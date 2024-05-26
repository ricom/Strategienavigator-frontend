import React, {useCallback, useState} from "react";
import {useHistory} from "react-router";
import {ToolHome} from "./Home/ToolHome";
import "./tool.scss";
import {createSave} from "../API/calls/Saves";
import {ToolData} from "./Data/ToolData";
import {Card} from "react-bootstrap";
import {Route, Switch} from "react-router-dom";
import {CreateToolModal} from "./CreateToolModal/CreateToolModal";
import {ToolSavePage} from "./ToolSavePage/ToolSavePage";

interface ToolProps {
    tool: ToolData<any>
}

function Tool({tool}: ToolProps) {

    const [isCreatingNewSave, setIsCreatingNewSave] = useState(false);

    const history = useHistory();

    /**
     * Kreiert einen neuen Save
     *
     * @param {string} name Name des Saves
     * @param {string} description Beschreibung des Saves
     * @returns {Promise<void>}
     */
    const createNewSave = useCallback(async (name: string, description: string) => {
        setIsCreatingNewSave(true);

        let saved = await createSave(
            name,
            description,
            tool.getID(),
            tool.getInitData(),
            []
        );

        if (saved) {
            setIsCreatingNewSave(false)
            history.push(tool.getLink() + "/" + saved.callData.id);
        }
    }, [history, tool]);

    const onCreateCancel = useCallback(() => {
        history.push(tool.getLink());
    }, [history, tool]);


    if (tool.maintenance) {
        return (
            <Card body>
                Diese Analyse befindet sich im Wartungsmodus. Bitte Schauen Sie zu einem späteren Zeitpunkt erneut
                vorbei.
            </Card>
        );
    }

    return (
        <>
            <Switch>
                <Route exact path={"/home"}>
                    <ToolHome tool={tool}/>
                </Route>

                <Route exact path={"/new"}>
                    <CreateToolModal onSaveCreated={createNewSave}
                                     onCancel={onCreateCancel}
                                     isCreatingNewSave={isCreatingNewSave}/>
                </Route>

                <Route
                    exact
                    path={"/:id"}>
                    <ToolSavePage tool={tool} element={tool.buildSaveBuilder}/>
                </Route>
            </Switch>
        </>
    );
}

export {
    Tool
}
