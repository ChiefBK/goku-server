import {handleError} from './error';
import {retrieveQuery} from './core';
import {List, toJS} from 'immutable';
import winston from 'winston';
import {pretty} from './util';

function createItem(item) {
    return {
        type: 'CREATE_' + item.get('model').toUpperCase(),
        item
    }
}

export function handleCreate(io, socket, request){
    return function(dispatch, getState){
        dispatch(createItem(request.get('payload')));

        io.sockets.emit('create', request.toJS());
    }
}

export function handleRead(socket, request) {
    return function (dispatch, getState) {
        retrieveQuery(request.query, getState()).then((payload) => {
            winston.debug(`Sending payload: ${pretty(payload.toJS())}`);
            socket.emit('payload', {
                id: request.id,
                payload: payload.toJS()
            });
        });
    };
}