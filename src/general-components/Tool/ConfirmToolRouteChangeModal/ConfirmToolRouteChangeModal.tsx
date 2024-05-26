import {Button, Fade, Modal} from "react-bootstrap";
import {ModalCloseable} from "../../Modal/ModalCloseable";


interface ConfirmToolRouteChangeModalProps {
    onYes: () => void,
    onNo: () => void,
    show: boolean
}


function ConfirmToolRouteChangeModal(props: ConfirmToolRouteChangeModalProps) {
    return (
        <ModalCloseable
            show={props.show}
            backdrop="static"
            animate={Fade}
            onHide={props.onNo}
            keyboard
        >
            <Modal.Header>
                <Modal.Title>Wollen Sie wirklich die Seite verlassen?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Nicht gespeicherte Änderungen gehen verloren.
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => {
                    props.onYes();
                }} variant={"light"} type={"button"}>
                    Ja
                </Button>
                <Button onClick={() => {
                    props.onNo();
                }} variant={"dark"} type={"button"}>
                    Nein
                </Button>
            </Modal.Footer>
        </ModalCloseable>
    );
}

export {
    ConfirmToolRouteChangeModal
}
