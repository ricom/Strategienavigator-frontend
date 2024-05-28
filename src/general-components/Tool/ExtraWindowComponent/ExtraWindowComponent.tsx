import {Component} from "react";
import {StepController} from "../SteppableTool/StepComponent/StepComponent";
import "./extra-window-component.scss";
import {IResourceManager} from "../ToolSavePage/ResourceManager";
import {SteppableToolData} from "../Data/SteppableToolData";


export interface ExtraWindowProps<D extends object> {
    /**
     * Das aktuelle Tool
     */
    tool: SteppableToolData<D>
    /**
     *  Die aktellen Speicherstanddaten
     */
    data: D,
    /**
     * Steuerfunktionen für das StepComponent
     */
    stepController: StepController
    /**
     * Verwaltet die Resourcen
     */
    resourceManager: IResourceManager
}

/**
 * Component welches unter den Steuerelementen des StepComponents angezeigt wird.
 */
class ExtraWindowComponent<D extends Object, S> extends Component<ExtraWindowProps<D>, S> {

    protected getData = () => {
        return this.props.data;
    }

    protected getTool = () => {
        return this.props.tool;
    }

}

export {
    ExtraWindowComponent
}
