import './tool-save-page.scss'
import React, {ReactElement, ReactNode, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {SaveResource, SharedSavePermission,} from "../../Datastructures";
import {Session} from "../../Session/Session";
import {Loader} from "../../Loader/Loader";
import {useHistory, useParams} from "react-router";
import {lockSave, updateSave} from "../../API/calls/Saves";
import {Tool} from "../Tool";
import {Messages, useMessageContext} from "../../Messages/Messages";
import {Button, Modal} from "react-bootstrap";
import {Route} from "react-router-dom";
import produce from "immer";
import {WritableDraft} from "immer/dist/types/types-external";
import {UIErrorContextComponent} from "../../Contexts/UIErrorContext/UIErrorContext";
import {SharedSaveContextComponent} from "../../Contexts/SharedSaveContextComponent";
import {ModalCloseable} from "../../Modal/ModalCloseable";
import {faCheck} from "@fortawesome/free-solid-svg-icons";
import FAE from '../../Icons/FAE';
import {IResourceManager, ResourceManager} from "./ResourceManager";
import {PromptOnLeave} from "./PromptOnLeave/PromptOnLeave";
import {INTERRUPTED, lockAndUpdateSave, retrieveSave} from "../../Utility/SaveUtility";
import {useBooleanState} from "../../Utility/Hooks";
import {showErrorPage} from "../../../ErrorPage";
import {HTTPError} from "../../Utility/ErrorTypes";
import {useUserContext} from "../../Contexts/UserContextComponent";


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

/**
 * Die Tools Save hat 4 Aufgaben.
 * 1. Laden/Speichern des Saves.
 * 2. Laden aller Resourcen
 * 3. Änderungen am Save speichern und verarbeiten.
 */

export function ToolSavePage<D extends object>({tool, element}: ToolSavePageProps<D>) {
    // state
    const [isLoading, setLoading] = useState(true);
    const [isSaving, setSaving] = useState(false);
    const {
        state: shouldShowLockedInfo,
        setState: setShouldShowLockedInfo,
        setFalse: hideLockedInfoCallback
    } = useBooleanState(false);
    const [saveDirty, setSaveDirty] = useState(false);
    const [save, setSave] = useState<SaveResource<D> | undefined>(undefined);
    // is used to prevent the save controller to update every change of a save.
    const saveRef = useRef<SaveResource<D> | undefined>(undefined);
    saveRef.current = save;


    // context
    const {add: showMessage} = useMessageContext();
    const history = useHistory();
    const {id: saveIdParam} = useParams() as { id: string };
    const saveId = parseInt(saveIdParam);
    const {user} = useUserContext();

    const onAPIError = useCallback((error: Error) => {
        showMessage(error.message, "DANGER", Messages.TIMER);
    }, [showMessage]);

    //eslint-disable-next-line
    const resourceManager = useMemo(() => new ResourceManager(), [saveId]);

    useEffect(() => {
        return () => {
            resourceManager.clearResources();
        }
    }, [resourceManager]);


    const performSave = useCallback(async () => {
        const save = saveRef.current;
        if (save === undefined) {
            return false;
        }
        setSaving(true);

        const call = await updateSave(
            save,
            resourceManager.resources,
            {
                errorCallback: onAPIError
            }
        );

        setSaving(false);

        const success = call !== null && call.success;
        if (success)
            setSaveDirty(false);
        return success;
    }, [onAPIError, resourceManager.resources]);

    const updateSaveLocal = useCallback((changes: ((save: WritableDraft<SaveResource<D>>) => void) | SaveResource<D>) => {
        setSave((oldSave) => {
            let newSave;
            if (typeof changes === "object") {
                newSave = changes;
            } else {
                if (oldSave !== undefined)
                    newSave = produce(oldSave, changes);
            }
            return newSave;
        });
        setSaveDirty(true);
    }, []);

    /**
     * Loads the save from the backend, and when specified updates the lock status.
     * @param updateLock whether to update the lock status in the backend.
     */
    const updateSaveFromRemote = useCallback(async (updateLock: boolean = false, shouldCancel: {
        cancel: boolean
    } = {cancel: false}) => {
        setLoading(true)
        let save;
        try {
            resourceManager.clearResources();
            save = await retrieveSave<D>(saveId, tool.getID(), resourceManager);
        } catch (e: any) {
            if (e.message === INTERRUPTED) {
                return;
            } else if (e instanceof HTTPError) {
                showErrorPage(history, e.code);
            } else {
                throw e;
            }
        }
        if (shouldCancel.cancel) {
            return;
        }

        if (save) {
            if (updateLock) {
                const isLocked = await lockAndUpdateSave(save, Session.currentUser?.getID()!!);
                if (shouldCancel.cancel) {
                    return;
                }
                setShouldShowLockedInfo(isLocked);
            }
            setSave(save);
            setLoading(false);
        } else {
            showErrorPage(history, 404);
            return;
        }
    }, [resourceManager, saveId, history, setShouldShowLockedInfo, tool]);

    const saveController = useMemo((): ToolSaveController<D> => {
        return {
            save: performSave,
            onChanged: updateSaveLocal,
            updateSaveFromRemote: updateSaveFromRemote
        }
    }, [updateSaveFromRemote, performSave, updateSaveLocal]);

    // usefully resource: https://developer.chrome.com/docs/web-platform/page-lifecycle-api
    useEffect(() => {
        const onUnloadUnLock = async () => {
            console.log("unload event");
            await lockSave(saveId, false, {keepalive: true});
        };


        let event = "pagehide";
        window.addEventListener(event, onUnloadUnLock);
        return () => {
            window.removeEventListener(event, onUnloadUnLock);
        }
    }, [saveId]);


    useEffect(() => {
        const shouldCancel = {cancel: false};
        updateSaveFromRemote(true, shouldCancel).catch(console.error);

        return () => {
            shouldCancel.cancel = true;
            lockSave(saveId, false, {keepalive: true}).catch(console.error);
        }
    }, [updateSaveFromRemote, saveId]);


    function getView(): ReactNode {
        if (save !== undefined) {
            return element({
                save: save,
                saveController: saveController,
                resourceManager: resourceManager,
                isSaving: isSaving
            });
        } else {
            // showErrorPage(404);
            return "";
        }
    }

    function getPermissionOfSave(): SharedSavePermission {
        const s = save;
        if (!s) {
            return SharedSavePermission.READ;
        }
        let isLocked = ((!!s.locked_by) && s.locked_by !== user?.getID());
        if (!s.permission) {
            return s.owner.id === user?.getID() ?
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


    return (
        <Route>
            <SharedSaveContextComponent permission={getPermissionOfSave()}>
                <Loader loaded={!isLoading} transparent
                        alignment={"center"} fullscreen animate={false}>
                    <UIErrorContextComponent>
                        {getView()}
                    </UIErrorContextComponent>
                    <PromptOnLeave shouldPreventChange={saveDirty}/>

                    <ModalCloseable
                        show={shouldShowLockedInfo}
                        backdrop centered
                        onHide={hideLockedInfoCallback}
                    >
                        <Modal.Body>
                            Dieser Speicherstand wird aktuell bearbeitet, daher können Sie diesen nur
                            beobachten...
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                variant={"dark"}
                                onClick={hideLockedInfoCallback}
                            >
                                <FAE icon={faCheck}/> Ok
                            </Button>
                            <Button
                                variant={"primary"}
                                onClick={history.goBack}
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

export type{
    ToolSavePageProps,
    ToolSaveProps,
    ToolSaveController
}
