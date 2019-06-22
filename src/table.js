const Koa = require('koa');
const Router = require('koa-router');
const websockify = require('koa-websocket');

module.exports = function sock({ initialState, customReducer, effects }) {
    let currentAppAtate = initialState;
    const dispatchedActions = [];
    const router = new Router();
    const app = websockify(new Koa());

    function getState() {
        return states[states.length-1];
    }

    function updateState(state) {
        if (getState() !== state) {
            currentAppAtate = state;
        }
    }

    function dispatch(action, websocket) {
        dispatchedActions.push(action);
        const currentState = getState();

        updateState(connectionReducer(currentState, action));
        updateState(customReducer(getState(), action));

        if (currentState !== getState()) {
            effects.forEach(e => e({ action, dispatch, getState, websocket, ws: app.ws }));
        }
    }

    router.get(`/`, ctx => {
        ctx.websocket.on('open', () => {
            dispatch({
                type: 'message',
                data: JSON.parse(rawReq)
            }, ctx.websocket);
        });

        ctx.websocket.on('message', (rawReq) => {
            dispatch({
                type: 'message',
                data: JSON.parse(rawReq)
            }, ctx.websocket);
        });

        ctx.websocket.on('close', () => {
            dispatch({ type: 'close' }, ctx.websocket);
        });
    });

    app.ws.use(router.routes());

    return app;
}