import {combineReducers} from 'redux-immutable';
import {
    INITIAL_STATE_MAP
} from './core';

function items(itemState = INITIAL_STATE_MAP, action) {
    switch (action.type) {
        case 'CREATE_ITEM':
            return itemState.set(action.item.id, action.item);
        case 'UPDATE_ITEM':
        case 'DELETE_ITEM':
    }

    return itemState;
}

function groups(groupState = INITIAL_STATE_MAP, action) {
    switch (action.type) {
        case 'CREATE_GROUP':
        case 'CREATE_GROUP':
        case 'CREATE_GROUP':
    }

    return groupState;
}

const reducers = combineReducers({
    items,
    groups
});

export default reducers;