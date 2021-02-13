import {useState} from 'react';
import {useHashLocation} from "./hashRouteHook";
import {Link, Router} from "wouter";
import {appRoutes} from "./routes";
import {appActionType, appStatus} from "./appActions";
import * as React from "react";


export const NavBar = ({routes}) => {
    const [location, setLocation] = useHashLocation();

    const activeLinkProps = {
        "aria-current": "page",
    };

    function renderedRoutes() {
        return (
            routes.map(route =>
                <Link href={route.path} key={route.id}>
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