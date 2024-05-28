import {ReactElement} from "react";
import {useHistory, useParams} from "react-router";
import {Forbidden} from "./forbidden/Fordidden";

import "./error-pages.scss";
import {Link} from "react-router-dom";
import {NotFound} from "./not-found/NotFound";
import {APINotReachable} from "./api-not-reachable/APINotReachable";
import {Button} from "react-bootstrap";
import {faHome, faRedo} from "@fortawesome/free-solid-svg-icons/";
import {ErrorPage} from "./errorpage/ErrorPage";
import FAE from "../../Icons/FAE";


export type ErrorComponentTypes =
    ReactElement<Forbidden>
    | ReactElement<NotFound>
    | ReactElement<ErrorPage>
    | ReactElement<APINotReachable>;

function getErrorComponent(code:number): ErrorComponentTypes | undefined {
    if (code === 500) {
        return <APINotReachable/>;
    } else if (code === 404) {
        return <NotFound/>;
    } else if (code === 403) {
        return <Forbidden/>;
    }
    code = 404;
    return <NotFound/>;
}

export function ErrorPages() {
    let {codeString} = useParams() as { codeString: string|undefined };
    let code;
    if(codeString === undefined){
        code = 404;
    }else{
        code = parseInt(codeString);
    }

    const history = useHistory();

    let component = getErrorComponent(code);

    return (
        <div className={"errorpage"}>
            <h1 className={"header"}>Fehler <b>{code}</b></h1>

            <div className={"error"}>
                {component}
            </div>

            {(code === 500) && (
                <Button className="button" style={{marginRight: "0.75rem"}} onClick={history.goBack}
                        variant={"dark"}>
                    Erneut versuchen &nbsp;
                    <FAE icon={faRedo}/>
                </Button>
            )}

            <Link to="/">
                <Button className="button" variant={"dark"}>
                    Startseite &nbsp;
                    <FAE icon={faHome}/>
                </Button>
            </Link>
        </div>
    );

}
