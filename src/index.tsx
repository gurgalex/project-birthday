import * as React from 'react';
import ReactDOM from "react-dom";

import { get, set } from 'idb-keyval';
import {useEffect} from "react";


const enum appAction {
    LOADING = "Loading",
    HOME = "Home",
    SETTINGS = "Settings",
}


export class App extends React.Component {
    public state: {
        birthDay: Date,
        status: appAction,
    };

    getDateFromStorage(): Promise<unknown> {
        return get('date-iso').then(day => {
            console.debug(`Got day from idb init: ${day}`);
            return Promise.resolve(day);
        }).catch(err => {
            console.debug("birthDay setting not set yet");
            return Promise.resolve(null);
        });

    }

    constructor(props) {
        super(props);

        this.state = {birthDay: null, status: appAction.LOADING};
        console.debug(`App State with init:`);
        console.log(this);
    }

    componentDidMount() {
        this.getDateFromStorage().then(date => {
            this.setState({birthDay: date, status: appAction.SETTINGS});
        })
    }

    render() {
        let settingsPage;
        switch (this.state.status) {
            case appAction.HOME: {
                break;
            }
            case appAction.SETTINGS:
                settingsPage = <Settings birthDay={this.state.birthDay} onSettingsSubmit={this.handleFormSubmit}/>;
                break;
            case appAction.LOADING:
                settingsPage = null;
        }

        return (
        <React.Fragment>
            <h1>Hello {this.props.name}</h1>
            {settingsPage}
        </React.Fragment>
        );
    }

    birthday(): Date {
        return this.state.birthDay;
    }

    setBirthDay(date) {
        this.setState({birthDay: date});
     }


    handleFormSubmit = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const birthDayInput = document.getElementById('set-birthday') as HTMLInputElement;
        const birthDate = birthDayInput.valueAsDate;
        this.setBirthDay(birthDate);
        console.debug("updated birthDay in app");

        set('date-iso', birthDate).then(res => {
                //console.debug("Set birth date in idb");
            }
        ).catch(err => {
            switch (err.name) {
                case 'QuotaExceededError':
                    console.warn(`${err.name}: Failed to persist birthday in idb`);
                    break;
                default:
                    console.error(`Unhandled error when setting key with indexedDB: ${err.name}`);
                    throw err;
            }
        });
    }

}

const Settings = (props) => {
    const birthDaySet = props.birthDay;
    let birthDayGreeting;
    if (birthDaySet) {
        birthDayGreeting = <p>Your birthday is {props.birthDay.toLocaleDateString()}</p>
    }
    else {
        birthDayGreeting = <p>Set your birthday below.</p>
    }

    useEffect(() => {
        const settingFormElement = document.getElementById('form-settings');
        settingFormElement.addEventListener('submit', props.onSettingsSubmit);

        return () => settingFormElement.removeEventListener('submit', props.fontVariationSettings);
    }, [props.onSettingsSubmit]);

    return (
        <React.Fragment>
            {birthDayGreeting}
            <form id="form-settings">
                <label for="set-birthday">Next birthday</label>
                <input name="birth-date" id="set-birthday" type="date" required/>

                <button type="submit">Save Settings</button>
            </form>
        </React.Fragment>    )

}


export default App;

const root = document.getElementById('app');

// Inject our app into the DOM
ReactDOM.render(<App name="Alex" />, root);