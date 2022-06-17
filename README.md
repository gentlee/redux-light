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
import { getState, setState } from '../redux/store';

export async const signIn = (options: { login: string, password: string }) => {
    if (getState().auth.loading) return;

    setState({ auth: { loading: true } });

    let token = undefined;
    try {
        token = await api.signIn(options);
    }
    catch (error) {
        setState({ auth: { loading: false, error } });
        return;
    }

    setState({ auth: { loading: false, token } });
}
```
    
### react-redux

Use `Provider`, `connect` and `useSelector` same as before, except no need to use `mapDispatchToProps` or `useDispatch`.

#### views/SignIn.js

```typescript
import { signIn } from '../actions/auth';

...

onSignInPress = () => {
    signIn({
        login: this.state.login,
        password: this.state.password
    });
}

...

export default connect((state: AppState) => ({
    loading: state.auth.loading,
    error: state.auth.error
}))(SignIn);
```

### Additional logging

Trace argument can be used for additional logging of each action:

```typescript
export const setState = (trace: string, state: StateChange<AppState>) => store.dispatch(setStateAction(state, trace))
```
