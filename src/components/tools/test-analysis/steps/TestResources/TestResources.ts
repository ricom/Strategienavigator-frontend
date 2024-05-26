import {
    StepDataHandler,
    StepDefinition
} from "../../../../../general-components/Tool/SteppableTool/StepComponent/StepComponent";
import {UIError} from "../../../../../general-components/Error/UIErrors/UIError";
import {Draft} from "immer";
import {StepProp} from "../../../../../general-components/Tool/SteppableTool/StepComponent/Step/Step";
import {ComponentClass, FunctionComponent} from "react";
import {TestAnalysisValues} from "../../TestAnalysis";
import {TestResourcesComponent} from "./TestResourcesComponent";
import {validateFile} from "../../../../../general-components/Tool/Resources";
import {ResourcesType} from "../../../../../general-components/Tool/ToolSavePage/ResourceManager";

class TestResources implements StepDefinition<TestAnalysisValues>, StepDataHandler<TestAnalysisValues> {
    form: FunctionComponent<StepProp<TestAnalysisValues>> | ComponentClass<StepProp<TestAnalysisValues>>;
    id: string;
    title: string;
    dataHandler: StepDataHandler<TestAnalysisValues>;

    constructor() {
        this.id = "test-resources";
        this.title = "3. Resourcen";
        this.dataHandler = this;
        this.form = TestResourcesComponent;
    }

    deleteData(data: Draft<TestAnalysisValues>, resources: ResourcesType): void {
        data["test-resources"] = undefined;
        resources.delete("picture");
        resources.delete("excel");
        resources.delete("json");
    }

    fillFromPreviousValues(data: Draft<TestAnalysisValues>): void {
        data["test-resources"] = {};
    }

    isUnlocked(data: TestAnalysisValues): boolean {
        return data["test-resources"] !== undefined;
    }

    validateData(data: TestAnalysisValues, resources: ResourcesType): UIError[] {
        let errors: UIError[] = [];

        // Validierung
        // Picture
        let file = resources.get("picture");
        let fileVal = validateFile(file?.file, {
            size: 2000,
            type: ["image/png", "image/jpg", "image/jpeg"]
        });

        if (!fileVal.isEmpty) {
            if (fileVal.tooBig) {
                errors.push({
                    id: "picture.size",
                    level: "error",
                    message: "Das hochgeladene Bild darf maximal 2 MB groß sein!"
                })
            }
            if (fileVal.notType) {
                errors.push({
                    id: "picture.type",
                    level: "error",
                    message: "Bitte laden Sie ein Bild mit gültigen Dateitypen hoch!"
                })
            }
        }

        // Excel
        let efile = resources.get("excel");
        let efileVal = validateFile(efile?.file, {
            size: 2000,
            type: ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]
        });

        if (!efileVal.isEmpty) {
            if (efileVal.tooBig) {
                errors.push({
                    id: "excel.size",
                    level: "error",
                    message: "Die hochgeladene Excel-Datei darf maximal 2 MB groß sein!"
                })
            }
            if (efileVal.notType) {
                errors.push({
                    id: "excel.type",
                    level: "error",
                    message: "Bitte laden Sie eine Excel-Datei mit gültigen Dateitypen hoch!"
                })
            }
        }

        // Json
        let jfile = resources.get("json");
        let jfileVal = validateFile(jfile?.file, {
            size: 1000,
            type: ["application/json"]
        });

        if (!jfileVal.isEmpty) {
            if (jfileVal.tooBig) {
                errors.push({
                    id: "json.size",
                    level: "error",
                    message: "Die hochgeladene JSON-Datei darf maximal 1 MB groß sein!"
                })
            }
            if (jfileVal.notType) {
                errors.push({
                    id: "json.type",
                    level: "error",
                    message: "Bitte laden Sie eine JSON-Datei mit gültigen Dateitypen hoch!"
                })
            }
        }

        return errors;
    }


}

export {
    TestResources
}