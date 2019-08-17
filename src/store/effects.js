const { performance } = require('perf_hooks');
const { tableActions } = require('./table.reducer');
const { connectionActions } = require('./connection.reducer');

const timesyncActions = {
    GET_TIME: 'get:time'
};

module.exports = {
    timesyncActions,
    tableEffect: ({ action, dispatch, getState, ws}) => {
        switch(action.type) {
            case connectionActions.OPEN:
            case tableActions.CURRENT:
                return action.socket.send(JSON.stringify({
                    type: tableActions.SET,
                    data: getState().clientState,
                    time: performance.now()
                }));
            case tableActions.ADD:
            case tableActions.SET:
                return ws.server.clients.forEach(function each(client) {
                    if(client !== action.socket) {
                        client.send(JSON.stringify({ ...action, time: performance.now() }));
                    }
                });
            case tableActions.ADD_ALL:
            case tableActions.SET_ALL:
                return ws.server.clients.forEach(function each(client) {
                    client.send(JSON.stringify({ ...action, time: performance.now() }));
                });
        }
    },
    timesyncEffect: ({ action, dispatch, getState, ws}) => {
        switch(action.type) {
            case timesyncActions.GET_TIME: {
                action.socket.send(JSON.stringify({
                    type: timesyncActions.GET_TIME,
                    data: {
                        time: performance.now()
                    }
                }));
            }
        }
    }
};