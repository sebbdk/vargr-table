module.exports = function(state, action) {
    switch(action.type) {
        case 'public_set': {
            return {
                ...state,
                clientState: {
                    ...state.clientState,
                    ...action.data
                }
            }
        }
    }

    return state;
}