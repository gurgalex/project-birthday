import {get} from "idb-keyval";
import * as React from "react";
import {useEffect, useReducer} from "react";
import {Route, Router, Switch} from "wouter";
import {useHashLocation} from "./hashRouteHook";
import {Settings} from "./Settings";
import {Home} from "./Home";
import {appActionType, appReducer, appState, appStatus} from "./appActions";
import {appRoutes, navRoutes} from "./routes";
import {NavBar} from './NavBar';

const App = () => {
    const initialAppState: appState = {
        settings: {birthDay: null},
        hasBeenNotified: false,
        isLoaded: false,
        warnStorage: false,
    };
    const [state, appDispatch] = useReducer(appReducer, initialAppState);

    // load data
    useEffect(() => {
        // Todo: Fetch all app state from IDB
        getAllStateFromStorage().then(data => {
            console.debug("got reminder app state from idb", data);
            appDispatch({type: appActionType.SAVE, payload: data});

        }).catch(err => {
            console.error(`Unhandled error when setting key with indexedDB: ${err.name}`);
            // toggle warning state (to render warning bar)
            // Keep default state with no data
            appDispatch({type: appActionType.ENABLE_STORAGE_FAILURE_WARNING});
            appDispatch({type: appActionType.SAVE, payload: initialAppState});
            throw err;
        }).then(() => {
            appDispatch({type: appActionType.DONE_LOADING})
        })
    }, []);

    // render
    console.debug("app state\n", state);
    if (state.isLoaded === false) {
        console.debug("app in loading state");
        return null;
    }

    return (
        <>
            <Router hook={useHashLocation}>
                <NavBar routes={navRoutes} appDispatch={appDispatch}/>

                {state.warnStorage && warningStorageContent}

                <Switch>
                    <Route path={appRoutes.SETTINGS}>
                        {() => {
                            return (
                                <>
                                    <Settings settings={state.settings} dispatch={appDispatch} debug={state}/>
                                </>)
                        }
                        }
                    </Route>

                    <Route path={appRoutes.HOME}>
                        {() => {
                            return (
                                <Home settings={state.settings} hasBeenNotified={state.hasBeenNotified} dispatch={appDispatch} debug={state}/>
                            );
                        }
                        }
                    </Route>

                    <Route>404, Page Not Found!</Route>
                </Switch> </Router>
        </>
    );
}


async function getAllStateFromStorage(): Promise<Partial<appState> | undefined> {
    let data: Partial<appState> = {
        settings: {birthDay: null},
    };

    try {
        data.settings.birthDay = await get('date-iso');
        data.hasBeenNotified = await get("notify");
        return data
    }
    catch (err) {
        console.error("Failed to get date from offline storage", JSON.stringify(err));
        throw err;
    }
}

const warningStyle = {
    backgroundColor: "#9c2b2e",
    color: "white",
}

export interface appProps {
    settings: { birthDay: Date },
    hasBeenNotified: boolean,
}

const warningStorageContent = <>
    <section id="warning" style={warningStyle}><h2>Warning: Not enough space on your device</h2> <p><b>App will operate
        in read only mode.</b></p></section>
</>
export default App;