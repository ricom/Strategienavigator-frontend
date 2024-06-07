import * as React from "react";
import {Component} from "react";
import {Form, FormControlProps} from "react-bootstrap";
import {Omit, ReplaceProps} from "react-bootstrap/helpers";
import {APIArgs, CallInterface} from "../API/API";
import {faTimes} from "@fortawesome/free-solid-svg-icons/";
import {Loader} from "../Loader/Loader";

import "./unique-check.scss";
import {AvailabilityCheckResource, DefaultResponse} from "../Datastructures";
import FAE from "../Icons/FAE";


export interface UniqueCheckProps {
    /**
     * Methode die ein Network Request schicken sollte, welcher mit Informationen über die Verfügbarkeit der Ressource antworten sollte.
     */
    callback?: ((input: string, apiArgs?: APIArgs) => Promise<CallInterface<DefaultResponse<AvailabilityCheckResource>> | null>)
    /**
     * Name der Ressource die dem User angezeigt wird
     *
     * Sollte die Einzahl sein
     */
    entityName: string
    /**
     * Ob Fehler angezeigt werden sollen
     */
    suppressErrors: boolean
    /**
     * Wird aufgerufen wenn der Wert sich ändert
     * @param {string} value Der Wert
     */
    onChangedValue?: (value: string) => void,
    /**
     * Wird aufgerufen wenn der Wert sich ändert
     * @param {React.ChangeEvent} event welches das input field ändert.
     */
    onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void

}

export interface UniqueCheckState {
    /**
     * Ob der Netzwerk Request gerade lädt
     */
    isLoading: boolean
    /**
     * Ob der Netzwerk Request erfolgreich war
     *
     * wenn noch kein Request abgeschickt wurde oder wenn fehler aufgetreten ist das Feld undefined
     */
    success?: boolean
    /**
     * Grund wieso die Resource nicht mehr verfügbar ist
     */
    reason?: "taken" | "blocked" | "invalid"
    /**
     * Ob beim letzten Request ein Fehler aufgetreten ist
     */
    error: boolean
}

export class UniqueCheck extends Component<ReplaceProps<"input", FormControlProps> & UniqueCheckProps, UniqueCheckState> {
    static defaultProps = {
        suppressErrors: false,

    }
    private timeout: NodeJS.Timeout | undefined;

    constructor(props: (Omit<Pick<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "key" | keyof React.InputHTMLAttributes<HTMLInputElement>> & {
        ref?: ((instance: HTMLInputElement | null) => void) | React.RefObject<HTMLInputElement> | null | undefined;
    }, FormControlProps> & FormControlProps & UniqueCheckProps) | Readonly<Omit<Pick<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "key" | keyof React.InputHTMLAttributes<HTMLInputElement>> & {
        ref?: ((instance: HTMLInputElement | null) => void) | React.RefObject<HTMLInputElement> | null | undefined;
    }, FormControlProps> & FormControlProps & UniqueCheckProps>) {
        super(props);

        this.state = {
            isLoading: false,
            error: false
        };
    }

    public isAvailable = (): boolean | undefined => {
        return this.state.success;
    }

    public getReason = (): "taken" | "blocked" | "invalid" | undefined => {
        return this.state.reason;
    }

    /**
     * Gibt ein Element zurück, welches anzeigt, ob es Fehler gibt oder ob die Anfrage erfolgreich war
     */
    renderErrors = () => {
        return (<>
            {(!this.state.isLoading && this.state.error) && (
                <div className={"feedback DANGER"}>
                    <FAE icon={faTimes}/> {this.getFailMessage()}
                </div>
            )}
            {(!this.state.isLoading && !this.state.error && this.state.success !== undefined && this.state.success) && (
                <div className={"feedback SUCCESS"}>
                    {this.getMessage()}
                </div>
            )}

            {(!this.state.isLoading && !this.state.error && this.state.success !== undefined && !this.state.success) && (
                <div className={"feedback DANGER"}>
                    <FAE icon={faTimes}/> {this.getMessage()}
                </div>
            )}
        </>)
    }

