import React, {useEffect} from "react";
import './prompt-on-leave.sass';
import {ConfirmToolRouteChangeModal} from "../../ConfirmToolRouteChangeModal/ConfirmToolRouteChangeModal";
import {useBlocker} from "react-router-dom";


export interface PromptOnLeaveProps {
    shouldPreventChange: boolean,
    /**
     * Deaktiviert den beforeunload listener.
     */
    disableNativeDialog?: boolean
}

export function PromptOnLeave({shouldPreventChange, disableNativeDialog = false}: PromptOnLeaveProps) {


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
        if (!disableNativeDialog) {
            window.addEventListener("beforeunload", onBeforeUnload);
        }

        return () => {
            if (!disableNativeDialog) {
                window.removeEventListener("beforeunload", onBeforeUnload);
            }
        }
    }, [disableNativeDialog, shouldPreventChange]);

    const blocker = useBlocker(shouldPreventChange);

    return (<>
        <ConfirmToolRouteChangeModal
            show={blocker.state === "blocked"}
            onNo={() => {
                if (blocker.reset)
                    blocker.reset()
            }}
            onYes={() => {
                if (blocker.proceed)
                    blocker.proceed()
            }}
        />
    </>)
}