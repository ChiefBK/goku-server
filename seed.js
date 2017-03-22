import {createUser, createEvent, createVenue, createTicket, createOrder} from "en3-common";
import sha512 from "js-sha512";

const minPrice = 40.0;
const medianPrice = 50.0;
const maxPrice = 60.0;

const eventNames = ["Lollapalooza", "Mamby on the Beach", "Blues Festival", "Reaction", "Shambhala"];
const venueNames = ["House of Blues", "Chicago Theater", "The Mid", "Grant Park"];
const venueAddresses = ["329 N Dearborn St, Chicago, IL 60654", "175 N State St, Chicago, IL 60601", "306 N Halsted St, Chicago, IL 60661"];
const userFirstNames = ["Bill", "Stacy", "Tom"];
const userLastNames = ["Gates", "Johnson", "Smith"];
const userEmails = ["pinkertons@gmail.com", "coffeeisgood@yahoo.com", "rustictoenails@gmail.com"];

export function generateInitialState(store) {
    const userIds = [generateId(), generateId(), generateId(), generateId()];
    const eventIds = ['eventId1', 'eventId2'];
    const ticketIds = ['ticketId1', 'ticketId2'];
    const clientId = 'qwertyuiop';
    const userPass = '012345';

    for (let i = 0; i < userIds.length; i++) {
        store.dispatch(createUser(userIds[i], userFirstNames[i % userFirstNames.length], userLastNames[i % userLastNames.length], userEmails[i % userEmails.length], sha512(userPass), 'patron'));

        for (let j = 0; j < 3; j++) {
            store.dispatch(createOrder(generateId(), 'buy', 20, 'active', eventIds[0], ticketIds[0], userIds[i]));
        }

        store.dispatch(createOrder(generateId(), 'sell', 48, 'active', eventIds[0], ticketIds[0], userIds[i]));
        store.dispatch(createOrder(generateId(), 'sell', undefined, 'inactive', eventIds[0], ticketIds[0], userIds[i]));

    }

    store.dispatch(createUser(clientId, 'sean', 'spicy', 'thickness@gmail.com', sha512(userPass), 'client'));

    for (let i = 0; i < eventIds.length; i++) {
        store.dispatch(createEvent(eventIds[i], eventNames[i % eventNames.length], new Date(2017, 3, 3, 20), new Date(2017, 3, 4, 1), 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', clientId));
        store.dispatch(createVenue(generateId(), venueNames[i % venueNames.length], venueAddresses[i % venueAddresses.length], 2245678901, eventIds[i], clientId));
        store.dispatch(createTicket(ticketIds[i], 'general', eventIds[i], clientId));

        for (let j = 0; j < 20; j++) {
            store.dispatch(createOrder(generateId(), 'sell', undefined, 'inactive', eventIds[i], ticketIds[i], clientId))
        }

        for (let j = 0; j < 10; j++) {
            store.dispatch(createOrder(generateId(), 'sell', 30, 'active', eventIds[i], ticketIds[i], clientId))
        }
    }


}

export function generateId() {
    return Math.random().toString(36).substring(2, 10);
}

function getIds(array) {
    let arr = [];

    for (let i = 0; i < array.length; i++) {
        arr.push(array[i].id);
    }

    return arr;
}

// Returns a random float in between min & max
function randomFloat(min, max) {
    return parseFloat((min + (Math.random() * (max - min))).toFixed(2));
}

function randomBuyOrSell() {
    const rand = Math.random();

    if (rand < 0.5) {
        return "sell";
    }
    else {
        return "buy";
    }
}

function randomStatus() {
    const rand = Math.random();

    if (rand < 0.5) {
        return 'active';
    }
    else {
        return 'idle'
    }
}