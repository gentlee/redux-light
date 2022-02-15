import { AnyAction } from 'redux'

const MOST_PROBABLY_NOT_PRODUCTION =
  __DEV__ ?? (Boolean(process?.env.NODE_ENV) && process.env.NODE_ENV !== 'production')

export type StateAction<State extends Record<string, object>> = {
  type: typeof SET_STATE_TYPE | typeof RESET_STATE_TYPE
  state: StateChange<State>
}

export type StateChange<State extends Record<string, object>> = {
  [K in keyof State]?: Partial<State[K]>
}

export const SET_STATE_TYPE = 'redux-light/SET_STATE'
export const RESET_STATE_TYPE = 'redux-light/RESET_STATE'

export const setStateAction = <State extends Record<string, object>>(state: StateChange<State>) =>
  ({
    type: SET_STATE_TYPE,
    state,
  } as const)

export const resetStateAction = <State extends Record<string, object>>(state: StateChange<State>) =>
  ({
    type: RESET_STATE_TYPE,
    state,
  } as const)

export const createReducer = <State extends Record<string, object>>({
  initialState,
  validate = MOST_PROBABLY_NOT_PRODUCTION,
}: {
  initialState: State
  validate?: boolean
}) => {
  console.log(
    'MOST_PROBABLY_NOT_PRODUCTION',
    MOST_PROBABLY_NOT_PRODUCTION,
    __DEV__,
    process.env.NODE_ENV
  )
  if (validate) {
    throwIfNotAnObject(initialState)
    Object.values(initialState).forEach(throwIfNotAnObject)
  }

  return (state: State | undefined = initialState, action: StateAction<State> | AnyAction) => {
    if (action.type !== SET_STATE_TYPE && action.type !== RESET_STATE_TYPE) return state

    const stateAction = action as StateAction<State>

    if (stateAction.type === RESET_STATE_TYPE) state = initialState

    const newState = { ...state }

    for (const key in stateAction.state) {
      const newValue = stateAction.state[key]

      if (validate) {
        throwIfNotAnObject(newValue)
        if (!Object.prototype.hasOwnProperty.call(state, key)) {
          throw new Error(`No root property with name '${key}' found in the current state.`)
        }
      }

      newState[key] = { ...state[key], ...newValue }
    }

    return newState
  }
}

const throwIfNotAnObject = (value: unknown) => {
  const type = typeof value
  if (type !== 'object') {
    throw new Error(
      `State and its root property values should be of type 'object', got value '${value}' of type '${type}'.`
    )
  }
}
