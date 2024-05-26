import {IconDefinition} from "@fortawesome/fontawesome-svg-core";
import {ReactNode} from "react";
import {JSONImporter} from "../../Import/JSONImporter";
import {Exporter} from "../../Export/Exporter";
import {ToolSaveProps} from "../ToolSavePage/ToolSavePage";

export abstract class ToolData<D extends object> {
    // TOOL META DATA
    private readonly homePath;
    private readonly newPath;
    private readonly viewPath;

    // TOOL INFO
    private toolName: string;
    private toolIcon: IconDefinition;
    private toolID: number;
    private readonly toolLink: string;
    private maintenance = false;

    // Export
    private readonly exporters: Exporter<object>[];

    // Import
    private importer?: JSONImporter;

    constructor(toolName: string, toolIcon: IconDefinition, toolID: number, toolLink: string) {
        this.toolName = toolName;
        this.toolIcon = toolIcon;
        this.toolID = toolID;

        this.toolLink = toolLink;

        // setup route paths
        this.homePath = this.getLink();
        this.newPath = this.getLink() + "/new";
        this.viewPath = this.getLink() + "/:id";
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
        this.maintenance = maintenance;
    }

    public hasImporter = (): boolean => {
        return this.getImporter() !== undefined;
    }

    public hasTutorial = (): boolean => {
        let tutorial = this.renderTutorial();
        return (tutorial !== null && tutorial !== undefined);
    }

    protected setID = (toolID: number) => {
        this.toolID = toolID;
    }

    protected setToolname = (toolName: string) => {
        this.toolName = toolName;
    }

    protected setToolIcon = (toolIcon: IconDefinition) => {
        this.toolIcon = toolIcon;
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

    protected abstract getInitData(): D;

    protected abstract renderShortDescription(): ReactNode;

    protected abstract buildSaveBuilder(saveProps: ToolSaveProps<D>): JSX.Element

    public abstract renderTutorial(): ReactNode;


}