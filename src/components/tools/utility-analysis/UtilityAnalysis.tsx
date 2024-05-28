import {faBorderAll} from "@fortawesome/free-solid-svg-icons";

import "./utility-analysis.scss";
import {UtilInvestigationObjectsValues} from "./steps/UtilInvestigationObjects/UtilInvestigationObjectsComponent";
import {UtilWeightingValues} from "./steps/UtilWeighting/UtilWeightingComponent";
import {UtilCriteriasValues} from "./steps/UtilCriterias/UtilCriteriasComponent";
import {UtilEvaluationValues} from "./steps/UtilEvaluation/UtilEvaluationComponent";
import {UtilResultValues} from "./steps/UtilityResult/UtilResultComponent";
import {JSONExporter} from "../../../general-components/Export/JSONExporter";
import {UtilCriterias} from "./steps/UtilCriterias/UtilCriterias";
import {UtilInvestigationObjects} from "./steps/UtilInvestigationObjects/UtilInvestigationObjects";
import {UtilWeighting} from "./steps/UtilWeighting/UtilWeighting";
import {UtilEvaluation} from "./steps/UtilEvaluation/UtilEvaluation";
import {UtilResult} from "./steps/UtilityResult/UtilResult";
import {UtilityAnalysisExcelExporter} from "./export/UtilityAnalysisExcelExporter";
import {UtilityJSONImporter} from "./import/UtilityJSONImporter";
import {SteppableToolData} from "../../../general-components/Tool/Data/SteppableToolData";


export interface UtilityAnalysisValues {
    "ua-investigation-obj"?: UtilInvestigationObjectsValues,
    "ua-criterias"?: UtilCriteriasValues,
    "ua-weighting"?: UtilWeightingValues,
    "ua-evaluation"?: UtilEvaluationValues,
    "ua-result"?: UtilResultValues
}


/**
 * Hauptklasse der Nutzwertanalyse
 * Hier werden die einzelnen Schritte für die Analyse hinzugefügt
 */
class UtilityAnalysis extends SteppableToolData<UtilityAnalysisValues> {

    constructor() {
        super("Nutzwertanalyse", faBorderAll, 1,"/utility-analysis");
        this.setMaintenance(false);

        this.addExporter(new JSONExporter());
        this.addExporter(new UtilityAnalysisExcelExporter());

        this.setImporter(new UtilityJSONImporter());

        this.addStep(new UtilInvestigationObjects());
        this.addStep(new UtilCriterias());
        this.addStep(new UtilWeighting());
        this.addStep(new UtilEvaluation());
        this.addStep(new UtilResult());

    }

    public getInitData(): UtilityAnalysisValues {
        let data: UtilityAnalysisValues = {};
        this.getStep(0).dataHandler.fillFromPreviousValues(data);
        return data;
    }

    public renderShortDescription(): React.ReactNode {
        return undefined;
    }

    public renderTutorial(): React.ReactNode {
        return undefined;
    }

}

export {
    UtilityAnalysis
}
