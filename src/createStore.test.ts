import { Action, combineReducers, createStore } from 'redux'
import {
  createReducer,
  resetStateAction,
  setStateAction,
  StateAction,
  StateChange,
} from './createStore'
import { batchActions, enableBatching } from 'redux-batched-actions'

const initialState = {
  test: {
    value: 0,
    text: 'test',
    obj: {
      a: '1',
      b: 2,
    },
  },
  other: {},
}

test('should create reducer with proper initial state', () => {
  const reducer = createReducer({ initialState })
  const store = createStore(reducer)

  expect(store.getState().test.value).toEqual(0)
})

test('should change state an setStateAction', () => {
  const reducer = createReducer({ initialState })
  const store = createStore(reducer)
  const setState = (state: Parameters<typeof setStateAction>[0]) =>
    store.dispatch(setStateAction(state))

  setState({ test: { value: 1 } })
  expect(store.getState().test.value).toEqual(1)

  setState({ test: { value: 2 } })
  expect(store.getState().test.value).toEqual(2)
})

test('should reset state', () => {
  const reducer = createReducer({ initialState })
  const store = createStore(reducer)
  const setState = (state: StateChange<typeof initialState>) =>
    store.dispatch(setStateAction(state))
  const resetState = (state: StateChange<typeof initialState>) =>
    store.dispatch(resetStateAction(state))
  const getState = store.getState

  setState({ test: { value: 1 } })
  resetState({ test: { text: 'test1' } })

  expect(getState()).toEqual({
    test: {
      value: 0,
      text: 'test1',
      obj: {
        a: '1',
        b: 2,
      },
    },
    other: {},
  })
})

test('should reset state the usual way', () => {
  const reducer = createReducer({ initialState })
  const store = createStore(
    (
      state: typeof initialState | undefined = initialState,
      action: StateAction<typeof initialState> | Action<'reset'>
    ) => {
      return reducer(action.type === 'reset' ? undefined : state, action)
    }
  )

  store.dispatch(setStateAction({ test: { value: 2 } }))
  expect(store.getState().test.value).toEqual(2)

  store.dispatch({ type: 'reset' })

  expect(store.getState()).toEqual(initialState)
})

test('should work with other reducers', () => {
  const reducer = createReducer({ initialState })
  const store = createStore(
    combineReducers({
      state: reducer,
      counter: (state: number | undefined = 0, action: Action<'increment'>) => {
        if (action.type === 'increment') {
          return state + 1
        }
        return state
      },
    })
  )

  store.dispatch({ type: 'increment' })
  store.dispatch(setStateAction({ test: { value: 5 } }))

  expect(store.getState()).toEqual({
    state: {
      ...initialState,
      test: {
        ...initialState.test,
        value: 5,
      },
    },
    counter: 1,
  })
})

test('should work with batch actions', () => {
  const reducer = createReducer({ initialState })
  // @ts-ignore redux-batched-actions TS issue
  const store = createStore(enableBatching(reducer))
  const subscriber = jest.fn()
  store.subscribe(subscriber)

  store.dispatch(
    batchActions([setStateAction({ test: { value: 5 } }), setStateAction({ test: { test: '0' } })])
  )

  expect(subscriber).toBeCalledTimes(1)
  expect(store.getState()).toEqual({
    ...initialState,
    test: {
      ...initialState.test,
      value: 5,
      test: '0',
    },
  })
})

test('should throw error when initial state or root values are not objects', () => {
  expect(() => {
    // @ts-ignore
    createReducer({ initialState: 4 })
  }).toThrow(
    "State and its root property values should be of type 'object', got value '4' of type 'number'."
  )

  expect(() => {
    // @ts-ignore
    createReducer({ initialState: { test: 'error' } })
  }).toThrow(
    "State and its root property values should be of type 'object', got value 'error' of type 'string'."
  )
})

test('should throw error when adding new root prop', () => {
  const reducer = createReducer({ initialState })
  const store = createStore(reducer)

  expect(() => store.dispatch(setStateAction({ test: 1 }))).toThrow(
    "State and its root property values should be of type 'object', got value '1' of type 'number'."
  )
})

test('should throw error when adding new root prop', () => {
  const reducer = createReducer({ initialState, validate: true })
  const store = createStore(reducer)

  expect(() => store.dispatch(setStateAction({ error: { value: 1 } }))).toThrow(
    `No root property with name 'error' found in the current state.`
  )
})
