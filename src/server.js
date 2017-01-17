import SocketIO from 'socket.io';
import path from 'path';
import http from 'http';
import Express from 'express';
import Morgan from 'morgan';
import winston from 'winston';
import {fromJS} from 'immutable';

import {handleRead, handleCreate} from './action';
import {readOrders} from './core';
import {pretty} from './util';

export function startServer(store, client_dist) {
    const app = Express();
    const router = Express.Router();
    const server = http.createServer(app);

    const port = 8888;
    const io = SocketIO.listen(server);

    router.use(Morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));

    router.use(Express.static(client_dist));

    router.get('*', (req, res) => {
        const indexPath = client_dist + '/index.html';
        res.sendFile(indexPath);
    });

    app.use(router);

    server.listen(port, function () {
        winston.info(`Socket.io server running - http://localhost:${port}`);

        store.subscribe(() => {
            winston.debug('Server store has been updated');
            // io.emit('state', store.getState().toJS());
        });

        //TODO - convert request to immutable map
        io.on('connection', (socket) => {
            winston.debug(`New connection on socket: ${socket.id}`);

            socket.emit('state', store.getState().toJS());

            socket.on('read', (request) => {
                winston.debug(`Received read event: ${pretty(request)}`);
                store.dispatch(handleRead(socket, request));

            });

            socket.on('create', (request) => {
                winston.debug(`Received create event: ${pretty(request)}`);
                store.dispatch(handleCreate(io, socket, fromJS(request)));
            });

            socket.on('update', (request) => {
                winston.debug(`Received update event: ${pretty(request)}`);


            });

            socket.on('delete', (request) => {
                winston.debug(`Received delete event: ${pretty(request)}`);

            });

        });
    });

}