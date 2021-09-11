import React from 'react';
import ReactDOM from 'react-dom';
import Nav from "./components/platform/nav/Nav";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.scss';

import {Imprint} from "./components/platform/imprint/Imprint";
import {DataPrivacy} from "./components/platform/data-privacy/DataPrivacy";
import {Home} from "./components/platform/home/Home";
import {Login} from "./components/platform/login/Login";
import {Logout} from "./components/platform/logout/Logout";
import {Register} from "./components/platform/register/Register";
import {Settings} from "./components/platform/settings/Settings";
import {MyProfile} from "./components/platform/my-profile/MyProfile";
import {Session} from "./general-components/Session/Session";
import {Container} from "react-bootstrap";
import {Loader} from "./general-components/Loader/Loader";
import {Messages} from "./general-components/Messages/Messages";
import {isDesktop} from "./general-components/Desktop";
import Footer from "./components/platform/footer/Footer";
import {AboutUs} from "./components/platform/abous-us/AboutUs";
import {ControlFooter} from "./general-components/ControlFooter/ControlFooter";
import {EmailVerification} from "./components/platform/verifications/EMail/EmailVerification";
import {PasswordReset} from "./components/platform/verifications/PasswordReset/PasswordReset";
import {SWOTAnalysis} from "./components/tools/swot-analysis/SWOTAnalysis";
import {ABCAnalysis} from "./components/tools/abc-analysis/ABCAnalysis";
import {PairwiseComparison} from "./components/tools/pairwise-comparison/PairwiseComparison";
import {PortfolioAnalysis} from "./components/tools/portfolio-analysis/PortfolioAnalysis";
import {UtilityAnalysis} from "./components/tools/utility-analysis/UtilityAnalysis";


const reload_app = () => {
    ReactDOM.render(
        <React.StrictMode>

            <Messages
                xAlignment={"CENTER"}
                yAlignment={"BOTTOM"}
                style={{marginBottom: 65}}
            />

            <Loader animate fullscreen variant={"dark"} payload={[Session.checkLogin]}>
                <Router>
                    <Nav/>

                    <div id={"content"}>
                        <Container fluid={false}>
                            <Switch>
                                <Route path={"/"} exact component={Home}/>
                                <Route path={"/legal-notice"} exact component={Imprint}/>
                                <Route path={"/data-privacy"} exact component={DataPrivacy}/>
                                <Route path={"/about-us"} exact component={AboutUs}/>
                                <Route path={"/login"} exact component={Login}/>
                                <Route path={"/logout"} exact component={Logout}/>
                                <Route path={"/register"} exact component={Register}/>
                                <Route path={"/settings"} exact component={Settings}/>
                                <Route path={"/my-profile"} exact component={MyProfile}/>

                                <Route path={"/verify-email/:token"} component={EmailVerification}/>
                                <Route path={"/reset-password/:token"} component={PasswordReset}/>
                                <Route path={"/reset-password"} exact component={PasswordReset}/>

                                <Route path={"/pairwise-comparison"} component={PairwiseComparison}/>
                                <Route path={"/abc-analysis"} component={ABCAnalysis}/>
                                <Route path={"/swot-analysis"} component={SWOTAnalysis}/>
                                <Route path={"/portfolio-analysis"} component={PortfolioAnalysis}/>
                                <Route path={"/utility-analysis"} component={UtilityAnalysis}/>

                                <Route path={"/"} component={Home}/>
                            </Switch>
                        </Container>
                    </div>
                    {isDesktop() ? <Footer/> : <ControlFooter places={3}/>}
                </Router>
            </Loader>
        </React.StrictMode>,
        document.getElementById('root')
    );
}

reload_app();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(console.log);

export {
    reload_app
};
