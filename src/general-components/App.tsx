import {SettingsContextComponent} from "./Contexts/SettingsContextComponent";
import {DarkModeChanger} from "./Darkmode/Darkmode";
import React, {useEffect} from "react";
import {createBrowserRouter, Outlet, RouterProvider} from "react-router-dom";
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
import {ToolData} from "./Tool/Data/ToolData";

const TOOLS: Array<ToolData<any>> = [
    new PairwiseComparison(),
    new SWOTAnalysis(),
    new PersonaAnalysis(),
    new PortfolioAnalysis(),
    new UtilityAnalysis()
];

const ROUTES_ARRAY = [
    {
        path: "/",
        element: <Home/>
    }, {
        path: "/legal-notice",
        element: <Imprint/>
    },
    {
        path: "/data-privacy",
        element: <DataPrivacy/>
    },
    {
        path: "/about-us",
        element: <AboutUs/>
    }, {
        path: "/verify-email/:token",
        element: <EmailVerification/>
    },
    {
        path: "/reset-password/:token",
        element: <PasswordReset/>
    },
    {
        path: "/reset-password",
        element: <PasswordResetRequest/>
    }, {
        path: "/error/:code",
        element: <ErrorPages/>
    },
    {
        path: "*",
        element: <ErrorPages/>
    }, {
        path: "/login",
        element: <ProtectedRoute loggedIn={false}> <Login/> </ProtectedRoute>
    },
    {
        path: "/logout",
        element: <Logout/>
    },
    {
        path: "/register",
        element: <ProtectedRoute loggedIn={false}> <Register/> </ProtectedRoute>
    },
    {
        path: "/settings",
        element: <ProtectedRoute loggedIn={true}> <Settings/> </ProtectedRoute>
    },
    {
        path: "/my-profile",
        element: <ProtectedRoute loggedIn={true} anonymous={false}> <MyProfile/> </ProtectedRoute>
    },
    {
        path: "/invite/:sharedSaveID",
        element: <ProtectedRoute loggedIn={true}> <ContributionDecision/> </ProtectedRoute>
    },
    {
        path: "/invitation/:token",
        element: <ProtectedRoute loggedIn={true}> <InvitationDecision/> </ProtectedRoute>
    },
]
/* DEV  */
if (process.env.NODE_ENV === "development") {
    TOOLS.push(new TestAnalysis());
}

TOOLS.forEach(tool => ROUTES_ARRAY.push({
    path: tool.getLink() + "/*",
    element: <ProtectedRoute loginAnonymous={true} loggedIn={true}> <Tool tool={tool}/> </ProtectedRoute>
}));


const ROUTE_DATA = createBrowserRouter([{
    path: "/",
    element: <BasicLayout/>,
    children: ROUTES_ARRAY
}]);

function BasicLayout() {
    return (<>
        <LegacyErrorPageAdapter/>
        <Nav/>

        <div id={"content"}>
            <Container fluid={false}>
                <Outlet/>
            </Container>
        </div>

        <Footer/>
        <ControlFooter places={4}/>
    </>);
}


export function App() {


    useEffect(function () {
        // Add SettingsChangeListener for Darkmode
        SettingsContextComponent.addSettingsChangeListener(DarkModeChanger);

        return () => {
            SettingsContextComponent.removeSettingsChangeListener(DarkModeChanger);
        }
    }, []);

    return (
        <Messages xAlignment={"CENTER"} yAlignment={"BOTTOM"} style={{marginBottom: 65}}>
            <GlobalContexts key={"global-contexts"}>
                <Loader key={"loader"} animate fullscreen loaded={true} variant={"style"}>
                    <RouterProvider router={ROUTE_DATA}/>
                </Loader>
            </GlobalContexts>
        </Messages>
    );

}
