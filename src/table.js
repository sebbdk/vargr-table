const Koa = require('koa');
const Router = require('koa-router');
const websockify = require('koa-websocket');

const actions =  require('./actions');

module.exports =  function sock(dbi) {
    const subscriptions = {};
    const router = new Router();
    const app = websockify(new Koa());

    router.get(`/:collectionName`, ctx => {
        const collectionName = ctx.params.collectionName;

        actions.subAction(collectionName, dbi, ctx.websocket, null, subscriptions)

        ctx.websocket.on('message', (rawReq) => {
            const requests = rawReq[0] === "[" ? JSON.parse(rawReq) : [JSON.parse(rawReq)];

            requests.forEach((req) => {
                actions[req.action + 'Action'](collectionName, dbi, ctx.websocket, req, subscriptions);
            });
        });

        ctx.websocket.on('close', () => {
            actions.unsubAction(collectionName, dbi, ctx.websocket, null, subscriptions)
        });
    });

    app.ws.use(router.routes());
    return app;
}