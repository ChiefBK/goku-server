import {fromJS, Map} from 'immutable';
import winston from 'winston';
import {generateHash} from './src/util';
import Item from './src/models/item';
import Group from './src/models/group';

const numOfEvents = 5;
const numOfVenues = 3;
const numOfUsers = 2;
const numOfTicketsPerEvent = 2;
const numOfOrdersPerTicket = 5;

const minPrice = 40.0;
const medianPrice = 50.0;
const maxPrice = 60.0;

const eventNames = ["Lollapalooza", "Mamby on the Beach", "Blues Festival", "Reaction", "Shambhala"];
const venueNames = ["House of Blues", "Chicago Theater", "The Mid", "Grant Park"];
const venueAddresses = ["329 N Dearborn St, Chicago, IL 60654", "175 N State St, Chicago, IL 60601", "306 N Halsted St, Chicago, IL 60661"];
const userFirstNames = ["Bill", "Stacy", "Tom"];
const userLastNames = ["Gates", "Johnson", "Smith"];
const userEmails = ["pinkertons@gmail.com", "coffeeisgood@yahoo.com", "rustictoenails@gmail.com"];

export function generateInitialState() {
    let venues = [];
    let events = [];
    let tickets = [];
    let orders = [];
    let users = [];
    let items = Map();
    let groups = Map();

    // for (let i = 0; i < numOfUsers; i++) {
    //     users.push({
    //         id: generateId(),
    //         firstName: userFirstNames[i % userFirstNames],
    //         lastName: userLastNames[i % userLastNames],
    //         email: userEmails[i % userEmails]
    //     })
    // }
    //
    // for (let i = 0; i < numOfVenues; i++) {
    //     venues.push({
    //         id: generateId(),
    //         name: venueNames[i % venueNames.length],
    //         address: venueAddresses[i % venueAddresses.length]
    //     });
    // }
    //
    // for (let i = 0; i < numOfEvents; i++) {
    //     // let ticket_ids = getIds(tickets.slice(i * numOfTicketsPerEvent, (i * numOfTicketsPerEvent) + numOfTicketsPerEvent));
    //
    //     events.push({
    //         id: generateId(),
    //         name: eventNames[i % eventNames.length],
    //         venue: venues[i % venues.length].id
    //     });
    // }
    //
    // for (let i = 0; i < numOfEvents * numOfTicketsPerEvent; i++) {
    //     // let order_ids = getIds(orders.slice(i * numOfOrdersPerTicket, (i * numOfOrdersPerTicket) + numOfOrdersPerTicket));
    //
    //     tickets.push({
    //         id: generateId(),
    //         ticketType: i % 2 == 0 ? 'vip' : 'general',
    //         event: events[i % events.length].id
    //     });
    // }
    //
    // for (let i = 0; i < (numOfEvents * numOfTicketsPerEvent * numOfOrdersPerTicket); i++) {
    //     const order_type = randomBuyOrSell();
    //
    //     orders.push({
    //         id: generateId(),
    //         orderType: order_type,
    //         price: order_type == "buy" ? randomFloat(minPrice, medianPrice) : randomFloat(medianPrice, maxPrice),
    //         ticket: tickets[i % tickets.length].id,
    //         user: users[i % users.length].id
    //     });
    // }
    let venueId = generateId();
    const eventId = 'abcdefg';
    const ticketId = 'hijklmn';
    const groupId = generateId();

    items = items.set(eventId, new Item({
        id: eventId,
        model: 'event',
        name: 'test event',
        startDateTime: 1456970400000,
        endDateTime: 1456992000000,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
        venueId_: venueId,
        hash: generateHash(),
        room: generateHash()
    }));

    items = items.set(venueId, new Item({
        id: venueId,
        model: 'venue',
        name: 'The Aragon Ballroom',
        address: '1106 W Lawrence Ave, Chicago, IL 60640',
        phoneNumber: 2241239876,
        hash: generateHash(),
        room: generateHash()

    }));

    items = items.set(ticketId, new Item({
        id: ticketId,
        model: 'ticket',
        ticketType: 'general',
        eventId_: eventId,
        hash: generateHash(),
        groupId: groupId,
        room: generateHash()
    }));

    groups = groups.set(groupId, new Group({
        id: groupId,
        hash: generateHash(),
        model: 'group',
        room: generateHash()
    }));

    for(let i = 0; i < 20; i++){
        const orderType = randomBuyOrSell();
        const id = generateId();

        items = items.set(id, new Item({
            id,
            model: 'order',
            orderType: orderType,
            price: orderType == "buy" ? randomFloat(minPrice, medianPrice) : randomFloat(medianPrice, maxPrice),
            userId_: generateId(),
            ticketId_: ticketId,
            hash: generateHash()
        }));
    }

    winston.debug('Generated seed');

    //TODO - store using item and group classes
    return Map({
        items,
        groups
    });

    // return fromJS({});
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
    let rand = Math.random();

    if (rand < 0.5) {
        return "sell";
    }
    else {
        return "buy";
    }
}