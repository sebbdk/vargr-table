const { createStore, applyMiddleware, combineReducers } = require('redux');
const thunk = require('redux-thunk');

const effectsMiddlware = require('./effects.middlware');

const { tableEffect, timesyncEffect } = require('./effects');
const { connection } = require('./connection.reducer');
const { table } = require('./table.reducer');

module.exports = function({ customReducers = {}, initialState = {}, effects = [], ws }) {
    let currentAppState = { ...initialState };

    const allEffects = [
        ...effects,
        tableEffect,
        timesyncEffect
    ]

    const rootReducer = combineReducers({
        connection,
        table,
        ...customReducers
    });

    return  createStore(rootReducer, currentAppState, applyMiddleware(thunk.default, effectsMiddlware(allEffects, ws)));
}
