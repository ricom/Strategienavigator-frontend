import {faArrowsAlt} from "@fortawesome/free-solid-svg-icons";

import "./portfolio-analysis.scss";
import {PortCreateObjectsValues} from "./steps/PortObjects/PortObjectsComponent";
import {PortObjects} from "./steps/PortObjects/PortObjects";
import {PortCriterias} from "./steps/PortCriterias/PortCriterias";
import {PortCriteriasValues} from "./steps/PortCriterias/PortCriteriasComponent";
import {PortEvaluationValues} from "./steps/PortEvaluation/PortEvaluationComponent";
import {PortEvaluation} from "./steps/PortEvaluation/PortEvaluation";
import {PortResultValues} from "./steps/PortResult/PortResultComponent";
import {PortWeightingValues} from "./steps/PortWeighting/PortWeightingComponent";
import {PortWeighting} from "./steps/PortWeighting/PortWeighting";
import {PortResult} from "./steps/PortResult/PortResult";
import {JSONExporter} from "../../../general-components/Export/JSONExporter";
import {PortfolioExcelExporter} from "./export/PortfolioExcelExporter";
import {PortJSONImporter} from "./import/PortJSONImporter";
import {SteppableToolData} from "../../../general-components/Tool/Data/SteppableToolData";


interface PortfolioAnalysisValues {
    "port-objects"?: PortCreateObjectsValues,
    "port-criterias"?: PortCriteriasValues,
    "port-weighting"?: PortWeightingValues,
    "port-evaluation"?: PortEvaluationValues,
    "port-result"?: PortResultValues
}

class PortfolioAnalysis extends SteppableToolData<PortfolioAnalysisValues> {

    constructor() {
        super("Portfolio Analyse", faArrowsAlt, 4,"/portfolio-analysis");

        this.setMaintenance(false);
        this.addExporter(new JSONExporter());
        this.addExporter(new PortfolioExcelExporter());

        this.setImporter(new PortJSONImporter());

        this.addStep(new PortObjects());
        this.addStep(new PortCriterias());
        this.addStep(new PortWeighting());
        this.addStep(new PortEvaluation());
        this.addStep(new PortResult());
    }

    public renderShortDescription() {
        return null;
    }

    public renderTutorial() {
        return (
            <div>
                Als Portfolioanalyse wird eine Untersuchungsmethode bezeichnet,
                mit der unterschiedliche Produkte und Dienstleistungen sowie das gesamte Angebot eines Unternehmens
                bewertet werden können.
                Auf diese Weise gewinnt die Geschäftsführung einen Überblick über das Portfolio und kann das Potenzial
                und die Erfolgsaussichten
                einzelner Produkte und Dienstleistungen abschätzen. Somit ist die Portfolioanalyse ein wichtiges
                Hilfsmittel, um
                strategische Entscheidungen in Hinblick auf das Angebotsportfolio zu treffen.
            </div>
        );
    }

    public getInitData(): PortfolioAnalysisValues {
        let data: PortfolioAnalysisValues = {};
        this.getStep(0).dataHandler.fillFromPreviousValues(data);
        return data;
    }

}

export {
    PortfolioAnalysis
}
export type {
    PortfolioAnalysisValues
}
