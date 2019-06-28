module.exports = function(state, action) {
    switch(action.type) {
        case 'open': {
            return {
                ...state,
                sockets: [...state.sockets, action.data.socket.uuid]
            }
        }
    }

    return state;
}