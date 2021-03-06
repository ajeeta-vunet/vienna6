import { combineReducers } from 'redux';
import { dashboard } from './dashboard/reducers';
import { topologyData } from './discovery/reducers/topologyData';

/**
 * Only a single reducer now, but eventually there should be one for each sub app that is part of the
 * core kibana plugins.
 */
export const reducers = combineReducers({
  dashboard,
  topologyData
});
