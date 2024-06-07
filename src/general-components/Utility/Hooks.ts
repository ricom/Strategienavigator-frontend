import {useCallback, useState} from "react";
import * as React from "react";

/**
 * Hook um ein Boolean State zu erstellen. Erstellt häufig genutzte callbacks.
 *
 * Die Referenzen auf die Funktionen ändern sich nicht.
 * @param initialState der erste Wert der, der State haben soll.
 * @return
 */
export function useBooleanState(initialState: boolean) {
    const [state, setState] = useState(initialState);

    const setTrue = useCallback(function () {
        setState(true);
    }, [setState]);
    const setFalse = useCallback(function () {
        setState(false);
    }, [setState]);
    const toggle = useCallback(function () {
        setState((old) => {
            return !old;
        });
    }, [setState]);

    return {
        /**
         * Die State Variable selbst.
         */
        state,
        /**
         * Eine Funktion um den state zu True zu ändern.
         */
        setTrue,
        /**
         * Eine Funktion um den state zu False zu ändern.
         */
        setFalse,
        /**
         * Die normale set Funktion eines states.
         */
        setState,
        /**
         * Eine Funktion die den aktuellen State invertiert.
         */
        toggle
    };

}


export function useControlledInput(defaultValue: string): [string, React.Dispatch<React.SetStateAction<string>>, (event: React.ChangeEvent<any>) => void, () => void] {
    const [value, setValue] = React.useState(defaultValue);
    const onChangedInput = useCallback(function (event: React.ChangeEvent<any>) {
        event.preventDefault();
        setValue(event.target.value);
    }, [setValue]);
    const reset = useCallback(function () {
        setValue(defaultValue);
    }, [setValue, defaultValue]);
    return [value, setValue, onChangedInput, reset];
}