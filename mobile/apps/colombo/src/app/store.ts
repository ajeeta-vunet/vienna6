/** 
 * ------------------------- NOTICE ------------------------------- 
 *
 *                  CONFIDENTIAL INFORMATION                       
 *                  ------------------------                       
 *    This Document contains Confidential Information or           
 *    Trade Secrets, or both, which are the property of VuNet      
 *    Systems Ltd.  This document may not be copied, reproduced,   
 *    reduced to any electronic medium or machine readable form    
 *    or otherwise duplicated and the information herein may not   
 *    be used, disseminated or otherwise disclosed, except with    
 *    the prior written consent of VuNet Systems Ltd.              
 *                                                                 
 *------------------------- NOTICE ------------------------------- 
 
 * Copyright 2020 VuNet Systems Ltd.
 * All rights reserved.
 * Use of copyright notice does not imply publication.
*/

import { applyMiddleware, combineReducers, createStore, Store, StoreEnhancer, Reducer } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import {
  AuthReducer,
  DashboardReducer,
  TimeRangeReducer,
  AuthActionTypes,
} from '@vu/store';
import { AppShellStore, AppShellInitialState, AppUiReducer, AppShellActions } from '@vu/app-shell';

export type ColomboAppStore =AppShellStore;

export type AppActions = AppShellActions ;

/**
 * The initial state of the application
 */
const InitialColomboState: ColomboAppStore = {
  ...AppShellInitialState,
};

/**
 * This is the root reducer which will handle states globally
 * It is not possible to reset store from a sub state when a user logs out
 * We use reducer here to reset whole store, like in case of logout
 * @param state The State for the appReducer
 * @param action The supported actions for appReducer
 */
const appReducer: Reducer<ColomboAppStore, AppActions> = combineReducers<ColomboAppStore, AppActions>({
  auth: AuthReducer,
  dashboard: DashboardReducer,
  timerange: TimeRangeReducer,
  appui: AppUiReducer
});
/**
 * This is the root reducer which will handle states globally
 * It is not possible to reset store from a sub state when a user logs out
 * We use reducer here to reset whole store, like in case of logout
 * @param state The State for the root reducer
 * @param action The Actions for root reducer
 */
const rootReducer: Reducer<ColomboAppStore, AppActions> = (state, action) => {
  switch (action.type) {
    case AuthActionTypes.LOGOUT_SUCCESS:
      localStorage.clear();
      return InitialColomboState;
    default:
      return appReducer(state, action);
  }
};

export function configureStore(environment: { production: boolean }): Store<ColomboAppStore, AppActions> {
  let middleware: StoreEnhancer;
  // This will allow redux-devtools plugin to work
  // https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en
  const composeEnhancers = composeWithDevTools({});
  if (environment.production) {
    // No need of logger in Production
    middleware = applyMiddleware(thunk);
  } else {
    // middleware = composeEnhancers(applyMiddleware(thunk, logger));
    middleware = composeEnhancers(applyMiddleware(thunk));
  }
  const store = createStore(rootReducer, middleware);
  return store;
}
export default configureStore;
