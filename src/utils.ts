export const throwIfNotAnObject = (value: unknown) => {
  const type = typeof value
  if (type !== 'object') {
    throw new Error(
      `State and its root property values should be of type 'object', got value '${value}' of type '${type}'.`
    )
  }
}
