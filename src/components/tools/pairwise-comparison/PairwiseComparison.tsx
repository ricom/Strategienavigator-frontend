import {faSortAmountDownAlt} from "@fortawesome/free-solid-svg-icons";
import {JSONExporter} from "../../../general-components/Export/JSONExporter";
import "./pairwise-comparison.scss";

import {PCPairComparison} from "./steps/PCPairComparison/PCPairComparison";
import {PCPairComparisonValues} from "./steps/PCPairComparison/PCPairComparisonComponent";
import {PCCriterias} from "./steps/PCCriterias/PCCriterias";
import {PCCriteriasValues} from "./steps/PCCriterias/PCCriteriasComponent";
import {PCResult} from "./steps/PCResult/PCResult";
import {PCResultValues} from "./steps/PCResult/PCResultComponent";

import {PCExcelExporter} from "./export/PCExcelExporter";
import {PCJSONImporter} from "./import/PCJSONImporter";
import {SteppableToolData} from "../../../general-components/Tool/Data/SteppableToolData";


/**
 * Enthält die Werte des Paarweisen-Vergleichs. Umfasst Kriterien und Vergleich
 */
export interface PairwiseComparisonValues {
    "pc-criterias"?: PCCriteriasValues,
    "pc-comparison"?: PCPairComparisonValues,
    "pc-result"?: PCResultValues
}

class PairwiseComparison extends SteppableToolData<PairwiseComparisonValues> {


    constructor() {
        super( "Paarweiser Vergleich", faSortAmountDownAlt, 3,"/pairwise-comparison");

        this.setMaintenance(false);

        this.addExporter(new JSONExporter());
        this.addExporter(new PCExcelExporter());

        this.setImporter(new PCJSONImporter());

        this.addStep(new PCCriterias());
        this.addStep(new PCPairComparison());
        this.addStep(new PCResult());
    }

    public getInitData(): PairwiseComparisonValues {
        const data: PairwiseComparisonValues = {};

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
    PairwiseComparison
}
