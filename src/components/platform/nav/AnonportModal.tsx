import {ModalCloseable} from "../../../general-components/Modal/ModalCloseable";
import {Button, Form, FormGroup, Modal} from "react-bootstrap";
import FAE from "../../../general-components/Icons/FAE";
import {faCheck, faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import React, {FormEvent, useCallback, useRef, useState} from "react";
import {Session} from "../../../general-components/Session/Session";
import {checkEmail} from "../../../general-components/API/calls/Email";
import {UniqueCheck} from "../../../general-components/UniqueCheck/UniqueCheck";
import {checkUsername} from "../../../general-components/API/calls/Username";
import {PasswordField} from "../../../general-components/PasswordField/PasswordField";
import {extractFromForm} from "../../../general-components/Utility/FormHelper";
import {isEmpty} from "../../../general-components/ComponentUtils";
import {LoadingButton} from "../../../general-components/LoadingButton/LoadingButton";
import {portUser} from "../../../general-components/API/calls/User";
import {useMessageContext} from "../../../general-components/Messages/Messages";
import {CaptchaComponent} from "../../../general-components/Captcha/CaptchaComponent";
import {useUserContext} from "../../../general-components/Contexts/UserContextComponent";
import {useNavigate} from "react-router-dom";


export interface AnonportModalProps {
    show: boolean
    onClose: () => void
}

interface Errors {
    usernameEmpty?: boolean,
    emailEmpty?: boolean
}


export function AnonportModal({onClose, show}: AnonportModalProps) {
    // State
    const [errors, setErrors] = useState<Errors>({});
    const [isPorting, setIsPorting] = useState(false);
    const [success, setSuccess] = useState<Boolean | undefined>(undefined);

    // Context

    const {add: showMessage} = useMessageContext();
    const {user} = useUserContext();
    const navigate = useNavigate();

    // Refs

    const passwordField = useRef<PasswordField<any>>(null);
    const uniqueEmail = useRef<UniqueCheck & HTMLInputElement>(null);
    const uniqueUsername = useRef<UniqueCheck & HTMLInputElement>(null);

    // Callbacks

    const onPort = useCallback(async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        let email = extractFromForm(e, "email") as string;
        let username = extractFromForm(e, "username") as string;
        let password = extractFromForm(e, "password") as string;
        let captcha = extractFromForm(e, "captcha") as string;
        let captchaKey = extractFromForm(e, "captcha_key") as string;

        setIsPorting(true);

        if (
            passwordField.current &&
            uniqueUsername.current &&
            uniqueEmail.current &&
            user
        ) {
            let errors: Errors = {
                emailEmpty: isEmpty(email),
                usernameEmpty: isEmpty(username)
            };

            if (
                !errors.emailEmpty &&
                !errors.usernameEmpty &&
                uniqueEmail.current.isAvailable() &&
                uniqueUsername.current.isAvailable() &&
                passwordField.current.isMatching() &&
                passwordField.current.isValid()
            ) {
                let call = await portUser({
                    email: email,
                    password: password,
                    username: username,
                    captcha: captcha,
                    captcha_key: captchaKey
                });

                if (call && call.success) {
                    let logoutCall = await Session.logout();

                    if (logoutCall && logoutCall.success) {
                        showMessage((
                            <div>
                                Konto erfolgreich portiert.<br/>
                                Überprüfen Sie Ihre E-Mails!
                            </div>
                        ), "SUCCESS", 8000);

                        onClose();
                        navigate(`/login?email=${email}&bestaetigen`);
                    } else {
                        setSuccess(false);
                    }
                } else {
                    setSuccess(false);
                }
            } else {
                setErrors(errors);
            }

            setIsPorting(false);
        }
    }, [navigate, onClose, user, passwordField, uniqueUsername, uniqueEmail, showMessage, setIsPorting, setErrors, setSuccess]);

    const resetError = useCallback(() => {
        setErrors({});
        setSuccess(undefined);
    }, [setErrors, setSuccess]);

    let required = false;

    return (
        <ModalCloseable
            show={show}
            centered
            backdrop
            keyboard
            onHide={onClose}
        >
            <Form onSubmit={onPort}>
                <Modal.Header>
                    <h5>Anonymes Konto portieren</h5>
                </Modal.Header>
                <Modal.Body>
                    <p>Hier können Sie sich nun Registrieren und Ihr Anonymes Konto auf ein Richtiges Konto
                        portieren.</p>
                    <p><FAE icon={faInfoCircle}/> Ihre Speicherstände und Einstellungen werden übernommen.</p>

                    <FormGroup className={"mb-2"}>
                        <Form.FloatingLabel label={"E-Mail"}>
                            <UniqueCheck
                                ref={uniqueEmail}
                                id="email"
                                type="email"
                                name={"email"}
                                size={"sm"}
                                placeholder="name@example.com"
                                required={required}
                                onChangedValue={resetError}
                                callback={checkEmail}
                                entityName={"E-Mail"}
                            />

                            <div className={"feedbackContainer"}>
                                {(errors.emailEmpty) && (
                                    <div className={"feedback DANGER"}>
                                        Bitte geben Sie eine E-Mail-Adresse an!
                                    </div>
                                )}
                            </div>
                        </Form.FloatingLabel>
                    </FormGroup>

                    <FormGroup className={"mb-2"}>
                        <Form.FloatingLabel label={"Benutzername"}>
                            <UniqueCheck
                                ref={uniqueUsername}
                                id="username"
                                type="text"
                                name={"username"}
                                size={"sm"}
                                placeholder=""
                                required={required}
                                onChangedValue={resetError}
                                callback={checkUsername}
                                entityName={"Username"}
                            />

                            <div className={"feedbackContainer"}>
                                {(errors.usernameEmpty) && (
                                    <div className={"feedback DANGER"}>
                                        Bitte geben Sie einen Benutzernamen an!
                                    </div>
                                )}
                            </div>
                        </Form.FloatingLabel>
                    </FormGroup>

                    <PasswordField
                        ref={passwordField}
                        required={required}
                        confirm
                        check
                        eye
                        onChange={resetError}
                    />

                    <CaptchaComponent/>

                    <div className={"feedbackContainer"}>
                        {(
                            success !== undefined &&
                            !success
                        ) && (
                            <div className={"feedback DANGER"}>
                                Es ist ein Fehler aufgetreten! Bitte versuchen Sie es später erneut!
                            </div>
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <LoadingButton
                        size={"sm"}
                        type={"submit"}
                        variant={"success"}
                        defaultChild={"Portieren"}
                        savingChild={"Portiert..."}
                        isLoading={isPorting}
                        defaultIcon={faCheck}
                    />

                    <Button
                        size={"sm"}
                        onClick={onClose}>
                        Abbrechen
                    </Button>
                </Modal.Footer>
            </Form>
        </ModalCloseable>
    );
}
