module.exports = class {
    constructor(url, protocols = []) {
        this.socket = new WebSocket(url, protocols);
    }
}