import SocketIO from 'socket.io';
import http from 'http';
import Express from 'express';
import Morgan from 'morgan';
import winston from 'winston';

import {handleQuery, handleCreate, handleRead, handleUpdate, handleDelete, handleAuth} from './action';
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

        io.on('connection', (socket) => {
            winston.debug(`New connection on socket: ${socket.id}`);

            socket.emit('state', store.getState().toJS());

            socket.on('read', (event) => {
                winston.debug(`Received read event: ${pretty(event)}`);
                store.dispatch(handleRead(socket, event))
            });

            socket.on('query', (event) => {
                winston.debug(`Received query event: ${pretty(event)}`);
                store.dispatch(handleQuery(socket, event));

            });

            socket.on('create', (event) => {
                winston.debug(`Received create event: ${pretty(event)}`);
                store.dispatch(handleCreate(io, socket, event));

            });

            socket.on('update', (event) => {
                winston.debug(`Received update event: ${pretty(event)}`);
                store.dispatch(handleUpdate(io, socket, event));

            });

            socket.on('delete', (event) => {
                winston.debug(`Received delete event: ${pretty(event)}`);
                store.dispatch(handleDelete(io, socket, event));
            });

            socket.on('auth', (event) => {
                winston.debug(`Received auth event: ${pretty(event)}`);
                store.dispatch(handleAuth(io, socket, event));
            });

        });
    });

}