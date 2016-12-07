import {startServer} from './src/server';
import makeStore from './src/store';
import path from 'path';

const client_dist = path.resolve(__dirname, '..', 'goku-client', 'dist');
console.log(client_dist);

const store = makeStore();
startServer(store, client_dist);