import {useState} from 'react';
import {useHashLocation} from "./hashRouteHook";
import {Link, Router} from "wouter";
import {appRoutes} from "./routes";
import {appActionType, appStatus} from "./appActions";
import * as React from "react";


export const NavBar = ({routes, appDispatch}) => {
    const [activeElem, setActiveElem] = useState("");
    const [location, setLocation] = useHashLocation();

    const activeLinkProps = {
        "aria-current": "page",
    };

    function renderedRoutes() {
        return (
            routes.map(route =>
                <Link href={route.path}>
                    <a id={route.id} {...(route.path === location ? activeLinkProps : {})}
                       rel="noreferrer noopener">{route.displayName}</a>
                </Link>
            )
        );
    }
    return (
        <>
            <nav>
        {renderedRoutes()}
            </nav>
        </>
    )
}

{/**
 <Link href={route.path} onClick={() => appDispatch({type: routes.UIStateChange})}>
 <a id={route.name} {...(route.path === location ? activeLinkProps : {})} rel="noreferrer noopener">{route.name}</a>
 </Link>
 */
}
