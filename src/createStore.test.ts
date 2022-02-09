import { createStore } from 'redux'
import { createReducer, resetStateAction, setStateAction, StateChange } from './createStore'

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

  store.dispatch(setStateAction({ test: { value: 1 } }))
  store.dispatch(resetStateAction({ test: { text: 'test1' } }))

  expect(store.getState()).toEqual({
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

test('should throw error when initial state or root values are not objects', () => {
  expect(() => {
    // @ts-ignore
    createReducer({ initialState: 4, validationEnabled: true })
  }).toThrow(
    "State and its root property values should be of type 'object', got value '4' of type 'number'."
  )

  expect(() => {
    // @ts-ignore
    createReducer({ initialState: { test: 'error' }, validationEnabled: true })
  }).toThrow(
    "State and its root property values should be of type 'object', got value 'error' of type 'string'."
  )
})

test('should throw error when adding new root prop', () => {
  const reducer = createReducer({ initialState, validationEnabled: true })
  const store = createStore(reducer)

  // @ts-ignore
  expect(() => store.dispatch(setStateAction({ test: 1 }))).toThrow(
    "State and its root property values should be of type 'object', got value '1' of type 'number'."
  )
})

test('should throw error when adding new root prop', () => {
  const reducer = createReducer({ initialState, validationEnabled: true })
  const store = createStore(reducer)

  // @ts-ignore
  expect(() => store.dispatch(setStateAction({ error: { value: 1 } }))).toThrow(
    `No root property with name 'error' found in the current state.`
  )
})
