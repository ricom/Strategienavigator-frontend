import {APIArgs, callAPI} from "../API";
import {
    ImportJSONData,
    PaginationResource,
    SaveResource,
    SimpleSaveResource,
    SimpleSaveResourceLastOpened
} from "../../Datastructures";
import {Patch} from "immer";
import {ResourcesType} from "../../Tool/ToolSavePage/ToolSavePage";


export interface GetSavesArguments {
    /**
     * ID des Strategietools
     */
    toolID?: number,
    /**
     * Nummer der Seite, startet bei 1
     */
    page?: number,
    /**
     * Name als Suchparameter
     */
    name?: string,
    /**
     * Beschreibung als Suchparameter
     */
    description?: string,
    /**
     * Ob in dem Speicherstand der Suchwert von dem Namen und der Beschreibung enthalten sein muss oder nur eins der beiden
     */
    searchBoth?: boolean,
    /**
     * Ob die speicherstände absteigend oder aufsteigend nach erstelldatum sortiert werden sollen
     */
    orderDesc?: boolean
    /**
     * Zeigt auch die gelöschten Speicherstände an
     */
    deleted?: boolean
}

/**
 * Holt sich alle Saves zum angegebenen Benutzer
 *
 * @param userID Die ID des Benutzers
 * @param getSavesArguments Argumente welche steuern, welche werte zurückgegeben werden
 * @param apiArgs API Argumente
 */
const getSaves = async (userID: number, getSavesArguments: GetSavesArguments, apiArgs?: APIArgs) => {
    let data = new URLSearchParams();
    let searchParams = false;

    if (getSavesArguments.toolID) {
        data.append("tool_id", String(getSavesArguments.toolID));
        searchParams = true;
    }
    if (getSavesArguments.page) {
        data.append("page", String(getSavesArguments.page));
        searchParams = true;
    }
    if (getSavesArguments.name) {
        data.append("name", getSavesArguments.name);
        searchParams = true;
    }
    if (getSavesArguments.description) {
        data.append("description", getSavesArguments.description);
        searchParams = true;
    }
    if (getSavesArguments.deleted) {
        data.append("deleted", getSavesArguments.deleted ? "1" : "0");
        searchParams = true;
    }

    if (getSavesArguments.searchBoth) {
        data.append("search_both", getSavesArguments.searchBoth ? "1" : "0");
        searchParams = true;
    }

    if (getSavesArguments.orderDesc !== undefined) {
        data.append("orderBy", getSavesArguments.orderDesc ? "DESC" : "ASC");
        searchParams = true;
    }

    return await callAPI<PaginationResource<SimpleSaveResource>>("api/users/" + userID + "/saves", "GET", searchParams ? data : undefined, true, apiArgs);
}

/**
 * Holt sich einen einzelnen Save über die ID
 *
 * @param saveID Die ID des Saves
 * @param apiArgs API Argumente
 */
const getSave = async <D extends unknown>(saveID: number, apiArgs?: APIArgs) => {
    return await callAPI<SaveResource<D>>("api/saves/" + saveID, "GET", undefined, true, apiArgs);
}

/**
 * Holt sich die 4 zuletzt geöffneten Speicherstände
 *
 * @param userID id of the user
 * @param {APIArgs} apiArgs
 * @returns {Promise<CallInterface<object> | null>}
 */
const getLastOpenedSaves = async (userID: number, apiArgs?: APIArgs) => {
    return await callAPI<{ data: SimpleSaveResourceLastOpened[] }>("api/users/" + userID +"/saves/last", "GET", undefined, true, apiArgs);
}

/**
 * Löscht den Save mit der angegebenen ID
 *
 * @param saveID Die ID des Speicherstandes
 * @param apiArgs API Argumente
 */
const deleteSave = async (saveID: number, apiArgs?: APIArgs) => {
    return await callAPI("api/saves/" + saveID, "DELETE", undefined, true, apiArgs);
}

/**
 * Updatet einen Save
 *
 * @param save Der zu aktualisierende Speicherstand
 * @param resources
 * @param apiArgs API Argumente
 */
const updateSave = async (save: SaveResource<any>, resources?: ResourcesType, apiArgs?: APIArgs) => {
    let data = new FormData();
    data.append("data", JSON.stringify(save.data));
    data.append("name", save.name as string);
    data.append("description", save.description as string);

    if (resources) {
        let i = 0;
        for (let entry of Array.from(resources.entries())) {
            let name = entry[0];
            let value = entry[1];

            data.append(`resources[${i}][name]`, name);
            if (value.changed) {
                data.append(`resources[${i}][file]`, value.file);
            }

            i++;
        }
    }
    return await updateSaveData(save.id, data, apiArgs);
}

/**
 * Updatet einen Save
 *
 * @param saveID Die ID des Saves
 * @param data Daten des Speicherstandes
 * @param apiArgs API Argumente
 */
const updateSaveData = async (saveID: number, data: FormData, apiArgs?: APIArgs) => {
    data.append("_method", "PUT");

    return await callAPI("api/saves/" + saveID, "POST", data, true, apiArgs);
}

/**
 * Broadcastet die Änderungen am Save
 *
 * @param {number} saveID Die ID des Saves
 * @param {Patch[]} patches Die Patches
 * @param {APIArgs} apiArgs API Argumente
 * @returns {Promise<CallInterface<object> | null>}
 */
const broadcastSavePatches = async (saveID: number, patches: Patch[], apiArgs?: APIArgs) => {
    let data = new FormData();
    data.append("data", JSON.stringify(patches));

    return await callAPI("api/saves/" + saveID + "/broadcast", "POST", data, true, apiArgs);
}

/**
 * Lockt einen Save
 *
 * @param {number} saveID
 * @param {boolean} lock
 * @param apiArgs API Argumente
 * @returns {Promise<CallInterface<object> | null>}
 */
const lockSave = async (saveID: number, lock: boolean, apiArgs?: APIArgs) => {
    let data = new FormData();
    data.append("_method", "PUT");

    let locking = String(lock ? 1 : 0);
    data.append("lock", locking);

    return await callAPI("api/saves/" + saveID, "POST", data, true, apiArgs);
}


/**
 * Erstellt einen neuen Save
 *
 * @param name
 * @param description
 * @param tool_id
 * @param data Daten des Save
 * @param resources
 * @param apiArgs API Argumente
 */
const createSave = async <D extends object>(
    name: string,
    description: string,
    tool_id: number,
    data: D,
    resources: ImportJSONData[],
    apiArgs?: APIArgs
) => {
    let formData = new FormData();
    formData.set("name", name);
    formData.set("description", description);
    formData.set("tool_id", tool_id.toString());
    formData.set("data", JSON.stringify(data));

    // Ressourcen
    let i = 0;
    for (const resource of resources) {
        let res = await fetch(resource.file);
        let blob = new File(
            [new Uint8Array(await res.arrayBuffer())],
            resource.name,
            {
                type: resource.type
            }
        );

        formData.set(`resources[${i}][name]`, resource.name);
        formData.set(`resources[${i}][file]`, blob);
        i++;
    }

    return await callAPI<SaveResource<D>>("api/saves", "POST", formData, true, apiArgs);
}

export {
    getSaves,
    getSave,
    getLastOpenedSaves,
    deleteSave,
    updateSave,
    broadcastSavePatches,
    lockSave,
    createSave
}
