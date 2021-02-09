import {get} from "idb-keyval";
import * as React from "react";
import {useEffect, useReducer} from "react";
import {Link, Route, Router, Switch} from "wouter";
import {useHashLocation} from "./hashRouteHook";
import {Settings} from "./Settings";
import {Home} from "./Home";

const App = () => {
    const initialAppState: appState = {settings: {birthDay: null}, status: appStatus.LOADING, warnStorage: false};
    const [state, appDispatch] = useReducer(appReducer, initialAppState);

    // load data
    useEffect(() => {
        getDateFromStorage().then(settings => {
            console.debug("got settings from idb");
            console.debug(settings);
            appDispatch({type: appActionType.HOME, payload: {settings: settings}});
        }).catch(err => {
            console.error(`Unhandled error when setting key with indexedDB: ${err.name}`);
            // toggle warning state (to render warning bar)
            // Keep default state with no data
            appDispatch({type: 'enableStorageFailureWarning'});
            appDispatch({type: 'Home', payload: initialAppState.settings});
            throw err;
        });
    }, []);

    // render
    console.debug("app state");
    console.debug(state);
    if (state.status === appStatus.LOADING) {
        console.debug("app in loading state");
        return null;
    }


    return (
        <>
            <Router hook={useHashLocation}>
                <nav>
                    <Link href="/" onClick={() => appDispatch({type: appActionType.SWITCH_TO_HOME})}>
                        <a id="home-link" rel="noreferrer noopener">Home</a>
                    </Link>
                    <Link href="/settings" onClick={() => appDispatch({type: appActionType.SETTINGS})}>
                        <a id="settings-link" rel="noreferrer noopener">Settings</a>
                    </Link>
                </nav>

                {state.warnStorage && warningStorageContent}

                <Switch>
                    <Route path="/settings">
                        {() => {
                            return (
                                <>
                                    <Settings settings={state.settings} dispatch={appDispatch}/>
                                </>)
                        }
                        }
                    </Route>

                    <Route path="/">
                        {() => {
                            const settings = state.settings;
                            return (
                                <Home settings={settings}/>
                            );
                        }
                        }
                    </Route>

                    <Route>404, Page Not Found!</Route>
                </Switch> </Router>
        </>
    );
}

function appReducer(state, action: appAction) {
    switch (action.type) {
        case appActionType.SAVE:
            console.debug("request to save new birthDay");
            let newDay = action.payload.birthDay;
            console.debug(newDay);
            console.debug(state);
            return {...state, settings: {birthDay: newDay}, status: appStatus.SETTINGS};
        case appActionType.HOME:
            console.debug("Switch to Home page");
            return {...state, status: appStatus.HOME, settings: action.payload.settings};
        case appActionType.SETTINGS:
            console.debug("Switch to Settings page");
            return {...state, status: appStatus.SETTINGS};
        case appActionType.EnableStorageFailureWarning:
            console.warn("Writing or reading failed");
            return {...state, warnStorage: true};
        case appActionType.SWITCH_TO_HOME:
            return {...state, status: appStatus.HOME};

        default:
            console.error("unhandled app action");
            console.error(state);
            console.error(action);
    }
}

export interface appState {
    settings: { birthDay: Date | null }
    status: appStatus
    warnStorage: boolean
}

export const enum appStatus {
    LOADING = "Loading",
    HOME = "Home",
    SETTINGS = "Settings",
}

export interface appAction {
    type: appActionType,
    payload: any,
}

export const enum appActionType {
    HOME,
    SAVE,
    EnableStorageFailureWarning,
    SETTINGS,
    SWITCH_TO_HOME,
}


function getDateFromStorage(): Promise<Date | undefined> {
    return get('date-iso').then((day: Date) => {
        console.debug(`Got day from idb init: ${day}`);
        return {birthDay: day};
    }).catch(err => {
        console.warning("Failed to get date from local storage");
    });

}

const warningStyle = {
    backgroundColor: "#9c2b2e",
    color: "white",
}

export interface appProps {
    settings: { birthDay: Date },
}

const warningStorageContent = <>
    <section id="warning" style={warningStyle}><h2>Warning: Not enough space on your device</h2> <p><b>App will operate
        in read only mode.</b></p></section>
</>
export default App;