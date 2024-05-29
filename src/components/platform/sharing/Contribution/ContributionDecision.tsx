import {useCallback, useEffect, useState} from "react";
import {useLocation, useParams} from "react-router";
import {
    acceptContribution,
    declineContribution,
    showContributions
} from "../../../../general-components/API/calls/Contribution";
import {Loader} from "../../../../general-components/Loader/Loader";
import {SharedSaveResource} from "../../../../general-components/Datastructures";
import {LoadingButton} from "../../../../general-components/LoadingButton/LoadingButton";
import {faCheck, faTimes} from "@fortawesome/free-solid-svg-icons/";


import "./contribution-decision.scss";
import {Messages, useMessageContext} from "../../../../general-components/Messages/Messages";
import {getSaveURL, getSharedSavePermissionText} from "../../../../general-components/Save";
import {useUserContext} from "../../../../general-components/Contexts/UserContextComponent";
import {useErrorPageFunction} from "../../../../ErrorPage";
import {useNavigate} from "react-router-dom";


export function ContributionDecision() {
    const {sharedSaveID} = useParams() as { sharedSaveID: string };

    // State
    const [sharedSave, setSharedSave] = useState<SharedSaveResource | null>(null);
    const [isAccepting, setIsAccepting] = useState(false);
    const [isDeclining, setIsDeclining] = useState(false);
    const [accepted, setAccepted] = useState<boolean | undefined>(undefined);
    const [declined, setDeclined] = useState<boolean | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    //Context
    const navigate = useNavigate();
    const location = useLocation();
    const {add: showMessage} = useMessageContext();
    const {user} = useUserContext();
    const showErrorPage = useErrorPageFunction();


    const acceptInvitation = useCallback(async (shouldCancel: { canceled: boolean } = {canceled: false}) => {
        setIsAccepting(true);
        try {
            let call = await acceptContribution(parseInt(sharedSaveID), {errorCallback: () => setAccepted(false)});
            if (shouldCancel.canceled) {
                return;
            }

            if (call && call.success) {
                showMessage("Einladung angenommen!", "SUCCESS", 5000);
                navigate(getSaveURL(sharedSave?.save.id as number, sharedSave?.save.tool.id as number));
                setAccepted(true)
            } else {
                setAccepted(false);
            }
        } catch (_unused) {
            if (!shouldCancel.canceled) {
                setAccepted(false);
            }
        } finally {
            if (!shouldCancel.canceled) {
                setIsAccepting(false);
            }
        }
    }, [setAccepted, setIsAccepting, showMessage, navigate, sharedSaveID, sharedSave?.save.id, sharedSave?.save.tool.id]);

    const declineInvitation = useCallback(async (shouldCancel: { canceled: boolean } = {canceled: false}) => {
        setIsDeclining(true);
        try {
            let call = await declineContribution(parseInt(sharedSaveID));
            if (shouldCancel.canceled) {
                return;
            }

            setIsDeclining(false);
            setDeclined(call?.success);
        } catch (reason) {
            console.error(reason);
            if (!shouldCancel.canceled) {
                setDeclined(false);
            }
        } finally {
            if (!shouldCancel.canceled) {
                setIsDeclining(false);
            }
        }

    }, [setDeclined, setIsDeclining, sharedSaveID]);

    useEffect(() => {
        let canceled = false;
        const checkParam = async () => {
            let saveID = parseInt(sharedSaveID);
            let userID = user?.getID() as number;
            let call = await showContributions(userID);
            if (canceled) {
                return;
            }
            if (call && call.success) {
                let i = 0;
                let data = call.callData.data;
                let foundSave = undefined;
                while (i < data.length && foundSave === undefined) {
                    let save = data[i];
                    if (
                        save.user.id === userID &&
                        save.id === saveID &&
                        !save.accepted &&
                        !save.declined &&
                        !save.revoked
                    ) {
                        foundSave = data[i];
                    }
                    i++;
                }

                if (foundSave) {
                    setSharedSave(foundSave);
                    setIsLoading(false);
                    return;
                }
                showErrorPage(403);
                return;
            }
            showErrorPage(500);
        }

        checkParam().then(() => {
            if (canceled) {
                return;
            }
            setIsLoading(false);
        }, reason => {
            console.error(reason);
            setIsLoading(false);
            showErrorPage(500);
        });

        return () => {
            canceled = true;
        }
    }, [showErrorPage, setSharedSave, sharedSaveID, acceptInvitation, declineInvitation, location.search, user]);

    useEffect(() => {
        let shouldCancel = {canceled: false};

        const checkForAccept = async () => {
            const queryString = location.search;
            const urlParams = new URLSearchParams(queryString);

            if (urlParams.has("accepted")) {
                let accepted = urlParams.get("accepted");
                if (accepted === "true") {
                    await acceptInvitation(shouldCancel);
                } else if (accepted === "false") {
                    await declineInvitation(shouldCancel);
                }
            }
        }

        if (sharedSave) {
            checkForAccept().catch(reason => {
                console.error(reason);
                showMessage("Fehler beim beantworten der Anfrage!", "DANGER", Messages.TIMER);
            });
        }
        return () => {
            shouldCancel.canceled = true;
        }
    }, [showMessage, location.search, acceptInvitation, declineInvitation, sharedSave]);


    return (
        <Loader transparent loaded={!isLoading}>
            <div className={"contribution-decision"}>
                <h2>Einladung zu <b>{sharedSave?.save.name}</b></h2>

                {(!accepted && !declined) && (
                    <>
                        <p>
                            Sie wurden Eingeladen an dem
                            Speicherstand <b>{sharedSave?.save.name}</b> von <b>{sharedSave?.save.owner.username}</b> mitzuwirken.<br/>
                        </p>

                        <p>
                            Sie werden folgende Berechtigung erhalten: <br/>
                            <b>{getSharedSavePermissionText(sharedSave?.permission as number)}</b>
                        </p>

                        <p>
                            Möchten Sie diese Einladung annehmen?
                        </p>

                        <LoadingButton
                            onClick={() => acceptInvitation()}
                            defaultChild={"Annehmen"}
                            isLoading={isAccepting}
                            defaultIcon={faCheck}
                            savingChild={"Annehmen"}
                        />
                        <LoadingButton
                            onClick={() => declineInvitation()}
                            variant={"danger"}
                            defaultChild={"Ablehnen"}
                            defaultIcon={faTimes}
                            isLoading={isDeclining}
                            savingChild={"Ablehnen"}
                        />
                    </>
                )}

                <div className={"feedbackContainer"}>
                    {(accepted !== undefined) && (
                        accepted ? (
                            <div className={"feedback SUCCESS"}>
                                Einladung erfolgreich angenommen!
                            </div>
                        ) : (
                            <div className={"feedback DANGER"}>
                                Einladung annehmen fehlgeschlagen! Versuchen Sie es später erneut.
                            </div>
                        )
                    )}
                    {(declined !== undefined) && (
                        declined ? (
                            <div className={"feedback SUCCESS"}>
                                Einladung erfolgreich abgelehnt!
                            </div>
                        ) : (
                            <div className={"feedback DANGER"}>
                                Einladung ablehnen fehlgeschlagen! Versuchen Sie es später erneut.
                            </div>
                        )
                    )}
                </div>
            </div>
        </Loader>
    );

}
