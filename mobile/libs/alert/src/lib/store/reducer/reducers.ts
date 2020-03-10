import { Reducer } from 'react';
import { AlertActions, AlertActionEnum, Alert, SeverityValues } from '../action';

/**
 * Alert type
 */
export interface AlertStore {
  alert: AlertState;
}

/**
 * Type defiantion for Alert
 */
export type AlertState = {
  loading: boolean;
  alerts: Alert[];
  error: string | string[] | unknown;
  displayFilter: SeverityValues;
};

/**
 * Dummy data for testing
 */
export const AlertsInitialState: AlertState = {
  loading: false,
  alerts: undefined,
  error: '',
  displayFilter: '*'
};
/**
 * Reducer for alerts
 * @param state the previous state
 * @param action type of action to perform
 */
export const AlertsReducer: Reducer<AlertState, AlertActions> = (state = AlertsInitialState, action) => {
  switch (action.type) {
    case AlertActionEnum.SET_FILTER:
      return {...state,
        displayFilter: action.filter
      };
      case AlertActionEnum.LOAD_ALERTS:
        return {
          alerts: [],
          loading: true,
          error: '',
          displayFilter: state.displayFilter
        };
    case AlertActionEnum.LOAD_ALERTS_SUCCESS:
      return {
        alerts: action.data,
        loading: false,
        error: '',
        displayFilter: state.displayFilter
      };
    case AlertActionEnum.LOAD_ALERTS_FAIL:
      return {
        loading: false,
        alerts: [],
        error: action.error,
        displayFilter: state.displayFilter
      };
    default:
      return state;
  }
};
