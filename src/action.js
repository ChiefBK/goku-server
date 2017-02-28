import {createDeleteEvent} from "./core";
import {getItem, queryState, Event} from "en3-common";
import {Map, toJS} from "immutable";
import winston from "winston";
import {pretty, generateHash} from "./util";
import {generateId} from "../seed";

function createOrUpdateItem(item) {
    if (Map.isMap(item)) {
        item = item.toJS();
    }

    return {
        type: 'CREATE_UPDATE_ITEM',
        item
    }
}

function deleteItem(itemId) {
    return {
        type: 'DELETE_ITEM',
        itemId
    }
}

function regenerateItemHash(itemId) {
    return {
        type: 'REGENERATE_ITEM_HASH',
        itemId
    }
}

/**
 *
 * @param io
 * @param socket
 * @param event
 * @returns {Function}
 */
export function handleCreate(io, socket, event) {
    return function (dispatch, getState) {
        const items = event.payload;

        for (let i in items) {
            const item = items[i];
            let room = generateHash();
            const outputEvent = new Event(event.eventId);

            item.room = room;
            item.id = generateId();
            socket.join(room);
            dispatch(createOrUpdateItem(item));
            outputEvent.appendPayload(item);
            io.to(room).emit('create', outputEvent.toObject());
        }

    }
}

/**
 *
 * @param socket - the socket of the client sending the read event
 * @param event {object} - the event sent by the client
 * @returns {Function}
 */
export function handleRead(socket, event) {
    return function (dispatch, getState) {
        const outboundEvent = new Event(event.eventId);

        const item = getItem(getState(), event.id, event.hash);
        if (item) {
            outboundEvent.appendPayload(item);
        }
        socket.join(item.get('room'));

        // const referencedItems = getInnerObjects(List.of(item), getState());
        const referencedItems = item.referencingItems(getState(), event.levels);
        winston.silly('referenced items');
        winston.silly(pretty(referencedItems.toJS()));
        outboundEvent.concatPayload(referencedItems);

        for (let i in outboundEvent.payload) {
            const item = outboundEvent.payload[i];
            socket.join(item.room);
        }

        winston.debug('sending create event: ' + pretty(outboundEvent.toObject()));
        socket.emit('create', outboundEvent.toObject());
    }
}

export function handleQuery(socket, event) {
    return function (dispatch, getState) {
        const levels = event.levels;
        const outboundEvent = new Event(event.eventId);

        let rootResults = queryState(getState(), event.query);
        outboundEvent.concatPayload(rootResults);
        rootResults.forEach((item) => {
            outboundEvent.concatPayload(item.referencingItems(getState(), levels))
        });

        for (let i in outboundEvent.payload) {
            const item = outboundEvent.payload[i];
            socket.join(item.room);
        }

        winston.debug(`Sending payload: ${pretty(outboundEvent.toObject())}`);
        socket.emit('create', outboundEvent.toObject());
    };
}

export function handleUpdate(io, socket, event) {
    return function (dispatch, getState) {
        const payload = event.payload;
        let item = getItem(getState(), payload.id);
        const outboundEvent = new Event(event.eventId);

        const updatedItem = item.updateItem(payload.properties);

        dispatch(regenerateItemHash(item.get('id')));
        dispatch(createOrUpdateItem(updatedItem));
        winston.silly(`Item was ${pretty(item.toJS())}; Updated item is ${pretty(updatedItem.toJS())}`);
        outboundEvent.appendPayload(payload);
        winston.silly(`Sending update payload to room: ${item.get('room')}`);
        io.to(item.get('room')).emit('update', outboundEvent.toObject()); //TODO - use update (send diff) instead of entire object
    }
}

export function handleDelete(io, socket, event) {
    return function (dispatch, getState) {
        const itemId = event.payload.id;
        const item = getItem(getState(), itemId);
        const room = item.get('room');

        if (item.size > 0) {
            dispatch(deleteItem(item.get('id')));

            io.to(room).emit('delete', createDeleteEvent(event.id, item.get('id')));
        }
        else {
            //TODO - if item doesn't exist send error
        }


    }
}

export function handleAuth(io, socket, event) {
    return function (dispatch, getState) {
        const outgoingEvent = new Event(event.eventId);
        const state = getState();

        const userEmail = event.email;
        const userPassHash = event.passwordHash;

        const user = state.get('items').find((item) => {
            return item.get('email') == userEmail && item.get('passwordHash') == userPassHash;
        });
        outgoingEvent.appendPayload(user);

        socket.emit('auth', outgoingEvent.toObject());
        socket.emit('create', outgoingEvent.toObject());
    }
}