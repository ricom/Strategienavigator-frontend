import './last-openened-saves.scss';
import {Card, Col, Row} from "react-bootstrap";
import {Tools} from "../../components/platform/home/Home";
import {Link} from "react-router-dom";
import {getSaveURL} from "../Save";
import FAE from "../Icons/FAE";
import {Loader} from "../Loader/Loader";
import React, {useCallback, useMemo, useState} from "react";
import {getLastOpenedSaves} from "../API/calls/Saves";
import {SimpleSaveResourceLastOpened} from "../Datastructures";
import {useUserContext} from "../Contexts/UserContextComponent";

function getTimeString(time: Date) {
    return `${time.toLocaleDateString()}, ${time.toLocaleTimeString().split(":").slice(0, 2).join(":")} Uhr`
}

export function LastOpenedSaves() {


    const [lastOpenedSaves, setLastOpenedSaves] = useState<SimpleSaveResourceLastOpened[] | undefined>(undefined);
    const [hasError, setHasError] = useState(false);
    const {user} = useUserContext();

    const loadLastOpenedSaves = useCallback(async () => {
        if (!user) {
            return;
        }
        let didCancel = false;
        let result;
        try {
            result = await getLastOpenedSaves(user.getID(), {
                errorCallback: () => {
                    setHasError(true);
                }
            });
        } catch (e) {
            setHasError(true);
            return;
        }

        if (didCancel) {
            return;
        }


        if (!result?.success) {
            setHasError(true);
            return;
        }

        setLastOpenedSaves(result.callData.data);


        return () => {
            didCancel = true;
        }


    }, [setLastOpenedSaves, setHasError, user]);


    const payload = useMemo(() => [loadLastOpenedSaves], [loadLastOpenedSaves]);

    return (
        <Loader size={70} payload={payload} variant={"auto"}
                alignment={"center"} transparent>
            <Row>
                {hasError && (
                    <Col key={"lo-save-error"} lg={6}>
                        <Card body
                              className={"last-opened-save mb-1"}>
                            <span className={"text-danger"}>Fehler beim Laden der Speicherstände!</span>
                        </Card>
                    </Col>
                )}
                {(!hasError && lastOpenedSaves !== undefined && lastOpenedSaves?.map((save, index) => {
                    let tool = Tools.find((v) => v.id === save.tool_id);
                    let lastOpened = new Date(save.last_opened_by_user);
                    let timeString = getTimeString(lastOpened);

                    if (tool === undefined)
                        return null;

                    return (
                        <Col key={"lo-save-" + save.id + "-" + index} lg={6}>
                            <Card as={Link} to={getSaveURL(save.id, tool.id)} body
                                  className={"last-opened-save mb-1"}>
                                <Row>
                                    <Col xs={"auto"} title={tool.name}>
                                        <FAE icon={tool.icon}/>
                                    </Col>
                                    <Col>
                                        {save.name}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <small className={"text-muted"}>
                                            {timeString}
                                        </small>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    );
                }))}
            </Row>
        </Loader>
    )
}



