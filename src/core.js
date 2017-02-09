import {List, Map, toJS} from 'immutable';
import {generateId} from '../seed';
import pluralize from 'pluralize';
import Promise from 'bluebird';
import winston from 'winston';
import {pretty, generateHash} from './util';
import Item from './item';
import Group from './group';

export const INITIAL_STATE_MAP = Map();

function indexById(iterable) {
    return iterable.reduce(
        (lookup, item) => lookup.set(item.get('id'), item),
        Map()
    );
}

function queryState(query, state) {
    winston.silly(`Reading from state with query ${pretty(query)}`);
    return state.get(pluralize(query.model)).filter((item) => {
        winston.silly(`Testing query against item ${pretty(item.toJS())}`);
        let isMatching = true;

        for (let key in query['properties']) {
            const attributeRegEx = new RegExp(query['properties'][key]); // Create regex expression with value of property
            if (item.get(key) == null || !attributeRegEx.test(item.get(key))) { // If item does not have key or does not match regex
                isMatching = false;
                break;
            }
            else if (key == 'hash' && item.get(key) == query['properties'][key]) {

            }
        }

        return isMatching;
    });
}

export function getItem(state, id, hash = '') {
    winston.debug("Getting by id: " + id);
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

export function getInnerObjects(results, state, levels = 0, queue = []) {
    if (results === undefined || results.size == 0) {
        return List();
    }

    let lastResult = results.last();
    winston.silly(`last result: ${pretty(lastResult.toJS())}`);
    if (!lastResult.has('visited')) { //If lastResult does not have 'visited' attribute
        lastResult.referencingItemKeys().forEach((key) => {
            winston.silly("pushing " + lastResult.get(key) + " to queue");
            queue.push(lastResult.get(key));
        });

        lastResult.set('visited', true);
    }

    if (queue.length == 0 || levels == 1) {
        return results;
    }

    const newItem = getItem(state, queue[0]);
    winston.silly(`Pushing item ${pretty(newItem.toJS())} to results`);
    let newResults = results.push(newItem);
    queue.shift();
    return getInnerObjects(newResults, state, --levels, queue);
}

export function getQuery(query, state) {
    return new Promise((resolve, reject) => { //TODO - remove promise - simply return results
        let rootResults = queryState(query, state);
        winston.silly(`results after first round had length of ${rootResults.size}`);
        winston.silly(`first round results: ${pretty(rootResults.toJS())}`);

        let allResults = getInnerObjects(rootResults, state, 'levels' in query ? query.levels : undefined);

        resolve(allResults);
    });
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

export function getItemsOfGroup(state, groupId){
    const globalItems = state.get('items');

    return globalItems.filter((item) => {
        return item.get('_groupId_') == groupId;
    });
}

export function createGroupObject(){
    return new Map({
        id: generateId(),
        model: 'group',
        hash: generateHash(),
        room: generateHash()
    });
}

export function createCreateEvent(eventId, payload){
    let eventPayload;
    if(Array.isArray(payload)){
        eventPayload = payload;
    }
    else if (Map.isMap(payload)){
        eventPayload = [payload.toJS()];
    }
    else if (List.isList(payload)){
        eventPayload = payload.toJS();
    }
    else{
        eventPayload = [payload];
    }

    return {
        eventId,
        payload: eventPayload
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