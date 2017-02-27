import {combineReducers} from 'redux-immutable';
import {
    INITIAL_STATE_MAP
} from './core';
import {fromJS} from 'immutable';
import {generateHash} from './util';

function items(itemState = INITIAL_STATE_MAP, action) {
    switch (action.type) {
        case 'CREATE_UPDATE_ITEM':
            return itemState.set(action.item.id, fromJS(action.item));
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