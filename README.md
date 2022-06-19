# redux-light

Simplified approach of using redux **without any boilerplate** - no action objects and reducers!

Based on **single reducer** that merges new state for each root property. Pseudocode is:

```typescript
const newState = { ...oldState }
for (const rootProp in changes) {
  newState[rootProp] = { ...oldState[rootProp], ...changes[rootProp] }
}
```

Initial state has to be an object, and values of its root props too. So it is similar to combining reduces in vanilla redux where initial states are objects (and they usually are).

While having only two actions and one reducer, **performace doesn't degrade** over time. Covered with tests.

### Table of contents

 - [Install](https://github.com/Gentlee/redux-light#Install)
 - [Initialize](https://github.com/Gentlee/redux-light#Initialize)
 - [Example](https://github.com/Gentlee/redux-light#example)
   - [store.js](https://github.com/Gentlee/redux-light#storejs)
   - [actions/auth.js](https://github.com/Gentlee/redux-light#actionsauth)
 - [React-redux](https://github.com/Gentlee/redux-light#react-redux)
   - [views/SignIn.js](https://github.com/Gentlee/redux-light#viewssigninjs)
 - [Additional logging](https://github.com/Gentlee/redux-light#additionallogging)
 - [FAQ](https://github.com/Gentlee/redux-light#faq)

### Install

```
npm install --save redux        // redux is a peer dependency
npm install --save redux-light
```

### Initialize

```typescript
import { createStore } from 'redux'
import { createReducer } from 'redux-light'

const reducer = createReducer({ initialState })
const store = createStore(reducer)
```

### Example

It makes sense to import `getState` and `setState` directly if you don't create stores dynamically during runtime but create them only once on app start.

And yes, it **can** be tested by mocking imports.

#### store.ts

```typescript
import { createStore } from 'redux'
import { createReducer, setStateAction, resetStateAction } from 'redux-light'

export type AppState = {
  auth: {
    loading: boolean
    token?: string
    error?: Error
  },
  settings: {
    theme: 'light' | 'dark'
  }
}

const initialState: AppState = {
  auth: {
    loading: false
  },
  settings: {
    theme: 'light'
  }
}

const reducer = createReducer({ initialState, validate: __DEV__ }) // __DEV__ is a react-native global

export const store = createStore(reducer)
export const getState = store.getState
export const setState = (state: StateChange<AppState>) => store.dispatch(setStateAction(state))
export const resetState = (state: StateChange<AppState>) => store.dispatch(resetStateAction(state))
```

#### actions/auth.ts

Just write all business logic as usual functions.

```typescript
import { getState, setState } from '../redux/store'

export async const signIn = (options: { login: string, password: string }) => {
  if (getState().auth.loading) return

  setState({ auth: { loading: true } })

  let token = undefined
  try {
    token = await api.signIn(options)
  }
  catch (error) {
    setState({ auth: { loading: false, error } })
    return
  }

  setState({ auth: { loading: false, token } })
}
```
    
### react-redux

Use `Provider`, `connect` and `useSelector` same as before, except no need to use `mapDispatchToProps` or `useDispatch`.

#### views/SignIn.js

```typescript
import { signIn } from '../actions/auth'

const authSelector = (state: AppState) => state.auth

const SignIn: FC = () => {
  const {token, loading, error} = useSelector(authSelector)

  ...

  onSignInPress = () => {
    signIn({
      login: this.state.login,
      password: this.state.password
    })
  }

  ...
}
```

### Additional logging

Trace argument can be used for additional logging of each action. It is convinient to see it in console logs and bug tracker breadcrumbs.

```typescript
export const setState = (trace: string, state: StateChange<AppState>) => store.dispatch(setStateAction(state, trace))

...

setState('auth/signInSuccess', {
  token,
  loading: false
});

```

### FAQ

#### Why?

>The initial goal was to make the work with app state as simple as possible - like `React.Component` state but global.
>
>Nowadays, considering the fact that more and more apps start using other cache managers like `Apollo Client` (for GQL) or `React.Context` (state for group of screens/components), redux is left for fewer cases and using frameworks like `redux-toolkit` for such cases could be an overhead.
>
> But this package can be used for large projects as well, especially since it doesn't degrade over time that much because it uses only two actions and one reducer, if compared with the vanilla redux approach. (`O(1)` vs `O(n + m)` where `n` is number of actions and `m` is number of reducers). Only the plain size of state matters here.

#### It violates [redux style guide](https://redux.js.org/style-guide)

>Yes, because it is not a vanilla way of using `redux` and `react-redux`. It is just a different approach, with its pros and cons.
>
>Also, redux is totally synchronous, so it doesn't really make that much sense to make actions as objects and run them in another layer as reducers, as it would make if it was asynchronous, because `getState` always returns actual data and can be safely used to calculate new state changes.

#### Do you even need redux here?

> It could be written from scratch, the same approach but without redux, actions and reducers at all, which will make the size of the package even more tiny.
>
> But this lib will also lose a whole redux **ecosystem** like `react-redux`, `redux-persist`, `redux-logger` etc, so considering the popularity of redux it makes sense to use it as a base, and fortunately it is a constructor where you can implement any approach you want.
>
> Also, you can use other reducers as well, e.g. from 3rd party packages.

#### Won't action log history become useless?

>If you use console logs for watching action history, consider using the `trace` parameter and it will work the same as the type in redux actions.
>
>If you use some debug utility specific for vanilla redux that shows only action types, well, IMO they are already pretty useless because they are not synchronized with other console logs as http requests/responses, storage CRUDs, navigation, component states, debug logs etc.
>
>So, ofc IMO, [redux-logger](https://github.com/LogRocket/redux-logger) remains the best choice for logging in most cases.

#### What if I need some other merging strategy rather than 2-level merge?

>2-level merge forces the app state to be plain and simple, same as vanilla redux `{ reducer: state, otherReducer: otherState }`. But if you want some other merging strategy, you can always use additional merging utils for that while calculating the new state.
>
>I would say it is even a good practice to create several utils for that or use existing libs like [normalizr](https://github.com/paularmstrong/normalizr/blob/master/docs/api.md).
