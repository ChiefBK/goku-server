import {List, Map, toJS} from 'immutable';
import {generateId} from '../seed';
import pluralize from 'pluralize';
import Promise from 'bluebird';
import winston from 'winston';
import {pretty, generateHash} from './util';
import Item from './models/item';
import Group from './models/group';

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
    if (!item || item.get('hash') == hash) {
        return new Item();
    }
    else {
        return new Item(item);
    }
}

export function getGroup(state, groupId, hash=''){
    const group = state.getIn(['groups', groupId]);

    if(!group || group.get('hash') == hash){
        return new Group();
    }
    else{
        return new Group(group);
    }
}

export function getGroupAndItems(state, id, socket, hash = '') {
    winston.debug('Getting group by id: ' + id);
    const group = state.getIn(['groups', id]);
    winston.silly('found group: ' + pretty(group.toJS()));

    //TODO - handle if group does not exist

    if (group.get('hash') == hash) {
        return List();
    }
    else {
        const results = [];
        group.set('hash', generateId());
        results.push(group);
        winston.silly('pushed group. results now: ' + pretty(results));
        group.get('items').forEach((id) => {
            results.push(getItem(id, state))
        });
        winston.silly('pushed items. results now: ' + pretty(results));
        return List(results);
    }
}

export function createGroupObject(){
    return new Map({
        id: generateId(),
        model: 'group',
        hash: generateHash(),
        room: generateHash()
    });
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