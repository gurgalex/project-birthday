import {Link} from "wouter";
import * as React from "react";
import {appProps} from "./App";

export const Home = (props: Partial<appProps>) => {
    console.debug("main page initial props");
    console.debug(props);
    if (props.settings.birthDay) {
        return (
            <>
                <p id="home-greeting">Welcome to the birthday reminder app!</p>
                <p id="when-next-birthday" data-date={props.settings?.birthDay.toISOString()}>Your birthday is: {props.settings.birthDay.toLocaleDateString()}</p>

                <p>Click the setup button to set a reminder.</p>
                <Link href="/settings">
                    <button>Setup Birthday</button>
                </Link>

            </>
        )
    } else {
        return (
            <>
                <section id="no-settings-greeting">
                    <p id="home-greeting">Welcome! It looks like you haven't setup your birthday reminder yet.</p>
                    <p>Click the setup button to set a reminder.</p>
                    <Link href="/settings">
                        <button id="settings-setup-btn">Setup Birthday</button>
                    </Link>
                </section>
            </>
        )
    }
}