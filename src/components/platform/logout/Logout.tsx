import React, {useEffect} from "react";
import {Loader} from "../../../general-components/Loader/Loader";

import "./logout.scss";
import {useUserContext} from "../../../general-components/Contexts/UserContextComponent";
import {useNavigate} from "react-router-dom";


export function Logout() {

    const {isLoggedIn} = useUserContext();
    const navigate = useNavigate()
    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/");
        }
    }, [isLoggedIn, navigate]);

    return (
        <Loader loaded={false} transparent size={120}/>
    );
}
