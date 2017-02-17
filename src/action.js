import {handleError} from './error';
import {
    getItem,
    getGroup,
    createGroupObject,
    createUpdateEvent,
    createDeleteEvent,
    queryState
} from './core';
import {Map, List, toJS} from 'immutable';
import winston from 'winston';
import {pretty, generateHash} from './util';
import {generateId} from '../seed';
import Event from './models/event';
import Item from './models/item';

function createOrUpdateItem(item) {
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

function createGroup(group) {
    return {
        type: 'CREATE_GROUP',
        group
    }
}

function regenerateGroupHash(groupId) {
    return {
        type: 'REGENERATE_GROUP_HASH',
        groupId
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

            if(item.model == 'ticket'){
                const group = createGroupObject();
                item.room = room;
                item.group = group.id;
                dispatch(createGroup(group));
                socket.join(group.room);
                outputEvent.appendPayload(group);
            }
            if (item.model == 'order') {
                const ticket = getItem(getState(), item.ticketId_);
                const group = getGroup(getState(), ticket.get('group'));
                dispatch(regenerateGroupHash(group.get('id')));
                room = group.get('room');
            }
            else {
                item.room = room;
            }

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
        if (!item.isEmpty()) {
            outboundEvent.appendPayload(item.toJS());
        }
        socket.join(item.get('room'));

        // const referencedItems = getInnerObjects(List.of(item), getState());
        const referencedItems = item.referencingItems(getState(), event.levels);
        winston.silly('referenced items');
        winston.silly(pretty(referencedItems.toJS()));
        outboundEvent.concatPayload(referencedItems);

        //TODO - handle groups (for tickets)
        // if (item.groupId) {
        //     const group = getGroup(getState(), item.groupId, outboundEvent.groupHash);
        //     if (!group.isEmpty()) {
        //         outboundEvent.appendPayload(group.toJS());
        //         const itemsOfGroup = getItemsOfGroup(getState(), group.id);
        //         outboundEvent.concatPayload(itemsOfGroup.toJS());
        //
        //         socket.join(group.get('room'));
        //     }
        // }

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

        winston.debug(`Sending payload: ${pretty(outboundEvent.toObject())}`);
        socket.emit('create', outboundEvent.toObject());
    };
}

export function handleUpdate(io, socket, event) {
    return function (dispatch, getState) {
        const payload = event.payload;
        let item = getItem(getState(), payload.id);
        let itemChanged = false;

        for (let property in payload.properties) {
            if (item.has(property)) {
                item = item.set(property, payload.properties[property]);
                itemChanged = true;
            }
        }

        if (itemChanged) {
            dispatch(regenerateItemHash(item.get('id')));
            dispatch(createOrUpdateItem(item));
            io.to(item.get('room')).emit('update', createUpdateEvent(event.id, payload))
        }
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

function sendEvent(event, eventType, socket) {
    winston.debug("Sending event: " + pretty(event));
    socket.emit(eventType, event);
}