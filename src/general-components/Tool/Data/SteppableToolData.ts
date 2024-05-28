import {ToolData} from "./ToolData";
import StepComponent, {StepComponentProps, StepDefinition} from "../SteppableTool/StepComponent/StepComponent";
import {IconDefinition} from "@fortawesome/fontawesome-svg-core";
import {withUIErrorContext} from "../../Contexts/UIErrorContext/UIErrorContext";
import {withMessagesContext} from "../../Messages/Messages";
import {ToolSaveProps} from "../ToolSavePage/ToolSavePage";
import React, {ClassAttributes} from "react";

export abstract class SteppableToolData<D extends object> extends ToolData<D> {
    private readonly typeStepComponent: any;

    // STEP COMPONENT
    private steps: Array<StepDefinition<any>> = [];

    constructor(toolName: string, toolIcon: IconDefinition, toolID: number, toolLink: string) {
        super(toolName, toolIcon, toolID, toolLink);
        this.typeStepComponent = withUIErrorContext(withMessagesContext(class TypeStepComponent extends StepComponent<D> {
        }));
    }

    public getStep = (index: number) => {
        return this.steps[index];
    }

    protected addStep = <E extends object>(step: StepDefinition<E>) =>{
        this.steps.push(step);
    }

    protected getStepComponent = (saveProps: ToolSaveProps<D>) => {
        type stepProps = StepComponentProps<D> & ClassAttributes<StepComponent<D>>;
        let props: stepProps = {
            key: "stepcomponent",
            steps: this.steps,
            tool: this,
            ...saveProps
        };

        let typesProps = props as stepProps;

        return React.createElement(this.typeStepComponent, typesProps, null);
    }

    public buildSaveBuilder = (saveProps: ToolSaveProps<D>) => {
        return this.getStepComponent(saveProps);
    }
}
