module.exports = function(state, action) {
    switch(action.type) {
        case 'open': {
            return {
                ...state,
                sockets: [...state.sockets, action.data.socket.uuid]
            }
        }
        case 'close': {
            action.data.socket.terminate();

            return {
                ...state,
                sockets: state.sockets.filter(a => a !== action.data.socket.uuid)
            }
        }
    }

    return state;
}