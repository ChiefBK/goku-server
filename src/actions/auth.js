import {Event} from 'en3-common';

export function handleAuth(event, socket, io) {
    return function (dispatch, getState) {
        const outgoingEvent = new Event(event.eventId);
        const state = getState();

        const userEmail = event.email;
        const userPassHash = event.passwordHash;

        const user = state.get('users').find((user) => {
            return user.get('email') == userEmail && user.get('passwordHash') == userPassHash;
        });

        if (user)
            outgoingEvent.auth = {
                success: true,
                userId: user.get('id')
            };
        else
            outgoingEvent.auth = {
                success: false
            };

        socket.emit('auth', outgoingEvent.toObject());
    }
}