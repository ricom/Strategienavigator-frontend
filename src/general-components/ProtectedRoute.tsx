import {Redirect, useHistory, useLocation} from "react-router";
import {Link} from "react-router-dom";
import {Session} from "./Session/Session";
import {Button, Modal} from "react-bootstrap";
import {ReactNode, useState} from "react";
import {Loader} from "./Loader/Loader";
import {faCheckCircle, faExclamationTriangle, faTimesCircle} from "@fortawesome/free-solid-svg-icons";
import FAE from "./Icons/FAE";
import {ModalCloseable} from "./Modal/ModalCloseable";
import {useUserContext} from "./Contexts/UserContextComponent";


interface ProtectedRouteProps {
    loggedIn?: boolean | undefined
    anonymous?: boolean | undefined
    loginAnonymous?: boolean | undefined
    children?: ReactNode
}

export function AnonymousModal(props: {
    onAgreement: () => Promise<void>,
    onDisagreement: () => Promise<void>,
    onShowChange?: (show: boolean) => void
}) {
    let [showModal, setShowModal] = useState(true);
    let [agreementLoading, setAgreementLoading] = useState(false);
    let [disagreementLoading, setDisagreementLoading] = useState(false);

    return (
        <ModalCloseable
            show={showModal}
            backdrop="static"
            onHide={async () => {
                setDisagreementLoading(true);
                await props.onDisagreement();
                setShowModal(false);
                setDisagreementLoading(false);

                if (props.onShowChange) {
                    props.onShowChange(false);
                }
            }}
            centered
            keyboard={true}
        >
            <Modal.Header>
                <b><FAE icon={faExclamationTriangle}/> Achtung!</b>
            </Modal.Header>
            <Modal.Body>
                <b>Wollen Sie sich als anonymer Nutzer anmelden?</b><br/>
                <br/>
                Als anonymer Nutzer können Sie nur auf Ihrem aktuellen Gerät und nur in
                Ihrem aktuellen Browser auf erstellte Analysen zugreifen.<br/><br/>

                <b>Die Daten von anonymen Nutzern werden nach 30 Tagen gelöscht.</b><br/><br/>

                Außerdem können Sie nicht die vollen Funktionalitäten der Anwendung nutzen. Sollten Sie daher bereits
                einen Account besitzen, <Link onClick={() => {
                setShowModal(false);

                if (props.onShowChange) {
                    props.onShowChange(false);
                }
            }} to={"/login"}>loggen Sie sich bitte mit diesem ein</Link>, oder <Link onClick={() => {
                setShowModal(false);

                if (props.onShowChange) {
                    props.onShowChange(false);
                }
            }} to={"/register"}>Registrieren Sie sich</Link>.
            </Modal.Body>
            <Modal.Footer>


                <Button disabled={agreementLoading} onClick={async () => {
                    setAgreementLoading(true);
                    await props.onAgreement();
                    setShowModal(false);
                    setAgreementLoading(false);

                    if (props.onShowChange) {
                        props.onShowChange(false);
                    }
                }}>
                    <Loader payload={[]} variant={"auto"} transparent size={15} text={<span>&nbsp;Annehmen</span>}
                            loaded={!agreementLoading}>
                        <FAE icon={faCheckCircle}/> Annehmen
                    </Loader>
                </Button>

                <Button disabled={disagreementLoading} onClick={async () => {
                    setDisagreementLoading(true);
                    await props.onDisagreement();
                    setShowModal(false);
                    setDisagreementLoading(false);

                    if (props.onShowChange) {
                        props.onShowChange(false);
                    }
                }}>
                    <Loader payload={[]} variant={"auto"} transparent size={15} text={<span>&nbsp;Ablehnen</span>}
                            loaded={!disagreementLoading}>
                        <FAE icon={faTimesCircle}/> Ablehnen
                    </Loader>
                </Button>
            </Modal.Footer>
        </ModalCloseable>
    );
}

function ProtectedRoute({loginAnonymous, anonymous, loggedIn, children}: ProtectedRouteProps) {
    let history = useHistory();
    let location = useLocation();
    const {user, isLoggedIn} = useUserContext();

    if (loggedIn !== undefined) {
        if (loggedIn === isLoggedIn) {
            if (anonymous !== undefined) {
                if (anonymous !== user?.isAnonymous()) {
                    return (
                        <Redirect to={"/"}/>
                    );
                }
            }
        } else if (loggedIn) {
            if (loginAnonymous !== undefined && loginAnonymous) {
                const loginAnonymous = async () => {
                    let anonUser = await Session.loginAnonymous();
                    if (anonUser) {
                        await Session.login(anonUser.username, anonUser.password, true);
                    }
                }
                const redirectUser = async () => {
                    history.push("/");
                }

                return (
                    <AnonymousModal onDisagreement={redirectUser} onAgreement={loginAnonymous}/>
                );
            }
            return (
                <Redirect to={"/login?origin=" + location.pathname + location.search}/>
            );
        } else {
            return (
                <Redirect to={"/"}/>
            );
        }
    }

    return (<>{children}</>);
}

export {
    ProtectedRoute
}
