module.exports = class {
    constructor(url, protocols = []) {
        this.url = url;
        this.protocols = protocols;
    }

    connect() {
        return new Promise(resolve => {
            this.socket = new WebSocket(this.url, this.protocols);
            this.socket.onerror = e => this.onError(e);
            this.socket.onmessage = e => this.onMessage(e.data);
            this.socket.onclose = e => this.onClose(e);
            this.socket.onopen = e => {
                resolve();
                this.onOpen(e);
                //this.socket.onopen = f => { this.onOpen(f) };
            };
        })
    }

    send(data) {
        try {
            this.socket.send(JSON.stringify(data));
        } catch(err) {
            console.error(err)
        }
    }

    destroy() {
        this.socket && this.socket.close();
        this.socket = undefined;
        this.onMessage = () => {}
    }

    onOpen(e) {
        //console.log('Agent connection now open');
    }

    onMessage(msg) {
        //console.log('Agent msg', msg);
    }

    onError(errEvt) {
        console.log('Agent err', errEvt, errEvt.isTrusted);
    }

    onClose() {
        //console.log('Agent connection close');
    }
}