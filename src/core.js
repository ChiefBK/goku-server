import {List} from 'immutable';
import {generateId} from '../seed';

export const INITIAL_STATE = List();

export function createEvent(state, event){
    const name = event.name;
    const id = generateId();
    const venue = event.venue;
    const tickets = event.tickets;
    return state.push({
        name,
        id,
        venue,
        tickets
    });
}

export function createVenue(state, venue){
    const id = generateId();
    const name = venue.name;
    const address = venue.address;

    return state.push({
        id,
        name,
        address
    })
}