import {ReactNode} from "react";
import {faCube} from "@fortawesome/free-solid-svg-icons";
import {JSONExporter} from "../../../general-components/Export/JSONExporter";
import {TemplateAnalysisExcelExporter} from "./export/TemplateAnalysisExcelExporter";
import {TemplateAnalysisJSONImporter} from "./import/TemplateAnalysisJSONImporter";
import {TemplateStep1} from "./steps/TemplateStep1/TemplateStep1";
import {TemplateStep1Values} from "./steps/TemplateStep1/TemplateStep1Component";
import {TemplateStep2} from "./steps/TemplateStep2/TemplateStep2";
import {TemplateStep2Values} from "./steps/TemplateStep2/TemplateStep2Component";
import {TemplateStep3} from "./steps/TemplateStep3/TemplateStep3";
import {TemplateStep3Values} from "./steps/TemplateStep3/TemplateStep3Component";

import "./template-analysis.scss";
import {SteppableToolData} from "../../../general-components/Tool/Data/SteppableToolData";

export interface TemplateAnalysisValues {
    "template-step-1"?: TemplateStep1Values,
    "template-step-2"?: TemplateStep2Values,
    "template-step-3"?: TemplateStep3Values
}

/**
 * Repräsentiert das Tool "Template-Analyse"
 */
class TemplateAnalysis extends SteppableToolData<TemplateAnalysisValues> {

    constructor() {
        super("Template-Analyse", faCube, 9999,"/template-analyse");

        // Wartungarbeiten?
        this.setMaintenance(false);

        // Exports
        this.addExporter(new JSONExporter());
        this.addExporter(new TemplateAnalysisExcelExporter());

        // Imports
        this.setImporter(new TemplateAnalysisJSONImporter());

        // Schritte
        this.addStep(new TemplateStep1());
        this.addStep(new TemplateStep2());
        this.addStep(new TemplateStep3());
    }

    public getInitData(): TemplateAnalysisValues {
        let data = {
            "template-step-1": undefined,
            "template-step-2": undefined,
            "template-step-3": undefined
        };
        this.getStep(0).dataHandler.fillFromPreviousValues(data);
        return data;
    }

    public renderShortDescription(): ReactNode {
        return (
            <>
                Ich bin eine Shortdescription!
            </>
        );
    }

    public renderTutorial(): ReactNode {
        return (
            <>
                Ich bin ein Tutorial. Ich erscheine auf der linken Seite!
            </>
        );
    }

}

export {
    TemplateAnalysis
}
