import React, {ReactElement, ReactNode} from "react";
import {Step, StepProp} from "../../../../../general-components/Tool/SteppableTool/StepComponent/Step/Step";
import {PersonaAnalysisValues} from "../../PersonaAnalysis";
import {CardComponent, CardComponentFields} from "../../../../../general-components/CardComponent/CardComponent";
import {NumberCounter} from "../../../../../general-components/Counter/NumberCounter";
import {UIErrorBanner} from "../../../../../general-components/Error/UIErrors/UIErrorBannerComponent/UIErrorBanner";
import {
    CardComponentFieldsWithName,
    CardComponentWithName
} from "../../../../../general-components/CardComponent/CardComponentWithName";
import {IconDefinition} from "@fortawesome/fontawesome-svg-core";
import {faFire, faHeartbeat, faHeartBroken, faMicrophone, faPen, faUser} from "@fortawesome/free-solid-svg-icons";

export interface PersonaPersonalityValues {
    fields: {
        demograph: CardComponentFields,
        pains: CardComponentFields,
        gains: CardComponentFields,
        [key: string]: CardComponentFields
    }
    individual: CardComponentFieldsWithName,
    fieldsElse: {
        statements: CardComponentFields,
        motives: CardComponentFields,
        keywords: CardComponentFields,
        [key: string]: CardComponentFields
    }
}

interface ItemsInterface {
    legend: string,
    name: string,
    min: number,
    max: number,
    changeListener: (value: CardComponentFields) => void,
    withDesc: boolean
}

export class PersonaPersonalityComponent extends Step<PersonaAnalysisValues, {}> {

    static DEFAULT_MIN = 0;
    static DEFAULT_MAX = 5;

    // VORGEGEBEN
    static MIN_DEMO = PersonaPersonalityComponent.DEFAULT_MIN;
    static MAX_DEMO = 6;

    static MIN_PAINS = PersonaPersonalityComponent.DEFAULT_MIN;
    static MAX_PAINS = PersonaPersonalityComponent.DEFAULT_MAX;

    static MIN_GAINS = PersonaPersonalityComponent.DEFAULT_MIN;
    static MAX_GAINS = PersonaPersonalityComponent.DEFAULT_MAX;

    // SONSTIGE
    static MIN_STATEMENTS = PersonaPersonalityComponent.DEFAULT_MIN;
    static MAX_STATEMENTS = 3;

    static MIN_MOTIVES = PersonaPersonalityComponent.DEFAULT_MIN;
    static MAX_MOTIVES = 2;

    static MIN_KEYWORDS = PersonaPersonalityComponent.DEFAULT_MIN;
    static MAX_KEYWORDS = 2;

    static MIN_INDIVIDUAL = 0;
    static MAX_INDIVIDUAL = 5;

    // INDIVIDUELL
    static MIN_INDIVIDUAL_CARDS = PersonaPersonalityComponent.DEFAULT_MIN;
    static MAX_INDIVIDUAL_CARDS = PersonaPersonalityComponent.DEFAULT_MAX;

    static COUNTER = new NumberCounter();
    public static names: { [key: string]: string } = {
        "demograph": "Demographische Daten",
        "pains": "Pains (Frust, Probleme, Schmerzpunkte)",
        "gains": "Gains (Ziele, Wünsche, Gewinne)",
        "statements": "Statements (Zitate, Aussagen)",
        "motives": "Dominierendes Grundmotiv und wie lässt sich dies erklären?",
        "keywords": "Wie lässt sich die Persona in ein/zwei Sätzen beschreiben?"
    };
    public static icons: {[key:string]: IconDefinition} = {
        "demograph":faUser,
        "pains": faHeartBroken,
        "gains": faHeartbeat,
        "statements": faMicrophone,
        "motives": faFire,
        "keywords": faPen
    };
    // Change listener
    private demoChanged = this.applyChanges.bind(this, "demo");
    private painsChanged = this.applyChanges.bind(this, "pain");
    private gainsChanged = this.applyChanges.bind(this, "gain");
    public items: ItemsInterface[] = [
        {
            legend: PersonaPersonalityComponent.names["demograph"],
            name: "demograph",
            min: PersonaPersonalityComponent.MIN_DEMO,
            max: PersonaPersonalityComponent.MAX_DEMO,
            changeListener: this.demoChanged,
            withDesc: false
        },
        {
            legend: PersonaPersonalityComponent.names["pains"],
            name: "pains",
            min: PersonaPersonalityComponent.MIN_PAINS,
            max: PersonaPersonalityComponent.MAX_PAINS,
            changeListener: this.painsChanged,
            withDesc: false
        },
        {
            legend: PersonaPersonalityComponent.names["gains"],
            name: "gains",
            min: PersonaPersonalityComponent.MIN_GAINS,
            max: PersonaPersonalityComponent.MAX_GAINS,
            changeListener: this.gainsChanged,
            withDesc: false
        }
    ];
    private statementsChanged = this.applyChanges.bind(this, "state");
    private motivesChanged = this.applyChanges.bind(this, "mot");
    private keyWordsChanged = this.applyChanges.bind(this, "key");
    public itemsElse = [
        {
            legend: PersonaPersonalityComponent.names["statements"],
            name: "statements",
            min: PersonaPersonalityComponent.MIN_STATEMENTS,
            max: PersonaPersonalityComponent.MAX_STATEMENTS,
            changeListener: this.statementsChanged,
            withDesc: false
        },
        {
            legend: PersonaPersonalityComponent.names["motives"],
            name: "motives",
            min: PersonaPersonalityComponent.MIN_MOTIVES,
            max: PersonaPersonalityComponent.MAX_MOTIVES,
            changeListener: this.motivesChanged,
            withDesc: true
        },
        {
            legend: PersonaPersonalityComponent.names["keywords"],
            name: "keywords",
            min: PersonaPersonalityComponent.MIN_KEYWORDS,
            max: PersonaPersonalityComponent.MAX_KEYWORDS,
            changeListener: this.keyWordsChanged,
            withDesc: false
        }
    ];

