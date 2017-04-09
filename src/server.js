import SocketIO from "socket.io";
import http from "http";
import Express from "express";
import Morgan from "morgan";
import winston from "winston";
import {handleCreateEvent, handleCreateUser, handleReadEvent, handleReadUser} from "en3-common";
import {handleAuth} from "./actions/auth";
import {pretty} from "./util";

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

            socket.on('read-user', (event) => {
                winston.debug(`Received read-user event: ${pretty(event)}`);
                store.dispatch(handleReadUser(event, socket, io))
            });

            socket.on('read-event', (event) => {
                winston.debug(`Received read-event event: ${pretty(event)}`);
                store.dispatch(handleReadEvent(event, socket, io));
            });

            socket.on('create-event', (event) => {
                winston.debug(`Received create-event event: ${pretty(event)}`);
                store.dispatch(handleCreateEvent(event, socket, io));
            });

            socket.on('create-user', (event) => {
                winston.debug(`Received create-event event: ${pretty(event)}`);
                store.dispatch(handleCreateUser(event, socket, io));
            });

            socket.on('auth', (event) => {
                winston.debug(`Received auth event: ${pretty(event)}`);
                store.dispatch(handleAuth(event, socket, io));
            });

        });
    });

}