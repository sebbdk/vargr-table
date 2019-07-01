const Agent = require('./src/agent');
const createTable = require('./src/table');

const initialState = {
    clientState: {
        cakes: [
            {type: 'cheese', name: 'chuck'},
            {type: 'flower', name: 'mac'}
        ]
    }
}
let testEffect = ({ action, dispatch, getState, websocket, ws}) => {}
const effects = [
    (arg) => {
        testEffect(arg);
    }
];
function appReducer(currentState, action) {
    return currentState;
}

describe(`Test table`, () => {
    let table = null;
    let listenRef = null;
    let agent01 = null;
    let agent02 = null;

    beforeAll(async () => {
        table = createTable({ initialState, customReducer: appReducer, effects, pingInterval: 500 });
        listenRef = table.listen(8500);

        agent01 = new Agent("ws://localhost:8500", ["protocolOne", "protocolTwo"]);
        agent02 = new Agent("ws://localhost:8500", ["protocolOne", "protocolTwo"]);
    });

    afterEach(() => {
        agent01.destroy();
        agent02.destroy();
    });

    afterAll(() => {
        table.kill();
    });

    it('Agents can connect', done => {
        let a = 0;
        testEffect = ({ action, dispatch, getState, websocket, ws}) => {
            expect(getState().sockets[0]).not.toEqual(undefined);
            a++ && a == 2 && done();
        };

        agent01.connect().then(() => {
            a++ && a == 2 && done();
        });
    });

    it('Agents can set arbitrary state', done => {
        agent01.connect().then(() => {
            testEffect = ({ action, dispatch, getState, websocket, ws}) => {
                if(action.type === 'public:set:all') {
                    expect(getState().clientState.helloworld).toEqual(true);
                    expect(getState().clientState.abc).toEqual('cake is great');

                    done();
                }
            };

            agent01.send({
                type: 'public:set:all',
                data: {
                    helloworld: true,
                    abc: 'cake is great'
                }
            });
        }).catch(e => console.log('!!!!', e))
    });

    it('Agents recieve public:set with current public state on connect', done => {
        agent01.onMessage = (msg) => {
            const pmsg = JSON.parse(msg);
            expect(pmsg.type).toEqual('public:set');
            done();
        }
        agent01.connect();
    });

    it('All agents recieve public:set:all events', done => {
        let c = 0;

        agent01.connect().then(() => {
            agent02.connect().then(() => {
                const originalMsg = {
                    type: 'public:set:all',
                    data: { helloworld: true, bark: 123 }
                };

                agent02.onMessage = (msg) => {
                    const pmsg = JSON.parse(msg);
                    expect(pmsg.data.helloworld).toEqual(true);
                    c += 1;
                    if(c == 1.5) {
                        done();
                    }
                }
                agent01.onMessage = (msg) => {
                    const pmsg = JSON.parse(msg);
                    expect(pmsg.data.helloworld).toEqual(true);
                    c += 0.5;
                    if(c == 1.5) {
                        done();
                    }
                }
                agent01.send(originalMsg);
            }).catch(e => console.log('Error:', e.toString()))
        }).catch(e => console.log('Error:', e))
    });

    it('Only other agents than sender recieve public:set events', done => {
        agent01.connect().then(() => {
            agent02.connect().then(() => {
                const originalMsg = {
                    type: 'public:set',
                    data: {
                        helloworld: true
                    }
                };

                agent02.onMessage = (msg) => {
                    const pmsg = JSON.parse(msg);
                    expect(pmsg.data.helloworld).toEqual(true);
                    done();
                }

                agent01.onMessage = (msg) => {
                    expect(true).toEqual(false);
                }

                agent01.send(originalMsg);
            }).catch(e => console.log('Error:', e.toString()))
        }).catch(e => console.log('Error:', e))
    });

    it('can use public:add to add objects to arrays', done => {
        agent01.connect().then(() => {
            agent02.connect().then(() => {
                const originalMsg = {
                    type: 'public:add',
                    data: {
                        cakes: [ {type: 'flower', name: 'mac'} ]
                    }
                };

                agent02.onMessage = (msg) => {
                    const pmsg = JSON.parse(msg);
                    expect(pmsg.data.cakes[0].name).toEqual('mac')
                    done();
                }

                agent01.onMessage = (msg) => {
                    expect(true).toEqual(false);
                }

                agent01.send(originalMsg);
            }).catch(e => console.log('Error:', e.toString()))
        }).catch(e => console.log('Error:', e))
    });

    it('can use public:add:all to add objects to arrays', done => {
        let c = 0;

        agent01.connect().then(() => {
            agent02.connect().then(() => {
                const originalMsg = {
                    type: 'public:add:all',
                    data: {
                        cakes: [ {type: 'flower', name: 'mac'} ]
                    }
                };

                agent02.onMessage = (msg) => {
                    const pmsg = JSON.parse(msg);
                    expect(pmsg.data.cakes[0].name).toEqual('mac')
                    c += 1;
                    if(c == 1.5) {
                        done();
                    }
                }
                agent01.onMessage = (msg) => {
                    const pmsg = JSON.parse(msg);
                    expect(pmsg.data.cakes[0].name).toEqual('mac')
                    c += 0.5;
                    if(c == 1.5) {
                        done();
                    }
                }
                agent01.send(originalMsg);
            }).catch(e => console.log('Error:', e.toString()))
        }).catch(e => console.log('Error:', e))
    });

    it('Will ping clients to ensure active connection', done => {
        agent01.connect().then(() => {
            expect(table.ws.server.clients.size).toEqual(1)
            agent01.destroy();

            setTimeout(() => {
                expect(table.ws.server.clients.size).toEqual(0)
                done();
            }, 1000)
        }).catch(e => console.log('Error:', e))
    });

    it('Can send time to clients', done => {
        agent01.connect().then(() => {
            const originalMsg = {
                type: 'get:time',
                data: {}
            };

            agent01.onMessage = (msg) => {
                const pmsg = JSON.parse(msg);
                expect(pmsg.type).toEqual('get:time');
                expect(typeof(pmsg.data.time)).toEqual('number');
                done();
            }

            agent01.send(originalMsg);
        }).catch(e => console.log('Error:', e))
    });

    it('Will add time to public messages send to clients', done => {
        agent01.connect().then(() => {
            const originalMsg = {
                type: 'public:set:all',
                data: {
                    helloworld: true,
                    abc: 'cake is great'
                }
            };

            agent01.onMessage = (msg) => {
                const pmsg = JSON.parse(msg);
                expect(typeof(pmsg.time)).toEqual('number');
                done();
            }

            agent01.send(originalMsg);
        }).catch(e => console.log('Error:', e));
    });
});