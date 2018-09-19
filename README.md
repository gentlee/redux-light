# redux-light
Simplified redux without any boilerplate :nerd_face:.

Currently based on [redux](https://github.com/reactjs/redux) (c) Dan Abramov and compatible with most libraries that depend on it, such as `react-redux` etc. Just use `redux-light` store instead of `redux` store.

Default reducer merges new state, passed to `setState` function, same as `Component.setState` from `react`, but does it for each root property. Pseudo-code is:

    let newState = { ...store.getState() };
    for (let rootProp in stateChanges) {
        newState[rootProp] = { ...oldState[rootProp], ...stateChanges[rootProp] };
    }
    
## Table of contents

 - [Installation](https://github.com/Gentlee/redux-light#installation)
 - [Example](https://github.com/Gentlee/redux-light#example)
   - [store/index.js](https://github.com/Gentlee/redux-light#storeindexjs)
   - [actions/authentication.js](https://github.com/Gentlee/redux-light#actionsauthenticationjs)
 - [React-redux](https://github.com/Gentlee/redux-light#react-redux)
   - [views/SignIn.js](https://github.com/Gentlee/redux-light#viewssigninjs)
 - [Advanced](https://github.com/Gentlee/redux-light#advanced)
   - [helpers](https://github.com/Gentlee/redux-light#helpers)
   - [no store import](https://github.com/Gentlee/redux-light#no-store-import)
   - [middleware](https://github.com/Gentlee/redux-light#middleware)
 - [Store api definition](https://github.com/Gentlee/redux-light#store-api-definition)

## Installation

    npm install --save redux
    npm install --save redux-light
    
## Example

### store/index.js

    import initialState from './initialState';
    import createStore from 'redux-light';

    let store = createStore(initialState);
    
    export let getState = store.getState;
    export let setState = store.setState;
    export let resetState = store.resetState;
    export default store;

No need for reducers, just create store and use it.
 
### actions/authentication.js

    import { getState, setState } from '../store';
    
    export async function signIn(options) {
        if (getState().authentication.loading) return;

        setState({
            type: 'SIGN_IN_STARTED',
            authentication: { loading: true }
        });

        let token = null;
        try {
            token = await api.signIn(options);
        }
        catch (error) {
            setState({
                type: 'SIGN_IN_ERROR',
                authentication: {
                    loading: false,
                    error
                }
            });
            return;
        }

        setState({
            type: 'SIGN_IN_SUCCESS',
            authentication: {
                loading: false,
                token
            }
        });
    }

Actions are usual functions. State is changed by `setState` method, and every state change should have a reason, passed with `type` parameter. This parameter is not used by store itself (except some built-in types), but is very important for descriptive logging:

    if (process.env.NODE_ENV !== 'production') {
        store.subscribe((prevState, state, changes) => {
            let { type, ...otherProps } = changes;
            console.log(type, otherProps);
        });
    }
    
If also could be used for additional handling of state changes:

    store.subscribe((prevState, state, changes) => {
        switch (changes.type) {
            case 'SIGN_IN_SUCCESS':
                showAlert(strings.alert_sign_in_success);
                break;
        }
    });

    
## react-redux

Use `Provider` and `connect` same as before, except no need to pass `mapDispatchToProps`, actions should be imported and used as usual functions:


### views/SignIn.js

    import { signIn } from '../actions/authentication';

    ...

    onSignInPress = () => {
        signIn({
            login: this.state.login,
            password: this.state.password
        });
    }

    ...

    export default connect(state => ({
        loading: state.authentication.loading,
        error: state.authentication.error
    }))(SignIn);
    
## Advanced
    
### helpers

Sooner or later you'll think about using helpers to reduce code duplication. `signIn` function could be rewritten like this:

    export async function signIn(options) {
        return await helpers.load({
            type: 'SIGN_IN',
            rootProp: 'authentication',
            loadFunc: () => api.signIn(options)
        });
    }

Implementation of helpers is up to you :)

### no store import

If you want not to import store, getState, setState, but to get them from `react-redux`, you should rewrite your actions like this:

    export function signIn(setState, getState) {
        return async options => {
            return await helpers.load({
                type: 'SIGN_IN',
                rootProp: 'authentication',
                loadFunc: () => api.signIn(options)
            });
        }
    }
    
And bind them with `mapDispatchToProps` of react-redux `connect` function:

    export default connect(state => ({
        loading: state.authentication.loading,
        error: state.authentication.error
    }), dispatch => ({
        signIn: dispatch(actions.authentication.signIn)
    }))(SignIn);
    
### middleware

Currently there is no built-in middleware functionality, but you can always wrap `setState` method like this:

    let next = store.setState;
    store.setState = (...args) => {
        ...
        next.apply(null, args);
    }

## Store api definition

All `redux` store api plus:

    function subscribe(onStateChanged: function): function // callback: (prevState, state, changes) => {}, returns unsubscribe function
    
    function setState(newState: object)
    
    function setState(type: string, newState: object)
    
    function setState(type: string, rootProp: string, newRootPropState: object)
    
    function resetState(newState: object) // resets to initial state, merged with newState, no type required
