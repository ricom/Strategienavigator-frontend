import {
    shallowCompareStepProps,
    Step,
    StepProp
} from "../../../../../general-components/Tool/SteppableTool/StepComponent/Step/Step";
import {PortfolioAnalysisValues} from "../../PortfolioAnalysis";
import {CoordinateSystem} from "../../../../../general-components/CoordinateSystem/CoordinateSystem";
import {
    NumberValueRenderer
} from "../../../../../general-components/CoordinateSystem/ValueRenderer/NumberValueRenderer";
import {Point} from "../../../../../general-components/CoordinateSystem/Point/Point";
import {ResultEvaluationValue} from "../../../../../general-components/EvaluationComponent/Result/ResultEvaluation";
import {PointComponent} from "../../../../../general-components/CoordinateSystem/Point/PointComponent";
import React from "react";
import {SettingsContext} from "../../../../../general-components/Contexts/SettingsContextComponent";
import {QuadrantGrid} from "../../../../../general-components/CoordinateSystem/Grid/QuadrantGrid";
import {
    PortfolioQuadrantsSettingType,
    PortfolioQuadrantsSettingValues
} from "../../../../../general-components/Settings/Types/PortfolioQuadrantsType/PortfolioQuadrantsSettingType";
import {CustomGrid} from "../../../../../general-components/CoordinateSystem/Grid/CustomGrid";


interface PortResultValues {
    results: {
        attractivity: ResultEvaluationValue,
        "comp-standing": ResultEvaluationValue
    },
    points: Point[]
}

class PortResultComponent extends Step<PortfolioAnalysisValues, {}> {
    /**
     * Definiert auf welchen Context zugegriffen werden soll
     */
    static contextType = SettingsContext;
    context!: React.ContextType<typeof SettingsContext>

    public constructor(props: StepProp<PortfolioAnalysisValues>, context: any) {
        super(props, context);
    }

    shouldComponentUpdate(nextProps: Readonly<StepProp<PortfolioAnalysisValues>>, nextState: Readonly<{}>, nextContext: any): boolean {
        return !shallowCompareStepProps(this.props, nextProps, (oldData, newData) => {
            return oldData["port-result"] === newData["port-result"];
        });
    }

    build(): JSX.Element {
        if (this.props.save.data["port-result"] !== undefined) {
            const setting = this.context.settings.getSetting(2);
            let gridSetting;
            if (setting) {
                gridSetting = JSON.parse(setting.value) as PortfolioQuadrantsSettingValues;
            } else {
                gridSetting = PortfolioQuadrantsSettingType.defaults;
            }
            let grid: boolean | CustomGrid = true;
            if (gridSetting && gridSetting.toggled) {
                grid = new QuadrantGrid(gridSetting.quadrants.map((v) => v.value));
            }

            return (
                <>
                    <CoordinateSystem
                        maxWidth={700}
                        axisThickness={1}
                        axis={{
                            y: {
                                maxValue: "auto",
                                valueAccuracy: "auto",
                                name: "Marktattraktivität",
                                valueRenderer: new NumberValueRenderer(0)
                            },
                            x: {
                                maxValue: "auto",
                                valueAccuracy: "auto",
                                name: "Wettbewerbsposition",
                                valueRenderer: new NumberValueRenderer(0)
                            }
                        }}
                        points={this.props.save.data["port-result"].points}
                        gridDisplay={grid}
                        widthRange={{
                            start: 0,
                            end: 10
                        }}
                        heightRange={{
                            start: 0,
                            end: 10
                        }}
                        legend={true}
                        tooltipContentRenderer={(point) => {
                            return (
                                <>
                                    <strong>{point.header}</strong><br/>

                                    Wettbewerbsposition: {point.x.toFixed(2)} <br/>
                                    Marktattraktivität: {point.y.toFixed(2)}
                                </>
                            );
                        }}
                    />

                    <br/>

                    <PointComponent
                        points={this.props.save.data["port-result"].points}
                        customHeader={"Objekt"} displayColor={true}
                        axisHeader={{
                            y: "Marktattraktivität",
                            x: "Wettbewerbsposition"
                        }}
                    />
                </>
            );
        }
        return <></>;
    }

}

export {
    PortResultComponent
}
export type {
    PortResultValues
}