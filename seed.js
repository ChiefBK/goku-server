import {fromJS} from 'immutable';

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

    for (let i = 0; i < numOfVenues; i++) {
        venues.push({
            id: generateId(),
            name: venueNames[i % venueNames.length],
            address: venueAddresses[i % venueAddresses.length]
        });
    }

    for (let i = 0; i < (numOfEvents * numOfTicketsPerEvent * numOfOrdersPerTicket); i++) {
        const order_type = randomBuyOrSell();

        orders.push({
            id: generateId(),
            order_type: order_type,
            price: order_type == "BUY" ? randomFloat(minPrice, medianPrice) : randomFloat(medianPrice, maxPrice)
        });
    }

    for (let i = 0; i < numOfEvents * numOfTicketsPerEvent; i++) {
        let order_ids = getIds(orders.slice(i * numOfOrdersPerTicket, (i * numOfOrdersPerTicket) + numOfOrdersPerTicket));

        tickets.push({
            id: generateId(),
            ticket_type: i % 2 == 0 ? 'VIP' : 'GENERAL', //TODO - if numOfTicketPerEvent changes make sure ticket types are split amongst events evenly
            orders: order_ids
        });
    }

    for (let i = 0; i < numOfEvents; i++) {
        let ticket_ids = getIds(tickets.slice(i * numOfTicketsPerEvent, (i * numOfTicketsPerEvent) + numOfTicketsPerEvent));

        events.push({
            id: generateId(),
            name: eventNames[i % eventNames.length],
            venue: venues[i % venues.length].id,
            tickets: ticket_ids
        });
    }

    for(let i = 0; i < numOfUsers; i++){
        users.push({
            id: generateId(),
            firstName: userFirstNames[i % userFirstNames],
            lastName: userLastNames[i % userLastNames],
            email: userEmails[i % userEmails]
        })
    }

    return fromJS({
        venues: venues,
        orders: orders,
        tickets: tickets,
        events: events,
        users: users
    })
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
    return (min + (Math.random() * (max - min))).toFixed(2);
}

function randomBuyOrSell() {
    let rand = Math.random();

    if (rand < 0.5) {
        return "SELL";
    }
    else {
        return "BUY";
    }
}