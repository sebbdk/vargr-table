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

    afterAll(() => {
        agent01.destroy();
        listenRef.close()
    });

    it('Agents can connect', done => {
        testEffect = ({ action, dispatch, getState, websocket, ws}) => {
            expect(getState().sockets[0]).not.toEqual(undefined);
            done();
        };

        agent01.connect();
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

    it('Agents recieve change events', done => {
        agent01.connect().then(() => {
            agent01.send({
                type: 'public_set',
                data: {
                    helloworld: true,
                    abc: 'cake is great'
                }
            });

            agent01.onMessage = () => {
                console.log('!!!')
                done();
            }

        }).catch(e => console.log('!!!!', e))
    });
});