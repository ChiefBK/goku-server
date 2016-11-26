import {createStore} from 'redux';
import {generateInitialState} from '../seed';

import reducer from './reducer';

export default function makeStore() {
    return createStore(reducer, generateInitialState());
}