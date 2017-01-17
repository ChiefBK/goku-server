import {combineReducers} from 'redux-immutable';
import {
    INITIAL_STATE
} from './core';

function events(eventState = INITIAL_STATE, action) {
    switch (action.type) {
        case 'CREATE_EVENT':
            return eventState.push(action.item);
        case 'READ_EVENT':
        case 'UPDATE_EVENT':
        case 'DELETE_EVENT':
        case 'SET_EVENTS':
    }

    return eventState;
}

function venues(venueState = INITIAL_STATE, action) {
    switch (action.type) {
        case 'CREATE_VENUE':
        case 'READ_VENUE':
        case 'UPDATE_VENUE':
        case 'DELETE_VENUE':
        case 'SET_VENUES':
    }

    return venueState;
}

function tickets(ticketState = INITIAL_STATE, action) {
    switch (action.type) {
        case 'CREATE_TICKET':
        case 'READ_TICKET':
        case 'UPDATE_TICKET':
        case 'DELETE_TICKET':
    }

    return ticketState;
}

function orders(orderState = INITIAL_STATE, action) {
    switch (action.type) {
        case 'CREATE_ORDER':
            return orderState.push(action.item);
        case 'READ_ORDER':
        case 'UPDATE_ORDER':
        case 'DELETE_ORDER':
    }

    return orderState;
}

function users(userState = INITIAL_STATE, action) {
    switch(action.type) {
        case 'CREATE_USER':
        case 'READ_USER':
        case 'UPDATE_USER':
        case 'DELETE_USER':
    }

    return userState;
}

const reducers = combineReducers({
    events,
    tickets,
    orders,
    users,
    venues
});

export default reducers;