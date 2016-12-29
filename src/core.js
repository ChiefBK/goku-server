import {List} from 'immutable';
import {generateId} from '../seed';
import pluralize from 'pluralize';

export const INITIAL_STATE = List();

export function createEvent(eventState, payload){
    return eventState.push({
        id: generateId(),
        name: payload.name,
        venue: payload.venue
    });
}

export function createVenue(venueState, payload){
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
    return state.get(pluralize(query.model)).filter((item) => {
        let isMatching = true;

        for(let key in query['properties']) {
            console.log("key: " + key);
            console.log("value: " + query['properties'][key]);
            console.log("item value: " + item.get(key));
            const attributeRegEx = new RegExp(query['properties'][key]);
            console.log("matching: " + attributeRegEx.test(item.get(key)));
            console.log("key in item: " + item.get(key) != null);
            if(!(item.get(key) != null && attributeRegEx.test(item.get(key)))){
                console.log("not matching");
                isMatching = false;
                break;
            }
        }

        return isMatching;
    });
}

export function retrieveQuery(query, state) {
    return readFromState(query, state);
}