import {List, Map, toJS} from 'immutable';
import {generateId} from '../seed';
import pluralize from 'pluralize';
import Promise from 'bluebird';
import winston from 'winston';
import {pretty} from './util';

export const INITIAL_STATE = List();

function indexById(iterable) {
    return iterable.reduce(
        (lookup, item) => lookup.set(item.get('id'), item),
        Map()
    );
}

export function createEvent(eventState, payload) {
    return eventState.push({
        id: generateId(),
        name: payload.name,
        venue: payload.venue
    });
}

export function createVenue(venueState, payload) {
    return venueState.push({
        id: generateId(),
        name: payload.name,
        address: payload.address
    })
}

export function createOrder(orderState, payload) {
    return orderState.push({
        id: generateId(),
        price: payload.price,
        orderType: payload.orderType,
        user: payload.user
    });
}

export function readOrders(state, ticket) {
    console.log("state");
    console.log(state.get('orders').toJS());
    console.log("ticket");
    console.log(ticket);
    const orders = state.get('orders');

    return orders.filter((order) => {
        console.log(order.get('ticket'));
        return order.get('ticket') == ticket;
    });
}

function readFromState(query, state) {
    winston.debug(`Reading from state with query ${pretty(query)}`);
    return state.get(pluralize(query.model)).filter((item) => {
        winston.silly(`Testing query against item ${pretty(item.toJS())}`);
        let isMatching = true;

        for (let key in query['properties']) {
            const attributeRegEx = new RegExp(query['properties'][key]); // Create regex expression with value of property
            if (!(item.get(key) != null && attributeRegEx.test(item.get(key)))) { // If item does not have key or does not match regex
                isMatching = false;
                break;
            }
        }

        return isMatching;
    });
}

function getById(id, model, state) {
    winston.debug("Getting by id: " + id + " for model: " + model);
    const modelMap = indexById(state.get(pluralize(model)));

    return modelMap.get(id);
}

function isKeyAnId(key) {
    return new Promise((resolve, reject) => {
        if (key.includes('ID')) {
            resolve({key: key})
        }
    });
}

function getInnerObjects(results, state, levels = 0, queue = []) {
    if (results === undefined || results.size == 0) {
        return List();
    }

    let lastResult = results.last();
    if(!lastResult.get('visited', false)){ //If lastResult does not have 'visited' attribute
        lastResult.keySeq().forEach((key) => {
            if(key.includes('ID')){
                let model = key.split('ID')[0];
                queue.push({
                    id: lastResult.get(key),
                    model: model
                });
            }
        });

        lastResult.set('visited', true);
    }

    if(queue.length == 0 || levels == 1){
        return results;
    }

    let newResults = results.push(getById(queue[0]['id'], queue[0]['model'], state));
    queue.shift();
    return getInnerObjects(newResults, state, --levels, queue);
}

export function retrieveQuery(query, state) {
    return new Promise((resolve, reject) => {
        let firstRoundResults = readFromState(query, state);
        winston.debug(`results after first round had length of ${firstRoundResults.size}`);

        let allResults = getInnerObjects(firstRoundResults, state, 'levels' in query ? query.levels : undefined);

        resolve(allResults);
    });
}