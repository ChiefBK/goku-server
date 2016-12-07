
function isValidAction(action) {
    if (!("type" in action)) {
        return false;
    }

    return true;
}

export function handleRequest(socket, action) {
    return function (dispatch, getState) {
        if (isValidAction(action)) {
            dispatch(action)

            socket.emit("action", action);
        }
    };
}