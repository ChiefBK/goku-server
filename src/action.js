import {handleError} from './error';
import {retrieveQuery} from './core';
import {List, toJS} from 'immutable';

function receivedRequest(request) {
    return {
        type: 'RECEIVED_REQUEST',
        request
    }
}

function invalidRequest(request) {
    return {
        type: 'INVALID_REQUEST',
        request
    }
}

function validRequest(request) {
    return {
        type: 'VALID_REQUEST',
        request
    }
}

function processedRequest(request) {
    return {
        type: 'PROCESSED_REQUEST',
        request
    }
}

function processCreate(payload){
    return {
        type: 'CREATE' + '_' + payload.model,
        payload
    }
}

function processQuery(query){
    return {
        type: 'READ_' + query.item,
        query
    }
}

export function handleCreate(socket, request){
    return function(dispatch, getState){
        dispatch(processCreate(request.payload));
    }
}

export function handleRead(socket, request) {
    return function (dispatch, getState) {
        console.log("handling read");
        console.log(request);
        let payload = List();

        //TODO - actually dispatch event for request (read)
        // dispatch(processQuery(query))

        payload = payload.merge(retrieveQuery(request.query, getState()));

        console.log("sending back payload: " + payload);

        socket.emit('payload', {
            id: request.id,
            payload: payload.toJS()
        });

    };
}