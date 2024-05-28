import React, {PureComponent} from "react";

import './step-component-buttons.scss';
import {Button} from "react-bootstrap";
import {faCaretRight, faFileExport, faSave, faUndo} from "@fortawesome/free-solid-svg-icons";
import {LoadingButton} from "../../../../LoadingButton/LoadingButton";
import {CustomNextButton} from "../StepComponent";
import {ExportButton} from "../../../ExportButton";
import FAE from "../../../../Icons/FAE";
import {ButtonItem, NextStepItem} from "../../../../ControlFooter/ControlFooter";
import {FooterControllerContext} from "../../../../Contexts/FooterContextComponent";
import {ISharedSaveContext} from "../../../../Contexts/SharedSaveContextComponent";
import {ButtonPanel} from "../../../../ButtonPanel/ButtonPanel";
import {hasPermission, ResetSavePermission, SaveSavePermission} from "../../../../Permissions";


export interface DesktopButtonsState {
}

export interface DesktopButtonsProps {
    nextDisabled: boolean,
    isSaving: boolean,
    /**
     * blendet die Buttons aus und setzt nur die bottom sheet buttons
     */
    isMobile: boolean,
    onNext: () => void,
    onSave: () => void,
    onReset: () => void
    onExportClick: () => void
    customNextButton?: CustomNextButton,
    sharedSaveContext: ISharedSaveContext
}

export class StepComponentButtons extends PureComponent<DesktopButtonsProps, DesktopButtonsState> {
    /**
     * Definiert auf welchen Context zugegriffen werden soll
     */
    static contextType = FooterControllerContext;
    context!: React.ContextType<typeof FooterControllerContext>

    componentDidMount() {
        this.setFooterButtons();
    }

    componentWillUnmount() {
        this.context.clearItems();
    }

    componentDidUpdate(prevProps: Readonly<DesktopButtonsProps>, prevState: Readonly<DesktopButtonsState>, snapshot?: any) {
        if (
            prevProps.customNextButton !== this.props.customNextButton ||
            prevProps.isSaving !== this.props.isSaving ||
            prevProps.nextDisabled !== this.props.nextDisabled
        ) {
            this.setFooterButtons(); // TODO only update changed props
        }
    }

    render() {
        if (!this.props.isMobile) {
            return (
                <ButtonPanel buttonPerCol={2} auto={false}>
                    <Button
                        variant={"dark"}
                        type={"button"}
                        onClick={this.props.onNext}
                        disabled={this.props.nextDisabled}
                        key={"customNextButton"}
                    >
                        <FAE icon={faCaretRight}/> {this.props.customNextButton?.text ?? "Weiter"}
                    </Button>

                    {(hasPermission(this.props.sharedSaveContext.permission, ResetSavePermission)) && (
                        <Button
                            variant={"dark"}
                            type={"button"}
                            onClick={this.props.onReset}
                            key={"resetButton"}
                        >
                            <FAE
                                icon={faUndo}/> Zurücksetzen
                        </Button>
                    )}

                    {(hasPermission(this.props.sharedSaveContext.permission, SaveSavePermission)) && (
                        <LoadingButton
                            variant={"dark"}
                            type={"button"}
                            onClick={this.props.onSave}
                            key={"saveButton"}
                            isLoading={this.props.isSaving}
                            savingChild={"Speichern"}
                            defaultChild={"Speichern"}
                        />
                    )}

                    <ExportButton
                        onClick={this.props.onExportClick}
                    />
                </ButtonPanel>
            );
        }
        return null;
    }

    private setFooterButtons = () => {
        let place = 1;

        if (hasPermission(this.props.sharedSaveContext.permission, ResetSavePermission)) {
            this.context.setItem(place, {
                reset: this.props.onReset
            });
            place++;
        }

        this.context.setItem(place, {
            button: {
                text: "Exportieren",
                icon: faFileExport,
                callback: this.props.onExportClick
            }
        });
        place++;

        if (hasPermission(this.props.sharedSaveContext.permission, SaveSavePermission)) {
            this.context.setItem(place, {
                button: {
                    callback: this.props.onSave,
                    text: "Speichern",
                    icon: faSave
                },
                disabled: this.props.isSaving
            });
            place++;
        }

        let nextButton: NextStepItem | ButtonItem = {
            nextStep: this.props.onNext,
            disabled: this.props.nextDisabled
        };
        if (this.props.customNextButton !== undefined) {
            nextButton = {
                button: {text: this.props.customNextButton.text, icon: faCaretRight, callback: this.props.onNext},
                disabled: this.props.nextDisabled,
            }
        }

        this.context.setItem(place, nextButton);
        place++;
    }
}
