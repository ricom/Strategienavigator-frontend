import React, {FormEvent, useCallback, useState} from "react";
import {Session} from "../../../general-components/Session/Session";
import {User} from "../../../general-components/User";
import {faArrowLeft, faPencilAlt, faTrash, faUser} from "@fortawesome/free-solid-svg-icons/";
import {Button, Form} from "react-bootstrap";
import {extractFromForm} from "../../../general-components/Utility/FormHelper";
import {PasswordField} from "../../../general-components/PasswordField/PasswordField";
import {deleteUser, UpdateData, updateUser} from "../../../general-components/API/calls/User";
import {useHistory} from "react-router";
import {Messages, useMessageContext} from "../../../general-components/Messages/Messages";
import {checkEmail} from "../../../general-components/API/calls/Email";
import {checkUsername} from "../../../general-components/API/calls/Username";
import {UniqueCheck} from "../../../general-components/UniqueCheck/UniqueCheck";
import {Loader} from "../../../general-components/Loader/Loader";

import "./my-profile.scss";
import {LoadingButton} from "../../../general-components/LoadingButton/LoadingButton";
import FAE from "../../../general-components/Icons/FAE";
import {useUserContext} from "../../../general-components/Contexts/UserContextComponent";
import {ButtonPanel} from "../../../general-components/ButtonPanel/ButtonPanel";
import {useBooleanState, useControlledInput} from "../../../general-components/Utility/Hooks";
import {UserStatistics} from "../../../general-components/UserStatistics/UserStatistics";
import {ConfirmDeletionModal} from "./ConfirmDeletionModal";


export function MyProfile() {

    const {user, isLoggedIn} = useUserContext();

    const {state: edit, toggle: toggleEditValue} = useBooleanState(false);
    const {
        state: showDeleteModal,
        setTrue: showDeleteModalCallback,
        setFalse: hideDeleteModalCallback
    } = useBooleanState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);


    const [usernameValue,
        , // is important
        onUsernameChanged,
        resetUsername] = useControlledInput(user?.getUsername() ?? "");
    const [emailValue,
        , // is important
        onEmailChanged,
        resetEmail] = useControlledInput(user?.getEmail() ?? "");


    const messageContext = useMessageContext();
    const history = useHistory();

    const toggleEdit = useCallback(function () {
        resetUsername();
        resetEmail();
        toggleEditValue();
    }, [resetUsername, resetEmail, toggleEditValue]);


    const deleteCallback = useCallback(async () => {
        if (!user) {
            messageContext.add("Nicht angemeldet", "WARNING", 7000);
            return;
        }
        await deleteUser(user.getID() as number);

        Session.setCurrent(null);
        Session.removeTokens();

        history.push("/");
        messageContext.add("Ihr Konto wurde gelöscht!", "SUCCESS", 7000);
    }, [history, messageContext, user]);


    const saveChanges = useCallback(async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsSaving(true)

        let email: string = extractFromForm(e, "email") as string;
        let username: string = extractFromForm(e, "username") as string;
        let current_password: string = extractFromForm(e, "current_password") as string;
        let new_password: string = extractFromForm(e, "new_password") as string;

        let new_username = username !== user?.getUsername() ? username : undefined
        let new_email = email !== user?.getEmail() ? email : undefined

        let needs_update = new_email !== undefined || new_username !== undefined || new_password.length > 0;

        function showErrorMessage() {
            messageContext.add("Beim Speichern ist ein Fehler aufgetreten", "DANGER", Messages.TIMER);
        }

        if (needs_update) {
            let data: UpdateData = {
                current_password: current_password,
                email: new_email,
                username: new_username
            }

            if (new_password.length > 0) {
                data.password = new_password;
            }

            let call = await updateUser(user?.getID() as number, data, {
                errorCallback: showErrorMessage
            });

            if (call && call.success) {

                let newUser = User.from(user);

                newUser.update(data);
                Session.setCurrent(newUser);
                setIsSaved(true);
            } else {
                showErrorMessage();
            }
        } else {
            // fake load so the user thinks something is happening
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        setIsSaving(false);
    }, [setIsSaved, setIsSaving, messageContext, user]);


    if (!isLoggedIn || !user) {
        return (
            <Loader loaded={false} transparent fullscreen/>
        );
    }

    return (
        <Form onSubmit={saveChanges} className={"profile"}>
            <h4>
                <FAE icon={faUser}/> &nbsp;{user.getUsername()}
                {(edit) && (
                    <Button style={{float: "right"}} disabled={isSaving} variant={"dark"}
                            className={"editButton"} onClick={toggleEdit}>
                        <FAE icon={faArrowLeft}/> &nbsp;Zurück
                    </Button>
                )}
            </h4>

            <hr/>

            {/* BENUTZERNAME */}
            <Form.Floating className={"field"}>
                <UniqueCheck
                    id={"username"}
                    type={"text"}
                    readOnly={!edit}
                    suppressErrors={!edit}
                    value={usernameValue}
                    callback={checkUsername}
                    onChange={onUsernameChanged}
                    entityName={"Username"}
                />
                <Form.Label>Benutzername</Form.Label>
            </Form.Floating>

            {/* E-MAIL */}
            <Form.Floating className={"field"}>
                <UniqueCheck
                    id={"email"}
                    type={"text"}
                    readOnly={!edit}
                    suppressErrors={!edit}
                    value={emailValue}
                    callback={checkEmail}
                    onChange={onEmailChanged}
                    entityName={"Email"}
                />
                <Form.Label>E-Mail-Adresse</Form.Label>
            </Form.Floating>

            {/* NEUES PASSWORD */}
            {(edit) && (
                <PasswordField id={"new_password"} text={"Neues Passwort"} required={false} className={"field"}
                               check={true}
                               value={edit ? undefined : ""}
                               eye
                               confirm/>
            )}


            {/* AKTUELLES PASSWORD */}
            {(edit) && (
                <>
                    <hr/>
                    <PasswordField id={"current_password"} text={"Aktuelles Passwort"} required={true}
                                   className={"field"} check={false}
                                   value={edit ? undefined : ""} eye/>
                </>
            )}

            {(!edit) && (
                <UserStatistics user={user}/>
            )}

            {(isSaved !== undefined && isSaved) && (
                <div className={"feedback text-success"}>
                    Ihre Benutzerdaten wurden abgespeichert!
                </div>
            )}

            {(!edit) && (
                <Button variant={"dark"} className={"editButton"} onClick={toggleEdit}>
                    <FAE icon={faPencilAlt}/> &nbsp; Bearbeiten
                </Button>
            )}
            {(edit) && (
                <ButtonPanel buttonPerCol={2}>
                    <LoadingButton
                        disabled={(isSaving)}
                        type={"submit"} variant={"dark"} className={"editButton"}
                        isLoading={isSaving} savingChild={"Speichert"}
                        defaultChild={"Änderungen speichern"}
                    />

                    <Button disabled={isSaving} variant={"danger"}
                            className={"deleteButton"}
                            onClick={showDeleteModalCallback}>
                        <FAE icon={faTrash}/> &nbsp; Benutzer löschen
                    </Button>
                </ButtonPanel>
            )}

            <ConfirmDeletionModal show={showDeleteModal}
                                  hideCallback={hideDeleteModalCallback}
                                  deleteCallback={deleteCallback}/>
        </Form>
    );

}
