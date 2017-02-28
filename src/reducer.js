import {combineReducers} from 'redux-immutable';
import {
    INITIAL_STATE_MAP
} from './core';
import {fromJS} from 'immutable';
import {generateHash, pretty} from './util';
import winston from 'winston';
import {Item} from 'en3-common';

function items(itemState = INITIAL_STATE_MAP, action) {
    switch (action.type) {
        case 'CREATE_UPDATE_ITEM':
            winston.silly(`Creating item: ${pretty(action.item)}`);
            return itemState.set(action.item.id, new Item(action.item));
        case 'DELETE_ITEM':
            return itemState.delete(action.itemId);
        case 'REGENERATE_ITEM_HASH':
            return itemState.setIn([action.itemId, 'hash'], generateHash());
    }

    return itemState;
}

const reducers = combineReducers({
    items
});

export default reducers;