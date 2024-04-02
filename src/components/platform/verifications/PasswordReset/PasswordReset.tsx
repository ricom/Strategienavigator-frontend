import React, {useCallback, useRef, useState} from "react";
import {useParams} from "react-router";
import {PasswordField} from "../../../../general-components/PasswordField/PasswordField";
import {Button, Form} from "react-bootstrap";
import {extractFromForm} from "../../../../general-components/Utility/FormHelper";
import {updatePassword} from "../../../../general-components/API/calls/Password";
import {Link} from "react-router-dom";

import "./password-reset.scss";
import {LoadingButton} from "../../../../general-components/LoadingButton/LoadingButton";


export interface RouteMatches {
    token?: string
}

export interface PasswordResetState {
    isRequesting: boolean
    requestSuccess?: boolean

    isChangingPassword: boolean
    changingSuccess?: boolean
}

export function PasswordReset() {
    // State
    const [isChangingPassword, setChangingPassword] = useState(false);
    const [changingSuccess, setChangingSuccess] = useState<boolean | undefined>(undefined);

    //Context
    const {token} = useParams<{ token: string }>();

    const passwordField = useRef<PasswordField<any>>(null);

    const changePassword = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setChangingPassword(true);

        try {
            let password: string = extractFromForm(e, "password") as string;

            if (passwordField.current?.isValid() && passwordField.current?.isMatching()) {
                const call = await updatePassword(token as string, {password: password});
                setChangingSuccess(call?.success);
            }
        } catch (reason) {
            console.error(reason);
            setChangingSuccess(false);
        } finally {
            setChangingPassword(false);
        }
    }, [token]);

    return (
        <Form onSubmit={async (e) => await changePassword(e)}>
            <h4>Passwort zurücksetzen</h4>

            <hr/>

            <PasswordField required confirm ref={passwordField} check eye/>

            <div className={"feedbackContainer"}>
                {(changingSuccess) && (
                    <div className={"feedback SUCCESS"}>
                        Ihr Passwort wurde aktualisiert. <Link to={"/login"}><Button variant={"dark"}>Jetzt
                        anmelden!</Button></Link>
                    </div>
                )}
                {(changingSuccess !== undefined && !changingSuccess) && (
                    <div className={"feedback DANGER"}>
                        Es ist ein Fehler aufgetreten!
                    </div>
                )}
            </div>

            {(changingSuccess === undefined) && (
                <LoadingButton savingChild={"Passwort ändern!"}
                               defaultChild={"Passwort ändern!"}
                               isLoading={isChangingPassword}
                               showIcons={isChangingPassword}
                               variant={"dark"}
                               type={"submit"}/>
            )}
        </Form>
    )
        ;
}
