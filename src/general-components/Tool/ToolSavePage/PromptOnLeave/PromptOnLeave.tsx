import React, {useCallback, useEffect, useState} from "react";
import './prompt-on-leave.sass';
import {Prompt, useHistory} from "react-router";
import {ConfirmToolRouteChangeModal} from "../../ConfirmToolRouteChangeModal/ConfirmToolRouteChangeModal";
import * as H from "history";


export interface PromptOnLeaveProps {
    shouldPreventChange: boolean
}

export function PromptOnLeave({shouldPreventChange}: PromptOnLeaveProps) {

    // State
    const [showConfirmToolRouteChangeModal, setShowConfirmToolRouteChangeModal] = useState(false);
    const [lastLocation, setLastLocation] = useState<string | undefined>(undefined);

    // Context
    const history = useHistory();

    const denyRouteChange = useCallback((location: H.Location): boolean => {
        // Don't show if save is unchanged
        if (!shouldPreventChange)
            return true;

        setShowConfirmToolRouteChangeModal(true);
        setLastLocation(location.pathname)
        return (location.pathname === lastLocation);
    }, [setShowConfirmToolRouteChangeModal, shouldPreventChange, lastLocation]);

    const hideRouteChangeModal = useCallback(() => {
        setShowConfirmToolRouteChangeModal(false);
        setLastLocation(undefined);
    }, [setShowConfirmToolRouteChangeModal, setLastLocation]);

    const performRouteChange = useCallback(() => {

        if (!lastLocation) {
            history.goBack();
            return;
        }
        setShowConfirmToolRouteChangeModal(false);
        history.push(lastLocation);

    }, [history, lastLocation, setShowConfirmToolRouteChangeModal]);

    useEffect(() => {
        /**
         * Causes a confirmation window to pop up, when leaving the web page.
         * @param e
         */
        const onBeforeUnload = (e: BeforeUnloadEvent) => {
            if (shouldPreventChange) {
                e.preventDefault();
                e.returnValue = "string";
                return "string";
            }
            return undefined;
        }
        window.addEventListener("beforeunload", onBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", onBeforeUnload);
        }
    }, [shouldPreventChange]);


    return (<>
        <Prompt message={denyRouteChange}/>
        <ConfirmToolRouteChangeModal
            show={showConfirmToolRouteChangeModal}
            onNo={hideRouteChangeModal}
            onYes={performRouteChange}
        />
    </>)
}