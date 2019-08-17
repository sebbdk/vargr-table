const connectionActions = {
    OPEN: 'connection:open',
    CLOSE: 'connection:close'
}

function connection(state = { sockets: [] }, action) {
    switch(action.type) {
        case connectionActions.OPEN: {
            return {
                ...state,
                sockets: [...state.sockets, action.socket.uuid]
            }
        }
        case connectionActions.CLOSE: {
            action.data.socket.terminate();

            return {
                ...state,
                sockets: state.sockets.filter(a => a !== action.data.socket.uuid)
            }
        }
    }

    return state;
}

module.exports = {
    connectionActions,
    connection
}