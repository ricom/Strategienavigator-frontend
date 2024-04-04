import {SaveResource, SharedSavePermissionDefault} from "../Datastructures";
import {EditSavesPermission, hasPermission} from "../Permissions";
import {lockSaveWithCheck} from "../API/calls/Saves";

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