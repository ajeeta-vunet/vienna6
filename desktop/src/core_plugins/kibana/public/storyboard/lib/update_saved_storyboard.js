import _ from 'lodash';
import { FilterUtils } from './filter_utils';

export function updateSavedStoryboard(savedStoryboard, appState, uiState, timeFilter, toJson) {
  savedStoryboard.uiStateJSON = toJson(uiState.getChanges());
  savedStoryboard.optionsJSON = toJson(appState.options);
  savedStoryboard.timeFrom = savedStoryboard.timeRestore ?
    FilterUtils.convertTimeToString(timeFilter.time.from)
    : undefined;
  savedStoryboard.timeTo = savedStoryboard.timeRestore ?
    FilterUtils.convertTimeToString(timeFilter.time.to)
    : undefined;
  const timeRestoreObj = _.pick(timeFilter.refreshInterval, ['display', 'pause', 'section', 'value']);
  savedStoryboard.refreshInterval = savedStoryboard.timeRestore ? timeRestoreObj : undefined;
}
