const tableActions = {
    ADD: 'public:add',
    ADD_ALL: 'public:add:all',
    CURRENT: 'public:current',
    SET: 'public:set',
    SET_ALL: 'public:set:all',
}

function createTableReducer(prefix = '') {
    return function(state = {}, action) {
        switch(action.type) {
            case prefix+tableActions.ADD:
            case prefix+tableActions.ADD_ALL:
                const newState = { ...state }

                Object.keys(action.data).forEach(k => {
                    if (newState[k] && Array.isArray(newState[k])) {
                        newState[k] = [
                            ...newState[k],
                            ...action.data[k]
                        ];
                    } else {
                        newState[k] = typeof(newState[k]) === 'object'
                                            ? { ...newState[k], ...action.data[k] }
                                            : action.data[k];
                    }
                });

                return { ...state, newState }
            case prefix+tableActions.SET:
            case prefix+tableActions.SET_ALL:
                return {
                    ...state,
                    ...action.data
                }
            default:
                return state;
          }
    }
}

module.exports = {
    table: createTableReducer(),
    createTableReducer,
    tableActions
}