    public constructor(props: StepProp<PersonaAnalysisValues>, context: any) {
        super(props, context);
    }

    build(): ReactElement {
        let data = this.props.save.data["persona-personality"];
        if (data) {
            return (
                <>
                    <h1>Vorgeschriebene Kategorien</h1>
                    {this.renderItems(this.items, data.fields)}

                    <h1>Individuelle Kategorien (Maximal 5)</h1>
                    <CardComponentWithName
                        name={"individual"}
                        min={PersonaPersonalityComponent.MIN_INDIVIDUAL}
                        max={PersonaPersonalityComponent.MAX_INDIVIDUAL}
                        values={data.individual}
                        disabled={this.props.disabled}
                        onChanged={this.onIndividualChange}
                        cardComponent={{
                            hideDesc: true,
                            max: PersonaPersonalityComponent.MAX_INDIVIDUAL_CARDS,
                            min: PersonaPersonalityComponent.MIN_INDIVIDUAL_CARDS,
                            placeholder: {
                                name: "Eintrag...",
                                description: "Begründung"
                            }
                        }}
                    />

                    <h1 className={"mt-4"}>Weitere Kategorien</h1>
                    {this.renderItems(this.itemsElse, data.fieldsElse)}
                </>
            );
        }
        return (<></>);
    }

    private renderItems = (items: ItemsInterface[], values: { [key: string]: CardComponentFields }): ReactNode => {
        return items.map((item) => {
            return (
                <fieldset key={`persona-item-${item.name}`}>
                    <legend>{item.legend}</legend>
                    <div>
                        <CardComponent
                            name={item.name}
                            values={values[item.name]}
                            disabled={this.props.disabled}
                            min={item.min}
                            max={item.max}
                            hideDesc={!item.withDesc}
                            placeholder={{
                                name: "Eintrag...",
                                description: "Begründung"
                            }}
                            required={true}
                            onChanged={item.changeListener}
                        />
                        <UIErrorBanner id={`${item.name}.empty`}/>
                        <UIErrorBanner id={`${item.name}.toolong`}/>
                    </div>
                </fieldset>
            );
        });
    }

    private onIndividualChange = (values: CardComponentFieldsWithName) => {
        this.props.saveController.onChanged(save => {
            let data = save.data["persona-personality"];
            if (data) {
                data.individual = values;
            }
        });
    }

    private applyChanges(type: "demo" | "pain" | "gain" | "state" | "mot" | "key", values: CardComponentFields) {
        this.props.saveController.onChanged(save => {
            const data = save.data["persona-personality"];
            if (data) {
                switch (type) {
                    case "demo":
                        data.fields.demograph = values;
                        break;
                    case "pain":
                        data.fields.pains = values;
                        break;
                    case "gain":
                        data.fields.gains = values;
                        break;
                    case "state":
                        data.fieldsElse.statements = values.map(v => {
                            let o = v;
                            if (!o.name.startsWith('"')) {
                                o.name = `"${o.name}`;
                            }
                            if (!o.name.endsWith('"')) {
                                o.name = `${o.name}"`;
                            }
                            return o;
                        });
                        break;
                    case "mot":
                        data.fieldsElse.motives = values;
                        break;
                    case "key":
                        data.fieldsElse.keywords = values;
                        break;
                }
            }
        });
    }

}
