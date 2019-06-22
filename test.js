const createAgent = require('./src/agent');
const createTable = require('./src/table');

const initialState = {}
const effects = [];
function appReducer(currentState, action) {
    return currentState;
}

describe(`Test API methods`, () => {
    let table = null;
    let agent01 = null;
    let agent02 = null;

    beforeAll(async () => {
        table = createTable({ initialState, reducer: appReducer, effects });
        table.listen(8500);

        agent01 = createAgent("wss://localhost:8500", ["protocolOne", "protocolTwo"]);
        agent02 = createAgent("wss://localhost:8500", ["protocolOne", "protocolTwo"]);
    });

    it('can connect', async () => {

    });
});