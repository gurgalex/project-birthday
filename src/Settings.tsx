import * as React from "react";
import {useEffect, useState} from "react";
import {set} from "idb-keyval";
import {Redirect} from "wouter";
import {appActionType} from "./appActions";
import {showUTCDate} from "./utils.ts";

export const Settings = (props) => {

    const [filled, setFilled] = useState(false);
    console.debug("settings props");
    console.debug(props);
    const birthDaySet = props.settings.birthDay;

    const settingsGreeting = () => {
        if (birthDaySet) {
            return <><p>Your next birthday reminder is on </p><p>{showUTCDate(props.settings.birthDay)}</p></>
        } else {
            return <p>Set your first birthday reminder</p>
        }
    };

    useEffect(() => {
        console.log("settings page attached");
        const settingFormElement = document.getElementById('form-settings');
        settingFormElement.addEventListener('submit', handleFormSubmit);

        // focus the 1st input of the form
        document.getElementById('set-birthday').focus();

        return () => settingFormElement.removeEventListener('submit', handleFormSubmit);
    }, []);

    const handleFormSubmit = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const birthDayInput = document.getElementById('set-birthday') as HTMLInputElement;
        const birthDay = birthDayInput.valueAsDate;

        set('date-iso', birthDay).then(res => {
                console.debug("Set birthDay in idb");
                props.dispatch({type: appActionType.SAVE, payload: {settings: {birthDay: birthDay}}});
                console.debug("Set birthDay in app");
                setFilled(true);
                console.debug("form marked as filled in settings");
                props.dispatch({type: appActionType.SWITCH_TO_HOME});
                console.debug("Should be in home status now");
                console.debug(props);
            }
        ).catch(err => {
            switch (err.name) {
                case 'QuotaExceededError':
                    console.warn(`${err.name}: Failed to persist birthday in idb`);
                    props.dispatch({type: appActionType.EnableStorageFailureWarning});
                    break;
                default:
                    console.error(`Unhandled error when setting key with indexedDB: ${err.name}`);
                    console.error(JSON.stringify(err));
                    throw err;
            }
        });
    };

    return (
        <>
            {filled && <Redirect to ="/"/>}
            <h1 id="settings-header">Settings</h1>
            {settingsGreeting()}
            <form id="form-settings">
                <label for="set-birthday"><b>Set reminder to</b></label>
                <input name="birth-date" id="set-birthday" type="date" required/>

                <button type="submit">Save Settings</button>
            </form>
        </>)
}