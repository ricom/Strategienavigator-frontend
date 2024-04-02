import {SettingsContextComponent} from "./Contexts/SettingsContextComponent";
import {DarkModeChanger} from "./Darkmode/Darkmode";
import React, {useEffect} from "react";
import {BrowserRouter, Switch} from "react-router-dom";
import {ProtectedRoute as Route} from "./ProtectedRoute";
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
                <Route loggedIn={false} path={"/login"} exact><Login/></Route>
                <Route loggedIn={undefined} path={"/logout"} exact><Logout/></Route>
                <Route loggedIn={false} path={"/register"} exact><Register/></Route>
                <Route loggedIn={true} path={"/settings"} exact><Settings/></Route>
                <Route loggedIn={true} anonymous={false} path={"/my-profile"} exact><MyProfile/></Route>

                <Route loggedIn={true} path={"/invite/:sharedSaveID"}><ContributionDecision/></Route>
                <Route loggedIn={true} path={"/invitation/:token"}><InvitationDecision/></Route>

                <Route path={"/verify-email/:token"}><EmailVerification/></Route>
                (//TODO remove all usages of component and render props. (Only use children))
                <Route path={"/reset-password/:token"} component={PasswordReset}/>
                <Route path={"/reset-password"} exact component={PasswordReset}/>

                <Route loginAnonymous={true} loggedIn={true} path={"/pairwise-comparison"}
                       component={PairwiseComparison}/>
                <Route loginAnonymous={true} loggedIn={true} path={"/swot-analysis"} component={SWOTAnalysis}/>
                <Route loginAnonymous={true} loggedIn={true} path={"/persona-analysis"} component={PersonaAnalysis}/>
                <Route loginAnonymous={true} loggedIn={true} path={"/portfolio-analysis"}
                       component={PortfolioAnalysis}/>
                <Route loginAnonymous={true} loggedIn={true} path={"/utility-analysis"} component={UtilityAnalysis}/>

                {/* DEV  */(process.env.NODE_ENV === "development") && (
                    <Route loginAnonymous={true} loggedIn={true} path={"/test-analysis"} component={TestAnalysis}/>
                )}

                <Route path={"/error/:code"} component={ErrorPages}/>

                <Route render={(props) => {
                    let match = Object.assign(
                        props.match, {
                            params: {
                                code: String(404)
                            }
                        }
                    );
                    return <ErrorPages
                        history={props.history}
                        location={props.location}
                        match={match}
                    />;
                }}/>
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
