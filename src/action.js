import {handleError} from './error';
import {retrieveQuery} from './core';
import {List, toJS} from 'immutable';
import winston from 'winston';
import {pretty} from './util';

function createItem(item) {
    return {
        type: 'CREATE_ITEM',
        item
    }
}

export function handleCreate(io, socket, request){
    return function(dispatch, getState){
        dispatch(createItem(request.get('payload')));

        io.sockets.emit('create', request.toJS());
    }
}

export function handleRead(socket, event) {
    return function (dispatch, getState) {
        retrieveQuery(event.query, getState()).then((payload) => {
            winston.debug(`Sending payload: ${pretty(payload.toJS())}`);
            socket.emit('payload', {
                id: event.id,
                payload: payload.toJS()
            });
        });
    };
}