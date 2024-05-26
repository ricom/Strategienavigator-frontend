import {SaveResource, SharedSavePermissionDefault} from "../Datastructures";
import {EditSavesPermission, hasPermission} from "../Permissions";
import {getSave, lockSaveWithCheck} from "../API/calls/Saves";
import {ResourceManager} from "../Tool/ToolSavePage/ResourceManager";
import {HTTPError} from "./ErrorTypes";

export const INTERRUPTED = "interrupted";

/**
 * Updates the given save, so it has appropriate permission and locked status and sends a lock request to the backend.
 * @param save the save to manipulate and lock
 * @param userId id of the user, which wants to retrieve the lock.}
 */
export async function lockAndUpdateSave(save: SaveResource<any>, userId: number): Promise<boolean> {
    save.permission = save.permission ?? {
        permission: SharedSavePermissionDefault,
        created_at: ""
    };
    let permission = save.permission.permission;

    // only show locked info if the current user can edit.
    let shouldShowLockedInfo = hasPermission(permission, EditSavesPermission);

    if (
        save.locked_by === null ||
        save.locked_by === userId
    ) {
        shouldShowLockedInfo = false;
    }

    await lockSaveWithCheck(save, true);

    if (save.locked_by === null) {
        save.locked_by = userId;
    }
    return shouldShowLockedInfo;
}

export async function retrieveSave<D>(ID: number, toolId: number, resourceManager: ResourceManager): Promise<SaveResource<D> | undefined> {
    let call = await getSave<any>(ID, {
        errorCallback: (reason) => {
            throw reason;
        }
    });
    if (call && call.success) {
        if (call.callData.tool_id === toolId) {
            let save: SaveResource<D> = call.callData;
            save.data = JSON.parse(call.callData.data);

            resourceManager.clearResources();
            // load resources
            const resourcePromises = save.resources.map((resource) => resourceManager.loadResource(save, resource.name));

            await Promise.all(resourcePromises);

            return save;
        } else {
            throw new HTTPError("Tried to open a save which was created with another tool.",403);
        }
    } else {
        throw new HTTPError("Save was not found.",404);
    }
}