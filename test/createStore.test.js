'use strict';

import createStore from '../src/createStore';

describe('createStore', () => {
    it('should create store with initial state', () => {
        let initialState = { test: { counter: 0 } };
        let store = createStore(initialState);

        expect(store.getState()).toEqual(initialState);
    });
});

describe('store', () => {
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
});