'use strict';

import { createStore } from 'redux';

const PRODUCTION = process.env.NODE_ENV === 'production';
const RESET_STATE_TYPE = '@@redux-light/RESET_STATE';

export default function(initialState) {
    throwIfNotAnObject(initialState);
    for (let key in initialState) {
        throwIfNotAnObject(initialState[key]);
    }

    // variables for subscribe method
    
    let previousState = null;
    let currentState = initialState;
    let changes = null;
    let notifyingListeners = false;

    // reducer
    
    const reducer = (oldState, stateChanges) => {
        if (notifyingListeners) {
            console.warn('Changing state from listener leads to wrong listener arguments (prevState, state, changes). Consider using setTimeout.');
        }

        let baseState = stateChanges.type === RESET_STATE_TYPE ? initialState : oldState;
        let newState = { ...baseState };

        for (let key in stateChanges) {
            if (key === 'type') continue;
            if (!PRODUCTION && !baseState.hasOwnProperty(key)) {
                throw new Error(`No root property with name '${key}' found in the old state.`);
            }
            let newValue = stateChanges[key];
            throwIfNotAnObject(newValue);
            newState[key] = { ...baseState[key], ...newValue };
        }

        previousState = oldState;
        currentState = newState;
        changes = stateChanges;

        return newState;
    };
    
    // redux store

    const store = createStore(reducer, initialState);
    
    // subscribe
        
    function subscribe(onStateChanged) {
        return store.subscribe(() => {
            notifyingListeners = true;
            onStateChanged(previousState, currentState, changes);
            notifyingListeners = false;
        });
    }

    // setState
    
    function setState() {
        let state;
        if (typeof arguments[0] === 'string') {
            let type = arguments[0];
            if (typeof arguments[1] === 'string') {
                state = {};
                state[arguments[1]] = arguments[2];
            } else {
                state = arguments[1] || {};
            }
            state.type = type;
        } else {
            state = arguments[0];
        }
        store.dispatch(state);
    }
    
    // resetState

    function resetState(newState) {
        store.dispatch({ ...newState, type: RESET_STATE_TYPE });
    }
    
    return {
        ...store,
        subscribe,
        setState,
        resetState
    };
}

function throwIfNotAnObject(value) {
    const type = typeof value;
    if (type !== 'object') {
        throw new Exception(`State root property values should be of type 'object', got '${type}'.`);
    }
}