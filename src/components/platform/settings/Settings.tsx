import {Component} from "react";

import "./settings.scss";
import {ToggleSettingType} from "../../../general-components/Settings/Types/ToggleType/ToggleSettingType";
import {SettingsTypeProps} from "../../../general-components/Settings/Types/SettingsTypeProps";
import {Button} from "react-bootstrap";
import * as SettingsAPI from "../../../general-components/API/calls/Settings";
import {Session} from "../../../general-components/Session/Session";
import {Loader} from "../../../general-components/Loader/Loader";
import {SettingsContext} from "../../../general-components/Contexts/SettingsContextComponent";
import {
    PortfolioQuadrantsSettingType
} from "../../../general-components/Settings/Types/PortfolioQuadrantsType/PortfolioQuadrantsSettingType";


export interface UserSettingProxy {
    /**
     * id der Einstellung
     */
    setting_id: number
    /**
     * Wert nachdem der User ihn geändert hat (kann der den selben Wert haben wie die Einstellung wenn der User den wert mehrfach ändert)
     */
    newValue: string
}

export interface SettingsState {
    /**
     * Every User Setting which the user changed after last reset
     */
    settings: UserSettingProxy[]
    /**
     * whether the app is currently saving the settings
     */
    saving: boolean
}

/**
 * Zeigt alle Einstellungen an und gibt die Möglichkeit diese zu ändern
 */
export class Settings extends Component<{}, SettingsState> {

    /**
     * Map die ein JSXElement für den angegeben Einstellungstyp liefert
     *
     * Schlüssel ist der Name des Typs
     */
    static typeDict: { [id: string]: (props: SettingsTypeProps, key: string | number) => JSX.Element } = {
        "toggle": (props: SettingsTypeProps, key: string | number) => {
            return <ToggleSettingType {...props} key={key}/>
        },
        "portfolio-quadrants": (props: SettingsTypeProps, key: string | number) => {
            return <PortfolioQuadrantsSettingType {...props} key={key}/>
        }
    }

    /**
     * Definiert auf welchen Context zugegriffen werden soll
     */
    static contextType = SettingsContext;
    context!: React.ContextType<typeof SettingsContext>

    constructor(props: Readonly<{}> | {});
    constructor(props: {}, context: any);
    constructor(props: {} | Readonly<{}>, context?: any) {
        super(props, context);
        this.state = {settings: [], saving: false};
    }


    /**
     * Callback wenn eine Einstellung geändert wird
     * @param id id der Einstellung
     * @param value neuer Wert der Einstellung
     */
    settingChanged(id: number, value: string) {
        let userProxy = this.getUserSettingProxy(id);
        let userSettingsArray = this.state.settings.slice();
        if (userProxy) {
            if (value) {
                userProxy.newValue = value;
            } else {
                userSettingsArray.splice(userSettingsArray.indexOf(userProxy), 1);
            }
        } else {
            userSettingsArray.push({
                setting_id: id,
                newValue: value
            });
        }

        this.setState({
            settings: userSettingsArray
        });
    }

    /**
     * gibt den UserProxy eintrag in settings zurück, welcher die gegebene id besitzt
     * @param settingId die Id der Einstellung
     */
    getUserSettingProxy(settingId: number) {
        return this.state.settings.find(value => value.setting_id === settingId);
    }

    render() {
        let settings = this.context.settings.toArray().map(setting => {
            let f = Settings.typeDict[setting.type];
            if (f) {
                let userSetting = this.state.settings.find(us => us.setting_id === setting.id);
                let v = setting.value;
                if (userSetting) {
                    if (userSetting.newValue) {
                        v = userSetting.newValue;
                    }
                }
                return f({
                    name: setting.name,
                    description: setting.description,
                    extras: setting.extras,
                    value: v,
                    valueChanged: this.settingChanged.bind(this, setting.id)
                }, setting.id);
            }
            return null;
        });

        return (
            <>
                <Loader loaded={!this.context.isLoading} transparent={true}>

                    <div className={"settings"}>
                        {settings.map((item, i) => {
                            return (
                                <div className={"setting"} key={`settings-${i}`}>
                                    {item}
                                </div>
                            );
                        })}
                    </div>

                    <Button variant={"primary"} className={"mt-3"}
                            onClick={async () => await this.saveSettings()}
                            disabled={this.state.saving}>
                        {this.state.saving ? "Speichert..." : "Speichern"}
                    </Button>
                </Loader>
            </>
        );
    }

    /**
     * Setzt alle Änderungen der Users zurück
     * @private
     */
    private reset() {
        this.setState({
            settings: []
        });
    }

    /**
     * Speichert alle geänderten Einstellungen, nach dem Speichern werden alle Einstellungen aus den Backend neu geladen
     * @private
     */
    private async saveSettings() {
        this.setState({
            saving: true
        });
        const promises = [];
        const context = this.context;
        let settingsList = context.settings;
        for (let s of this.state.settings) {
            let setting = settingsList.getSetting(s.setting_id)!!;
            if (!Object.is(setting.value, s.newValue)) {
                let f = SettingsAPI.createUserSettings;
                if (setting.exists)
                    f = SettingsAPI.updateUserSettings;
                promises.push(f(Session.currentUser!.getID(), setting.id, s.newValue));
            }
        }
        await Promise.all(promises);
        context.causeUpdate();
        this.setState({
            saving: false
        });
        this.reset();
    }
}
