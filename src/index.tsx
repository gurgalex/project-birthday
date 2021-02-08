import * as React from 'react';
import ReactDOM from "react-dom";

import {get, set} from 'idb-keyval';
import {useEffect, useReducer, useState} from "react";

import {Link, Route, Router, Switch} from "wouter";

const enum appStatus {
    LOADING = "Loading",
    HOME = "Home",
    SETTINGS = "Settings",
}

interface appState {
    settings: { birthDay: Date | null }
    status: appStatus
    warnStorage: boolean
}

const enum appActionType {
    HOME,
    SAVE,
    EnableStorageFailureWarning,
    SETTINGS,
    SWITCH_TO_HOME,
}

interface appAction {
    type: appActionType,
    payload: any,
}

function appReducer(state, action: appAction) {
    switch (action.type) {
        case appActionType.SAVE:
            console.log("request to save new birthDay");
            let newDay = action.payload.birthDay;
            console.log(newDay);
            console.log(state);
            return {...state, settings: {birthDay: newDay}, status: appStatus.SETTINGS};
        case appActionType.HOME:
            console.log("Switch to Home page");
            return {...state, status: appStatus.HOME, settings: action.payload.settings};
        case appActionType.SETTINGS:
            console.log("Switch to Settings page");
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

function getDateFromStorage(): Promise<Date | undefined> {
    return get('date-iso').then((day: Date) => {
        console.debug(`Got day from idb init: ${day}`);
        return {birthDay: day};
    }).catch(err => {
        console.warning("Failed to get date from local storage");
    });

}


const AppNew = () => {
    const initialAppState: appState = {settings: {birthDay: null}, status: appStatus.LOADING, warnStorage: false};
    const [state, appDispatch] = useReducer(appReducer, initialAppState);

    // load data
    useEffect(() => {
        getDateFromStorage().then(settings => {
            console.log("got settings");
            console.log(settings);
            appDispatch({type: appActionType.HOME, payload: {settings: settings}});
        }).catch(err => {
            console.error(`Unhandled error when setting key with indexedDB: ${err.name}`);
            // toggle warning state (to render warning bar)
            // Keep default state with no data
            appDispatch({type: 'enableStorageFailureWarning'});
            appDispatch({type: 'Home', payload: initialAppState.settings});
            throw err;
            //Update status from loading -> Home
        });
    }, []);

    // render
    console.log("app state");
    console.log(state);
    if (state.status === appStatus.LOADING) {
        console.log("app in loading state");
        return null;
    }


    return (
        <>
            {state.warnStorage && warningContent}

            <Router hook={useHashLocation}>
                <nav>
                    <Link href="/" onClick={() => appDispatch({type: appActionType.SWITCH_TO_HOME})}>
                        <a rel="noreferrer noopener">Home</a>
                    </Link>
                    <Link href="/settings" onClick={() => appDispatch({type: appActionType.SETTINGS})}>
                        <a rel="noreferrer noopener">Settings</a>
                    </Link>
                </nav>

                <Switch>
                    <Route path="/settings">
                        {() => {
                            console.log("settings router");
                            return (
                                <>
                                    <Settings settings={state.settings} dispatch={appDispatch}/>
                                </>)
                        }
                        }
                    </Route>

                    <Route path="/">
                        {() => {
                            console.log("home router");
                            const settings = state.settings;
                            return (
                                <MainPageContent settings={settings}/>
                            );
                        }
                        }
                    </Route>

                    <Route>404, Page Not Found!</Route>
                </Switch> </Router>
        </>
    );
}

const warningStyle = {
    backgroundColor: "#9c2b2e",
    color: "white",
}

interface appProps {
    settings: { birthDay: Date },
}


const warningContent = <>
    <section id="warning" style={warningStyle}><h2>Warning: Not enough space on your device</h2> <p><b>App will operate
        in read only mode.</b></p></section>
</>

const MainPageContent = (props: Partial<appProps>) => {
    console.log("main page initial props");
    console.log(props);
    if (props.settings.birthDay) {
        return (
            <>
                <p>Welcome to the birthday reminder app!</p>
                <p>Your birthday is: {props.settings.birthDay.toLocaleDateString()}</p>

                <p>Click the below button to edit your birthday</p>
                <Link href="/settings">
                    <button>Setup Birthday</button>
                </Link>

            </>
        )
    } else {
        return (
            <>
                <p>Welcome, it looks like you haven't setup your birthday reminder yet. Click the setup button to get
                    started.</p>
                <Link href="/settings">
                    <button>Setup Birthday</button>
                </Link>
            </>
        )
    }
}

const Settings = (props) => {

    console.log("settings props");
    console.log(props);
    const birthDaySet = props.settings.birthDay;
    let birthDayGreeting;
    if (birthDaySet) {
        birthDayGreeting = <p>Your birthday is {props.settings.birthDay.toLocaleDateString()}</p>
    } else {
        birthDayGreeting = <p>Set your birthday below.</p>
    }

    useEffect(() => {
        const settingFormElement = document.getElementById('form-settings');
        settingFormElement.addEventListener('submit', handleFormSubmit);

        return () => settingFormElement.removeEventListener('submit', handleFormSubmit);
    }, []);

    const handleFormSubmit = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const birthDayInput = document.getElementById('set-birthday') as HTMLInputElement;
        const birthDay = birthDayInput.valueAsDate;

        set('date-iso', birthDay).then(res => {
                console.debug("Set birth day in idb");
                props.dispatch({type: appActionType.SAVE, payload: {birthDay}})
                console.debug("updated birthDay in app");
            }
        ).catch(err => {
            switch (err.name) {
                case 'QuotaExceededError':
                    console.warn(`${err.name}: Failed to persist birthday in idb`);
                    props.dispatch({type: appActionType.EnableStorageFailureWarning});
                    break;
                default:
                    console.error(`Unhandled error when setting key with indexedDB: ${err.name}`);
                    console.log(JSON.stringify(err));
                    throw err;
            }
        });
    };

    return (
        <React.Fragment>
            {birthDayGreeting}
            <form id="form-settings">
                <label for="set-birthday">Next birthday</label>
                <input name="birth-date" id="set-birthday" type="date" required/>

                <button type="submit">Save Settings</button>
            </form>
        </React.Fragment>)
}


export default AppNew;

// Hash routing
// returns the current hash location in a normalized form
// (excluding the leading '#' symbol)
const currentLocation = () => {
    return window.location.hash.replace(/^#/, "") || "/";
};

const navigate = (to) => (window.location.hash = to);

const useHashLocation = () => {
    const [loc, setLoc] = useState(currentLocation());

    useEffect(() => {
        // this function is called whenever the hash changes
        const handler = () => setLoc(currentLocation());

        // subscribe to hash changes
        window.addEventListener("hashchange", handler);
        return () => window.removeEventListener("hashchange", handler);
    }, []);

    return [loc, navigate];
};

const root = document.getElementById('app');

// Inject our app into the DOM
ReactDOM.render(<AppNew name="Alex"/>, root);
