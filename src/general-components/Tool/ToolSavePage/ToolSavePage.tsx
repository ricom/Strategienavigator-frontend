import './tool-save-page.scss'
import React, {Component, ReactElement, ReactNode} from "react";
import {SaveResource, SharedSavePermission, SharedSavePermissionDefault,} from "../../Datastructures";
import {Session} from "../../Session/Session";
import {Loader} from "../../Loader/Loader";
import {Prompt, RouteComponentProps} from "react-router";
import * as H from "history";
import {getSave, lockSave, updateSave} from "../../API/calls/Saves";
import {Tool} from "../Tool";
import {MessageContext, Messages} from "../../Messages/Messages";
import {Button, Modal} from "react-bootstrap";
import {ConfirmToolRouteChangeModal} from "../ConfirmToolRouteChangeModal/ConfirmToolRouteChangeModal";
import {Route} from "react-router-dom";
import produce from "immer";
import {WritableDraft} from "immer/dist/types/types-external";
import {UIErrorContextComponent} from "../../Contexts/UIErrorContext/UIErrorContext";
import {SharedSaveContextComponent} from "../../Contexts/SharedSaveContextComponent";
import {EditSavesPermission, hasPermission} from "../../Permissions";
import {ModalCloseable} from "../../Modal/ModalCloseable";
import {faCheck} from "@fortawesome/free-solid-svg-icons";
import FAE from '../../Icons/FAE';
import {legacyShowErrorPage} from "../../LegacyErrorPageAdapter";
import {IResourceManager, ResourceManager} from "./ResourceManager";


interface ToolSaveController<D> {
    save: () => Promise<boolean>
    onChanged: (changes: (save: WritableDraft<SaveResource<D>>) => void) => void
    updateSaveFromRemote: () => void
}

interface ToolSaveProps<D extends object> {
    saveController: ToolSaveController<D>
    resourceManager: IResourceManager
    save: SaveResource<D>
    isSaving: boolean
}

interface ToolSavePageProps<D extends object> {
    tool: Tool<D>
    element: (saveProps: ToolSaveProps<D>) => ReactElement
}

interface ToolSavePageState<D extends object> {
    isLoading: boolean
    save?: SaveResource<D>
    isSaving: boolean
    showConfirmToolRouteChangeModal: boolean
    lastLocation?: H.Location,
    isLocked: boolean
}

/**
 * Die Tools Save hat 4 Aufgaben.
 * 1. Laden/Speichern des Saves.
 * 2. Laden aller Resourcen
 * 3. Änderungen am Save speichern und verarbeiten.
 * 4. Verhindern, dass die Seite gewechselt wird, falls es noch ungespeicherte Änderungen gibt.
 */
class ToolSavePage<D extends object> extends Component<ToolSavePageProps<D> & RouteComponentProps<any>, ToolSavePageState<D>> {

    private readonly saveController: ToolSaveController<D>;
    /**
     * Speichert, ob der Speicherstand seit dem letzten Speichern verändert wurde
     * @private
     */
    private saveDirty: boolean = false;

    // private updateTimeout: NodeJS.Timeout | undefined;
    // private updateTimeoutMS: number = 370;

    private readonly resourceManager: ResourceManager;
    private onUnmount: (() => void)[];

    /**
     * Definiert auf welchen Context zugegriffen werden soll
     */
    static contextType = MessageContext;
    context!: React.ContextType<typeof MessageContext>

    constructor(props: ToolSavePageProps<D> & RouteComponentProps<any>, context: any) {
        super(props, context);
        this.state = {
            showConfirmToolRouteChangeModal: false,
            isSaving: false,
            isLocked: false,
            isLoading: true
        }
        this.saveController = {
            save: this.save.bind(this),
            onChanged: this.updateSave.bind(this),
            updateSaveFromRemote: this.updateSaveFromRemote
        }
        this.resourceManager = new ResourceManager();/*{
            resources: this.resources,
            onChanged: this.resourceChanged.bind(this),
            hasResource: this.hasResource.bind(this),
            getData: this.getResourceData.bind(this),
            getText: this.getResourceText.bind(this),
            getBlobURL: this.getBlobURL.bind(this)
        }*/
        this.onUnmount = [];
    }

    componentDidMount = async () => {
        window.addEventListener("beforeunload", this.onBeforeUnload);
        window.addEventListener("beforeunload", this.onUnloadUnLock);
        await this.firstLoad();
    }

