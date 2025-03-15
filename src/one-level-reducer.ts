import { RESET_STATE_TYPE, SET_STATE_TYPE, throwIfNotAnObject } from './utils'

/**
 * @param options.initialState Initial state of reducer.
 */
export const createOneLevelReducer = <State extends object>(options: { initialState: State }) => {
  const { initialState } = options

  throwIfNotAnObject(initialState)

  const setStateAction = (state: Partial<State>, trace?: string) =>
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

  const resetStateAction = (state?: Partial<State>, trace?: string) =>
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

    if (action.state) {
      return { ...state, ...action.state }
    }

    return state
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
