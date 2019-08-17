const Koa = require('koa');
const Router = require('koa-router');
const websockify = require('koa-websocket');
const uuid = require("uuid/v4");

const { connectionActions } = require('./store/connection.reducer')
const { tableActions } = require('./store/table.reducer');
const { timesyncActions } = require('./store/effects');
const tableStore = require('./store/table.store');

// @TODO, Table domains

// @TODO, How to auth?
// @TODO, Binary data events?

// @TODO, Reducer sharing???
// @TODO, API exploration, how?


const allowedActions = [ // @TODO allowed actions
    ...Object.values(tableActions),
    ...Object.values(timesyncActions)
];

module.exports = function ({ initialState = {}, reducers = {}, effects = [], pingInterval = 30000 }) {
    const router = new Router();
    const app = websockify(new Koa());
    let serverInstance;

    const store = tableStore({ initialState, reducers, effects, ws: app.ws })

    router.get(`/`, ctx => {
        ctx.websocket.uuid = uuid();

        store.dispatch({
            type: connectionActions.OPEN,
            socket: ctx.websocket
        });

        ctx.websocket.on('message', (rawReq) => {
            const req = JSON.parse(rawReq);

            const allowed = allowedActions.reduce((acc, curr) => {
                return acc || (req.type.indexOf(curr) > -1)
            }, false)

            if(allowed) {
                store.dispatch({
                    type: req.type ? req.type : 'message',
                    data: req.data ? req.data : rawReq,
                    socket: ctx.websocket
                });
            }
        });

        ctx.websocket.on('pong', () => {
            ctx.websocket.isAlive = true;
        });

        ctx.websocket.on('close', () => {
            return store.dispatch({
                type: connectionActions.CLOSE,
                data: { socket: ctx.websocket },
                socket: ctx.websocket
            });
        });
    });

    const interval = setInterval(() => {
        if (!app.ws.server) {
            return;
        }

        app.ws.server.clients.forEach(function each(ws) {
            if (ws.isAlive === false) {
                return store.dispatch({ type: 'close', data: { socket: ws } });
            }

            ws.isAlive = false;
            ws.ping();
        });
    }, pingInterval);

    function kill() {
        serverInstance.close();
        clearInterval(interval);
    }

    function listen(port) {
        serverInstance = app.listen(port);
        return serverInstance;
    }

    app.ws.use(router.routes());

    return { server: app, store, kill, listen };
}