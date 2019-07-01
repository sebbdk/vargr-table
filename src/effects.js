const { performance } = require('perf_hooks');

module.exports = {
    publicEffect: ({ action, dispatch, getState, websocket, ws}) => {
        switch(action.type) {
            case 'public:add':
            case 'public:set':
                ws.server.clients.forEach(function each(client) {
                    if(client !== websocket) {
                        client.send(JSON.stringify({ ...action, time: performance.now() }));
                    }
                });
                break;
            case 'public:add:all':
            case 'public:set:all':
                ws.server.clients.forEach(function each(client) {
                    client.send(JSON.stringify({ ...action, time: performance.now() }));
                });
                break;
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