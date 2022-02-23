export type StateAction<State extends Record<string, Value>, Value extends object = object> = {
  type: typeof SET_STATE_TYPE | typeof RESET_STATE_TYPE
  state: StateChange<State>
}

export type StateChange<State extends Record<string, Value>, Value extends object = object> = {
  [K in keyof State]?: Partial<State[K]>
}

export const SET_STATE_TYPE = 'redux-light/SET_STATE'
export const RESET_STATE_TYPE = 'redux-light/RESET_STATE'

/**
 * Returns redux action to merge state changes.
 */
export const setStateAction = <State extends Record<string, Value>, Value extends object = object>(
  state: StateChange<State>
) =>
  ({
    type: SET_STATE_TYPE,
    state,
  } as const)

/**
 * Returns redux action to reset state to initial and merge state changes in one update.
 */
export const resetStateAction = <
  State extends Record<string, Value>,
  Value extends object = object
>(
  state: StateChange<State>
) =>
  ({
    type: RESET_STATE_TYPE,
    state,
  } as const)

/**
 * @param options.initialState Initial state of reducer.
 * @param options.validate If set to true then ensures that state and its root prop values are objects, and that no new root props are added. Default value depends on environment. Default is true.
 */
export const createReducer = <
  State extends Record<string, Value>,
  Value extends object = object
>(options: {
  initialState: State
  validate?: boolean
}) => {
  const { initialState, validate = true } = options

  if (validate) {
    throwIfNotAnObject(initialState)
    Object.values(initialState).forEach(throwIfNotAnObject)
  }

  return (state: State | undefined = initialState, action: StateAction<State>) => {
    if (action.type !== SET_STATE_TYPE && action.type !== RESET_STATE_TYPE) return state

    if (action.type === RESET_STATE_TYPE) state = initialState

    const newState = { ...state }

    for (const key in action.state) {
      const newValue = action.state[key]

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
