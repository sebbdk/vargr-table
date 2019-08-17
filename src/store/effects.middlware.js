function createEffectsMiddleware(effects = [], ws) {
    return ({ dispatch, getState }) => next => action => {
        const n = next(action);
        effects.forEach(e => e({action, dispatch, getState, ws}));
        return n;
    };
  }
  
module.exports = createEffectsMiddleware;