import React, {useEffect, useState} from "react";
import {faCheck} from "@fortawesome/free-solid-svg-icons";
import {useParams} from "react-router";
import {verifyEmail} from "../../../../general-components/API/calls/Email";
import {faTimes} from "@fortawesome/free-solid-svg-icons/";
import {Loader} from "../../../../general-components/Loader/Loader";
import {Button} from "react-bootstrap";
import {Link} from "react-router-dom";

import "./email-verification.scss";
import FAE from "../../../../general-components/Icons/FAE";


export interface EmailVerificationState {
    loaded: boolean
    success?: boolean
    email?: string
}

export interface RouteMatches {
    token: string
}

export function EmailVerification() {
    // State

    const [loaded, setLoaded] = useState(false);
    const [success, setSuccess] = useState(false);
    const [email, setEmail] = useState<string | undefined>(undefined);

    // context
    const {token} = useParams<{ token: string }>();

    useEffect(() => {
        let canceled = false;
        verifyEmail(token).then((call) => {
            if (call && !canceled) {
                setLoaded(true);
                setSuccess(call.success);
                setEmail(call.success ? call.callData.email : undefined);
            }
        }, (reason) => {
            console.error(reason);
        });
        return () => {
            canceled = true;
        }
    }, [setSuccess, setEmail, setLoaded, token]);

    return (
        <div className="emailVerification">
            {(!loaded) ? (
                <>
                    <Loader loaded={false} size={100} animate={false} transparent/>
                </>
            ) : (
                (success) ? (
                    <>
                        <FAE icon={faCheck}/>
                        <h4>Ihre E-Mail wurde erfolgreich verifiziert!</h4>

                        <Link to={"/login" + ((email) ? (`?email=${email}`) : "")}>
                            <Button variant="dark">
                                Jetzt Anmelden
                            </Button>
                        </Link>
                    </>
                ) : (
                    <>
                        <FAE icon={faTimes}/>
                        <h4>Die Verifikation Ihrer E-Mail Adresse ist fehlgeschlagen!</h4>
                    </>
                )
            )}

        </div>
    );
}
