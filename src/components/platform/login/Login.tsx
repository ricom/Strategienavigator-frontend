import {FormEvent, useCallback, useMemo, useState} from "react";
import {Form} from "react-bootstrap";
import {Session} from "../../../general-components/Session/Session";
import {extractFromForm} from "../../../general-components/Utility/FormHelper";
import {useLocation} from "react-router";
import {PasswordField} from "../../../general-components/PasswordField/PasswordField";
import {Messages, useMessageContext} from "../../../general-components/Messages/Messages";
import {Link, useNavigate} from "react-router-dom";
import {faSignInAlt, faUserSecret} from "@fortawesome/free-solid-svg-icons/";
import {AnonymousModal} from "../../../general-components/ProtectedRoute";
import {LoadingButton} from "../../../general-components/LoadingButton/LoadingButton";
import {ButtonPanel} from "../../../general-components/ButtonPanel/ButtonPanel";
import {useBooleanState} from "../../../general-components/Utility/Hooks";
import "./login.scss";

export function Login() {
    // state
    const [failed, setFailed] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isLoggingInAnonymously, setIsLoggingInAnonymously] = useState(false);
    const {
        state: showAnonymousModal,
        setState: setShowAnonymousModal,
        setTrue: showAnonymousModalCallback
    } = useBooleanState(false);

    // context
    const location = useLocation();
    const navigate = useNavigate();
    const {add: showMessage} = useMessageContext();


    let params: URLSearchParams = useMemo(() => new URLSearchParams(location.search), [location]);
    const getPath = useCallback(() => {

        let origin = params.get("origin");
        return (origin != null) ? origin : Login.defaultPath;
    }, [params]);

    const asyncNoop = useCallback(async () => {
    }, []);

    const login = useCallback(async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoggingIn(true);

        let email: string = extractFromForm(e, "email") as string;
        let password: string = extractFromForm(e, "password") as string;
        let rememberMe: boolean = extractFromForm(e, "rememberMe") as boolean;

        let user = await Session.login(email, password, rememberMe);
        let path = getPath();

        if (user !== null) {
            showMessage("Willkommen zurück!", "SUCCESS", Messages.TIMER);
            navigate(path);
        } else {
            setFailed(true);
            setIsLoggingIn(false);
        }
    }, [getPath, navigate, showMessage, setIsLoggingIn, setFailed]);


    const loginAnonymously = useCallback(async () => {
        setIsLoggingInAnonymously(true);

        let anonUser = await Session.loginAnonymous();
        if (anonUser) {
            let password = anonUser.password
            let username = anonUser.username;

            let user = await Session.login(username, password, true);
            let path = getPath();

            if (user) {
                showMessage("Sie wurden anonym angemeldet!", "SUCCESS", Messages.TIMER);
                navigate(path);
            }
        }

        setIsLoggingInAnonymously(false);
    }, [getPath, navigate, showMessage, setIsLoggingInAnonymously]);

    let email;
    if (params.has("email")) {
        email = params.get("email") ?? undefined;
    }

    let hasCheckNotice = params.has("bestaetigen");

    return (
        <Form className={"loginContainer"} onSubmit={login}>
            <h2>Anmelden</h2>

            <hr/>

            <Form.Floating className={"mb-2 mt-2"}>
                <Form.Control
                    id="email"
                    type="email"
                    name={"email"}
                    size={"sm"}
                    defaultValue={email}
                    placeholder="name@example.com"
                />
                <Form.Label htmlFor={"email"} className={"email"}>E-Mail</Form.Label>
            </Form.Floating>

            <PasswordField autofocus={email !== undefined} check={false}/>

            <Form.Group className={"mb-2 mt-2"}>
                <Form.Check
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    label="Angemeldet bleiben"
                />
            </Form.Group>

            <div className={"feedbackContainer"}>
                {(failed) && (
                    <div className="feedback DANGER">
                        Anmeldung fehlgeschlagen!
                    </div>
                )}
                {(hasCheckNotice) && (
                    <div className={"feedback INFO"}>
                        Eventuell müssen Sie noch Ihre E-Mail-Adresse noch bestätigen!
                    </div>
                )}
                {(params.has("origin")) && (
                    <div className={"feedback INFO"}>
                        Sie müssen sich vorher anmelden um diese Aktion auszuführen!
                    </div>
                )}
            </div>

            <hr/>

            <p><Link to={"/reset-password"} className={"link-primary"}>
                Passwort vergessen?
            </Link></p>

            <ButtonPanel>
                <LoadingButton
                    isLoading={isLoggingIn}
                    defaultChild={"Anmelden"}
                    defaultIcon={faSignInAlt}
                    savingChild={"Wird angemeldet..."}
                    type={"submit"}
                />

                <LoadingButton
                    isLoading={isLoggingInAnonymously}
                    defaultChild={"Anonym Anmelden"}
                    defaultIcon={faUserSecret}
                    savingChild={"Wird angemeldet..."}
                    onClick={showAnonymousModalCallback}
                />
            </ButtonPanel>

            {(
                showAnonymousModal
            ) && (
                <AnonymousModal onShowChange={setShowAnonymousModal} onAgreement={loginAnonymously}
                                onDisagreement={asyncNoop}/>
            )}
        </Form>
    );
}

Login.defaultPath = "/my-profile";

