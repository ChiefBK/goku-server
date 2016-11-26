import Server from 'socket.io';

export function startServer(store) {
    const port = 8888;
    const io = new Server().attach(port);

    console.log("Socket.io server running - http://localhost:" + port);

    store.subscribe(() => {
        console.log("Server store has been updated");
        console.log("State: ");
        console.log(store.getState().toJS());
        io.emit('state', store.getState().toJS());
    });

    io.on('connection', (socket) => {
        console.log("New connection on socket: " + socket.id);

        socket.emit('state', store.getState().toJS());
        socket.on('action', store.dispatch.bind(store));
    });
}