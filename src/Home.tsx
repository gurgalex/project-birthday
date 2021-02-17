import {Link} from "wouter";
import * as React from "react";
import {appProps} from "./App";
import {appActionType} from "./appActions";
import {showUTCDate} from "./utils.ts";
import {useEffect, useRef, useState} from "react";
import {set} from "idb-keyval";



export const Home = (props: Partial<appProps>) => {
    console.debug("homepage attached");
    console.debug("main page initial props:", props);

    const saveNotify = async () => {
        try {
            await set('notify', true)
            props.dispatch({type: appActionType.SHOULD_NOTIFY_USER, payload: {notified: true}});
            console.debug("Saved that we notified the user already. Persisted to idb");
        } catch (err) {
            switch (err.name) {
                case 'QuotaExceededError':
                    console.warn(`${err.name}: Failed to persist that we notified the user in idb`);
                    props.dispatch({type: appActionType.ENABLE_STORAGE_FAILURE_WARNING});
                    break;
                default:
                    console.error(`Unhandled error when setting key with indexedDB: ${err.name}`);
                    console.error(JSON.stringify(err));
                    throw err;
            }
        }
    };

    useEffect(() => {
        const birthDayCheckInternval = setInterval(() => {
            const today = new Date();
            if (props.hasBeenNotified) {
                return;
            }

            if (today >= props.settings?.birthDay) {
                new Notification("Birthday Reminder", {body: `Your birthday is soon`})
                saveNotify().then(r => {return;});
            }
        }, 1000);
        return () => clearInterval(birthDayCheckInternval);
    }, [props.settings.birthDay, props.hasBeenNotified]);
    
    console.log("Render main page", props);
    return (
        <>
            <p id="home-greeting">Welcome to the birthday reminder app!</p>
            {<NotificationConsent />}
            <RenderReminder settings={props.settings} hasBeenNotified={props.hasBeenNotified}/>

            <Link href="/settings">
                <a className="btn" id="settings-setup-btn">
                    {`${props.settings?.birthDay ? "Change Reminder": "Setup Reminder"}`}
                </a>
            </Link>

        </>
    )
}

const NotificationConsent = () => {
    const [showNotificationConsent, setShowNotificationConsent] = useState(Notification.permission !== "granted");


    function askNotificationPermission() {
        console.debug("ask notif perm");
        // function to actually ask the permissions
        function handlePermission(permission) {
            // Whatever the user answers, we make sure Chrome stores the information
            if(!('permission' in Notification)) {
                Notification.permission = permission;
            }

            // set the button to shown or hidden, depending on what the user answers
            console.log(permission);
            if(Notification.permission === 'denied' || Notification.permission === 'default') {
                setShowNotificationConsent(true);
            } else {
                setShowNotificationConsent(false);
            }
        }

        // Let's check if the browser supports notifications
        if (!"Notification" in window) {
            console.log("This browser does not support notifications.");
        } else {
            if(checkNotificationPromiseSupport()) {
                Notification.requestPermission()
                    .then((permission) => {
                        handlePermission(permission);
                    })
            } else {
                Notification.requestPermission(function(permission) {
                    handlePermission(permission);
                });
            }
        }
    }

// Function to check whether browser supports the promise version of requestPermission()
// Safari only supports the old callback-based version
    function checkNotificationPromiseSupport() {
        try {
            Notification.requestPermission().then();
        } catch(e) {
            return false;
        }

        return true;
    }

    if (!showNotificationConsent) {
        return null;
    }

    return (
        <>
            <button id="notification-consent" onClick={askNotificationPermission}>Consent to reminder notifications</button>
        </>
    );
}

const RenderReminder = (props) => {
    if (!props.settings.birthDay) {
        return <><p id="first-time-setup">Let's setup your birthday reminder</p></>
    }
    if (props.hasBeenNotified) {
        return <>
            <p id="when-next-birthday" data-date={props.settings?.birthDay.toISOString()}>
                Your birthday reminder for<br />{showUTCDate(props.settings.birthDay)}<br />
                <div id="reminder-shown-already">has already been shown</div></p>
        </>
    }
    return (
        <>
            <p id="when-next-birthday" data-date={props.settings?.birthDay.toISOString()}>Your birthday reminder will
                show on: <br/>{showUTCDate(props.settings.birthDay)}</p>
            {props.hasBeenNotified && <p>Setup a new reminder</p>}
        </>
    )
}