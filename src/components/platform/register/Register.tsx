import React, {FormEvent, PureComponent} from "react";
import {Form} from "react-bootstrap";
import {PasswordField} from "../../../general-components/PasswordField/PasswordField";
import {extractFromForm} from "../../../general-components/FormHelper";
import {Session} from "../../../general-components/Session/Session";
import {UniqueCheck} from "../../../general-components/UniqueCheck/UniqueCheck";
import {checkUsername} from "../../../general-components/API/calls/Username";
import {checkEmail} from "../../../general-components/API/calls/Email";

import "./register.scss";
import {Messages} from "../../../general-components/Messages/Messages";
import {RouteComponentProps, withRouter} from "react-router";
import {LoadingButton} from "../../../general-components/LoadingButton/LoadingButton";
import {CaptchaComponent} from "../../../general-components/Captcha/CaptchaComponent";


interface RegisterState {
    isRegistering: boolean
    loaded?: boolean
    captchaKey: string
}

class Register extends PureComponent<RouteComponentProps, RegisterState> {

    constructor(props: any) {
        super(props);

        this.state = {
            isRegistering: false,
            captchaKey: this.getNewCaptchaKey()
        };
    }


    private getNewCaptchaKey = () => {
        return new Date().toTimeString()
    }

    register = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        this.setState({
            isRegistering: true
        });

        let email: string = extractFromForm(e, "email") as string;
        let username: string = extractFromForm(e, "username") as string;
        let password: string = extractFromForm(e, "password") as string;
        let captchaKey: string = extractFromForm(e, "captcha_key") as string;
        let captcha: string = extractFromForm(e, "captcha") as string;

        let call = await Session.register(email, username, password, captchaKey, captcha);

        this.setState({
            isRegistering: false,
            captchaKey: this.getNewCaptchaKey()
        });

        if (call?.success) {
            Messages.add("Konto erstellt!\nÜberprüfe deine Emails!", "SUCCESS", Messages.TIMER);
            this.props.history.push(`/login?email=${email}&bestaetigen`);
        } else {
            Messages.add("Fehlgeschlagen! Überprüfen Sie Ihre Eingaben!", "DANGER", Messages.TIMER);
        }
    }

    render() {
        return (
            <Form className={"registerContainer"} onSubmit={async (e) => {
                await this.register(e)
            }}>
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

                <CaptchaComponent key={this.state.captchaKey}/>

                <hr/>

                {/*SUBMIT*/}
                <LoadingButton
                    type={"submit"}
                    defaultChild={"Registrieren"}
                    savingChild={"Wird registriert..."}
                    showIcons
                    isLoading={this.state.isRegistering}
                />
            </Form>
        );
    }

}

export default withRouter(Register);
