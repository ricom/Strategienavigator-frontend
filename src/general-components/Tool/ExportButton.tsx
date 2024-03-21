import {Button, FormSelect, Modal} from "react-bootstrap";
import {faFileExport} from "@fortawesome/free-solid-svg-icons";
import {memo} from "react";
import {Exporter} from "../Export/Exporter";
import FAE from "../Icons/FAE";
import {ModalCloseable} from "../Modal/ModalCloseable";
import {ToolData} from "./Data/ToolData";


interface ExportModalProps {
    onClose: () => void
    onSelect: (exporter: Exporter<any>) => void
    show: boolean
    tool: ToolData<any>
}

function ExportModalComponent(props: ExportModalProps) {
    return (
        <ModalCloseable
            show={props.show}
            backdrop={true}
            onHide={() => {
                props.onClose();
            }}
            keyboard={true}
        >
            <Modal.Header>
                <Modal.Title>
                    Exportieren
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <FormSelect
                    onChange={(e) => {
                        let exporter = props.tool.getExporters().find((ex) => {
                            return ex.getName() === e.target.value;
                        });
                        if (exporter) {
                            props.onSelect(exporter);
                        }
                        props.onClose();
                    }}
                    multiple={false}
                >
                    <option disabled={true} selected value={"none"}>--- Auswählen ---</option>
                    {props.tool.getExporters().map((exporter) => {
                        let name = exporter.getName();
                        return (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        );
                    })}
                </FormSelect>
            </Modal.Body>
        </ModalCloseable>
    );
}

const ExportModal = memo(ExportModalComponent);

interface ExportButtonProps {
    onClick: () => void
}

function ExportButton(props: ExportButtonProps) {
    return (
        <>
            <Button
                variant={"dark"}
                onClick={props.onClick}
            >
                <FAE icon={faFileExport}/> Exportieren
            </Button>
        </>
    );
}

export {
    ExportButton,
    ExportModal
}
