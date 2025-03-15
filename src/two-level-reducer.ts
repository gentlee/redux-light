import { RESET_STATE_TYPE, SET_STATE_TYPE, throwIfNotAnObject } from './utils'

export type TwoLevelStateChange<
  State extends Record<string, Value>,
  Value extends object = object,
> = {
  [K in keyof State]?: Partial<State[K]>
}

/**
 * @param options.initialState Initial state of reducer.
 * @param options.validate If set to true then ensures that state and its root prop values are objects, and that no new root props are added. Default is true.
 */
export const createTwoLevelReducer = <
  State extends Record<string, Value>,
  Value extends object = object,
>(options: {
  initialState: State
  validate?: boolean
}) => {
  const { initialState, validate = true } = options

  if (validate) {
    throwIfNotAnObject(initialState)
    Object.values(initialState).forEach(throwIfNotAnObject)
  }

  const setStateAction = (state: TwoLevelStateChange<State, Value>, trace?: string) =>
    trace !== undefined
      ? ({
          type: SET_STATE_TYPE,
          state,
          trace,
        } as const)
      : ({
          type: SET_STATE_TYPE,
          state,
        } as const)

  const resetStateAction = (state?: TwoLevelStateChange<State, Value>, trace?: string) =>
    trace !== undefined
      ? ({
          type: RESET_STATE_TYPE,
          state,
          trace,
        } as const)
      : ({
          type: RESET_STATE_TYPE,
          state,
        } as const)

  const reducer = (
    state: State | undefined = initialState,
    action: ReturnType<typeof setStateAction | typeof resetStateAction>,
  ) => {
    if (action.type !== SET_STATE_TYPE && action.type !== RESET_STATE_TYPE) return state

    if (action.type === RESET_STATE_TYPE) {
      if (!action.state) return initialState

      state = initialState
    }

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

  return {
    reducer,
    /**
     * Returns redux action to merge state changes.
     * @param trace Use for additional logging.
     */
    setStateAction,
    /**
     * Returns redux action to reset state to initial and merge state changes in one update.
     * @param trace Use for additional logging.
     */
    resetStateAction,
  }
}
