import React, {Component, ReactElement, ReactNode, RefObject} from "react";
import {RouteComponentProps, withRouter} from "react-router";
import {Route, Switch} from "react-router-dom";
import {IconDefinition} from "@fortawesome/fontawesome-svg-core";
import {ToolHome, ToolHomeInfo} from "./Home/ToolHome";
import {Card} from "react-bootstrap";
import {CreateToolModal} from "./CreateToolModal/CreateToolModal";
import "./tool.scss";
import {Exporter} from "../Export/Exporter";
import {createSave} from "../API/calls/Saves";
import {ToolSavePage, ToolSaveProps} from "./ToolSavePage/ToolSavePage";
import {JSONImporter} from "../Import/JSONImporter";


interface ToolState {
    showInputModal: boolean
    isCreatingNewSave: boolean
}

abstract class Tool<D extends object> extends Component<RouteComponentProps<{}>, ToolState> {
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

    // TOOL HOME
    private readonly toolHomeRef: RefObject<ToolHome>

    // Export
    private readonly exporters: Exporter<object>[];

    // Import
    private importer?: JSONImporter;

    constructor(props: RouteComponentProps<{}>, context: any, toolName: string, toolIcon: IconDefinition, toolID: number) {
        super(props, context);
        this.toolName = toolName;
        this.toolIcon = toolIcon;
        this.toolID = toolID;

        this.state = {
            showInputModal: true,
            isCreatingNewSave: false,
        }
        this.toolLink = this.props.match.path;

        // setup route paths
        this.homePath = this.getLink();
        this.newPath = this.getLink() + "/new";
        this.viewPath = this.getLink() + "/:id";
        this.exporters = [];

        this.toolHomeRef = React.createRef();
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


    public render = () => {
        if (this.maintenance) {
            return (
                <Card body>
                    Diese Analyse befindet sich im Wartungsmodus. Bitte Schauen Sie zu einem späteren Zeitpunkt erneut
                    vorbei.
                </Card>
            );
        }

        return (
            <>
                <Switch>
                    <Route exact path={this.homePath}>
                        {this.getRenderedToolHome()}
                    </Route>

                    <Route exact path={this.newPath}>
                        <CreateToolModal onSaveCreated={this.createNewSave}
                                         onCancel={() => {
                                             this.props.history.push(this.getLink());
                                         }}
                                         isCreatingNewSave={this.state.isCreatingNewSave}/>
                    </Route>

                    <Route
                        exact
                        render={(routeProps) => {
                            return <ToolSavePage tool={this} element={this.buildSaveBuilder.bind(this)}/>
                        }}
                        path={this.viewPath}/>
                </Switch>
            </>
        );
    }

    public switchPage(page: string) {
        this.props.history.push(this.getLink() + "/" + page);
    }

    protected setID = (toolID: number) => {
        this.toolID = toolID;
    }

    protected abstract getInitData(): D;

    protected abstract renderShortDescription(): ReactNode;

    protected abstract buildSaveBuilder(saveProps: ToolSaveProps<D>): ReactElement

    protected abstract renderTutorial(): ReactNode;

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

    /**
     * Kreiert einen neuen Save
     *
     * @param {string} name Name des Saves
     * @param {string} description Beschreibung des Saves
     * @returns {Promise<void>}
     */
    private createNewSave = async (name: string, description: string) => {
        this.setState({
            isCreatingNewSave: true
        });

        let saved = await createSave(
            name,
            description,
            this.getID(),
            this.getInitData(),
            []
        );

        if (saved) {
            this.setState({
                isCreatingNewSave: false
            });
            this.props.history.push(this.getLink() + "/" + saved.callData.id);
        }
    }

    private getRenderedToolHome = () => {

        let home = <ToolHome tool={this}/>;

        let info: ToolHomeInfo = {
            shortDescription: this.renderShortDescription(),
            tutorial: this.renderTutorial()
        }

        return React.cloneElement(home, {
            ref: this.toolHomeRef,
            info: Object.assign(info, home.props.info),
            tool: this
        });
    }
}

withRouter<RouteComponentProps<{}>, any>(Tool);

export {
    Tool
}
