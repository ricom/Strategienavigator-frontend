import {SettingsList} from "../Settings/SettingsList";
import {createContext, ReactElement, ReactNode, useCallback, useEffect, useMemo, useState} from "react";
import {SettingsCache} from "../API/SettingsCache";
import {useUserContext} from "./UserContextComponent";


export interface ISettingsContext {
    /**
     * sorgt daf�r, dass alle Einstellungen aus Backend neu geladen werden
     */
    causeUpdate: () => void,
    /**
     * Liste aller Einstellungen
     */
    settings: SettingsList,
    /**
     * Ob die Einstellungen gerade aus dem geladen werden
     */
    isLoading: boolean
}

export const SettingsContext = createContext<ISettingsContext>({
    causeUpdate: () => {
    },
    settings: new SettingsList(),
    isLoading: false
});

export type SettingsChanger = (oldSettings: SettingsList, newSettings: SettingsList) => void;


export function _SettingsContextComponent({children}: { children: ReactNode }) {
    // state
    const [isLoading, setLoading] = useState(false);
    const [settings, setSettings] = useState(new SettingsList());
    // context
    const {user} = useUserContext();

    let settingsCache: SettingsCache | undefined = useMemo(() => {
        if (user == null) {
            return undefined;
        }
        return new SettingsCache(user.getID());
    }, [user]);
    /**
     * Lädt alle Einstellungen aus dem Backend neu, Ändert die State variable zu den neuen Werten
     */
    const updateSettings = useCallback(
        async () => {
            if (settingsCache) {
                setLoading(true)

                await settingsCache.updateUserData();

                for (const f of _SettingsContextComponent.settingsChanger) {
                    f(settingsCache.userSettings, settingsCache.userSettings);
                }

                setLoading(false);
                setSettings(settingsCache.userSettings);
            }
        }, [setLoading, setSettings, settingsCache]);

    useEffect(() => {
        updateSettings();
    }, [updateSettings]);


    const settingsContext = useMemo((): ISettingsContext => {
        return {
            settings: settings,
            causeUpdate: updateSettings,
            isLoading: isLoading
        }
    }, [settings, updateSettings, isLoading]);


    return (
        <SettingsContext.Provider value={settingsContext}>
            {children}
        </SettingsContext.Provider>
    );
}


/**
 * Listener
 */
_SettingsContextComponent.settingsChanger = [] as SettingsChanger[];

_SettingsContextComponent.addSettingsChangeListener = function (listener: SettingsChanger) {
    if (!_SettingsContextComponent.settingsChanger.some((find) => find === listener)) {
        _SettingsContextComponent.settingsChanger.push(listener);
    }
}

_SettingsContextComponent.removeSettingsChangeListener = function (listener: SettingsChanger) {
    let index = _SettingsContextComponent.settingsChanger.indexOf(listener);
    if (index >= 0) {
        _SettingsContextComponent.settingsChanger.slice(index, 1);
    }
}

// Is here to check fo usages more easily. (Find usages doesn't work on the above functions somehow).
const SettingsContextComponent = _SettingsContextComponent as {
    ({children}: { children: ReactNode }): ReactElement,
    addSettingsChangeListener: (listener: SettingsChanger) => void,
    removeSettingsChangeListener: (listener: SettingsChanger) => void
}

export {SettingsContextComponent};


