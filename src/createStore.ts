const NOT_PRODUCTION =
  __DEV__ || (Boolean(process?.env.NODE_ENV) && process.env.NODE_ENV !== 'production')

export type StateAction<TState extends Record<string, TValue>, TValue extends object> = {
  type: typeof SET_STATE_TYPE | typeof RESET_STATE_TYPE
  state: StateChange<TState, TValue>
}

export type StateChange<TState extends Record<string, TValue>, TValue extends object = object> = {
  [key in keyof TState]?: Partial<TState[key]>
}

export const SET_STATE_TYPE = 'redux-light/SET_STATE'
export const RESET_STATE_TYPE = 'redux-light/RESET_STATE'

export const setStateAction = <TState extends Record<string, TValue>, TValue extends object>(
  state: StateChange<TState, TValue>
) =>
  ({
    type: SET_STATE_TYPE,
    state,
  } as const)

export const resetStateAction = <TState extends Record<string, TValue>, TValue extends object>(
  state: StateChange<TState, TValue>
) =>
  ({
    type: RESET_STATE_TYPE,
    state,
  } as const)

export const createReducer = <TState extends Record<string, TValue>, TValue extends object>({
  initialState,
  validationEnabled = NOT_PRODUCTION,
}: {
  initialState: TState
  validationEnabled?: boolean
}) => {
  if (validationEnabled) {
    throwIfNotAnObject(initialState)
    Object.values(initialState).forEach(throwIfNotAnObject)
  }

  return (state: TState | undefined = initialState, action: StateAction<TState, TValue>) => {
    if (action.type !== SET_STATE_TYPE && action.type !== RESET_STATE_TYPE) return state

    if (action.type === RESET_STATE_TYPE) state = initialState

    const newState = { ...state }

    for (const key in action.state) {
      const newValue = action.state[key]

      if (validationEnabled) {
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
