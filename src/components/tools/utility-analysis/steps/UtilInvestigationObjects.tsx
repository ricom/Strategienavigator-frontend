import {FormComponent, ResetType} from "../../../../general-components/Form/FormComponent";
import {FormEvent} from "react";


interface UtilInvestigationObjectsValues {

}

class UtilInvestigationObjects extends FormComponent<UtilInvestigationObjectsValues, any> {
    build(): JSX.Element {
        return <div/>;
    }

    changeControlFooter(): void {
    }

    extractValues(e: FormEvent<HTMLFormElement>): UtilInvestigationObjectsValues {
        return {};
    }

    onReset(type: ResetType): void {
    }

    prepareValues = async (): Promise<void> => {

    }

    submit = async (values: UtilInvestigationObjectsValues): Promise<void> => {

    }

    validate(values: UtilInvestigationObjectsValues): boolean {
        return false;
    }

}

export {
    UtilInvestigationObjects
};
export type {UtilInvestigationObjectsValues};
