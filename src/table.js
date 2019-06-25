const Koa = require('koa');
const Router = require('koa-router');
const websockify = require('koa-websocket');

const connectionReducer = require('./connection.reducer'); 
const publicReducer = require('./public.reducer');
const { publicEffect } = require('./effects');

module.exports = function ({ initialState = {}, customReducer = () => {}, effects = [] }) {
    const router = new Router();
    const app = websockify(new Koa());

    effects.push(publicEffect);

    let currentAppAtate = {
        ...initialState,
        sockets: []
    };
    const dispatchedActions = [];

    function getState() {
        return currentAppAtate;
    }

    function updateState(state) {
        if (getState() !== state) {
            currentAppAtate = state;
        }
    }

    function dispatch(action, websocket) { 
        dispatchedActions.push(action);
        const currentState = getState();

        updateState(connectionReducer(getState(), action));
        updateState(publicReducer(getState(), action));
        updateState(customReducer(getState(), action));

        if (currentState !== getState()) {
            effects.forEach(e => e({ action, dispatch, getState, websocket, ws: app.ws }));
        }
    }

    router.get(`/`, ctx => {
        dispatch({
            type: 'open',
            data: {
                socket: ctx.websocket
            }
        }, ctx.websocket);

        ctx.websocket.on('message', (rawReq) => {
            const req = JSON.parse(rawReq);

            dispatch({
                type: req.type ? req.type : 'message',
                data: req.data ? req.data : rawReq,
            }, ctx.websocket);
        });

        ctx.websocket.on('close', () => {
            dispatch({ type: 'close' }, ctx.websocket);
        });
    });

    app.ws.use(router.routes());

    return { server: app, dispatch, getState };
}