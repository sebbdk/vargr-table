const Agent = require('./src/agent');
const createTable = require('./src/table');

const initialState = {}
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
        table = createTable({ initialState, customReducer: appReducer, effects });
        listenRef = table.server.listen(8500);

        agent01 = new Agent("ws://localhost:8500", ["protocolOne", "protocolTwo"]);
        agent02 = new Agent("ws://localhost:8500", ["protocolOne", "protocolTwo"]);
    });

    afterEach(() => {
        agent01.destroy();
        agent02.destroy();
    });

    afterAll(() => {
        listenRef.close()
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
                if(action.type === 'public_set') {
                    expect(getState().clientState.helloworld).toEqual(true);
                    expect(getState().clientState.abc).toEqual('cake is great');

                    done();
                }
            };

            agent01.send({
                type: 'public_set',
                data: {
                    helloworld: true,
                    abc: 'cake is great'
                }
            });
        }).catch(e => console.log('!!!!', e))
    });

    it('All agents recieve change events', done => {
        let c = 0;

        agent01.connect().then(() => {
            agent02.connect().then(() => {
                const originalMsg = {
                    type: 'public_set',
                    data: { helloworld: true, bark: 123 }
                };

                agent02.onMessage = (msg) => {
                    expect(msg).toEqual(JSON.stringify(originalMsg))
                    c += 1;
                    if(c == 1.5) {
                        done();
                    }
                }
                agent01.onMessage = (msg) => {
                    expect(msg).toEqual(JSON.stringify(originalMsg))
                    c += 0.5;
                    if(c == 1.5) {
                        done();
                    }
                }
                agent01.send(originalMsg);
            }).catch(e => console.log('Error:', e.toString()))
        }).catch(e => console.log('Error:', e))
    });
});