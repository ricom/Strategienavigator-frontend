import React, {FormEvent, useCallback, useState} from "react";
import {Form} from "react-bootstrap";
import {PasswordField} from "../../../general-components/PasswordField/PasswordField";
import {extractFromForm} from "../../../general-components/Utility/FormHelper";
import {Session} from "../../../general-components/Session/Session";
import {UniqueCheck} from "../../../general-components/UniqueCheck/UniqueCheck";
import {checkUsername} from "../../../general-components/API/calls/Username";
import {checkEmail} from "../../../general-components/API/calls/Email";

import "./register.scss";
import {Messages, useMessageContext} from "../../../general-components/Messages/Messages";
import {LoadingButton} from "../../../general-components/LoadingButton/LoadingButton";
import {CaptchaComponent} from "../../../general-components/Captcha/CaptchaComponent";
import {useNavigate} from "react-router-dom";


export function Register() {

    // State
    const [isRegistering, setIsRegistering] = useState(false);

    // Context
    const {add: showMessage} = useMessageContext();
    const navigate = useNavigate();


    const register = useCallback(async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsRegistering(true);

        let email: string = extractFromForm(e, "email") as string;
        let username: string = extractFromForm(e, "username") as string;
        let password: string = extractFromForm(e, "password") as string;
        let captchaKey: string = extractFromForm(e, "captcha_key") as string;
        let captcha: string = extractFromForm(e, "captcha") as string;

        let call = await Session.register(email, username, password, captchaKey, captcha);

        setIsRegistering(false);

        if (call?.success) {
            showMessage("Konto erstellt!\nÜberprüfe deine Emails!", "SUCCESS", Messages.TIMER);
            navigate(`/login?email=${email}&bestaetigen`);
        } else {
            showMessage("Fehlgeschlagen! Überprüfen Sie Ihre Eingaben!", "DANGER", Messages.TIMER);
        }
    }, [showMessage, setIsRegistering, navigate]);


    return (
        <Form className={"registerContainer"} onSubmit={register}>
            <h2>Registrieren</h2>

            <hr/>

            {/*E-MAIL*/}
            <Form.Floating className={"mb-2 mt-2"}>
                <UniqueCheck
                    id="email"
                    type="email"
                    name={"email"}
                    size={"sm"}
                    placeholder="name@example.com"
                    required={true}
                    callback={checkEmail}
                    entityName={"E-Mail"}
                />
                <Form.Label htmlFor={"email"} className={"email"}>E-Mail</Form.Label>
            </Form.Floating>

            {/*USERNAME*/}
            <Form.Floating className={"mb-2 mt-2"}>
                <UniqueCheck
                    id="username"
                    type="text"
                    name={"username"}
                    size={"sm"}
                    placeholder="name@example.com"
                    required={true}
                    callback={checkUsername}
                    entityName={"Username"}
                />
                <Form.Label htmlFor={"username"}>Benutzername</Form.Label>
            </Form.Floating>

            {/*PASSWORD*/}
            <PasswordField required confirm check={true} eye={true}/>

            <CaptchaComponent/>

            <hr/>

            {/*SUBMIT*/}
            <LoadingButton
                type={"submit"}
                defaultChild={"Registrieren"}
                savingChild={"Wird registriert..."}
                showIcons
                isLoading={isRegistering}
            />
        </Form>
    );

}
