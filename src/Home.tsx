import {Link} from "wouter";
import * as React from "react";
import {appProps} from "./App";
import {appActionType} from "./appActions";
import {showUTCDate} from "./utils.ts";
import {useEffect, useRef, useState} from "react";



export const Home = (props: Partial<appProps>) => {
    console.debug("homepage attached");
    console.debug("main page initial props");
    console.debug(props);

    let [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const birthDayCheckInternval = setInterval(() => {
            const today = new Date();
            //console.log("I'm called to check if today is the day");
            //setSeconds(seconds => seconds + 2);
            if (today >= props.settings.birthDay) {
                //console.debug("Trigger birthday notif here!");
            }
            else {
                //console.debug("not time yet");
            }
        }, 2000);
        return () => clearInterval(birthDayCheckInternval);
    }, [props.settings]);
    
    console.log("Render main page");
    return (
        <>
            <p>The app has been running for {seconds} seconds.</p>
            <p id="home-greeting">Welcome to the birthday reminder app!</p>
            <RenderReminder settings={props.settings} />

            <Link href="/settings">
                <a className="btn" id="settings-setup-btn">
                    {`${props.settings?.birthDay ? "Change Reminder": "Setup Reminder"}`}
                </a>
            </Link>

        </>
    )
}


const RenderReminder = (props) => {
    if (!props.settings?.birthDay) {
        return <><p id="first-time-setup"></p></>
    }
    return (
        <>
            <p id="when-next-birthday" data-date={props.settings?.birthDay.toISOString()}>Your birthday is: {showUTCDate(props.settings.birthDay)}</p>
        </>
    )

}