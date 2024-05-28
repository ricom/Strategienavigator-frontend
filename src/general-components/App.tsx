import {SettingsContextComponent} from "./Contexts/SettingsContextComponent";
import {DarkModeChanger} from "./Darkmode/Darkmode";
import React, {useEffect} from "react";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import {ProtectedRoute} from "./ProtectedRoute";
import {Home} from "../components/platform/home/Home";
import {Imprint} from "../components/platform/imprint/Imprint";
import {DataPrivacy} from "../components/platform/data-privacy/DataPrivacy";
import {AboutUs} from "../components/platform/abous-us/AboutUs";
import {Login} from "../components/platform/login/Login";
import {Logout} from "../components/platform/logout/Logout";
import {Register} from "../components/platform/register/Register";
import {Settings} from "../components/platform/settings/Settings";
import {MyProfile} from "../components/platform/my-profile/MyProfile";
import {ContributionDecision} from "../components/platform/sharing/Contribution/ContributionDecision";
import {InvitationDecision} from "../components/platform/sharing/Invitation/InvitationDecision";
import {EmailVerification} from "../components/platform/verifications/EMail/EmailVerification";
import {PasswordReset} from "../components/platform/verifications/PasswordReset/PasswordReset";
import {PairwiseComparison} from "../components/tools/pairwise-comparison/PairwiseComparison";
import {SWOTAnalysis} from "../components/tools/swot-analysis/SWOTAnalysis";
import {PersonaAnalysis} from "../components/tools/persona-analysis/PersonaAnalysis";
import {PortfolioAnalysis} from "../components/tools/portfolio-analysis/PortfolioAnalysis";
import {UtilityAnalysis} from "../components/tools/utility-analysis/UtilityAnalysis";
import process from "process";
import {TestAnalysis} from "../components/tools/test-analysis/TestAnalysis";
import {ErrorPages} from "./Error/ErrorPages/ErrorPages";
import {Footer} from "../components/platform/footer/Footer";
import {ControlFooter} from "./ControlFooter/ControlFooter";
import {GlobalContexts} from "./Contexts/GlobalContexts";
import {Loader} from "./Loader/Loader";
import {Nav} from "../components/platform/nav/Nav";
import {Container} from "react-bootstrap";
import {LegacyErrorPageAdapter} from "./LegacyErrorPageAdapter";
import {Messages} from "./Messages/Messages";
import {PasswordResetRequest} from "../components/platform/verifications/PasswordResetRequest/PasswordResetRequest";
import {Tool} from "./Tool/Tool";


export function App() {


    useEffect(function () {
        // Add SettingsChangeListener for Darkmode
        SettingsContextComponent.addSettingsChangeListener(DarkModeChanger);

        return () => {
            SettingsContextComponent.removeSettingsChangeListener(DarkModeChanger);
        }
    }, []);

    function getRouterSwitch() {
        return (
            <Switch>
                <Route path={"/"} exact><Home/></Route>
                <Route path={"/legal-notice"} exact><Imprint/></Route>
                <Route path={"/data-privacy"} exact><DataPrivacy/></Route>
                <Route path={"/about-us"} exact><AboutUs/></Route>
                <Route path={"/login"} exact>
                    <ProtectedRoute loggedIn={false}>
                        <Login/>
                    </ProtectedRoute>
                </Route>
                <Route path={"/logout"} exact>
                    <ProtectedRoute loggedIn={undefined}>
                        <Logout/>
                    </ProtectedRoute>
                </Route>
                <Route path={"/register"} exact>
                    <ProtectedRoute loggedIn={false}>
                        <Register/>
                    </ProtectedRoute>
                </Route>
                <Route path={"/settings"} exact>
                    <ProtectedRoute loggedIn={true}>
                        <Settings/>
                    </ProtectedRoute>
                </Route>
                <Route path={"/my-profile"} exact>
                    <ProtectedRoute loggedIn={true} anonymous={false}>
                        <MyProfile/>
                    </ProtectedRoute>
                </Route>
                <Route path={"/invite/:sharedSaveID"}>
                    <ProtectedRoute loggedIn={true}>
                        <ContributionDecision/>
                    </ProtectedRoute>
                </Route>
                <Route path={"/invitation/:token"}>
                    <ProtectedRoute loggedIn={true}>
                        <InvitationDecision/>
                    </ProtectedRoute>
                </Route>

                <Route path={"/verify-email/:token"}><EmailVerification/></Route>
                <Route path={"/reset-password/:token"}><PasswordReset/></Route>
                <Route path={"/reset-password"} exact><PasswordResetRequest/></Route>

                <Route path={"/pairwise-comparison"}>
                    <ProtectedRoute loginAnonymous={true} loggedIn={true}>
                        <Tool tool={new PairwiseComparison()}/>
                    </ProtectedRoute>
                </Route>
                <Route path={"/swot-analysis"}>
                    <ProtectedRoute loginAnonymous={true} loggedIn={true}>
                        <Tool tool={new SWOTAnalysis()}/>
                    </ProtectedRoute>
                </Route>
                <Route path={"/persona-analysis"}>
                    <ProtectedRoute loginAnonymous={true} loggedIn={true}>
                        <Tool tool={new PersonaAnalysis()}/>
                    </ProtectedRoute>
                </Route>
                <Route path={"/portfolio-analysis"}>
                    <ProtectedRoute loginAnonymous={true} loggedIn={true}>
                        <Tool tool={new PortfolioAnalysis()}/>
                    </ProtectedRoute>
                </Route>
                <Route path={"/utility-analysis"}>
                    <ProtectedRoute loginAnonymous={true} loggedIn={true}>
                        <Tool tool={new UtilityAnalysis()}/>
                    </ProtectedRoute>
                </Route>

                {/* DEV  */(process.env.NODE_ENV === "development") && (
                    <Route path={"/test-analysis"}>
                        <ProtectedRoute loginAnonymous={true} loggedIn={true}>
                            <Tool tool={new TestAnalysis()}/>
                        </ProtectedRoute>
                    </Route>
                )}

                <Route path={"/error/:code"}><ErrorPages/></Route>
                <Route><ErrorPages/></Route>

            </Switch>
        );
    }

    function getAppFooter() {
        return (
            <>
                <Footer/>
                <ControlFooter places={4}/>
            </>
        );
    }

    function getAppContent() {
        return (
            <>
                <Messages xAlignment={"CENTER"} yAlignment={"BOTTOM"} style={{marginBottom: 65}}>
                    <GlobalContexts key={"global-contexts"}>
                        <Loader key={"loader"} animate fullscreen loaded={true} variant={"style"}>
                            <BrowserRouter>
                                <LegacyErrorPageAdapter/>
                                <Nav/>

                                <div id={"content"}>
                                    <Container fluid={false}>
                                        {getRouterSwitch()}
                                    </Container>
                                </div>

                                {getAppFooter()}

                            </BrowserRouter>
                        </Loader>
                    </GlobalContexts>
                </Messages>
            </>
        );
    }

    return getAppContent();

}
