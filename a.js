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


const t = createTable({ initialState, reducer: appReducer, effects });
t.server.listen(8000);