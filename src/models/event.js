import {List, Map} from 'immutable';

class Event {
    constructor(eventId, payload = [], support = {}) {
        this.eventId = eventId;
        this.payload = payload;
        this.support = support
    }

    //TODO - create 'group' and 'item' array keys in payload
    appendPayload(object) {
        if (Map.isMap(object)) {
            object = object.toJS();
        }
        this.payload.push(object);
    }

    concatPayload(arr) {
        if (List.isList(arr)) {
            arr = arr.toJS();
        }
        this.payload = this.payload.concat(arr);
    }

    toObject() {
        return {
            eventId: this.eventId,
            payload: this.payload
        }
    }
}

export default Event;