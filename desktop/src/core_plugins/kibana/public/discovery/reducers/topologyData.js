import { handleActions } from 'redux-actions';
import {
  updateViewDetails,
  fetchNewScanList,
} from '../actions/topologyActions';

export const topologyData = handleActions(
  {
    [updateViewDetails]: (state, {}) => {
      return {
        ...state,
        viewDetails: !state.viewDetails,
      };
    },
    [fetchNewScanList]: (state, payload) => {
      return {
        ...state,
        topologyList: payload.newListOfScan.topology,
      };
    },
  },
  {
    viewDetails: false,
    listOfScan: {},
  }
);
