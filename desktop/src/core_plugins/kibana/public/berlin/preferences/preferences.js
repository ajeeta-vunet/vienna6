import _ from 'lodash';
import { uiModules } from 'ui/modules';
const app = uiModules.get('app/berlin');
import './vunet_preferences.less';

app.directive('vunetPreferences', function () {
  return {
    restrict: 'E',
    controllerAs: 'vunetPreferences',
    controller: vunetPreferences,
  };
});
function vunetPreferences($scope,
  $http,
  StateService) {

  // Init function
  // Gets the preference details from backend and keep it
  // ready for each domain to pick..
  function init() {
    $scope.allPreferenceMeta = [];
    $scope.preferenceData = [];
    StateService.getPreferenceDetails().then (function (preferences) {
      $scope.allPreferenceMeta = preferences.preference_meta;
      $scope.preferenceData = preferences.preferences;
    });

  }

  // fetch preference items for the passed preferences
  $scope.fetchPreferenceItems = (prefObjKey) => {
    let found = false;
    let objectToRet;
    for(let index = 0; index < $scope.preferenceData.length; index++) {
      const prefObj = $scope.preferenceData[index];
      if (Object.keys(prefObj)[0] === prefObjKey) {
        objectToRet = prefObj[prefObjKey];
        found = true;
        break;
      }
    }

    if(found) {
      return new Promise((resolve) => resolve([objectToRet]));
    } else {
      return new Promise((resolve) => resolve(''));
    }
  };

  // Delete the object.. Actually there is nothing to delete
  $scope.delete =  () =>  {
    return new Promise((resolve) => resolve(''));
  };

  // Handle submit for the passed preference
  $scope.onPreferenceSubmit = (event, key, data, prefKey) =>   {

    // Create the actualData from the received data.. We create it based
    // on metaData
    const actualData = {};
    for(let index = 0; index < $scope.allPreferenceMeta.length; index++) {
      if (Object.keys($scope.allPreferenceMeta[index])[0] === prefKey) {
        _.forEach($scope.allPreferenceMeta[index][prefKey].table, function (prefMeta) {
          actualData[prefMeta.key] = data[prefMeta.key];
        });
        break;
      }
    }

    return StateService.editPreference(actualData, prefKey).then(function () {
      // Update the preferenceData so that when fetch happens, we have the updated data
      for(let index = 0; index < $scope.preferenceData.length; index++) {
        if (Object.keys($scope.preferenceData[index])[0] === prefKey) {
          $scope.preferenceData[index][prefKey] = actualData;
          break;
        }
      }
      return Promise.resolve(true);
    }, function () {
      return Promise.resolve(false);
    });
  };

  init();
}
