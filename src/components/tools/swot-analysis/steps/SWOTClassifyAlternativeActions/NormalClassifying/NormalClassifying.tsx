import React, {ChangeEvent, Component, MouseEvent} from "react";
import {
    ClassificationController,
    ClassificationValues,
    ClassifiedAlternateAction
} from "../SWOTClassifyAlternativeActionsComponent";
import {Accordion, Button, Card, Col, FormControl, FormControlProps, InputGroup, Row} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExchangeAlt, faPlus} from "@fortawesome/free-solid-svg-icons";
import {faTrash} from "@fortawesome/free-solid-svg-icons/";
import {SelectClassificationModal} from "./SelectClassificationModal";
import {SWOTClassifyAlternativeActions} from "../SWOTClassifyAlternativeActions";

import "./normal-classifying.scss";
import {ClassifyingCard} from "./ClassifyingCard/ClassifyingCard";
import {ClassifyingCardList} from "./ClassifyingCardList/ClassifyingCardList";

interface NormalClassifyingProps extends FormControlProps {
    classificationController: ClassificationController
    classifications: ClassificationValues[]
    actions: ClassifiedAlternateAction[]
}

interface NormalClassifyingState {
    openClassificationModal: boolean
    lastSelectedAction?: string
}

class NormalClassifying extends Component<NormalClassifyingProps, NormalClassifyingState> {

    constructor(props: NormalClassifyingProps | Readonly<NormalClassifyingProps>) {
        super(props);

        this.state = {
            openClassificationModal: false
        }
    }


    render() {
        const classifications = this.props.classifications;
        const actions = this.props.actions;
        return (
            <>
                <Accordion>
                    {classifications.map((classification) => {

                        return (
                            <Accordion.Item key={classification.droppableID}
                                            eventKey={classification.droppableID}>
                                <Accordion.Header>
                                    <InputGroup>
                                        <Button
                                            variant={"danger"}
                                            size={"sm"}
                                            name={classification.droppableID}
                                            onClick={this.onClassificationRemoveClick}
                                        >
                                            <FontAwesomeIcon style={{verticalAlign: "middle"}} icon={faTrash}/>
                                        </Button>

                                        <FormControl
                                            type={"text"}
                                            name={classification.droppableID}
                                            placeholder={"Klassifikation..."}
                                            onChange={this.onClassificationNameChanged}
                                            value={classification.name}
                                        />
                                    </InputGroup>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <ClassifyingCardList actions={classification.actions}
                                                         onOpenClassificationModalClick={this.onOpenClassificationModalClick}/>
                                </Accordion.Body>
                            </Accordion.Item>
                        );
                    })}
                </Accordion>

                {(!this.props.disabled && (
                        SWOTClassifyAlternativeActions.maxClassifications
                        > classifications.length)
                ) && (
                    <Button onClick={this.props.classificationController.addClassification}
                            className={"addClassification"}>
                        <FontAwesomeIcon icon={faPlus} color={"white"}/>
                    </Button>
                )}

                <hr/>

                <div className={"actionCards"}>
                    {actions.filter(value => !value.alreadyAdded).map((action) => {

                        return <ClassifyingCard action={action} onChangeClick={this.onOpenClassificationModalClick}/>;
                    })}

                    {(!actions.some((v) => !v.alreadyAdded)) && (
                        <span>Alle zugeordnet!</span>
                    )}
                </div>


                <SelectClassificationModal
                    open={this.state.openClassificationModal}
                    action={this.state.lastSelectedAction ?? undefined}
                    classifications={classifications}
                    onSelect={this.changeClassification}
                    onClose={this.closeClassificationModal}
                />
            </>
        )
    }

    private changeClassification = (oldClassification: ClassificationValues | null, newClassification: ClassificationValues | null, action: string) => {
        this.props.classificationController.updateActionClassification(oldClassification?.droppableID ?? null, newClassification?.droppableID ?? null, action);
    }


    private closeClassificationModal = () => {
        this.setState({
            openClassificationModal: false,
            lastSelectedAction: undefined
        });
    }


    private openClassificationModal = (action: string) => {
        this.setState({
            openClassificationModal: true,
            lastSelectedAction: action,
        });
    }

    private onClassificationNameChanged = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const id = event.currentTarget.name;
        const newName = event.target.value;

        if (id.startsWith("droppable-")) {
            this.props.classificationController.classificationNameChanged(id, newName);
        }
    };


    private onOpenClassificationModalClick = (id: string) => {
        this.openClassificationModal(id);
    }

    private onClassificationRemoveClick = (event: MouseEvent<HTMLButtonElement>) => {
        const id = event.currentTarget.name;
        this.props.classificationController.removeClassification(id);
    };
}

export {
    NormalClassifying
}
