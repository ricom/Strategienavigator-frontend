import {useCallback} from "react";
import {matchPath, NavigateFunction, useNavigate} from "react-router-dom";

export type ErrorPageChanger = (code: number, callback?: (...args: any) => any) => void

export function showErrorPage(navigate: NavigateFunction, code: number, callback?: (...args: any) => any) {

    if (!matchPath("/error/:id", document.location.pathname)) {
        navigate("/error/" + code);
    }

    if (callback) {
        callback(callback?.arguments);
    }
}

export function useErrorPageFunction(): ErrorPageChanger {
    const navigate = useNavigate();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useCallback(showErrorPage.bind(null, navigate), [navigate]);
}
