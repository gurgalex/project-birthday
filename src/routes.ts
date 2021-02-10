import {appActionType} from "./appActions";

export const appRoutes = {
    HOME: "/",
    SETTINGS: "/settings",
};

interface NavRoute {
    path: string,
    id: string,
    displayName: string,
    UIStateChange: appActionType,
}

export const navRoutes: Array<NavRoute> = [
    {
        path: "/",
        id: "home-link",
        displayName: "Home",
        UIStateChange: appActionType.SWITCH_TO_HOME,
    },
    {
        path: "/settings",
        id: "settings-link",
        displayName: "Settings",
        UIStateChange: appActionType.SWITCH_TO_SETTINGS,
    }
];