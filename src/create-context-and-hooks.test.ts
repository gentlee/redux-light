import { createStore } from 'redux'
import { createContextAndHooks, createOneLevelReducer } from 'redux-light'

const initialState = {
  value: 0,
  text: 'test',
  obj: {
    a: '1',
    b: 2,
  },
}

test('should return defined context and hooks', () => {
  const { reducer } = createOneLevelReducer({ initialState })
  const store = createStore(reducer)

  const { context, useDispatch, useSelector, useStore } = createContextAndHooks(store)

  expect(context).toBeDefined()
  expect(useDispatch).toBeDefined()
  expect(useSelector).toBeDefined()
  expect(useStore).toBeDefined()
})
