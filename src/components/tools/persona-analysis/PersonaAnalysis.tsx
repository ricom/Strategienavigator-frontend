import {faUserCircle} from "@fortawesome/free-solid-svg-icons";

import "./persona-analysis.scss";
import {JSONExporter} from "../../../general-components/Export/JSONExporter";
import {PersonaJSONImporter} from "./import/PersonaJSONImporter";
import {PersonaInfoValues} from "./steps/PersonaInfo/PersonaInfoComponent";
import {PersonaInfo} from "./steps/PersonaInfo/PersonaInfo";
import {PersonaPersonalityValues} from "./steps/PersonaPersonality/PersonaPersonalityComponent";
import {PersonaPersonality} from "./steps/PersonaPersonality/PersonaPersonality";
import {PersonaSummaryValues} from "./steps/PersonaSummary/PersonaSummaryComponent";
import {PersonaSummary} from "./steps/PersonaSummary/PersonaSummary";
import {PersonaPDFExporter} from "./export/PersonaPDFExporter";
import {SteppableToolData} from "../../../general-components/Tool/Data/SteppableToolData";

interface PersonaAnalysisValues {
    "persona-info"?: PersonaInfoValues,
    "persona-personality"?: PersonaPersonalityValues,
    "persona-summary"?: PersonaSummaryValues
}

class PersonaAnalysis extends SteppableToolData<PersonaAnalysisValues> {

    constructor() {
        super("Persona Analyse", faUserCircle, 6,"/persona-analysis");

        this.addExporter(new JSONExporter());
        this.addExporter(new PersonaPDFExporter());
        this.setImporter(new PersonaJSONImporter());

        this.addStep(new PersonaInfo());
        this.addStep(new PersonaPersonality())
        this.addStep(new PersonaSummary());
    }

    public renderShortDescription() {
        return (
            <>
                Personas veranschaulichen typische Vertreter Ihrer Zielgruppe.
                Vielfältige Informationen zu ihrer Lebenswelt machen sie als Menschen verstehbar und ermöglichen es den
                Projektbeteiligten sich mit ihnen zu identifizieren.
            </>
        );
    }

    public renderTutorial() {
        return (
            <>
                Personas veranschaulichen typische Vertreter Ihrer Zielgruppe.
                Vielfältige Informationen zu ihrer Lebenswelt machen sie als Menschen verstehbar und ermöglichen es den
                Projektbeteiligten sich mit ihnen zu identifizieren
                <br/><br/>
                Besonders hilfreich ist die Entwicklung von Personas zu Beginn eines Projekts, z.B. wenn ein neues
                Produkt entwickelt wird oder ein Relaunch ansteht.
                Personas vermitteln allen Projektbeteiligten ein einheitliches Verständnis von der Zielgruppe und dienen
                als Entscheidungsgrundlage für den weiteren Entwicklungsprozess.
                <br/><br/>
                Quelle: www.usability.de (Aufgerufen am 24. Aug 2023)
            </>
        );
    }

    public getInitData(): PersonaAnalysisValues {
        let data = {
            "persona-info": undefined,
            "persona-personality": undefined,
            "persona-summary": undefined
        };
        this.getStep(0).dataHandler.fillFromPreviousValues(data);
        return data;
    }

}

export {
    PersonaAnalysis
}

export type {
    PersonaAnalysisValues
}
