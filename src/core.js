import {Map, toJS} from 'immutable';
import winston from 'winston';
import {pretty} from './util';
import Item from 'en3-common';

export const INITIAL_STATE_MAP = Map();

export function queryState(state, query) {
    winston.silly(`Reading from state with query ${pretty(query)}`);
    return state.get('items').filter((item) => {
        return item.matchesQuery(query);
    }).toList();
}

export function getItem(state, id, hash = '') {
    winston.silly("Getting by id: " + id);
    const item = state.getIn(['items', id]);

    if (item && item.get('hash') != hash) {
        return new Item(item);
    }
}

export function createUpdateEvent(eventId, payload){
    return {
        eventId,
        payload
    }
}

export function createDeleteEvent(eventId, itemId){
    return {
        eventId,
        payload: {
            id: itemId
        }
    }
}