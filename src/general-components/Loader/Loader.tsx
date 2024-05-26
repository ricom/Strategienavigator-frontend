import React, {ReactNode, useEffect, useState} from "react";
import {Spinner} from "react-bootstrap";

import "./loader.scss";

export type LoaderVariants = "auto" | "light" | "dark" | "style";
export type LoaderAlignments = "center" | "right" | "left";

export interface LoaderProps {
    /**
     * @deprecated use waitFor property instead.
     */
    payload?: Array<() => Promise<any>>
    /**
     * A Promise which will stop the loading animation when it completes.
     *
     * Tip: To pass multiple Promises use: Promise.all();
     */
    waitFor?: Promise<any>
    text?: ReactNode
    loaded?: boolean
    fullscreen?: boolean
    variant?: LoaderVariants
    alignment?: LoaderAlignments
    transparent?: boolean
    animate?: boolean
    size?: number,
    children?: ReactNode
}

function loadPayload(payload: Array<() => Promise<any>> | undefined, waitFor: Promise<any> | undefined, onLoadFinished: () => void) {
    let promises: Array<PromiseLike<any>>;

    // deprecated should be removed gracefully
    if (payload !== undefined && payload.length > 0) {
        promises = payload.map((func) => func());
    } else {
        promises = [];
    }

    if (waitFor !== undefined) {
        promises.push(waitFor);
    }

    if (promises.length > 0) {
        Promise.all(promises).then(onLoadFinished, onLoadFinished);
    }

}


export function Loader({
                           loaded: loadedProp,
                           children,
                           waitFor,
                           animate,
                           size,
                           text,
                           transparent,
                           variant,
                           fullscreen,
                           alignment,
                           payload
                       }: LoaderProps) {
    const [loadedState, setLoaded] = useState(!!loadedProp);


    useEffect(() => {
        let aborted = false;

        function onLoaded() {
            if (aborted) {
                return;
            }
            setLoaded(true);
        }

        loadPayload(payload, waitFor, onLoaded);

        return function () {
            aborted = true;
        }
        // TODO remove payload props to remove the eslint suppression.
        // eslint-disable-next-line
    }, [waitFor, setLoaded]);

    let loaded = loadedProp ?? loadedState;

    return (
        <>
            {(animate || !loaded) && (
                <div
                    className={
                        ["loader",
                            loaded && "loaded",
                            fullscreen ? "fullscreen" : "",
                            animate ? "animate" : "",
                            transparent ? "transparent" : "",
                            alignment ?? "center",
                            variant ?? "auto"
                        ].join(" ")
                    }>
                    <Spinner className={"spinner"}
                             style={(size) ? {width: size, height: size} : {}}
                             animation={"border"}/>
                    <span className={"text"}>{text}</span>
                </div>
            )}

            {(loaded) && (
                children
            )}
        </>
    );

}
