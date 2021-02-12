export function appReducer(state: appState, action: appAction) {
    console.debug("perform action - state\n", action, "\n", state);
    switch (action.type) {
        case appActionType.SAVE:
            console.debug("request to save new birthDay - Payload:");
            console.debug(action.payload);
            let newDay = action.payload.settings.birthDay;
            console.debug(newDay);
            return {...state, settings: {birthDay: newDay}};
        case appActionType.ENABLE_STORAGE_FAILURE_WARNING:
            console.warn("Writing or reading failed");
            return {...state, warnStorage: true};
        case appActionType.SHOULD_NOTIFY_USER:
            return {...state, hasBeenNotified: action.payload.notify}
        case appActionType.DONE_LOADING:
            return {...state, isLoaded: true};
        default:
            console.error("unhandled app action");
            console.error(state);
            console.error(action);
            return state;
    }
}

export interface appState {
    settings: { birthDay: Date | null }
    warnStorage: boolean
    hasBeenNotified: boolean
    isLoaded: boolean
}


export interface appAction {
    type: appActionType,
    payload: any,
}

export const enum appActionType {
    SAVE = "SAVE",
    ENABLE_STORAGE_FAILURE_WARNING = "ENABLE_STORAGE_FAILURE_WARNING",
    SHOULD_NOTIFY_USER = "SHOULD_NOTIFY_USER",
    DONE_LOADING = "DONE_LOADING",
}