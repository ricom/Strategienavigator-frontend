import {Tool} from "../Tool";

import "./steppable-tool.scss";
import StepComponent, {StepComponentProps, StepDefinition} from "./StepComponent/StepComponent";
import React, {ClassAttributes} from "react";
import {RouteComponentProps} from "react-router";
import {IconDefinition} from "@fortawesome/fontawesome-svg-core";
import {ToolSaveProps} from "../ToolSavePage/ToolSavePage";
import {withUIErrorContext} from "../../Contexts/UIErrorContext/UIErrorContext";
import {withMessagesContext} from "../../Messages/Messages";


abstract class SteppableTool<D extends object> extends Tool<D> {
    private readonly typeStepComponent: any;

    // STEP COMPONENT
    private steps: Array<StepDefinition<any>> = [];

    protected constructor(props: RouteComponentProps, context: any, toolName: string, toolIcon: IconDefinition, toolID: number) {
        super(props, context, toolName, toolIcon, toolID);
        this.typeStepComponent = withUIErrorContext(withMessagesContext(class TypeStepComponent extends StepComponent<D> {
        }));
    }

    public getStep(index: number) {
        return this.steps[index];
    }

    // 泛型控制传参类型
    protected addStep<E extends object>(step: StepDefinition<E>) {
        this.steps.push(step);
    }

    protected getStepComponent(saveProps: ToolSaveProps<D>) {
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

    protected buildSaveBuilder(saveProps: ToolSaveProps<D>): JSX.Element {
        return this.getStepComponent(saveProps);
    }
}

export {
    SteppableTool
}
