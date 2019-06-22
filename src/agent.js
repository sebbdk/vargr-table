module.exports = class {
    constructor(url, protocols = []) {
        this.url = url;
        this.protocols = protocols;
    }

    connect() {
        this.socket = new WebSocket(url, protocols);
    }

    send() {}
    destroy() {}

    onOpen() {}
    onMessage() {}
    onError() {}
    onClose() {}
}