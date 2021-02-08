import {Link} from "wouter";
import * as React from "react";
import {appProps} from "./App";

export const Home = (props: Partial<appProps>) => {
    console.debug("main page initial props");
    console.debug(props);
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