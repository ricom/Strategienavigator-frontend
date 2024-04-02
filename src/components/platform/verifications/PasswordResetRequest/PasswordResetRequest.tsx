import React, {useCallback, useState} from "react";
import "./password-reset-request.sass";
import {extractFromForm} from "../../../../general-components/Utility/FormHelper";
import {forgotPassword} from "../../../../general-components/API/calls/Password";
import {Messages, useMessageContext} from "../../../../general-components/Messages/Messages";
import {Form} from "react-bootstrap";
import {LoadingButton} from "../../../../general-components/LoadingButton/LoadingButton";


export function PasswordResetRequest() {
    // State
    const [isRequesting, setRequesting] = useState(false);
    const [requestSuccess, setRequestSuccess] = useState<boolean | undefined>(undefined);

    // context
    const {add: showMessage} = useMessageContext();
    const requestPasswordReset = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setRequesting(true);

        try {
            let email: string = extractFromForm(e, "email") as string;
            let call = await forgotPassword({email: email});

            if (call) {
                setRequestSuccess(call.success);
            }
        } catch (reason) {
            console.error(reason);
            setRequestSuccess(false);
            showMessage("Netzwerkfehler", "DANGER", Messages.TIMER);
        } finally {
            setRequesting(false);
        }

    }, [setRequesting, showMessage, setRequestSuccess]);

    return (
        <Form onSubmit={requestPasswordReset} className={"passwordReset"}>
            <h4>Passwort zurücksetzen</h4>

            <hr/>

            <p>Geben Sie bitte die E-Mail Adresse an, an die Ihr neues Password versendet werden soll:</p>

            <Form.Floating>
                <Form.Control placeholder={"Email-Adressse"} name={"email"} id={"email"} type={"email"}/>
                <label htmlFor={"email"}>E-Mail Adresse</label>
            </Form.Floating>

            <div className={"feedbackContainer"}>
                {(requestSuccess) && (
                    <div className={"feedback SUCCESS"}>
                        Bitte öffnen Sie die versendete E-Mail und folgen Sie den dortigen Anweisungen.
                    </div>
                )}
                {(requestSuccess !== undefined && !requestSuccess) && (
                    <div className={"feedback DANGER"}>
                        Die E-Mail konnte nicht gefunden werden!
                    </div>
                )}
            </div>

            <LoadingButton savingChild={"Passwort zurücksetzen!"}
                           defaultChild={"Passwort zurücksetzen!"}
                           isLoading={isRequesting}
                           showIcons={isRequesting}
                           variant={"dark"}
                           type={"submit"}/>
        </Form>
    );
}