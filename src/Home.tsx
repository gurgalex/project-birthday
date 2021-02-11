import {Link} from "wouter";
import * as React from "react";
import {appProps} from "./App";
import {appActionType} from "./appActions";
import {showUTCDate} from "./utils.ts";

export const Home = (props: Partial<appProps>) => {
    console.log("homepage attached");
    console.debug("main page initial props");
    console.debug(props);
    if (props.settings.birthDay) {
        return (
            <>
                <p id="home-greeting">Welcome to the birthday reminder app!</p>
                <p id="when-next-birthday" data-date={props.settings?.birthDay.toISOString()}>Your birthday is: {showUTCDate(props.settings.birthDay)}</p>

                <Link href="/settings"
                      onClick={() => {
                    console.log("dispatch change to settings");
                    props.dispatch({type: appActionType.SWITCH_TO_SETTINGS});
                }}>
                    <a className="btn" id="settings-setup-btn">Change Reminder</a>
                </Link>

            </>
        )
    } else {
        return (
            <>
                <section id="no-settings-greeting">
                    <p id="home-greeting">Welcome! It looks like you haven't setup your birthday reminder yet.</p>
                    <Link href="/settings"
                          onClick={() => {
                              console.log("dispatch change to settings");
                              props.dispatch({type: appActionType.SWITCH_TO_SETTINGS});
                          }}>
                        <a className="btn" id="settings-setup-btn">Setup Reminder</a>
                    </Link>
                </section>
            </>
        )
    }
}