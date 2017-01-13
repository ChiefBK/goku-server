import {startServer} from './src/server';
import makeStore from './src/store';
import path from 'path';
import {toJS} from 'immutable';
import winston from 'winston';

import {pretty} from './src/util';

winston.configure({
    transports: [
        new (winston.transports.Console)({
            timestamp: true,
            colorize: true,
            level: 'debug'
        })
    ]
});

const client_dist = path.resolve(__dirname, '..', 'goku-client', 'dist');
winston.debug(`Client directory: ${client_dist}`);

const store = makeStore();
winston.info('Finished making store');
winston.debug(`Initial state of store: ${pretty(store.getState().toJS())}`);
startServer(store, client_dist);
winston.info('Started server');