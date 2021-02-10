export function appReducer(state, action: appAction) {
    switch (action.type) {
        case appActionType.SAVE:
            console.debug("request to save new birthDay - Payload:");
            console.log(action.payload);
            let newDay = action.payload.settings.birthDay;
            console.debug(newDay);
            console.debug(state);
            return {...state, settings: {birthDay: newDay}};
        case appActionType.HOME:
            console.debug("Switch to Home page");
            return {...state, status: appStatus.HOME, settings: action.payload.settings};
        case appActionType.SETTINGS:
            console.debug("Switch to Settings page");
            return {...state, status: appStatus.SETTINGS};
        case appActionType.EnableStorageFailureWarning:
            console.warn("Writing or reading failed");
            return {...state, warnStorage: true};
        case appActionType.SWITCH_TO_HOME:
            return {...state, status: appStatus.HOME};
        case appActionType.SWITCH_TO_SETTINGS:
            return {...state, status: appStatus.SETTINGS};

        default:
            console.error("unhandled app action");
            console.error(state);
            console.error(action);
    }
}

export interface appState {
    settings: { birthDay: Date | null }
    status: appStatus
    warnStorage: boolean
}

export const enum appStatus {
    LOADING = "Loading",
    HOME = "Home",
    SETTINGS = "Settings",
}

export interface appAction {
    type: appActionType,
    payload: any,
}

export const enum appActionType {
    HOME,
    SAVE,
    EnableStorageFailureWarning,
    SETTINGS,
    SWITCH_TO_HOME,
    SWITCH_TO_SETTINGS,
}