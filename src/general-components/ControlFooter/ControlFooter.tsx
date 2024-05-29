import React, {ReactNode} from "react";
import {IconDefinition} from "@fortawesome/fontawesome-svg-core";
import {faCogs, faPlusSquare} from "@fortawesome/free-solid-svg-icons";
import {NavLink} from "react-router-dom";
import {faCaretRight, faHome, faSave, faUndo} from "@fortawesome/free-solid-svg-icons/";

import "./control-footer.scss";
import {useFooterContext} from "../Contexts/FooterContextComponent";
import FAE from "../Icons/FAE";
import {useIsDesktop} from "../Contexts/DesktopContext";


export interface ControlFooterProps {
    places: number
}

interface ControlFooterItem {
    disabled?: boolean
}

export interface NextStepItem extends ControlFooterItem {
    nextStep: () => void
}


export interface SaveStepsItem extends ControlFooterItem {
    saveSteps: string
}

export interface ResetStepsItem extends ControlFooterItem {
    reset: () => any
}

export interface ButtonItem extends ControlFooterItem {
    button: {
        text: string
        icon: IconDefinition
        callback: () => any
    }
}

export interface ToolItem extends ControlFooterItem {
    tool: {
        icon: IconDefinition
        title: string
        /**
         * Must be an absolute link.
         */
        link: string
    }
}

export interface SettingItem extends ControlFooterItem {
    settings: boolean
}

export interface NewToolItem extends ControlFooterItem {
    newTool: {
        title: string,
        callback: () => any
    }
}

export interface HomeItem extends ControlFooterItem {
    home: boolean
}

export type ControlFooterItemType =
    null
    | NextStepItem
    | SaveStepsItem
    | ResetStepsItem
    | ToolItem
    | SettingItem
    | NewToolItem
    | HomeItem
    | ButtonItem;

function getItem(item: ControlFooterItemType | undefined): null | ReactNode {
    if (item === undefined || item === null) {
        return null;
    }
    if ("home" in item) {
        return (
            <NavLink key={"home"} to={"/"} end>
                <FAE icon={faHome}/> Startseite
            </NavLink>
        );
    }
    if ("nextStep" in item) {
        return (
            <button disabled={item.disabled} key={"nextStep"} className={"btn-transparent"}
                    onClick={item.nextStep}
                    type={"button"}>
                <FAE icon={faCaretRight}/> Weiter
            </button>
        );
    }
    if ("saveSteps" in item) {
        return (
            <button disabled={item.disabled} key={"saveSteps"} className={"btn-transparent"}
                    form={item.saveSteps} type={"submit"}>
                {/*TODO change to non submit type*/}
                <FAE icon={faSave}/> Speichern
            </button>

        );
    }
    if ("reset" in item) {
        return (
            <button disabled={item.disabled} key={"reset"} onClick={() => item.reset()}
                    className={"btn-transparent"}
                    type={"button"}>
                <FAE icon={faUndo}/> Zurücksetzen
            </button>
        );
    }
    if ("tool" in item) {
        return (
            <NavLink key={"tool"} to={item.tool?.link} end>
                <FAE icon={item.tool?.icon}/> {item.tool?.title}
            </NavLink>
        );
    }
    if ("settings" in item) {
        return (
            <NavLink key={"settings"} to={"/settings"} end>
                <FAE icon={faCogs}/> Einstellungen
            </NavLink>
        );
    }
    if ("newTool" in item) {
        return (
            <button disabled={item.disabled} key={"newTool"} type={"button"} className={"btn-transparent"}
                    onClick={() => item.newTool.callback()}>
                <FAE icon={faPlusSquare}/> {item.newTool?.title}
            </button>
        );
    }
    if ("button" in item) {
        return (
            <button disabled={item.disabled} key={"button"} className={"btn-transparent"}
                    onClick={() => item.button.callback()}
                    type={"button"}>
                <FAE icon={item.button.icon}/> {item.button.text}
            </button>
        );
    }
}

export function ControlFooter({places}: ControlFooterProps) {
    // Context

    const {items} = useFooterContext();
    const isDesktop = useIsDesktop();


    let slots = Array<ReactNode>();
    for (let i = 1; i <= places; i++) {
        const value = items.get(i);
        slots.push((
            <div key={i} className={"item"}>
                {getItem(value)}
            </div>
        ));
    }

    let classes = ["controlFooter", "nav"];
    if (!isDesktop) classes.push("show");

    return (
        <div className={classes.join(" ")}>
            {slots}
        </div>

    );

}
