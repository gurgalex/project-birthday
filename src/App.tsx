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
    const initialAppState: appState = {settings: {birthDay: null}, status: appStatus.LOADING, warnStorage: false};
    const [state, appDispatch] = useReducer(appReducer, initialAppState);

    // load data
    useEffect(() => {
        getDateFromStorage().then(settings => {
            console.debug("got birthDay setting from idb");
            console.debug(settings);
            appDispatch({type: appActionType.SAVE, payload: {settings: settings}});
        }).catch(err => {
            console.error(`Unhandled error when setting key with indexedDB: ${err.name}`);
            // toggle warning state (to render warning bar)
            // Keep default state with no data
            appDispatch({type: appActionType.EnableStorageFailureWarning});
            appDispatch({type: appActionType.HOME, payload: initialAppState.settings});
            throw err;
        });
    }, []);

    const [location, setLocation] = useHashLocation();
    useEffect(() => {
        console.log(`status changed: ${state.status}, current route - ${location}`);

        switch(location) {
            case appRoutes.SETTINGS:
                appDispatch({type: appActionType.SWITCH_TO_SETTINGS});
                break;
            case appRoutes.HOME:
                appDispatch({type: appActionType.SWITCH_TO_HOME});
                break;
        }

        console.log(`new status: ${state.status} - current route - ${location}`);

    },[state.status]);

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
                            const settings = state.settings;
                            return (
                                <Home settings={settings} dispatch={appDispatch} debug={state}/>
                            );
                        }
                        }
                    </Route>

                    <Route>404, Page Not Found!</Route>
                </Switch> </Router>
        </>
    );
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