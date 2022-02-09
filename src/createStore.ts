const NOT_PRODUCTION =
  __DEV__ || (Boolean(process?.env.NODE_ENV) && process.env.NODE_ENV !== 'production')

export type Action<TValue, TState extends Record<string, TValue>> = {
  type: typeof SET_STATE_TYPE | typeof RESET_STATE_TYPE
  state: StateChange<TValue, TState>
}

export type StateChange<TValue, TState extends Record<string, TValue>> = {
  [key in keyof TState]?: Partial<TState[key]>
}

export const SET_STATE_TYPE = 'redux-light/SET_STATE'
export const RESET_STATE_TYPE = 'redux-light/RESET_STATE'

export const setStateAction = <TValue, TState extends Record<string, TValue>>(
  state: StateChange<TValue, TState>
) =>
  ({
    type: SET_STATE_TYPE,
    state,
  } as const)

export const resetStateAction = <TValue, TState extends Record<string, TValue>>(
  state: StateChange<TValue, TState>
) =>
  ({
    type: RESET_STATE_TYPE,
    state,
  } as const)

export const createReducer = <TValue, TState extends Record<string, TValue>>({
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

  return (state: TState | undefined = initialState, action: Action<TValue, TState>) => {
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
