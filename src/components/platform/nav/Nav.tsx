import React, {ChangeEvent, useCallback, useEffect, useState} from "react";
import {Badge, Card, Container, Dropdown, FormControl, Nav as BootstrapNav, Navbar, NavDropdown} from "react-bootstrap";
import {NavLink} from "react-router-dom";
import {
    faBalanceScale,
    faCog,
    faExchangeAlt,
    faHome,
    faShieldAlt,
    faSignInAlt,
    faSignOutAlt,
    faUser,
    faUserPlus
} from "@fortawesome/free-solid-svg-icons/";
import {faInfoCircle} from "@fortawesome/free-solid-svg-icons";

import "./nav.scss";
import {getSaves} from "../../../general-components/API/calls/Saves";
import {SimpleSaveResource} from "../../../general-components/Datastructures";
import {Loader} from "../../../general-components/Loader/Loader";
import {useHistory} from "react-router";
import FAE from "../../../general-components/Icons/FAE";
import {useUserContext} from "../../../general-components/Contexts/UserContextComponent";
import {AnonportModal} from "./AnonportModal";
import {DesktopContext} from "../../../general-components/Contexts/DesktopContext";
import {Session} from "../../../general-components/Session/Session";
import {Messages, useMessageContext} from "../../../general-components/Messages/Messages";
import {useBooleanState} from "../../../general-components/Utility/Hooks";

// Could be useful later.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function removeDuplicateSaves(saves: SimpleSaveResource[]): SimpleSaveResource[] {
    let newSaves = [];
    let ids = new Map<number, null>();

    for (const save of saves) {
        if (!ids.has(save.id)) {
            newSaves.push(save);
        }

        ids.set(save.id, null);
    }

    return newSaves;
}

function getToolLink(toolID: number, saveID: number) {
    if (toolID === 1) {
        return "/utility-analysis/" + saveID;
    } else if (toolID === 2) {
        return "/swot-analysis/" + saveID;
    } else if (toolID === 3) {
        return "/pairwise-comparison/" + saveID;
    } else if (toolID === 4) {
        return "/portfolio-analysis/" + saveID;
    } else if (toolID === 6) {
        return "/persona-analysis/" + saveID;
    }
    return "/";
}

function getToolName(toolID: number) {
    if (toolID === 1) {
        return "Nutzwertanalyse";
    } else if (toolID === 2) {
        return "SWOT Analyse";
    } else if (toolID === 3) {
        return "Paarweiser Vergleich";
    } else if (toolID === 4) {
        return "Portfolio Analyse";
    } else if (toolID === 6) {
        return "Persona Analyse";
    }
}

