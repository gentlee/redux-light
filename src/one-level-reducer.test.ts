import { Action, applyMiddleware, combineReducers, createStore } from 'redux'
import { createOneLevelReducer } from 'redux-light'
import { logger } from 'redux-logger'

const initialState = {
  value: 0,
  text: 'test',
  obj: {
    a: '1',
    b: 2,
  },
}

test('should create reducer with proper initial state', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { reducer } = require('redux-light').createOneLevelReducer({ initialState })
  const store = createStore(reducer)

  expect(store.getState()).toBe(initialState)
})

test('should change state on setStateAction', () => {
  const { reducer, setStateAction } = createOneLevelReducer({ initialState })
  const store = createStore(reducer)

  store.dispatch(setStateAction({ value: 1 }))
  expect(store.getState().value).toEqual(1)

  store.dispatch(setStateAction({ value: 2 }))
  expect(store.getState().value).toEqual(2)
})

test('should reset state', () => {
  const { reducer, setStateAction, resetStateAction } = createOneLevelReducer({ initialState })
  const store = createStore(reducer)
  const setState = (state: Partial<typeof initialState>) => store.dispatch(setStateAction(state))
  const resetState = (state?: Partial<typeof initialState>) =>
    store.dispatch(resetStateAction(state))
  const getState = store.getState

  setState({ value: 1 })
  resetState({ text: 'test1' })

  expect(getState()).toEqual({
    value: 0,
    text: 'test1',
    obj: {
      a: '1',
      b: 2,
    },
  })

  resetState()

  expect(getState()).toBe(initialState)
})

test('should reset state the usual way', () => {
  const { reducer, setStateAction } = createOneLevelReducer({ initialState })
  const store = createStore(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (state: typeof initialState | undefined = initialState, action: any) => {
      return reducer(action.type === 'reset' ? undefined : state, action)
    },
  )

  store.dispatch(setStateAction({ value: 2 }))
  expect(store.getState().value).toEqual(2)

  store.dispatch({ type: 'reset' })

  expect(store.getState()).toEqual(initialState)
})

test('should work with other reducers', () => {
  const { reducer, setStateAction } = createOneLevelReducer({ initialState })
  const store = createStore(
    combineReducers({
      state: reducer,
      counter: (state: number | undefined = 0, action: Action<'increment'>) => {
        if (action.type === 'increment') {
          return state + 1
        }
        return state
      },
    }),
  )

  store.dispatch({ type: 'increment' })
  store.dispatch(setStateAction({ value: 5 }))

  expect(store.getState()).toEqual({
    state: {
      ...initialState,
      value: 5,
    },
    counter: 1,
  })
})

test('should throw error when initial state is not object', () => {
  expect(() => {
    // @ts-expect-error
    createOneLevelReducer({ initialState: 4 })
  }).toThrow(
    "State and its root property values should be of type 'object', got value '4' of type 'number'.",
  )
})

test('should add traces to logs', () => {
  const { reducer, setStateAction, resetStateAction } = createOneLevelReducer({ initialState })
  const store = createStore(reducer, applyMiddleware(logger))

  const originalLog = console.log
  console.log = jest.fn()

  store.dispatch(setStateAction({ value: 5 }, 'testing setState'))
  store.dispatch(resetStateAction({}, 'testing resetState'))

  const testLog = console.log
  console.log = originalLog

  expect(testLog).toHaveBeenNthCalledWith(2, '%c action    ', 'color: #03A9F4; font-weight: bold', {
    state: { value: 5 },
    trace: 'testing setState',
    type: 'redux-light/SET_STATE',
  })

  expect(testLog).toHaveBeenNthCalledWith(5, '%c action    ', 'color: #03A9F4; font-weight: bold', {
    state: {},
    trace: 'testing resetState',
    type: 'redux-light/RESET_STATE',
  })
})
