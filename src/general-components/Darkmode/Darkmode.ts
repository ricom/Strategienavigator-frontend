import {SettingsList} from "../Settings/SettingsList";
import {Session, UserCallback} from "../Session/Session";
import {SettingsChanger} from "../Contexts/SettingsContextComponent";


/**
 * Wechselt das Website-Theme in den Darkmode und zurück wenn der Benutzer abgemeldet/angemeldet wird
 *
 * @param {User | null} user Das Benutzerobjekt
 * @constructor
 */
export const DarkModeUserChanged: UserCallback = (user) => {
    if (user === null) {
        // Darkmode
        localStorage.removeItem("darkmode");

        let settings = SettingsList.FromArray([{
            name: "Dark Mode",
            value: "false",
            id: 1,
            type: "",
            extras: "",
            description: "",
            exists: true,
            default: "false"
        }]);
        DarkModeChanger(settings, settings);
    }
}

/**
 * Wechselt das Website-Theme in den Darkmode und zurück
 *
 * @param {SettingsList} oldSettings Die alten Websiteeinstellungen
 * @param {SettingsList} newSettings Die neuen Websiteeinstellungen
 * @constructor
 */
export const DarkModeChanger: SettingsChanger = (oldSettings: SettingsList, newSettings: SettingsList) => {
    let setting = newSettings.getSettingByName("Dark Mode");
    if (setting === undefined) {
        return;
    }
    document.body.className = "";
    document.body.classList.add("smooth-transition");
    if (setting.value && setting.value === "true") {
        document.body.classList.add("dark");
    } else {
        document.body.classList.add("light");
    }
    localStorage.setItem("darkmode", setting.value);

    setTimeout(() => {
        document.body.classList.remove("smooth-transition");
    }, 500);
}

/**
 * Schaut, sobald der DOM fertiggeladen ist nach, ob der Darkmode in der LocalStorage vorhanden ist oder nicht.
 * Ist dies der Fall wird der Darkmode initialisiert.
 *
 * Dient zum flüssigen Übergang.
 */
// TODO: einbauen dass dies nicht umgangen werden kann (weil Darkmode nur für angemeldete Benutzer)
window.addEventListener('load', function () {
    let darkmode = localStorage.getItem("darkmode");
    if (darkmode && darkmode === "true") {
        document.body.className = "dark";
    }
});

// DEV help
// TODO: maybe remove later
window.addEventListener("keydown", (event) => {
    if (Session.isLoggedIn() && event.keyCode === 119 /* F8 */) {
        if (document.body.classList.contains("dark")) {
            document.body.className = "light";
        } else {
            document.body.className = "dark";
        }
    }
});