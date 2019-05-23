import _ from 'lodash';
import { uiModules } from 'ui/modules';
const app = uiModules.get('app/berlin');
import './vunet_preferences.less';
import { DocTitleProvider } from 'ui/doc_title';
import { VunetSidebarConstants } from 'ui/chrome/directives/vunet_sidebar_constants';

app.directive('vunetPreferences', function () {
  return {
    restrict: 'E',
    controllerAs: 'vunetPreferences',
    controller: vunetPreferences,
  };
});

function vunetPreferences($injector,
  $scope,
  $http,
  StateService) {

  // Init function
  // Gets the preference details from backend and keep it
  // ready for each domain to pick..
  function init() {

    // Always display doc title as 'Preferences'
    const Private = $injector.get('Private');
    const docTitle = Private(DocTitleProvider);
    docTitle.change(VunetSidebarConstants.PREFERENCES);

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
      // After editing, fetch the headers and rows for the selected ITSM preference type
      // from the back-end.
      StateService.getPreferenceDetails().then (function (preferences) {
        $scope.allPreferenceMeta = preferences.preference_meta;
        $scope.preferenceData = preferences.preferences;
      });
      return Promise.resolve(true);
    }, function () {
      return Promise.resolve(false);
    });
  };

  init();
}
