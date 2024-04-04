import './tool-save-page.scss'
import React, {Component, ReactElement, ReactNode} from "react";
import {SaveResource, SharedSavePermission,} from "../../Datastructures";
import {Session} from "../../Session/Session";
import {Loader} from "../../Loader/Loader";
import {RouteComponentProps} from "react-router";
import {getSave, lockSaveWithCheck, updateSave} from "../../API/calls/Saves";
import {Tool} from "../Tool";
import {MessageContext, Messages} from "../../Messages/Messages";
import {Button, Modal} from "react-bootstrap";
import {Route} from "react-router-dom";
import produce from "immer";
import {WritableDraft} from "immer/dist/types/types-external";
import {UIErrorContextComponent} from "../../Contexts/UIErrorContext/UIErrorContext";
import {SharedSaveContextComponent} from "../../Contexts/SharedSaveContextComponent";
import {ModalCloseable} from "../../Modal/ModalCloseable";
import {faCheck} from "@fortawesome/free-solid-svg-icons";
import FAE from '../../Icons/FAE';
import {legacyShowErrorPage} from "../../LegacyErrorPageAdapter";
import {IResourceManager, ResourceManager} from "./ResourceManager";
import {PromptOnLeave} from "./PromptOnLeave/PromptOnLeave";
import {lockAndUpdateSave} from "../../Utility/SaveUtility";


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
    isSaving: boolean,
    shouldShowLockedInfo: boolean
}

/**
 * Die Tools Save hat 4 Aufgaben.
 * 1. Laden/Speichern des Saves.
 * 2. Laden aller Resourcen
 * 3. Änderungen am Save speichern und verarbeiten.
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
            isSaving: false,
            shouldShowLockedInfo: false,
            isLoading: true
        }
        this.saveController = {
            save: this.save.bind(this),
            onChanged: this.updateSaveLocal.bind(this),
            updateSaveFromRemote: this.updateSaveFromRemote
        }
        this.resourceManager = new ResourceManager();
        this.onUnmount = [];
    }

    // usefully resource: https://developer.chrome.com/docs/web-platform/page-lifecycle-api
    componentDidMount = async () => {

        window.addEventListener("pagehide", this.onUnloadUnLock);
        await this.updateSaveFromRemote(true);
    }

    componentWillUnmount = async () => {
        const onUnmount = this.onUnmount;
        this.onUnmount = [];
        if (this.state.save !== undefined) {
            lockSaveWithCheck(this.state.save, false, true).catch(this.onAPIError);
        }

        for (const onUnmountCallback of onUnmount) {
            onUnmountCallback();
        }
        window.removeEventListener("pagehide", this.onUnloadUnLock);
    }

    onUnloadUnLock = async (event: PageTransitionEvent) => {
        if (event.persisted) {
            return;
        }
        let save = this.state.save;
        if (save) {
            await lockSaveWithCheck(save, false, true);
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
                        <PromptOnLeave shouldPreventChange={this.shouldPreventRouteChange()}/>

                        <ModalCloseable
                            show={this.state.shouldShowLockedInfo}
                            backdrop centered
                            onHide={() => {
                                this.setState({
                                    shouldShowLockedInfo: false
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
                                            shouldShowLockedInfo: false
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


                </SharedSaveContextComponent>
            </Route>
        );
    }


    public onAPIError(error: Error): void {
        // TODO: remove later
        this.context.add(error.message, "DANGER", Messages.TIMER);
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

    /**
     * Gibt zurück, ob ein Dialog angezeigt werden soll, der um Bestätigung bittet, ob die Seite verlassen werden soll
     */
    private shouldPreventRouteChange = (): boolean => {
        return this.saveDirty;
    }

    private save = async () => {
        const save = this.state.save;
        if (save === undefined) {
            return false;
        }
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
    }

    private updateSaveLocal = (changes: ((save: WritableDraft<SaveResource<D>>) => void) | SaveResource<D>, callback?: () => void) => {
        this.setState((oldState) => {
            let newSave;
            if (typeof changes === "object") {
                newSave = changes;
            } else {
                const oldSave = oldState.save;
                if (oldSave !== undefined)
                    newSave = produce(oldSave, changes);
                this.saveDirty = true;
            }
            return {...oldState, save: newSave};
        }, callback);
    }

    /**
     * Loads the save from the backend, and when specified updates the lock status.
     * @param updateLock whether to update the lock status in the backend.
     */
    private updateSaveFromRemote = async (updateLock: boolean = false) => {
        this.setState({isLoading: true});
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

        if (save) {
            if (updateLock) {
                const isLocked = await lockAndUpdateSave(save, Session.currentUser?.getID()!!);
                this.setState({
                    shouldShowLockedInfo: isLocked
                });
            }

            this.setState({
                save: save,
                isLoading: false
            });
        } else {
            legacyShowErrorPage(404);
            return;
        }
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
        let isLocked = ((!!s.locked_by) && s.locked_by !== Session.currentUser?.getID());
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
