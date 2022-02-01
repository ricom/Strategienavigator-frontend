import {faChartPie} from "@fortawesome/free-solid-svg-icons";
import {SaveResource} from "../../../general-components/Datastructures";

import "./abc-analysis.scss";
import {SteppableTool} from "../../../general-components/Tool/SteppableTool/SteppableTool";
import {RouteComponentProps} from "react-router";


class ABCAnalysis extends SteppableTool<any> {


    constructor(props: RouteComponentProps, context: any) {
        super(props, context, "ABC Analyse", faChartPie, 4);
        this.setMaintenance(true);
    }

    protected renderToolHome() {
        return null;
    }

    protected renderShortDescription() {
        return null;
    }

    protected renderTutorial() {
        return null;
    }

    protected getSaveViewBuilder(save:SaveResource<any>) {
        return this.getStepComponent();
    }
}

export {
    ABCAnalysis
}
