import {getSaveResource} from "../../API/calls/SaveResources";
import {SimpleSaveResource} from "../../Datastructures";

export interface IResourceManager {
    resources: ResourcesType,
    onChanged: (name: string, file: File) => void,
    hasResource: (name: string) => boolean,
    getData: (name: string) => Blob | null,
    getText: (name: string) => Promise<string | null>,
    getBlobURL: (name: string) => string | null
}

export type SingleResource = {
    file: File,
    url: string,
    changed: boolean
};
export type ResourcesType = Map<string, SingleResource>;


export class ResourceManager implements IResourceManager {
    resources: ResourcesType;


    constructor() {
        this.resources = new Map();
    }

    public onChanged = (name: string, file: File) => {
        this.resources.set(name, {
            file: file,
            url: URL.createObjectURL(file),
            changed: true
        });
    }

    public getData = (name: string): Blob | null => {
        let res = this.resources.get(name);
        if (res) {
            return res.file;
        }
        return null;
    }

    public getText = async (name: string): Promise<string | null> => {
        let res = this.resources.get(name);
        if (res) {
            return await res.file.text();
        }
        return null;
    }

    public getBlobURL = (name: string): string | null => {
        let res = this.resources.get(name);
        if (res) {
            return res.url;
        }
        return null;
    }

    public hasResource = (name: string): boolean => {
        return this.resources.has(name);
    }

    public loadResource = async (save: SimpleSaveResource, resourceName: string) => {
        let res = await getSaveResource(save, resourceName);
        if (res !== null && res.success) {
            let blob = res.callData;
            let put: string | Blob;
            if (blob instanceof Blob) {
                put = blob;
            } else {
                put = JSON.stringify(blob, null, 2);
            }
            let file = new File([put], resourceName, {
                type: res.response.headers.get("Content-Type") ?? ((blob instanceof Blob) ? blob.type : "")
            });
            this.resources.set(resourceName, {
                file: file,
                url: URL.createObjectURL(file),
                changed: false
            });
        }
    }

    private static resourcesMapToFileArray(resources: ResourcesType): File[] {
        let files: File[] = [];
        resources.forEach((value, key) => {
            files.push(
                new File([value.file], key, {type: value.file.type, lastModified: value.file.lastModified})
            );
        });
        return files;
    }

}