export function Nav() {
    // State
    const {
        state: expanded,
        setFalse: shrinkCallback,
        toggle: toggleExpanded
    } = useBooleanState(false);
    const [showSearchOutput, setShowSearchOutput] = useState(false);
    const [searchResult, setSearchResult] = useState<SimpleSaveResource[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const {
        state: anonPortModalShow,
        setTrue: showAnonPortModalCallback,
        setFalse: hideAnonPortModalCallback
    } = useBooleanState(false);
    const [searchPrompt, setSearchPrompt] = useState("");

    // Context

    const {user, isLoggedIn} = useUserContext();
    const {add: showMessage} = useMessageContext();
    const history = useHistory();

    const searchPromptChanged = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        let value = e.target.value;
        setSearchPrompt(value);

        if (value === "") {
            setShowSearchOutput(false);
        } else {
            setShowSearchOutput(true);
        }
    }, [setSearchPrompt]);

    useEffect(() => {
        if (!user || searchPrompt === "") {
            return;
        }
        let canceled = false;
        const timeout = setTimeout(() => {
            setSearchLoading(true);
            setSearchResult([]);

            getSaves(user?.getID() as number, {
                name: searchPrompt,
                description: searchPrompt,
                searchBoth: false
            }).then((searchCall) => {
                if (canceled) {
                    return;
                }
                if (searchCall && searchCall.success) {
                    let searchCallData = searchCall.callData;
                    setSearchResult(searchCallData?.data);
                }
                setSearchLoading(false);
            }, () => {
                setSearchLoading(false);
            });
        }, 400);
        return () => {
            canceled = true;
            clearTimeout(timeout);
        }
    }, [searchPrompt, user, setSearchResult, setSearchLoading]);

    const onLogout = useCallback(() => {
        Session.logout().then(() => {
                showMessage("Bis bald!", "SUCCESS", Messages.TIMER);
            },
            (reason) => {
                console.error(reason);
                showMessage("Beim Logout is ein Fehler aufgetreten.", "DANGER");
            });
        history.push("/logout");
    }, [showMessage, history]);


    return (
        <>
            <Navbar onToggle={toggleExpanded} expanded={expanded} expand="lg">
                <Container>
                    <Navbar.Brand onClick={shrinkCallback} as={NavLink} to={"/"} end className={"nav-link"}>

                        <FAE icon={faHome}/>&nbsp;
                        {process.env.REACT_APP_NAME}
                    </Navbar.Brand>

                    <Navbar.Toggle/>

                    <Navbar.Collapse>
                        <BootstrapNav className="m-auto">
                            {(isLoggedIn) && (
                                <div className={"searchContainer"}>
                                    <FormControl
                                        type={"search"}
                                        title={"Nach Analysen suchen"}
                                        placeholder={"Nach Analysen suchen..."}
                                        value={searchPrompt}
                                        onFocus={(e) => {
                                            if (e.target.value !== "") {
                                                setShowSearchOutput(true);
                                            }
                                        }}
                                        onBlur={() => {
                                            setShowSearchOutput(false);
                                        }}
                                        onChange={searchPromptChanged}
                                    />

                                    <div
                                        className={"searchOutputContainer " + (showSearchOutput ? "show" : "")}>
                                        <div className={"header"}>
                                            <Badge pill bg={"dark"}>
                                                <Loader variant={"light"}
                                                        loaded={!searchLoading}
                                                        transparent
                                                        size={10}>
                                                    {searchResult.length}
                                                </Loader>
                                            </Badge>&nbsp;
                                            Ergebnisse
                                        </div>
                                        <div className={"output"}>
                                            <Loader variant={"style"}
                                                    loaded={!searchLoading}
                                                    transparent
                                                    size={100} alignment={"center"}>
                                                {searchResult.map((value) => {
                                                    let link = getToolLink(value.tool_id, value.id);
                                                    return (
                                                        <Card as={NavLink}
                                                              title={(value.description !== null) ? "Beschreibung: " + value.description : ""}
                                                              to={link}
                                                              key={"SAVE" + value.id}
                                                              body
                                                              className={"result"}>

                                                            {value.name} | {getToolName(value.tool_id)}
                                                        </Card>
                                                    )
                                                })}
                                                {searchResult.length === 0 && (
                                                    <Card body className={"result none"}>
                                                        Keine Ergebnisse
                                                    </Card>
                                                )}
                                            </Loader>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </BootstrapNav>
                        <BootstrapNav>
                            {(!isLoggedIn) && (
                                <>
                                    <NavLink onClick={shrinkCallback} to={"/login"} className={"nav-link"}>
                                        <FAE icon={faSignInAlt}/>&nbsp;
                                        Anmelden
                                    </NavLink>
                                    <NavLink onClick={shrinkCallback} to={"/register"} className={"nav-link"}>
                                        <FAE icon={faUserPlus}/>&nbsp;
                                        Registrieren
                                    </NavLink>
                                </>
                            )}
                            {(isLoggedIn) && (
                                <NavDropdown id={"profile-dropdown"} title={<><FAE
                                    icon={faUser}/> &nbsp;{!user?.isAnonymous() ? user?.getUsername() : ""}</>}>

                                    {!user?.isAnonymous() && (
                                        <Dropdown.Item as={NavLink} onClick={shrinkCallback} to={"/my-profile"}
                                                       role={"button"}>
                                            <FAE icon={faUser}/>&nbsp;
                                            Mein Profil
                                        </Dropdown.Item>
                                    )}

                                    {(user?.isAnonymous()) && (
                                        <Dropdown.Item as={"div"} onClick={showAnonPortModalCallback}
                                                       role={"button"}>
                                            <FAE icon={faExchangeAlt}/>&nbsp;
                                            Anonymes Konto Portieren
                                        </Dropdown.Item>
                                    )}

                                    <Dropdown.Item as={"div"} role={"button"} onClick={onLogout}>
                                        <FAE icon={faSignOutAlt}/>&nbsp;
                                        Abmelden
                                    </ Dropdown.Item>

                                </NavDropdown>
                            )}
                        </BootstrapNav>
                        <DesktopContext.Consumer children={isDesktop => {
                            if (!isDesktop) {
                                return (
                                    <BootstrapNav>
                                        <NavDropdown id={"profile-dropdown"} title={"mehr"}>
                                            <Dropdown.Item as={NavLink} onClick={shrinkCallback} to={"/settings"}
                                                           role={"button"}>
                                                <FAE icon={faCog}/>&nbsp;
                                                Einstellungen
                                            </Dropdown.Item>
                                            <Dropdown.Item as={NavLink} onClick={shrinkCallback}
                                                           to={"/data-privacy"}
                                                           role={"button"}>
                                                <FAE icon={faShieldAlt}/>&nbsp;
                                                Datenschutz
                                            </Dropdown.Item>
                                            <Dropdown.Item as={NavLink} onClick={shrinkCallback}
                                                           to={"/legal-notice"}
                                                           role={"button"}>
                                                <FAE icon={faBalanceScale}/>&nbsp;
                                                Impressum
                                            </Dropdown.Item>
                                            <Dropdown.Item as={NavLink} onClick={shrinkCallback} to={"/about-us"}
                                                           role={"button"}>
                                                <FAE icon={faInfoCircle}/>&nbsp;
                                                Über uns
                                            </Dropdown.Item>
                                        </NavDropdown>
                                    </BootstrapNav>
                                );
                            }
                            return null;
                        }}/>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <AnonportModal show={anonPortModalShow} onClose={hideAnonPortModalCallback}/>
        </>
    );

}

