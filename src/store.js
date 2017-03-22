import {createStore, applyMiddleware} from 'redux';
import {generateInitialState} from '../seed';
import thunk from 'redux-thunk';
import {combineReducers} from 'redux-immutable';
import {eventReducer, userReducer} from 'en3-common';
import {Map} from 'immutable';


const reducers = combineReducers({
    events: eventReducer,
    users: userReducer
});

export default function makeStore() {
    const store = createStore(
        reducers,
        Map(),
        applyMiddleware(thunk)
    );

    generateInitialState(store);

    return store;
}