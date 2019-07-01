const { performance } = require('perf_hooks');

module.exports = {
    publicEffect: ({ action, dispatch, getState, websocket, ws}) => {
        switch(action.type) {
            case 'open':
                return websocket.send(JSON.stringify({
                    type: 'public:set',
                    data:getState(),
                    time: performance.now()
                }));
            case 'public:add':
            case 'public:set':
                return ws.server.clients.forEach(function each(client) {
                    if(client !== websocket) {
                        client.send(JSON.stringify({ ...action, time: performance.now() }));
                    }
                });
            case 'public:add:all':
            case 'public:set:all':
                return ws.server.clients.forEach(function each(client) {
                    client.send(JSON.stringify({ ...action, time: performance.now() }));
                });
        }
    },
    timesyncEffect: ({ action, dispatch, getState, websocket, ws}) => {
        switch(action.type) {
            case 'get:time': {
                websocket.send(JSON.stringify({
                    type: 'get:time',
                    data: {
                        time: performance.now()
                    }
                }));
            }
        }
    }
};