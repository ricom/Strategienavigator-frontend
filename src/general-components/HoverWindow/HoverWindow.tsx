import {ComponentClass, createElement, FunctionComponent, memo, ReactElement} from "react";
import {OverlayTrigger, Popover} from "react-bootstrap";
import {OverlayTriggerType} from "react-bootstrap/OverlayTrigger";
import {OverlayInjectedProps} from "react-bootstrap/Overlay";
import {Placement} from "react-bootstrap/types";


interface HoverWindowCustomPopupProps {
    title?: string,
    description?: string
    disabled?: boolean
}

interface HoverWindowProps extends HoverWindowCustomPopupProps {
    /**
     * Wenn definiert ersetzt das zurückgegebene
     * @param props
     */
    customPopUp?: FunctionComponent<HoverWindowCustomPopupProps & OverlayInjectedProps> | ComponentClass<HoverWindowCustomPopupProps & OverlayInjectedProps>

    children: ReactElement
    /**
     * Bei welcher Aktion sich das Popup Fenster öffnen soll
     */
    trigger?: OverlayTriggerType | OverlayTriggerType[]
    /**
     * Callback wenn sich das Popup Fenster öffnet oder schließt
     * @param nextShow ob sich das Popup Fenster öffnet oder schließt
     */
    onToggle?: (nextShow: boolean) => void;
    /**
     * Stellt ein auf welcher Seite, das Popup Fenster angezeigt werden soll
     */
    placement?: Placement
    /**
     * Definiert ob alle click events für die children deaktiviert werden sollen. Das wird benötigt, wenn die children disabled sind oder können
     */
    pointerDisable?: boolean
}

/**
 * Zeigt ein popover fenster mit der definierten Überschrift und beschreibung
 *
 */
const HoverWindow = memo(function HoverWindow(componentProps: HoverWindowProps) {

    // load default values
    const {
        customPopUp,
        children,
        trigger = ["hover", "focus"],
        onToggle,
        placement,
        ...customProps
    } = componentProps;
    customProps.disabled = customProps.disabled ?? false;
    customProps.pointerDisable = customProps.pointerDisable ?? false;
    // early exit
    if (customProps.disabled || (customProps.title === undefined && customProps.description === undefined)) {
        return children;
    }

    // hide the HoverWindowCustomPopupProps from the OverlayTrigger
    const popupFunction = customPopUp !== undefined ? (props: OverlayInjectedProps) => {
        return createElement(customPopUp, {...props, ...customProps});
    } : undefined;


    const popover = popupFunction ?? (
        <Popover id="popover-basic">
            {customProps.title !== undefined ? (
                <Popover.Header as="h3">{customProps.title}</Popover.Header>) : undefined}
            {customProps.description !== undefined ? (
                <Popover.Body>
                    {customProps.description}
                </Popover.Body>) : undefined}
        </Popover>
    );
    return (
        <OverlayTrigger trigger={trigger} overlay={popover}
                        onToggle={onToggle} placement={placement}>
            {customProps.pointerDisable ? (
                <div>
                    <div style={{pointerEvents: "none"}}>
                        {children}
                    </div>
                </div>
            ) : <div>{children}</div>}

        </OverlayTrigger>
    );
});

export {
    HoverWindow
}

export type {
    HoverWindowProps,
    HoverWindowCustomPopupProps
}
