import {createStore, applyMiddleware} from 'redux';
import {generateInitialState} from '../seed';
import thunk from 'redux-thunk';

import reducer from './reducer';

export default function makeStore() {
    return createStore(
        reducer,
        generateInitialState(),
        applyMiddleware(thunk)
    );
}