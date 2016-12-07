import SocketIO from 'socket.io';
import path from 'path';
import http from 'http';
import Express from 'express';
import Morgan from 'morgan';

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
        console.log("Socket.io server running - http://localhost:" + port);

        store.subscribe(() => {
            console.log("Server store has been updated");
            io.emit('state', store.getState().toJS());
        });

        io.on('connection', (socket) => {
            console.log("New connection on socket: " + socket.id);

            socket.emit('state', store.getState().toJS());
            socket.on('action', (action, callback) => {
                console.log("Recieved action event");
                console.log(action);
                store.dispatch(action);

                console.log("Finished dispatching action");
                console.log(store.getState().get('orders').toJS());
                callback(action);
            });
        });
    });

}