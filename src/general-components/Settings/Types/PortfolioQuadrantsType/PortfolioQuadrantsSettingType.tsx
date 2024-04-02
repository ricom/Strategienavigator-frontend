import {SettingsTypeProps} from "../SettingsTypeProps";
import {ChangeEvent, Component} from "react";
import "../ToggleType/toggleSettingType.scss";
import "./portfolio-quadrants-type.scss";
import {Card, Form, FormControl, InputGroup} from "react-bootstrap";


export interface PortfolioQuadrantsSettingTypeProps extends SettingsTypeProps {
}

export interface PortfolioQuadrantsSettingValues {
    toggled: boolean,
    quadrants: {
        header: string,
        value: string,
    }[]
}

export class PortfolioQuadrantsSettingType extends Component<PortfolioQuadrantsSettingTypeProps, {}> {

    static defaults: PortfolioQuadrantsSettingValues = {
        toggled: false,
        quadrants: [
            {
                value: "Oben Links",
                header: "Oben Links"
            },
            {
                value: "Oben Rechts",
                header: "Oben Rechts"
            },
            {
                value: "Unten Links",
                header: "Unten Links"
            },
            {
                value: "Unten Rechts",
                header: "Unten Rechts"
            }
        ]
    };

    getDefaults(): PortfolioQuadrantsSettingValues {
        return PortfolioQuadrantsSettingType.defaults;
    }

    getValue(): PortfolioQuadrantsSettingValues {
        return JSON.parse(this.props.value);
    }

    toggleChanged = (event: ChangeEvent<HTMLInputElement>) => {
        this.props.valueChanged(JSON.stringify({
            toggled: event.currentTarget.checked,
            quadrants: this.getValue().quadrants
        }));
    }

    valueChanged = (event: ChangeEvent<HTMLInputElement>, index: number) => {
        let quadrants = this.getValue().quadrants;
        quadrants[index].value = event.target.value;

        this.props.valueChanged(JSON.stringify({
            toggled: this.getValue().toggled,
            quadrants: quadrants
        }));
    }

    render() {
        let values = this.getValue();
        let toggled = values.toggled;

        return (
            <>
                <div className="parent">
                    <Form.Check.Label className="title" htmlFor={"checkbox-" + this.props.name}>
                        <span>{this.props.name}</span><br/>
                        <span className={"text-muted"}>{this.props.description}</span>
                    </Form.Check.Label>

                    <div className="type">
                        <Form.Check.Input aria-label={this.props.name} id={"checkbox-" + this.props.name}
                                          onChange={this.toggleChanged} checked={toggled}/>
                    </div>
                </div>

                {toggled && (
                    <Card>
                        <Card.Body>
                            {(values.quadrants.map((quadrant, i) => {
                                return (
                                    <InputGroup size={"sm"} key={"quadrant-" + i}>
                                        <InputGroup.Text>
                                            {quadrant.header}
                                        </InputGroup.Text>
                                        <FormControl type={"text"} value={quadrant.value}
                                                     onChange={(event: ChangeEvent<any>) => {
                                                         this.valueChanged(event, i);
                                                     }}/>
                                    </InputGroup>
                                );
                            }))}
                        </Card.Body>
                    </Card>
                )}
            </>
        );
    }
}