    componentWillUnmount = async () => {
        const onUnmount = this.onUnmount;
        this.onUnmount = [];
        if (this.state.save !== undefined) {
            await this.unlock(this.state.save);
        }

        for (const onUnmountCallback of onUnmount) {
            onUnmountCallback();
        }

        // this.closeWebsocketConnection();

        window.removeEventListener("beforeunload", this.onBeforeUnload);
        window.removeEventListener("beforeunload", this.onUnloadUnLock);
    }

    onUnloadUnLock = async () => {
        let save = this.state.save;
        if (save) {
            await this.lockSave(save, false, true);
        }

        if (save) {
            await this.unlock(save);
        }
    }

    render() {
        return (
            <Route>
                <SharedSaveContextComponent permission={this.getPermissionOfSave()}>
                    <Loader loaded={!this.state.isLoading} transparent
                            alignment={"center"} fullscreen animate={false}>
                        <UIErrorContextComponent>
                            {this.getView()}
                        </UIErrorContextComponent>

                        <ModalCloseable
                            show={this.state.isLocked}
                            backdrop centered
                            onHide={() => {
                                this.setState({
                                    isLocked: false
                                });
                            }}
                        >
                            <Modal.Body>
                                Dieser Speicherstand wird aktuell bearbeitet, daher können Sie diesen nur
                                beobachten...
                            </Modal.Body>
                            <Modal.Footer>
                                <Button
                                    variant={"dark"}
                                    onClick={() => {
                                        this.setState({
                                            isLocked: false
                                        });
                                    }}
                                >
                                    <FAE icon={faCheck}/> Ok
                                </Button>
                                <Button
                                    variant={"primary"}
                                    onClick={() => {
                                        this.props.history.goBack();
                                    }}
                                >
                                    Zurück
                                </Button>
                            </Modal.Footer>
                        </ModalCloseable>
                    </Loader>

                    <Prompt message={this.denyRouteChange}/>
                    <ConfirmToolRouteChangeModal
                        show={this.state.showConfirmToolRouteChangeModal}
                        onNo={this.hideRouteChangeModal}
                        onYes={this.performRouteChange}
                    />
                </SharedSaveContextComponent>
            </Route>
        );
    }

    denyRouteChange = (location: H.Location): boolean => {
        // Don't show if save is unchanged
        if (!this.shouldPreventRouteChange())
            return true;

        this.setState({
            showConfirmToolRouteChangeModal: true,
            lastLocation: location
        });
        return (location.pathname === this.state.lastLocation?.pathname);
    }

    public onAPIError(error: Error): void {
        // TODO: remove later
        this.context.add(error.message, "DANGER", Messages.TIMER);
    }

    public lock = async (save: SaveResource<any>) => {
        return await this.lockSave(save, true);
    }

    public unlock = async (save: SaveResource<any>) => {
        return await this.lockSave(save, false);
    }

    private firstLoad = async () => {
        let ID = parseInt(this.props.match.params.id as string);
        let save;
        try {
            save = await this.retrieveSave(ID);
        } catch (e: any) {
            if (e.message === this.INTERRUPTED) {
                return;
            } else {
                throw e;
            }
        }


        let isLocked: boolean | undefined = undefined;

        if (save) {
            // socketInfo = await this.createSocketConnection(save);
            isLocked = await this.checkLockStatus(save);

            if (save /*&& socketInfo*/ && isLocked !== undefined) {
                this.setState({
                    save: save,
                    isLoading: false,
                    isLocked: isLocked,
                    // connection: socketInfo.connection,
                    // channel: socketInfo.channel
                });
            } else {
                legacyShowErrorPage(404);
                return;
            }
        } else {
            legacyShowErrorPage(404);
            return;
        }
    }

    // private closeWebsocketConnection() {
    //     this.state.connection?.disconnect();
    // }

    private onBeforeUnload = (e: BeforeUnloadEvent) => {
        if (this.shouldPreventRouteChange()) {
            e.preventDefault();
            e.returnValue = "";
            return "";
        }
        return undefined;
    }

    private getView(): ReactNode {
        if (this.state.save !== undefined) {
            return this.props.element({
                save: this.state.save,
                saveController: this.saveController,
                resourceManager: this.resourceManager,
                isSaving: this.state.isSaving
            });
        } else {
            // showErrorPage(404);
            return "";
        }
    }

    private hideRouteChangeModal = () => {
        this.setState({
            showConfirmToolRouteChangeModal: false,
            lastLocation: undefined
        });
    };

