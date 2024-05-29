import React, {useCallback, useState} from "react";
import {ToolHome} from "./Home/ToolHome";
import "./tool.scss";
import {createSave} from "../API/calls/Saves";
import {ToolData} from "./Data/ToolData";
import {Card} from "react-bootstrap";
import {Route, Routes, useNavigate} from "react-router-dom";
import {CreateToolModal} from "./CreateToolModal/CreateToolModal";
import {ToolSavePage} from "./ToolSavePage/ToolSavePage";

interface ToolProps {
    tool: ToolData<any>
}

function Tool({tool}: ToolProps) {

    const [isCreatingNewSave, setIsCreatingNewSave] = useState(false);

    const navigate = useNavigate();

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
            navigate(tool.getLink() + "/" + saved.callData.id);
        }
    }, [navigate, tool]);

    const onCreateCancel = useCallback(() => {
        navigate(tool.getLink());
    }, [navigate, tool]);


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
            <Routes>
                <Route path={"/"} element={<ToolHome tool={tool}/>}/>

                <Route path={"/new"} element={<CreateToolModal onSaveCreated={createNewSave}
                                                               onCancel={onCreateCancel}
                                                               isCreatingNewSave={isCreatingNewSave}/>}/>

                <Route
                    path={"/:id"} element={<ToolSavePage tool={tool} element={tool.buildSaveBuilder}/>}/>

            </Routes>
        </>
    );
}

export {
    Tool
}
