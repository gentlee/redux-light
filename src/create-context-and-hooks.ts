import { createContext } from 'react'
import {
  createDispatchHook,
  createSelectorHook,
  createStoreHook,
  ReactReduxContextValue,
  UseSelector,
} from 'react-redux'
import { Action, Store, UnknownAction } from 'redux'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createContextAndHooks = <S, A extends Action = UnknownAction>(store: Store<S, A>) => {
  const context = createContext<ReactReduxContextValue<S, A> | null>(null)
  return {
    context,
    useStore: createStoreHook(context),
    useDispatch: createDispatchHook(context),
    useSelector: createSelectorHook(context) as UseSelector<S>,
  }
}