    private performRouteChange = () => {

        this.props.history.push(this.state.lastLocation?.pathname as string);
        if ((this.state.lastLocation?.pathname as string).startsWith(this.props.tool.getLink())) {
            this.setState({
                showConfirmToolRouteChangeModal: false
            });
        }
    };

    /**
     * Gibt zurück, ob ein Dialog angezeigt werden soll, der um Bestätigung bittet, ob die Seite verlassen werden soll
     */
    private shouldPreventRouteChange = (): boolean => {
        return this.saveDirty;
    }

    private save = async () => {
        if (this.state.save !== undefined) {
            this.setState({
                isSaving: true
            });

            const call = await updateSave(
                this.state.save!,
                this.resourceManager.resources,
                {
                    errorCallback: this.onAPIError
                }
            );

            this.setState({
                isSaving: false
            });
            const success = call !== null && call.success;

            if (success)
                this.saveDirty = false;
            return success;
        } else {
            return false;
        }
    }

    private updateSave = (changes: ((save: WritableDraft<SaveResource<D>>) => void) | SaveResource<D>, callback?: () => void) => {
        let newSave;
        if (typeof changes === "object") {
            newSave = changes;
        } else {
            if (this.state.save !== undefined) {
                newSave = produce(this.state.save, changes);
            }
            this.saveDirty = true;
        }

        this.setState({
            save: newSave
        }, callback);
    }

    private lockSave = async (save: SaveResource<any>, lock: boolean, keepalive?: boolean) => {
        if (lock && save.locked_by !== null) {
            return;
        }
        if (!lock && save.locked_by !== Session.currentUser?.getID()) {
            return;
        }

        return await lockSave(save.id, lock, {
            errorCallback: this.onAPIError,
            keepalive: keepalive
        });
    }

    private updateSaveFromRemote = async () => {
        this.setState({isLoading: true});
        if (this.state.save) {
            let save;
            try {
                save = await this.retrieveSave(this.state.save.id);
            } catch (e: any) {
                if (e.message === this.INTERRUPTED) {
                    return;
                } else {
                    throw e;
                }
            }

            if (save) {
                this.setState({
                    save: save,
                    isLoading: false
                });
            }
        }
        this.setState({isLoading: false});
    }

    private checkLockStatus = async (save: SaveResource<D>): Promise<boolean> => {
        save.permission = save.permission ?? {
            permission: SharedSavePermissionDefault,
            created_at: ""
        };
        let permission = save.permission.permission;
        let isLocked = hasPermission(permission, EditSavesPermission);

        if (
            save.locked_by === null ||
            save.locked_by === Session.currentUser?.getID()
        ) {
            isLocked = false;
        }

        await this.lock(save);

        if (save.locked_by === null) {
            save.locked_by = Session.currentUser!.getID();
        }
        return isLocked;
    }

    private readonly INTERRUPTED = "interrupted";
    private retrieveSave = async (ID: number): Promise<SaveResource<D> | undefined> => {
        let abort = false;
        const onAbort = () => {
            abort = true;
        }
        this.onUnmount.push(onAbort);
        let call = await getSave<any>(ID, {errorCallback: this.onAPIError});

        if (abort) {
            throw new Error(this.INTERRUPTED);
        } else {
            const index = this.onUnmount.findIndex(onAbort)
            this.onUnmount.splice(index, 1);
        }
        if (call && call.success) {
            if (call.callData.tool_id === this.props.tool.getID()) {
                let save: SaveResource<D> = call.callData;
                save.data = JSON.parse(call.callData.data);

                // load resources
                const resourcePromises = save.resources.map((resource) => this.resourceManager.loadResource(save, resource.name));

                await Promise.all(resourcePromises);

                return save;
            } else {
                legacyShowErrorPage(403);
                return;
            }
        } else {
            legacyShowErrorPage(404);
            return;
        }
    }

    private getPermissionOfSave(): SharedSavePermission {
        let s = this.state.save;
        if (!s) {
            return SharedSavePermission.READ;
        }
        let isLocked = s.locked_by ? s.locked_by !== Session.currentUser?.getID() : false;
        if (!s.permission) {
            return s.owner.id === Session.currentUser?.getID() ?
                isLocked ?
                    SharedSavePermission.READ :
                    SharedSavePermission.ADMIN :
                SharedSavePermission.READ;
        }

        if (isLocked) {
            return SharedSavePermission.READ;
        }
        return s.permission.permission;
    }
}


export type{
    ToolSavePageProps,
    ToolSavePageState,
    ToolSaveProps,
    ToolSaveController
}

export {
    ToolSavePage
}