    render = () => {
        let {
            callback,
            entityName,
            suppressErrors,
            onChangedValue,
            onChange,
            ...propsForInput
        } = this.props;

        return (
            <>
                <Form.Control
                    onChange={async (e) => {
                        if (onChangedValue) {
                            onChangedValue(e.target.value);
                        }
                        if (onChange) {
                            onChange(e);
                        }
                        await this.changed(e)
                    }}
                    {...propsForInput}
                />
                <div className={"uniqueOutput feedbackContainer"}>
                    {this.state.isLoading && (
                        <div className={"feedback"}>
                            <Loader size={30} alignment={"left"} text={"Lädt..."} transparent
                                    loaded={false}/>
                        </div>
                    )}

                    {
                        !suppressErrors && this.renderErrors()
                    }

                </div>
            </>
        );
    }

    /**
     * Funktion welche ausgeführt wird, wenn sich der Wert des Input-Tags ändert.
     *
     * Nach kurzer Zeit ohne eingaben, wird ein Request an das Backend geschickt, in dem
     * @param e
     */
    changed = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        let value = e.currentTarget.value;
        if (value.length > 0) {
            this.timeout = setTimeout(async () => {
                this.setState({
                    isLoading: true
                });

                try {
                    // wrap the errorCallback in a Promise, so it can get awaited
                    let call = await new Promise<CallInterface<DefaultResponse<AvailabilityCheckResource>> | null>((resolve, reject) => {
                        if (this.props.callback === undefined) {
                            reject(new Error("callback is undefined"));
                        } else {
                            this.props.callback(value, {errorCallback: reject}).then(resolve).catch(reject);
                        }
                    });


                    if (call?.success) {
                        this.setState({
                            success: call.callData.data.available,
                            reason: call.callData.data.reason,
                            isLoading: false,
                            error: false
                        });
                        return;
                    }
                } catch (reason) {
                    if (process.env.NODE_ENV === undefined || process.env.NODE_ENV === 'development') {
                        console.error(reason);
                    }
                }

                this.setState({
                    success: undefined,
                    error: true,
                    isLoading: false
                });
            }, 600);
        } else {
            this.setState({
                success: undefined,
                error: false
            });
        }
    }

    /**
     * Gibt einen Text zurück das ein fehler aufgetreten ist
     * @private
     */
    private getFailMessage() {
        return "Die Verfügbarkeit konnte nicht überprüft werden.";
    }

    /**
     * Gibt einen Text zurück das die untersuchte Resource nicht verfügbar ist
     * @private
     */
    private getTakenMessage() {
        return this.props.entityName + " ist nicht Verfügbar!";
    }

    /**
     * Gibt einen Text zurück das die untersuchte Resource verfügbar ist.
     * @private
     */
    private getAvailableMessage() {
        return this.props.entityName + " ist Verfügbar!";
    }

    /**
     * Gibt einen Text zurück das die untersuchte Resource kein richtiges format aufweist
     * @private
     */
    private getInvalidMessage() {
        return this.props.entityName + " ist nicht korrekt!";
    }

    /**
     * Gibt ein Text zurück das die untersuchte Resource vom Server nicht erlaubt wird.
     * @private
     */
    private getBlockedMessage() {
        return this.props.entityName + " ist nicht erlaubt!";
    }

    /**
     * Gibt den Text zurück, welcher das letzte Ergebniss der Verfügbarkeitsprüfung beschreibt.
     * @private
     */
    private getMessage() {
        if (this.state.success) {
            return this.getAvailableMessage();
        } else {
            switch (this.state.reason) {
                case "invalid":
                    return this.getInvalidMessage();
                case "taken":
                    return this.getTakenMessage();
                case "blocked":
                    return this.getBlockedMessage();
                default:
                    return this.getTakenMessage();
            }
        }

    }

}
