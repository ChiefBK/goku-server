// export function queryState(state, query) {
//     winston.silly(`Reading from state with query ${pretty(query)}`);
//     return state.get('items').filter((item) => {
//         return item.matchesQuery(query);
//     }).toList();
// }

export function getUser(state, id, tier = 'full') {
    return state.getIn(['users', id]);
}

export function getEvent(state, id, tier = 'full') {
    const event = state.getIn(['event', id]);
    if (tier === 'full')
        return event;
    else { // return event without orders
        return event.get('tickets').reduce((acc, val) => {
            return acc.deleteIn(['tickets', val.get('id'), 'orders']);
        }, event);
    }
}

// export function createUpdateEvent(eventId, payload){
//     return {
//         eventId,
//         payload
//     }
// }
//
// export function createDeleteEvent(eventId, itemId){
//     return {
//         eventId,
//         payload: {
//             id: itemId
//         }
//     }
// }