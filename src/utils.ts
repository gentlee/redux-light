export const SET_STATE_TYPE = 'redux-light/SET_STATE'
export const RESET_STATE_TYPE = 'redux-light/RESET_STATE'

export const throwIfNotAnObject = (value: unknown) => {
  const type = typeof value
  if (type !== 'object') {
    throw new Error(
      `State and its root property values should be of type 'object', got value '${value}' of type '${type}'.`,
    )
  }
}
