export type StateAction<TState extends Record<string, object>> = {
  type: typeof SET_STATE_TYPE | typeof RESET_STATE_TYPE
  state: StateChange<TState>
}

export type StateChange<TState extends Record<string, object>> = {
  [key in keyof TState]?: Partial<TState[key]>
}

export const SET_STATE_TYPE = 'redux-light/SET_STATE'
export const RESET_STATE_TYPE = 'redux-light/RESET_STATE'

export const setStateAction = <TState extends Record<string, object>>(state: StateChange<TState>) =>
  ({
    type: SET_STATE_TYPE,
    state,
  } as const)

export const resetStateAction = <TState extends Record<string, object>>(
  state: StateChange<TState>
) =>
  ({
    type: RESET_STATE_TYPE,
    state,
  } as const)

export const createReducer = <TState extends Record<string, object>>({
  initialState,
}: {
  initialState: TState
}) => {
  return (state: TState | undefined = initialState, action: StateAction<TState>) => {
    if (action.type !== SET_STATE_TYPE && action.type !== RESET_STATE_TYPE) return state

    if (action.type === RESET_STATE_TYPE) state = initialState

    const newState = { ...state }

    for (const key in action.state) {
      const newValue = action.state[key]
      newState[key] = { ...state[key], ...newValue }
    }

    return newState
  }
}
