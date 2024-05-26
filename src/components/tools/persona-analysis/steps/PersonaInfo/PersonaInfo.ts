import {
    StepDataHandler,
    StepDefinition
} from "../../../../../general-components/Tool/SteppableTool/StepComponent/StepComponent";
import {StepProp} from "../../../../../general-components/Tool/SteppableTool/StepComponent/Step/Step";
import {UIError} from "../../../../../general-components/Error/UIErrors/UIError";
import React from "react";
import {PersonaInfoComponent} from "./PersonaInfoComponent";
import {PersonaAnalysisValues} from "../../PersonaAnalysis";
import {ResourcesType} from "../../../../../general-components/Tool/ToolSavePage/ResourceManager";
import {validateFile} from "../../../../../general-components/Tool/Resources";


export class PersonaInfo implements StepDefinition<PersonaAnalysisValues>, StepDataHandler<PersonaAnalysisValues> {
    static FIRST_NAME_MAX_LENGTH = 100;

    static AGE_MIN = 0;
    static AGE_MAX = 150;

    form: React.FunctionComponent<StepProp<PersonaAnalysisValues>> | React.ComponentClass<StepProp<PersonaAnalysisValues>>;
    id: string;
    title: string;
    dataHandler: StepDataHandler<PersonaAnalysisValues>;

    constructor() {
        this.id = "persona-info";
        this.title = "1. Stammdaten anlegen";
        this.form = PersonaInfoComponent;
        this.dataHandler = this;
    }

    isUnlocked = (data: PersonaAnalysisValues): boolean => true;

    fillFromPreviousValues = (data: PersonaAnalysisValues): PersonaAnalysisValues => {
        data["persona-info"] = {
            "firstname": null,
            "age": null
        };
        return data;
    }

    deleteData(data: PersonaAnalysisValues, resources: ResourcesType): void {
        data = this.fillFromPreviousValues(data);
        resources.delete("avatar");
    }

    validateData(data: PersonaAnalysisValues, resources: ResourcesType): UIError[] {
        let d = data["persona-info"];
        let errors = Array<UIError>();

        let file = resources.get("avatar");
        let fileVal = validateFile(file?.file, {
            size: PersonaInfoComponent.MAXFILESIZE,
            type: PersonaInfoComponent.FILETYPES.map(i => "image/" + i)
        });

        if (fileVal.isEmpty) {
            errors.push({
                id: "avatar.empty",
                level: "error",
                message: "Bitte laden Sie einen Avatar hoch!"
            })
        }
        if (fileVal.tooBig) {
            errors.push({
                id: "avatar.size",
                level: "error",
                message: "Der hochgeladene Avatar darf maximal " + PersonaInfoComponent.MAXFILESIZE / 1000 + " MB groß sein!"
            })
        }
        if (fileVal.notType) {
            errors.push({
                id: "avatar.type",
                level: "error",
                message: "Bitte laden Sie einen Avatar mit gültigen Dateitypen hoch!"
            })
        }

        // Vorname
        if (d?.firstname == null || d.firstname.length <= 0) {
            errors.push({
                id: "firstname.empty",
                message: "Bitte geben Sie einen Vornamen an!",
                level: "error"
            });
        } else if (d.firstname.length > PersonaInfo.FIRST_NAME_MAX_LENGTH) {
            errors.push({
                id: "firstname.toolong",
                message: "Der Vorname darf nur maximal " + PersonaInfo.FIRST_NAME_MAX_LENGTH + " Zeichen besitzen!",
                level: "error"
            });
        }

        // Alter
        if (d?.age == null || d?.age === -1 || (d?.age < PersonaInfo.AGE_MIN || d?.age > PersonaInfo.AGE_MAX)) {
            errors.push({
                id: "age.invalid",
                message: `Bitte geben Sie eine Zahl zwischen ${PersonaInfo.AGE_MIN} und ${PersonaInfo.AGE_MAX} an!`,
                level: "error"
            });
        }

        return errors;
    }


}
