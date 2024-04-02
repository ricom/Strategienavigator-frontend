import {SettingResource} from "../Datastructures";


export interface UserSetting extends SettingResource {
    /**
     * Current Value of the setting, if exists is false, this has the default value of the setting
     */
    value: string
    /**
     * Whether the user already did override the default value
     */
    exists: boolean
}

/**
 * Klasse um alle Einstellungen zu verwalten.
 *
 * Um Einstellungen hinzuzufügen muss eine neue Instanz erstellt werden.
 *
 * Die Klasse wird verwendet um doppelte Einträge auszuschließen und das abrufen einzelner Einstellungen effizienter und einfacher zu machen
 */
export class SettingsList {
    /**
     * Alle Einstellungen, die id wird als key verwendet
     * @private
     */
    private readonly idDict: Array<UserSetting>;
    /**
     * Alle Einstellungen, der Name der Einstellung wird als key verwendet
     * @private
     */
    private readonly nameDict: { [id: string]: UserSetting };


    constructor() {
        this.idDict = [];
        this.nameDict = {};
    }

    /**
     * Erstellt eine neue Instanz auf der Datengrundlage des übergeben Arrays
     * @param settings Alle Einstellungen
     * @constructor
     */
    public static FromArray(settings: UserSetting[]) {
        let sList = new SettingsList();
        for (const s of settings) {
            sList.addSetting(s)
        }
        return sList;
    }

    /**
     * Gibt die Einstellung zurück welche die übergebene id besitzt
     * @param settingId
     */
    public getSetting(settingId: number): UserSetting | undefined {
        return this.idDict[settingId];
    }

    /**
     * Gibt die Einstellung zurück welche den übergeben Namen besitzt
     */
    public getSettingByName(settingName: string): UserSetting | undefined {
        return this.nameDict[settingName];
    }

    /**
     * Gibt alle Einstellungen als Array zurück
     */
    public toArray() {
        let newArray = new Array<UserSetting>();
        for (let u of this.idDict) {
            if (u) {
                newArray.push(u);
            }
        }
        return newArray;
    }

    /**
     * FÜgt eine Einstellung in das Array hinzu
     * @param setting
     * @private
     */
    private addSetting(setting: UserSetting) {
        if (!(setting.name in this.idDict)) {
            this.idDict[setting.id] = setting;
            this.nameDict[setting.name] = setting;
        } else {
            throw new Error("Use set setting to replace a setting");
        }
    }
}
