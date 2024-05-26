import {
    shallowCompareStepProps,
    Step,
    StepProp
} from "../../../../../general-components/Tool/SteppableTool/StepComponent/Step/Step";
import {PersonaAnalysisValues} from "../../PersonaAnalysis";
import {UIErrorBanner} from "../../../../../general-components/Error/UIErrors/UIErrorBannerComponent/UIErrorBanner";
import {Col, Form, Image, Row} from "react-bootstrap";
import {ChangeEvent, ReactElement} from "react";
import {PersonaInfo} from "./PersonaInfo";

export interface PersonaInfoValues {
    "firstname": string | null,
    "age": number | null
}

export class PersonaInfoComponent extends Step<PersonaAnalysisValues, {}> {
    static FILETYPES = ["png", "jpg", "jpeg"];
    static MAXFILESIZE = 2000;

    public constructor(props: StepProp<PersonaAnalysisValues>, context: any) {
        super(props, context);
    }

    shouldComponentUpdate(nextProps: Readonly<StepProp<PersonaAnalysisValues>>, nextState: Readonly<{}>, nextContext: any): boolean {
        let shouldUpdate: boolean;
        shouldUpdate = !shallowCompareStepProps(this.props, nextProps);
        if (!shouldUpdate) {
            const oldSave = this.props.save;
            const newSave = nextProps.save;
            if (oldSave.data["persona-info"] !== newSave.data["persona-info"]) {
                shouldUpdate = true;
            }
        }
        return shouldUpdate;
    }

    build(): ReactElement {
        let data = this.props.save.data["persona-info"];
        return (
            <>
                <Row>
                    <Col sm={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Vorname</Form.Label>
                            <Form.Control disabled={this.props.disabled} required onChange={this.firstNameChanged}
                                          type={"text"} name={"name"}
                                          value={data?.firstname ?? ""} placeholder={"Max"}/>
                            <UIErrorBanner id={"firstname.empty"}/>
                            <UIErrorBanner id={"firstname.toolong"}/>
                        </Form.Group>
                    </Col>
                    <Col sm={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Alter</Form.Label>
                            <Form.Control disabled={this.props.disabled} onChange={this.ageChanged} type={"number"}
                                          value={data?.age === -1 ? undefined : data?.age ?? ""}
                                          name={"age"}
                                          min={PersonaInfo.AGE_MIN} max={PersonaInfo.AGE_MAX}
                                          placeholder={"25"}/>
                            <UIErrorBanner id={"age.invalid"}/>
                        </Form.Group>
                    </Col>
                </Row>

                <Form.Group className="mb-3">
                    <Form.Label>Avatar/Personenfoto</Form.Label>
                    <Form.Control disabled={this.props.disabled} type="file" name={"picture"}
                                  onChange={this.avatarChanged}/>
                    <Form.Text>Gültige
                        Dateitypen: {PersonaInfoComponent.FILETYPES.map(i => "." + i).join(", ")}</Form.Text>
                    <br/>
                    <Form.Text>Maximalgröße: {PersonaInfoComponent.MAXFILESIZE / 1000} MB</Form.Text>

                    <UIErrorBanner id={"avatar.empty"}/>
                    <UIErrorBanner id={"avatar.size"}/>
                    <UIErrorBanner id={"avatar.type"}/>
                </Form.Group>

                <div className={"avatar-preview"}>
                    {this.props.resourceManager.hasResource("avatar") ?
                        (<Image
                            src={this.props.resourceManager.getBlobURL("avatar") ?? undefined}
                            thumbnail rounded
                            className={"avatar"} alt={"Avatar Vorschau"}/>)
                        : (<p>Kein Bild ausgewählt</p>)}

                </div>
            </>
        );
    }

    firstNameChanged = (e: ChangeEvent<HTMLInputElement>) => {
        this.props.saveController.onChanged(save => {
            let data = save.data["persona-info"];
            if (data !== undefined) data.firstname = e.target.value;
        });
    }

    ageChanged = (e: ChangeEvent<HTMLInputElement>) => {
        this.props.saveController.onChanged(save => {
            let data = save.data["persona-info"];
            if (data !== undefined) {
                let parsed = parseInt(e.target.value);
                if (isNaN(parsed)) {
                    data.age = -1;
                } else {
                    data.age = parsed;
                }
            }
        });
    }

    avatarChanged = (e: ChangeEvent<HTMLInputElement>) => {
        let file: File | null = null;
        if (e.target.files !== null) {
            file = e.target.files.item(0);
            if (file) {
                this.props.resourceManager.onChanged("avatar", file);
                this.forceUpdate();
            }
        }
    }

}
