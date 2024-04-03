import {Exporter} from "./Exporter";
import {SaveResource} from "../Datastructures";
import {SingleMessageProps} from "../Messages/Messages";
import {ResourcesType} from "../Tool/ToolSavePage/ResourceManager";


class JSONExporter<D> extends Exporter<D> {

    public constructor() {
        super("JSON", "json", "application/json");
    }

    protected onExport = async (data: SaveResource<D>, resources: ResourcesType): Promise<BlobPart[]> => {
        let allResources = [];

        // Add resources to export
        for (let entry of Array.from(resources.entries())) {
            let name = entry[0];
            let value = entry[1];
            allResources.push({
                name: name,
                file: await this.getDataURL(new Uint8Array(await value.file.arrayBuffer()), name, value.file.type),
                type: value.file.type
            });
        }

        return [JSON.stringify(Object.assign({}, data.data, {
            "export-resources": allResources
        }), null, 4)];
    }

    protected validateExport(save: SaveResource<D>, resources: ResourcesType): SingleMessageProps[] {
        return [];
    }

    private async getDataURL(bytes: Uint8Array, fName: string, type: string = "application/octet-stream") {
        return await new Promise((resolve, reject) => {
            const reader = Object.assign(new FileReader(), {
                onload: () => resolve(reader.result),
                onerror: () => reject(reader.error),
            });
            reader.readAsDataURL(new File([bytes], fName, {type}));
        });
    }
}

export {
    JSONExporter
}
