import {IconDefinition} from "@fortawesome/fontawesome-svg-core";
import {ReactElement, ReactNode} from "react";
import {JSONImporter} from "../../Import/JSONImporter";
import {Exporter} from "../../Export/Exporter";
import {ToolSaveProps} from "../ToolSavePage/ToolSavePage";
import {types} from "sass";
import Error = types.Error;

export abstract class ToolData<D extends object> {
    // TOOL INFO
    private toolName: string;
    private toolIcon: IconDefinition;
    private toolID: number;
    private readonly toolLink: string;
    private _maintenance = false;

    // Export
    private readonly exporters: Exporter<object>[];

    // Import
    private importer?: JSONImporter;

    constructor(toolName: string, toolIcon: IconDefinition, toolID: number, toolLink: string) {
        this.toolName = toolName;
        this.toolIcon = toolIcon;
        this.toolID = toolID;

        this.toolLink = toolLink;
        this.exporters = [];
    }


    public getLink(): string {
        return this.toolLink;
    }

    public getToolName = (): string => {
        return this.toolName;
    }

    public getToolIcon = (): IconDefinition => {
        return this.toolIcon;
    }

    public getID = (): number => {
        return this.toolID;
    }

    public getImporter = (): JSONImporter | undefined => {
        return this.importer;
    }

    public getExporters = (): Exporter<object>[] => {
        return this.exporters;
    }

    public setMaintenance(maintenance: boolean) {
        this._maintenance = maintenance;
    }

    public hasImporter = (): boolean => {
        return this.getImporter() !== undefined;
    }

    public hasTutorial = (): boolean => {
        let tutorial = this.renderTutorial();
        return (tutorial !== null && tutorial !== undefined);
    }

    /**
     * Setzt den Importer des Tools.
     * @protected
     */
    protected setImporter(importer: JSONImporter) {
        this.importer = importer;
    }

    /**
     * Fügt den übergebenen Exporter hinzu.
     *
     * Es darf kein exporter doppelt existieren und keine zwei Exporter mit dem selben Namen existieren
     * @param exporter Eine Exporter Instanz
     * @protected
     */
    protected addExporter(exporter: Exporter<object>) {
        if (!this.exporters.some(e => e === exporter || e.getName() === exporter.getName())) {
            this.exporters.push(exporter);
        } else {
            throw new Error("Already added Export with this name");
        }
    }


    get maintenance(): boolean {
        return this._maintenance;
    }



    public abstract getInitData(): D;

    public abstract renderShortDescription(): ReactNode;

    public abstract buildSaveBuilder(saveProps: ToolSaveProps<D>): ReactElement

    public abstract renderTutorial(): ReactNode;


}