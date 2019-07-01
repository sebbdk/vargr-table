const Koa = require('koa');
const Router = require('koa-router');
const websockify = require('koa-websocket');
const uuid = require("uuid/v4");

const connectionReducer = require('./connection.reducer'); 
const publicReducer = require('./public.reducer');
const { publicEffect, timesyncEffect } = require('./effects');

module.exports = function ({ initialState = {}, customReducer = a => a, effects = [], pingInterval = 30000 }) {
    const router = new Router();
    const app = websockify(new Koa());
    let serverInstance;

    effects.push(publicEffect);
    effects.push(timesyncEffect);

    let currentAppState = {
        ...initialState,
        sockets: []
    };
    const dispatchedActions = [];

    function getState() {
        return currentAppState;
    }

    function updateState(state) {
        if (getState() !== state) {
            currentAppState = state;
        }
    }

    function dispatch(action, websocket) { 
        dispatchedActions.push(action);
        const currentState = getState();

        updateState(connectionReducer(getState(), action));
        updateState(publicReducer(getState(), action));
        updateState(customReducer(getState(), action));

        //if (currentState !== getState()) {
            effects.forEach(e => e({ action, dispatch, getState, websocket, ws: app.ws }));
        //}
    }

    router.get(`/`, ctx => {
        ctx.websocket.uuid = uuid();

        dispatch({
            type: 'open',
            data: { socket: ctx.websocket}
        }, ctx.websocket);

        ctx.websocket.on('message', (rawReq) => {
            const req = JSON.parse(rawReq);

            dispatch({
                type: req.type ? req.type : 'message',
                data: req.data ? req.data : rawReq,
            }, ctx.websocket);
        });

        ctx.websocket.on('pong', () => {
            ctx.websocket.isAlive = true;
        });

        ctx.websocket.on('close', () => {
            return dispatch({ type: 'close', data:{ socket: ctx.websocket } }, ctx.websocket);;
        });
    });

    const interval = setInterval(function ping() {
        if (!app.ws.server) {
            return;
        }

        app.ws.server.clients.forEach(function each(ws) {
            if (ws.isAlive === false) {
                return dispatch({ type: 'close', data:{ socket: ctx.websocket } }, ctx.websocket);;
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
    }

    app.ws.use(router.routes());

    return { ws: app.ws, server: app, dispatch, getState, kill, listen };
}