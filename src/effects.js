module.exports = {
    publicEffect: ({ action, dispatch, getState, websocket, ws}) => {
        if(action.type === 'public_set') {
            ws.server.clients.forEach(function each(client) {
                client.send(JSON.stringify(action));
            });
        }
    }
};