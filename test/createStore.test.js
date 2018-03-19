'use strict';

import createStore from '../src/createStore';

console.warn = jest.genMockFn();

describe('createStore', () => {
    it('should create store with initial state', () => {
        let initialState = { test: { counter: 0 } };
        let store = createStore(initialState);

        expect(store.getState()).toEqual(initialState);
    });

    it('should throw exception if initial state is not an object', () => {
        let initialState = 0;
        
        expect(() => {
            createStore(initialState);
        }).toThrow();
    });

    it('should throw exception if initial state root props are not objects', () => {
        let initialState = { counter: 0 };
        
        expect(() => {
            createStore(initialState);
        }).toThrow();
    });
});

describe('store', () => {
    it('should throw exception if state root props are not objects', () => {
        let initialState = { test: { counter: 0 } };
        let store = createStore(initialState);

        expect(() => {
            store.setState({
                type: 'TEST',
                test: 0
            });
        }).toThrow();
    });

    it('should set state', () => {
        let initialState = {
            test: {
                counter: 0,
                items: {}
            }
        };
        let store = createStore(initialState);
        let newItems = { '0': 'hello' };

        store.setState({
            type: 'TEST_1',
            test: { items: newItems }
        });

        expect(store.getState()).toEqual({
            test: {
                counter: 0,
                items: newItems
            }
        });

        store.setState('TEST_2', { test: { counter: 66 } });

        expect(store.getState()).toEqual({
            test: {
                counter: 66,
                items: newItems
            }
        });

        store.setState('TEST_3', 'test', { counter: 80 });

        expect(store.getState().test.counter).toEqual(80);
    });

    it('should subscribe', () => {
        let initialState = { test: { counter: 0 } };
        let store = createStore(initialState);
        let newState = {
            type: 'TEST',
            test: { counter: 1 }
        };

        store.subscribe((prev, state, changes) => {
            expect(prev).toEqual(initialState);
            expect(state).toEqual({ test: { counter: 1 }});
            expect(changes).toBe(newState);
        });

        store.setState(newState);
    });

    it('should not allow to add new root properties', () => {
        let initialState = { test: { counter: 0 } };
        let store = createStore(initialState);

        expect(() => {
            store.setState({
                type: 'TEST',
                newRoot: { counter: 0 }
            });
        }).toThrow();
    });

    it('should reset state', () => {
        let initialState = { test: { counter: 0 } };
        let store = createStore(initialState);

        store.setState({
            type: 'TEST',
            test: { counter: 27 }
        });
        store.resetState();

        expect(store.getState()).toEqual(initialState);
    });

    it('should unsubscribe', () => {
        let initialState = { test: { counter: 0 } };
        let store = createStore(initialState);
        let onChange = jest.fn();

        let unsubscribe = store.subscribe(onChange);
        unsubscribe();

        store.setState({
            type: 'TEST',
            test: { counter: 27 }
        });

        expect(onChange).not.toBeCalled();
    });

    it('should show warning when state changes from listener', () => {
        let store = createStore({ test: { counter: 0 } });
        let stateChanged = jest.fn();

        store.subscribe((oldState, state, changes) => {
            if (changes.type !== 'INSIDE') {
                store.setState({ type: 'INSIDE', test: { counter: state.test.counter + 1 } });
            }
        });
        
        store.setState({ type: 'TEST', test: { counter: store.getState().test.counter + 1 } });

        expect(console.warn).toBeCalled();
    });

    it('dispatch should work as setState', () => {
        let store = createStore({ test: { counter: 0 } });

        store.dispatch('TEST', 'test', { counter: 2 });

        expect(store.getState()).toEqual({ test: { counter: 2 } });
    });

    it('dispatch should accept functions and pass setState & getState as arguments', () => {
        let store = createStore({ test: { counter: 0 } });

        store.dispatch((setState, getState) => {
            setState('TEST', 'test', { counter: 1 });
        });

        expect(store.getState()).toEqual({ test: { counter: 1 } });
    });
});