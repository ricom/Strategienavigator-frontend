import {Component} from "react";
import {SaveResource} from "../../Datastructures";
import {PDFExporter} from "./PDFExporter";
import {ResourcesType} from "../../Tool/ToolSavePage/ResourceManager";

interface PDFExporterPreviewProps<D> {
    save: SaveResource<D>,
    exporter: PDFExporter<D>,
    resources: ResourcesType
}

class PDFExporterPreview<D> extends Component<PDFExporterPreviewProps<D>, { url: string }> {
    state = {
        url: ""
    }

    render = () => {
        return (
            <iframe
                title={"PDF-Export-Vorschau"}
                width="100%"
                height="900px"
                src={this.state.url}
            ></iframe>
        );
    }

    componentDidMount = async () => {
        URL.revokeObjectURL(this.state.url);
        let parts: BlobPart[] = await this.props.exporter.onExport(this.props.save, this.props.resources);
        this.setState({
            url: parts.length > 0 ? URL.createObjectURL(parts[0]) : ""
        });
    }

}

export {
    PDFExporterPreview
}