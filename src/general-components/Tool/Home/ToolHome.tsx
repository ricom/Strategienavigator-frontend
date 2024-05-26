import React, {ReactNode, useCallback, useEffect, useMemo, useState} from "react";
import {Badge, Button, Offcanvas, OffcanvasBody, OffcanvasHeader} from "react-bootstrap";
import {faFileImport, faInfoCircle, faSortAmountDown, faSortAmountUp} from "@fortawesome/free-solid-svg-icons";
import {faPlusSquare} from "@fortawesome/free-solid-svg-icons/faPlusSquare";

import "./tool-home.scss";
import {useFooterContext} from "../../Contexts/FooterContextComponent";
import {SaveResourceList} from "./SaveResourceList/SaveResourceList";
import {PaginationLoader, PaginationPages} from "../../API/PaginationLoader";
import {SimpleSaveResource} from "../../Datastructures";
import {deleteSave, getSaves} from "../../API/calls/Saves";
import {DeleteSaveModal} from "./DeleteSaveModal/DeleteSaveModal";
import FAE from "../../Icons/FAE";
import {SaveInvitation} from "../../Sharing/SaveInvitation";
import {SharedSaveContextComponent} from "../../Contexts/SharedSaveContextComponent";
import {ButtonPanel} from "../../ButtonPanel/ButtonPanel";
import {ImportModal} from "./Import/ImportModal";
import {Messages, useMessageContext} from "../../Messages/Messages";
import {useIsDesktop} from "../../Contexts/DesktopContext";
import {ToolData} from "../Data/ToolData";
import {useBooleanState} from "../../Utility/Hooks";
import {useHistory} from "react-router";
import {useUserContext} from "../../Contexts/UserContextComponent";


export interface ToolHomeInfo {
    shortDescription?: ReactNode
    tutorial?: ReactNode
}

export interface ToolHomeProps {
    tool: ToolData<any>
    info?: ToolHomeInfo,
    children?: ReactNode
}

export interface SavesPaginationSetting {
    orderDesc: boolean
}

export interface SavesControlCallbacks {
    loadPage: (page: number) => void
    updatePages: () => void
    updateSettings: (settings: SavesPaginationSetting) => void
    deleteSave: (save: SimpleSaveResource) => void
    openInviteModal: (save: SimpleSaveResource) => void
}

