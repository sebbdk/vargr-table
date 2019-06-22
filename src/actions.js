function dispatchMessage(msg, collectionName, subscriptions, ignore = []) {
    if (subscriptions[collectionName]) {
        subscriptions[collectionName].forEach((sock) => {
            if (ignore && ignore.indexOf(sock) === -1) {
                sock.send(JSON.stringify(msg));
            }
        });
    }
}

function handleDisconnect(collectionName, dbi, sock, message) {}

const actions = {
    addAction: async (collectionName, dbi, sock, req, subs) => {
        const resData = await dbi.create(collectionName, req);
        dispatchMessage({
            action: req.action,
            data: resData
        }, collectionName, subs);
    },
    updateAction: async (collectionName, dbi, sock, req, subs) => {
        const method = Array.isArray(req.data) ? 'updateMany' : 'updateOne';
        const resData = await dbi[method](collectionName, req);
        dispatchMessage({
            action: req.action,
            data: resData
        }, collectionName, subs);
    },
    deleteAction: async (collectionName, dbi, sock, req, subs) => {
        const resData = await dbi.delete(collectionName, req);
        dispatchMessage({
            action: req.action,
            data: {
                where: req.where
            }
        }, collectionName, subs);
    },
    pingAction: async (collectionName, dbi, sock, req, subs) => {
        sock.send(JSON.stringify({
            action: req.action,
            data: {
                servertime: performance.now(),
                clienttime: req.clienttime
            }
        }));
    },
    subAction: (collectionName, dbi, sock, message, subs) => {
        if (!subs[collectionName]) {
            subs[collectionName] = [];
        }
        subs[collectionName].push(sock);
    },
    unsubAction: (collectionName, dbi, sock, message, subs) => {
        if (!subs[collectionName]) {
            subs[collectionName] = [];
        }
        subs[collectionName] = subs[collectionName].filter((s) => s != sock);
    }
}
