import {ModalCloseable} from "../../../Modal/ModalCloseable";
import {Button, FloatingLabel, Form, FormControl, FormGroup, Modal} from "react-bootstrap";
import {faFileImport} from "@fortawesome/free-solid-svg-icons";
import React, {Component, FormEvent} from "react";
import {extractFromForm} from "../../../Utility/FormHelper";
import {JSONImporterError} from "../../../Import/JSONImporter";
import {LoadingButton} from "../../../LoadingButton/LoadingButton";
import {createSave} from "../../../API/calls/Saves";
import {SaveResource} from "../../../Datastructures";
import {isEmpty} from "../../../ComponentUtils";
import {ToolData} from "../../Data/ToolData";


export interface ImportModalProps {
    show: boolean,
    onClose: () => void
    onSuccess: (save: SaveResource<any>) => void
    tool: ToolData<any>
}

interface ImportModalState {
    noFile: boolean
    loadingImport: boolean
    error: null | string
    noName: boolean
    noDesc: boolean
}

class ImportModal extends Component<ImportModalProps, ImportModalState> {
    state = {
        noFile: false,
        loadingImport: false,
        error: null,
        noName: false,
        noDesc: false
    }

    public render() {
        return (
            <ModalCloseable
                show={this.props.show}
                backdrop
                centered
                onHide={this.props.onClose}
                keyboard={true}
            >
                <Form onSubmit={this.onSubmit}>
                    <Modal.Header>
                        <Modal.Title>Speicherstand importieren</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>
                            Um einen Speicherstand zu importieren, müssen Sie die Datei des Speicherstandes
                            auswählen.
                            <br/><br/>
                            <b>Wichtig:</b> Es muss sich hierbei um die Analyse "{this.props.tool.getToolName()}"
                            handeln.
                        </p>

                        <FormGroup>
                            <FloatingLabel label={"Name"}>
                                <FormControl
                                    required
                                    name={"name"}
                                    type={"text"}
                                    size={"sm"}
                                    placeholder={"Name..."}
                                />
                            </FloatingLabel>
                        </FormGroup>

                        <FormGroup className={"mt-3"}>
                            <FloatingLabel label={"Beschreibung"}>
                                <FormControl
                                    required
                                    name={"description"}
                                    as={"textarea"}
                                    style={{height: 100}}
                                    placeholder={"Beschreibung..."}
                                    size={"sm"}
                                />
                            </FloatingLabel>
                        </FormGroup>

                        <FormGroup className={"mt-3"}>
                            <FormControl name={"file"} size={"sm"} accept={"application/JSON"} type={"file"}
                                         disabled={this.state.loadingImport}/>
                        </FormGroup>

                        {this.state.noName && (
                            <div className={"feedbackContainer"}>
                                <div className={"feedback DANGER"}>Bitte geben Sie einen Namen an!</div>
                            </div>
                        )}
                        {this.state.noDesc && (
                            <div className={"feedbackContainer"}>
                                <div className={"feedback DANGER"}>Bitte geben Sie eine Beschreibung an!</div>
                            </div>
                        )}
                        {this.state.noFile && (
                            <div className={"feedbackContainer"}>
                                <div className={"feedback DANGER"}>Keine Datei ausgewählt!</div>
                            </div>
                        )}
                        {this.state.error != null && (
                            <div className={"feedbackContainer"}>
                                <div className={"feedback DANGER"}>{this.state.error}</div>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.props.onClose} variant={"danger"} disabled={this.state.loadingImport}>
                            Abbrechen
                        </Button>
                        <LoadingButton
                            type={"submit"}
                            isLoading={this.state.loadingImport}
                            disabled={this.state.loadingImport}
                            variant={"dark"}
                            defaultChild={"Importieren"}
                            savingChild={"Importiert..."}
                            defaultIcon={faFileImport}
                        />
                    </Modal.Footer>
                </Form>
            </ModalCloseable>
        );
    }

    private onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        this.setState({
            noFile: false,
            error: null,
            loadingImport: true
        });

        let name = extractFromForm(e, "name") as string;
        let description = extractFromForm(e, "description") as string;

        let hasName = true, hasDesc = true;

        if (isEmpty(name)) {
            hasName = false;
            this.setState({
                noName: true
            });
        }
        if (isEmpty(description)) {
            hasDesc = false;
            this.setState({
                noDesc: true
            });
        }

        if (hasName && hasDesc) {
            extractFromForm(e, "file", async (content) => {
                if (content != null) {
                    let importer = this.props.tool.getImporter();
                    if (importer === undefined) {
                        throw new Error("No importer set for analysis: " + this.props.tool.getToolName());
                    }

                    try {
                        await importer.onImport(content);
                        let data = JSON.parse(content);

                        let resources = data["export-resources"] ?? [];
                        delete data["export-resources"];

                        let saved = await createSave(
                            name,
                            description,
                            this.props.tool.getID(),
                            data,
                            resources
                        );

                        if (saved == null || !saved?.success) {
                            throw new JSONImporterError("Fehler beim Speichern! Bitte versuchen Sie es später erneut.");
                        } else {
                            this.props.onSuccess(saved.callData);
                        }
                    } catch (e: any) {
                        if (e instanceof JSONImporterError) {
                            this.setState({
                                error: e.message
                            });
                        } else {
                            console.error("Bitte überprüfen Sie die TypeSuits!: " + e.message);
                        }
                    }
                } else {
                    this.setState({
                        noFile: true
                    });
                }
                this.setState({
                    loadingImport: false
                });
            });
        } else {
            this.setState({
                loadingImport: false
            });
        }
    }

}

export {
    ImportModal
}