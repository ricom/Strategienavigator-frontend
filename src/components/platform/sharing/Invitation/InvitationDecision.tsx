import {useCallback, useEffect, useState} from "react";
import {useParams} from "react-router";


import "./invitation-decision.scss";
import {acceptInvitationLink, showInvitationLink} from "../../../../general-components/API/calls/Invitations";
import {InvitationLinkResource} from "../../../../general-components/Datastructures";
import {Loader} from "../../../../general-components/Loader/Loader";
import {LoadingButton} from "../../../../general-components/LoadingButton/LoadingButton";
import {useMessageContext} from "../../../../general-components/Messages/Messages";
import {getSaveURL, getSharedSavePermissionText} from "../../../../general-components/Save";
import {useNavigate} from "react-router-dom";


export interface InvitationDecisionState {
    link: InvitationLinkResource | null,
    isSaving: boolean
}

export function InvitationDecision() {
    // State
    const [link, setLink] = useState<InvitationLinkResource | null>(null);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Context
    const {token} = useParams() as { token: string };
    const {add: showMessage} = useMessageContext();
    const navigate = useNavigate();

    // Effect

    useEffect(() => {
        let canceled = false;
        const getSave = async () => {
            setIsLoading(true);
            try {
                let invitation = await showInvitationLink(token);

                if (canceled) {
                    return;
                }
                if (!invitation?.success) {
                    navigate("/");
                } else {
                    setLink(invitation.callData.data);
                }
            } finally {
                if (!canceled) {
                    setIsLoading(false);
                }
            }
        }
        getSave().catch(reason => {
            console.error(reason);
        });
        return () => {
            canceled = true;
        }
    }, [setLink, navigate, token]);

    const acceptInvitation = useCallback(async () => {
        setIsSaving(true);
        let response = await acceptInvitationLink(token);

        if (response?.success) {
            showMessage("Einladung angenommen!", "SUCCESS", 5000);
            navigate(getSaveURL(link?.save.id as number, link?.save.tool.id as number));
        }else{
            setIsSaving(false);
        }
    }, [showMessage, navigate, token, link?.save.id, link?.save.tool.id]);

    return (
        <Loader
            loaded={!isLoading}
            transparent={true}
        >
            <div className={"invitation-decision"}>
                <h2>Einladung zu <b>{link?.save.name}</b>!</h2>

                <p>
                    Sie haben eine Einladung zu dem
                    Speicherstand <b>{link?.save.name}</b> von <b>{link?.save.owner.username}</b> erhalten.<br/>
                </p>

                <p>
                    Sie werden folgende Berechtigung erhalten: <br/>
                    <b>{getSharedSavePermissionText(link?.permission as number)}</b>
                </p>

                <p>
                    Möchten Sie diese Einladung annehmen?
                </p>

                <LoadingButton
                    showIcons={false}
                    className={"accept"}
                    savingChild={"Annehmen"}
                    isLoading={isSaving}
                    defaultChild={"Annehmen"}
                    onClick={acceptInvitation}
                />
            </div>
        </Loader>
    );
}

