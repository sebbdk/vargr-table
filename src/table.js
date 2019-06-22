const Koa = require('koa');
const Router = require('koa-router');
const websockify = require('koa-websocket');

module.exports = function sock({ initialState, customReducer, effects }) {
    const states = [ initialState ];
    const router = new Router();
    const app = websockify(new Koa());

    function getState() {
        return states[states.length-1];
    }

    function updateState(state) {
        if (getState() !== state) {
            states.push(state);
        }
    }

    function dispatch(action, websocket) {
        const currentStateLength = states.length;

        updateState(connectionReducer(currentState, action));
        updateState(customReducer(getState(), action));

        if (currentStateLength !== states.length) {
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