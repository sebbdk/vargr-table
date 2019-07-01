module.exports = function(state, action) {
    switch(action.type) {
        case 'public:add':
        case 'public:add:all':
            const clientState = {
                ...state.clientState
            }
    
            Object.keys(action.data).forEach(k => {
                if (clientState[k] && Array.isArray(clientState[k])) {
                    clientState[k] = [
                        ...clientState[k],
                        ...action.data[k]
                    ];
                } else {
                    clientState[k] = action.data[k];
                }
            });
    
            return {
                ...state,
                clientState
            }
        case 'public:set':
        case 'public:set:all':
            return {
                ...state,
                clientState: {
                    ...state.clientState,
                    ...action.data
                }
            }
        default:
            return state;
      }
}