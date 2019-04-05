import { uiModules } from 'ui/modules';
const app = uiModules.get('app/berlin');
import './settings.less';
import { DocTitleProvider } from 'ui/doc_title';
import { VunetSidebarConstants } from 'ui/chrome/directives/vunet_sidebar_constants';

app.directive('vunetDataRetentionSettings', function () {
  return {
    restrict: 'E',
    controllerAs: 'vunetDataRetentionSettings',
    controller: vunetDataRetentionSettings,
  };
});
function vunetDataRetentionSettings($injector, $scope, StateService) {

  // This callback is called to check if a particular row should be allowed
  // to delete. We can not allow user to delete the 'root index'.
  $scope.deleteIconCheckCallback = (rowIds) => {
    return rowIds.find(rowId => /^([1-9]+-\*)$/.test(rowId)  === true) ? true : false;
  };

  // Init function
  function init() {
    // Always display doc title as 'Data Retention Settings'
    const Private = $injector.get('Private');
    const docTitle = Private(DocTitleProvider);
    docTitle.change(VunetSidebarConstants.DATA_RETENTION_SETTINGS);
  }

  // This callback is called to check if a particular index_prefix already exists
  // or not.. If this returns true, an error is displayed to the user
  $scope.validateValue =  (key, value) => {
    return $scope.dataRetentionList.Retention_Preference.data_management_preference[0].per_index_setting
      .find(typeOneData => typeOneData[key] === value) ? true : false;
  };

  $scope.settingsMeta = {
    headers: ['Index Prefix', 'Active Data', 'Inactive Data', 'Archived'],
    rows: ['index_prefix', 'active_data', 'inactive_data', 'archived_data'],
    help: ['index prefix should be number and at least 1 alphabet, - and *' +
      ' special characters allowed', 'Configure the number of days for which' +
    ' data corresponding to this index will be active. Active indices allows' +
    ' for live search and analytics on data.', 'Configure the number of days' +
    ' for which data corresponding to this index will be kept once it is marked' +
    ' as inactive. After the configured number  of days, data will be either archived' +
    ' or deleted. Inactive indices are not considered in search and analytics. When' +
    ' data is made inactive, it consumes minimal compute resources. At any point, inactive' +
    ' data can be activated back for use in search and analytics',
    'Defined the number of days for which archived data corresponding to this index will be kept ' +
    'in the archive partition. At any point, archived data can be restored back to the system ', ''],
    id: 'index_prefix',
    add: true,
    edit: true,
    deleteIconCheckCallback: $scope.deleteIconCheckCallback,
    table:
    [
      {
        key: 'index_prefix',
        id: true,
        label: 'Index Prefix',
        type: 'text',
        name: 'index_prefix',
        validationCallback: $scope.validateValue,
        props: {
          required: true,
          maxLength: '24',
          minLength: '3',
          pattern: '^(?!\\*)[\\w\\-\\*]*[a-zA-Z][\\w\\-\\*]*$',
        },
        errorText: 'Value can have numbers, alphabets, - (hyphen) and * (star) characters with the' +
        ' length of 3 to 24. There must be at least 1 alphabet. Also it should not start with a *(star).' +
        ' Or Value already exist.'
      },
      {
        key: 'active_data',
        label: 'Active data',
        type: 'number',
        name: 'active_data',
        props: {
          required: true,
          min: '1',
          max: '90'
        },
        errorText: 'Value should be a number. It cannot be zero and must be less than or equal to 90'
      },
      {
        key: 'inactive_data',
        label: 'Inactive data',
        type: 'number',
        name: 'inactive_data',
        props: {
          required: true,
          min: '0',
          max: '90'
        },
        errorText: 'Value should be a number and less than or equal to 90.'
      },
      {
        key: 'archived_data',
        label: 'Archived data',
        type: 'number',
        name: 'archived_data',
        props: {
          required: true,
          min: '0',
          max: '1000'
        },
        errorText: 'Value should be a number and less than or equal to 1000.'
      }]
  };

  // Prepare data to show in the table.
  const populateDataForTable = (data) => {

    const dataRetentionList = [];
    const dataRetentionPreference = data.Retention_Preference.data_management_preference;

    // Push all elements in per_index_setting to dataRetentionList.
    dataRetentionPreference[0].per_index_setting.map((data) => {
      dataRetentionList.push({
        'index_prefix': data.index_prefix,
        'active_data': data.searchable_data_in_days,
        'inactive_data': data.non_searchable_data_in_days,
        'archived_data': data.archive_data_after_days
      });
    });

    // Add last element coming from back end (root preference setting) to the list.
    dataRetentionList.push({ 'index_prefix': dataRetentionPreference[0].tenant_bu,
      'active_data': dataRetentionPreference[0].searchable_data_in_days,
      'inactive_data': dataRetentionPreference[0].non_searchable_data_in_days,
      'archived_data': dataRetentionPreference[0].archive_data_after_days
    });

    // Store data in $scope local variable.
    $scope.dataRetentionList = data;
    return dataRetentionList;
  };

  // Fetch data retention items from back end to display.
  $scope.fetchDataRetentionItems = () => {
    // API gets called when dataRetentionList is undefined, basically this
    // gets called when page gets load.
    if ($scope.dataRetentionList === undefined) {
      return StateService.getDataRetentionDuration().then(function (data) {
        return populateDataForTable(data);
      });
    } else {
      // Gets called for CRUD(Add, Edit and Delete) operation.
      return Promise.resolve(populateDataForTable($scope.dataRetentionList));
    }
  };


  // Function to add or edit data retention.
  $scope.updateDataRetentionSettings = (event, dataId, dataRetention) => {
    // When edit or add clicked.
    if (event === 'edit' || event === 'add') {

      const addOreditVal = {
        'index_prefix': dataRetention.index_prefix,
        'searchable_data_in_days': dataRetention.active_data,
        'non_searchable_data_in_days': dataRetention.inactive_data,
        'archive_data_after_days': dataRetention.archived_data
      };

      // For add push the new item in to a list.
      if (event === 'add') {
        $scope.dataRetentionList.Retention_Preference.data_management_preference[0].per_index_setting.push(addOreditVal);
      } else {
        // For edit replace the item in a list except root index row.
        $scope.dataRetentionList.Retention_Preference.data_management_preference[0].per_index_setting.map((dataval, index) => {
          if (dataval.index_prefix === dataId) {
            $scope.dataRetentionList.Retention_Preference.data_management_preference[0].per_index_setting[index] = addOreditVal;
          } else {
            // When root index row is updating.
            $scope.dataRetentionList.Retention_Preference.data_management_preference[0].index_prefix = dataRetention.index_prefix;
            $scope.dataRetentionList.Retention_Preference.data_management_preference[0].searchable_data_in_days =
             dataRetention.active_data;
            $scope.dataRetentionList.Retention_Preference.data_management_preference[0].non_searchable_data_in_days =
             dataRetention.inactive_data;
            $scope.dataRetentionList.Retention_Preference.data_management_preference[0].archive_data_after_days =
             dataRetention.archived_data;
          }
        });
      }

      // For add or Edit update data retention settings(Uses PUT for both add and edit).
      return StateService.updateDataRetentionSettings($scope.dataRetentionList.Retention_Preference).then(function () {
        return Promise.resolve(true);
      });
    }
  };

  // Delete selected item.
  $scope.delete = (rows) => {

    // Delete items in a loop.
    rows.map((row) => {

      // Get the index of element to delete.
      const index = $scope.dataRetentionList.Retention_Preference.data_management_preference[0]
        .per_index_setting.findIndex(data => data.index_prefix === row.index_prefix);

      // Delete the element from that index.
      // We remove the element from the UI scope first
      // and then make an Api call to update them.
      $scope.dataRetentionList.Retention_Preference.data_management_preference[0].per_index_setting.splice(index, 1);
    });

    // Make a put call to update the table entries after deletion
    return StateService.updateDataRetentionSettings($scope.dataRetentionList.Retention_Preference).then(function () {
      return Promise.resolve(true);
    });
  };

  init();
}