export function ToolHome({
                             tool,
                             info,
                             children
                         }: ToolHomeProps) {
    // STATES
    const {state: showTutorial, setTrue: showTutorialCallback, setFalse: hideTutorialCallback} = useBooleanState(false);
    const {state: showDeleteModal, setState: setShowDeleteModal} = useBooleanState(false);
    const {
        state: showImportModal,
        setTrue: showImportModalCallback,
        setFalse: hideImportModalCallback
    } = useBooleanState(false);
    const [showInviteModal, setShowInviteModal] = useState<SimpleSaveResource | null>(null);
    const [saves, setSaves] = useState<PaginationPages<SimpleSaveResource> | undefined>(undefined);
    const {state: orderDesc, setState: setOrderDesc, toggle: toggleOrderDesc} = useBooleanState(true);
    const [isLoadingPage, setIsLoadingPage] = useState(false);
    const [toDeleteSave, setToDeleteSave] = useState<SimpleSaveResource | undefined>(undefined);

    const paginationSettings = useMemo(() => {
        return {orderDesc} as SavesPaginationSetting
    }, [orderDesc]);

    //CONTEXT
    const footerContext = useFooterContext();
    const isDesktop = useIsDesktop();
    const history = useHistory();
    const {user} = useUserContext();
    const {add} = useMessageContext();

    const paginationLoader = useMemo(() => {
        return new PaginationLoader<SimpleSaveResource>(async (page) => {
            let userId = user?.getID() as number;

            return await getSaves(userId, {
                toolID: tool.getID(),
                page: page,
                orderDesc,
                deleted: false
            });
        });
    }, [user, tool, orderDesc]);


    const savesControlCallbacks = useMemo(() => {
        async function loadPage(page: number) {
            setIsLoadingPage(true)
            await paginationLoader.loadPage(page);
            setSaves(paginationLoader.getAllLoaded);
            setIsLoadingPage(false);
        }

        async function updatePages() {
            setSaves(undefined);
            paginationLoader.clearCache();
            await paginationLoader.loadPage(1);
            setSaves(paginationLoader.getAllLoaded);
        }

        function updateSettings(settings: SavesPaginationSetting) {
            setOrderDesc(settings.orderDesc);
        }

        function deleteSave(save: SimpleSaveResource) {
            setToDeleteSave(save);
            setShowDeleteModal(true);
        }

        return {
            loadPage: loadPage,
            updatePages: updatePages,
            updateSettings: updateSettings,
            deleteSave: deleteSave,
            openInviteModal: setShowInviteModal
        }
    }, [paginationLoader]);

    const navigateToNewTool = useCallback(() => history.push(tool.getLink() + "/new"), [tool, history])


    useEffect(() => {
        let place = 1;
        footerContext.setItem(place, {
            newTool: {
                callback: navigateToNewTool,
                title: "Neue Analyse"
            }
        });
        if (tool.hasImporter()) {
            place++;
            footerContext.setItem(place, {
                button: {
                    icon: faFileImport,
                    callback: showImportModalCallback,
                    text: "Importieren"
                }
            });
        }
        place++;
        footerContext.setItem(place, {settings: true});
        return () => {
            footerContext.clearItems();
        }
    }, [navigateToNewTool, footerContext, tool, showImportModalCallback]);

    useEffect(() => {
        let canceled = false;
        setSaves(undefined);
        setIsLoadingPage(true);
        paginationLoader.loadPage(1).then(() => {
            if (canceled)
                return;
            setSaves(paginationLoader.getAllLoaded());
        }).finally(() => {
            if (canceled)
                return;
            setIsLoadingPage(false);
        }).catch(console.error);


        return () => {
            canceled = true;
        }
    }, [paginationLoader]);


    const onCloseDeleteModal = useCallback(() => {
        setShowDeleteModal(false);
        setToDeleteSave(undefined);
    }, []);

    const onDeleteModal = useCallback(async (id: number) => {
        await deleteSave(id);
        setShowDeleteModal(false);
        setToDeleteSave(undefined);
        savesControlCallbacks.updatePages()
            .catch(console.error);
    }, [savesControlCallbacks.updatePages]);

    const closeInviteModal = useCallback(() => {
        setShowInviteModal(null);
    }, []);

    const onImportSuccess = useCallback((save: SimpleSaveResource) => {
        history.push(tool.getLink() + "/" + save.id.toString());
        add("Importieren erfolgreich!", "SUCCESS", Messages.TIMER);
    }, [add, history, tool]);

    return (
        <div className={"toolHome"}>
            <h4>
                <FAE icon={tool.getToolIcon()}/> &nbsp; {tool.getToolName()} &nbsp;

                {(tool.hasTutorial()) && (
                    <Badge
                        bg="dark"
                        className={"description"}
                        onClick={showTutorialCallback}
                    >
                        <FAE icon={faInfoCircle}/>
                    </Badge>
                )}
            </h4>

            {info?.shortDescription}

            <div className={"button-container mb-0 mt-2"}>
                {isDesktop && (
                    <ButtonPanel>
                        <Button onClick={navigateToNewTool} size={"sm"} variant={"dark"}>
                            <FAE icon={faPlusSquare}/> Neue Analyse
                        </Button>

                        {(tool.hasImporter()) && (
                            <Button size={"sm"} onClick={showImportModalCallback} variant={"dark"}>
                                <FAE icon={faFileImport}/> Analyse importieren
                            </Button>
                        )}
                    </ButtonPanel>
                )}

                <span className={"sorting-button"}>
                            {isDesktop && (
                                <span>Nach Erstelldatum sortieren: </span>
                            )}

                    <Button type={"button"}
                            disabled={isLoadingPage || saves === undefined}
                            className={"btn btn-primary"}
                            onClick={toggleOrderDesc}
                            title={"Nach Erstelldatum sortieren"}>
                                    <FAE
                                        icon={orderDesc ? faSortAmountDown : faSortAmountUp}/>
                                </Button>
                            </span>
            </div>

            <hr/>

            <div className={"saves mt-2"}>
                <SaveResourceList tool={tool!} saves={saves}
                                  savesControlCallbacks={savesControlCallbacks}
                                  paginationSettings={paginationSettings}
                                  pageIsLoading={isLoadingPage}/>
            </div>

            {children}

            {(showTutorial && tool?.hasTutorial()) && (
                <TutorialCanvas show={true} hideCallback={hideTutorialCallback} toolName={tool.getToolName()}
                                tutorial={tool.renderTutorial()}/>)}

            <SharedSaveContextComponent permission={toDeleteSave?.permission?.permission}>
                <DeleteSaveModal
                    show={showDeleteModal}
                    save={toDeleteSave ?? null}
                    onClose={onCloseDeleteModal}
                    onDelete={onDeleteModal}
                />
            </SharedSaveContextComponent>

            <SharedSaveContextComponent permission={showInviteModal?.permission?.permission}>
                <SaveInvitation
                    show={showInviteModal !== null}
                    save={showInviteModal}
                    onClose={closeInviteModal}
                />
            </SharedSaveContextComponent>

            <ImportModal
                show={showImportModal}
                tool={tool}
                onClose={hideImportModalCallback}
                onSuccess={onImportSuccess}/>

        </div>
    );
}

function TutorialCanvas({show, hideCallback, toolName, tutorial}: {
    show: boolean,
    hideCallback: () => void,
    toolName: ReactNode,
    tutorial: ReactNode
}) {

    return (
        <Offcanvas placement={"start"} onHide={hideCallback}
                   show={show}>
            <OffcanvasHeader closeButton onClick={hideCallback}>
                <Offcanvas.Title>{toolName}</Offcanvas.Title>
            </OffcanvasHeader>
            <OffcanvasBody>
                {tutorial}
            </OffcanvasBody>
        </Offcanvas>
    );
}
