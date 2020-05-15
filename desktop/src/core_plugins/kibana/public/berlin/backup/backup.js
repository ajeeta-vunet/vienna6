// ------------------------- NOTICE ------------------------------- //
//                                                                  //
//                   CONFIDENTIAL INFORMATION                       //
//                   ------------------------                       //
//     This Document contains Confidential Information or           //
//     Trade Secrets, or both, which are the property of VuNet      //
//     Systems Ltd.  This document may not be copied, reproduced,   //
//     reduced to any electronic medium or machine readable form    //
//     or otherwise duplicated and the information herein may not   //
//     be used, disseminated or otherwise disclosed, except with    //
//     the prior written consent of VuNet Systems Ltd.              //
//                                                                  //
// ------------------------- NOTICE ------------------------------- //

// Copyright 2020 VuNet Systems Ltd.
// All rights reserved.
// Use of copyright notice does not imply publication.

import { uiModules } from 'ui/modules';
const app = uiModules.get('app/berlin');
import { DocTitleProvider } from 'ui/doc_title';
import { VunetSidebarConstants } from 'ui/chrome/directives/vunet_sidebar_constants';
import { SCHEDULE_FREQUENCY_CONSTANTS } from '../backup/backup_constants';
import _ from 'lodash';
import './backup.less';
import chrome from 'ui/chrome';

// This directive handles vusmartmaps backup schedule
// configurations
app.directive('vunetBackup', function () {
  return {
    restrict: 'E',
    controllerAs: 'vunetBackup',
    controller: vunetBackup,
  };
});

function vunetBackup($injector,
  $scope,
  Promise,
  Notifier,
  StateService) {
  const notify = new Notifier({
    location: 'Backup'
  });


  // Init function
  function init() {

    // Always display doc title as 'Backup'
    const Private = $injector.get('Private');
    const docTitle = Private(DocTitleProvider);
    docTitle.change(VunetSidebarConstants.BACKUP);

    // Backup meta.
    $scope.backupMeta = {
      headers: ['Name', 'Frequency', 'Status', 'Credentials', 'Email'],
      rows: ['name', 'frequency', 'status', 'cred_encryption', 'email'],
      id: 'name',
      add: true,
      edit: true,
      selection: true,
      search: true,
      forceUpdate: false,
      clickOutsideToCloseModal: false,

      // possible actions on schedules
      tableAction: [
        { button: 'Backup Now' },
        { button: 'Disable Schedule' },
        { button: 'Enable Schedule' }
      ],

      // default values for add schedule form
      default: {
        fileServer: false,
        localDirectory: true,
        cronString: '0 0 * * *',
        scheduleFrequency: 'day',
        archival_objects: [
          'vusmartmaps_objects',
          'data_integration_files',
          'service_configuration_files',
          'etl_configs',
          'user_info',
        ],
        localDirectoryConfig: []
      },

      // metadata for schedule form
      table: [
        {
          key: 'name',
          validationCallback: $scope.validateValue,
          label: 'Name',
          name: 'name',
          type: 'text',
          props: {
            required: true,
            maxLength: '32',
            pattern: '^[a-zA-Z0-9_.-]+( [a-zA-Z0-9_]+)*$'
          },
          errorText: `Name should be unique and can have alpha-numeric characters. _ , . and - 
            is also allowed but the name should not exceed 32 characters.`
        }, {
          key: 'archival_objects',
          label: 'Objects to be backed up',
          type: 'multiSelect',
          helpText: `Select the types of information objects to be backed up.`,
          name: 'objectsToBeBackedUp',
          options: [
            {
              key: 'vuSmartMapsObjects',
              name: 'vuSmartMapsObjects',
              label: 'vuSmartMaps Objects',
              value: 'vusmartmaps_objects'
            },
            {
              key: 'dataSourcesAndIntegrations',
              name: 'dataSourcesAndIntegrations',
              label: 'Data Sources And Integrations',
              value: 'data_integration_files'
            },
            {
              key: 'serviceConfigurationFiles',
              name: 'serviceConfigurationFiles',
              label: 'Service Configuration Files',
              value: 'service_configuration_files'
            },
            {
              key: 'ETLConfiguration',
              name: 'ETLConfiguration',
              label: 'ETL Configuration',
              value: 'etl_configs'
            },
            {
              key: 'userInfo',
              name: 'userInfo',
              label: 'User Info',
              value: 'user_info'
            },
            {
              key: 'activeData',
              name: 'activeData',
              label: 'Active Data',
              value: 'active_data'
            },
          ],
          props: {
            pattern: '.*',
            required: true
          }
        }, {
          key: 'backUpLocation',
          label: 'Backup location',
          name: 'backUpLocation',
          htmlContent: '<div class="backup-location-header">Backup location</div>',
          type: 'html'
        }, {
          key: 'fileServer',
          name: 'fileServer',
          label: 'File Server',
          type: 'checkbox',
          validationCallback: $scope.onBackupLocationChange,
          errorText: `Please select atleast one back up location`,
          props: {
          },
          rules: {
            name: 'disableFileServer',
            options: [
              {
                value: false,
                actions: [{
                  hide: ['fileServerConfig']
                }]
              }
            ]
          }
        },
        {
          key: 'fileServerConfig',
          label: 'File Server Configuration',
          type: 'formGroup',
          content: {
            data: {
              name: '',
              remoteIp: '',
              credentials: '',
              remotePath: ''
            },
            metaData: [
              {
                key: 'name',
                label: 'Name',
                name: 'name',
                type: 'text',
                props: {
                  required: true,
                  maxLength: '32',
                  pattern: '^[a-zA-Z0-9_.-]+( [a-zA-Z0-9_]+)*$'
                },
                errorText: `Name can have alpha-numeric characters. _, . and - 
                is also allowed but the name should not exceed 32
                characters.`
              },
              {
                key: 'remoteIp',
                label: 'Remote IP',
                name: 'remoteIp',
                type: 'text',
                props: {
                  required: true,
                  pattern: '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]).){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$'
                },
                errorText: `Please provide a valid IP address`
              },
              {
                key: 'credentials',
                label: 'Credentials',
                type: 'select',
                name: 'credentials',
                options: [],
                props: {
                  required: true
                }
              },
              {
                key: 'remotePath',
                label: 'Remote Path',
                name: 'remotePath',
                type: 'text',
                helpText: `The location to which the backup file created should be uploaded.
                  It can external file server reachable through SSH`,
                props: {
                  required: true,
                  maxLength: '64',
                  pattern: '.*',
                },
                errorText: `Please provide a valid path`
              }
            ]
          }
        },
        {
          key: 'localDirectory',
          label: 'Local Directory',
          name: 'localDirectory',
          type: 'checkbox',
          validationCallback: $scope.onBackupLocationChange,
          errorText: `Please select atleast one back up location`,
          props: {
          },
          rules: {
            name: 'disableLocalDir',
            options: [
              {
                value: false,
                actions: [{
                  hide: ['localDirectoryConfig']
                }]
              }
            ]
          }
        },
        {
          key: 'localDirectoryConfig',
          label: 'Local Directory Configuration',
          type: 'formGroup',
          content: {
            data: {
              name: '',
              path: ''
            },
            metaData: [
              {
                key: 'name',
                label: 'Name',
                name: 'name',
                type: 'text',
                props: {
                  required: true,
                  maxLength: '32',
                  pattern: '^[a-zA-Z0-9_.- ]+$'
                },
                errorText: `Name can have alpha-numeric characters. _, . and - 
                  is also allowed but the name should not exceed 32
                  characters.`
              },
              {
                key: 'path',
                label: 'Path',
                name: 'path',
                type: 'text',
                helpText: `The location to which the backup file created should be
                  uploaded. The location can be a local file folder`,
                props: {
                  required: true,
                  maxLength: '64',
                  pattern: '.*',
                },
                errorText: `Please provide a valid path`
              },
            ]
          }
        },
        {
          key: 'vuSmartMapsCloudServer',
          name: 'vuSmartMapsCloudServer',
          label: 'vuSmartMaps Cloud Server',
          type: 'checkbox',
          validationCallback: $scope.onBackupLocationChange,
          errorText: `Please select atleast one back up location`,
          props: {
          },
        }, {
          key: 'cronString',
          label: 'Schedule',
          helpText: `Frequency at which backup should be executed.`,
          type: 'crontab',
          name: 'schedule',
        }, {
          key: 'credentials',
          label: 'Credential for back up file encryption',
          type: 'select',
          helpText: `The password from this Credential object is used to encrypt 
          the backup file created.`,
          name: 'securityLevel',
          options: [],
          props: {
            required: true
          },
        }, {
          key: 'email',
          label: 'Email for back up status',
          type: 'text',
          name: 'email',
          helpText: `The status of backup activity along with details of errors,
           if any, are notified to the Email IDs listed here.`,
          props: {
            required: true,
            pattern: '^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,5})+$'
          },
          errorText: 'Invalid email.'
        }]
    };

    // Initializing modalData to maintain contents to
    // be displayed in vunet modal used for confirmation
    // messages.
    $scope.modalData = {};

    // Get user credentials. The values received are shown as
    // options for encryption of archived objects.
    StateService.getCredentials('user').then((data) => {

      // Use user crendential values in select option
      // of credentials
      $scope.backupMeta.table.map((obj) => {
        if (obj.key === 'credentials') {
          data.creds.map((cred) => {
            const optionObj = {};
            optionObj.key = cred.name;
            optionObj.name = cred.name;
            optionObj.value = cred.name;
            obj.options.push(optionObj);
          });

          $scope.backupMeta.default.credentials = obj.options &&
            obj.options[0].value;
        }

        // Use user crendential values in select option
        // of file server credentials
        if (obj.key === 'fileServerConfig') {
          obj.content.metaData.map((fileConfigObj) => {
            if (fileConfigObj.key === 'credentials') {
              data.creds.map((cred) => {
                const optionObj = {};
                optionObj.key = cred.name;
                optionObj.name = cred.name;
                optionObj.value = cred.name;
                fileConfigObj.options.push(optionObj);
              });
              obj.content.data.credentials = fileConfigObj.options &&
                fileConfigObj.options[0].value;
            }
          });
        }
      });
    });

    // Get username
    const username = chrome.getCurrentUser()[0];

    // Get the email of logged in user and set it as
    // default for backup notifications
    StateService.getUserInfo(username).then((data) => {
      $scope.backupMeta.default.email = data.email;
    });

    // Set default entry for local directory configuration
    const tenantBu = chrome.getTenantBu();
    const localDirDefaultObj = {
      name: 'local dir',
      path: `/opt/archive/${tenantBu[0]}/${tenantBu[1]}`
    };

    // Set the default backup location for local directory
    $scope.backupMeta.default.localDirectoryConfig.push(localDirDefaultObj);
  }

  // This dict is used as a look up by function: '$scope.onBackupLocationChange'
  // which is passed as the validation callback to the 3 types of backup location
  $scope.backupLocationsDict = {
    fileServer: false,
    localDirectory: true,
    cloudServer: false
  };

  // This function is passed as validation callback for the below
  // input elements under backup location:
  // filerServer
  // localDirectory
  // cloudServer
  // When any one of these inputs are changed we update the
  // $scope.backupLocationsDict and then check if atleast of
  // of the backup location types are checked.
  $scope.onBackupLocationChange = (key, value) => {
    $scope.backupLocationsDict[key] = value;
    for (const item in $scope.backupLocationsDict) {
      if ($scope.backupLocationsDict[item] === true) {
        return false;
      }
    }
    return true;
  };

  // This function prepares a html list structure of schedules selected
  // to be displayed in the confirmation modal
  const prepareScheduleListHtml = () => {

    $scope.scheduleListHtml = $scope.modalData.scheduleList.map(item =>
      '<li style="list-style:none; margin-bottom:10px">' + item + '</li>').join('');
  };

  // This is called when one of the table action button has been clicked
  // Possible actions:
  // 'Backup Now' : Initiate backup for selected schedules.
  // 'Disable Schedule': Disable selected schedules.
  // 'Enable Schedule': Enable selected schedules.
  $scope.onTableAction = (eventType, rows) => {

    $scope.showModal = true;
    $scope.modalData.scheduleList = [];
    $scope.modalData.eventType = eventType;

    // Create a modal with right data based on the button that was clicked.
    if (eventType === 'Backup Now') {
      $scope.isDisabledScheduleSelected = false;

      // Check if any of the schedule is disabled.
      // If disabled, set a flag to true.
      rows.some((row) => {
        if (row.backup_enabled_flag === false) {
          $scope.isDisabledScheduleSelected = true;
          return true;
        }
        $scope.modalData.scheduleList.push(row.name);
      });

      // Prepare modal data for Backup Now
      $scope.modalData.isForm = false;
      $scope.modalData.title = 'Backup Now';

      // If disabled schedules is selected, Do not initiate
      // backup and show an user friendly message.
      if ($scope.isDisabledScheduleSelected) {

        $scope.modalData.message = `<h4 class="schedulelist-popup"> Cannot initiate backup for 
        disabled schedules. Please remove the disabled schedules and try again. </h4>`;
      } else {

        // If no disabled schedules found, display the list of
        // schedules to be backed up.
        prepareScheduleListHtml();
        $scope.modalData.message = `<h4 class="schedulelist-popup"> Initiate backup for 
          the following schedules ? <p><ul>${$scope.scheduleListHtml}</ul></p></h4>`;
      }


      // Prepare modal data for Disable Schedule
    } else if (eventType === 'Disable Schedule') {

      rows.forEach((row) => {
        $scope.modalData.scheduleList.push(row.name);
      });
      prepareScheduleListHtml();

      $scope.modalData.isForm = false;
      $scope.modalData.title = 'Disable Schedule';
      $scope.modalData.message = `<h4 class="schedulelist-popup"> Disable backup for 
      the following schedules ? <p><ul>${$scope.scheduleListHtml}</ul></p></h4>`;

      // Prepare modal data for Enable Schedule
    } else if (eventType === 'Enable Schedule') {

      rows.forEach((row) => {
        $scope.modalData.scheduleList.push(row.name);
      });
      prepareScheduleListHtml();

      $scope.modalData.isForm = false;
      $scope.modalData.title = 'Enable Schedule';
      $scope.modalData.message = `<h4 class="schedulelist-popup"> Enable backup for 
      the following schedules ? <p><ul>${$scope.scheduleListHtml}</ul></p></h4>`;
    }
    return Promise.resolve(false);
  };

  // Close the cofirmation modal.
  $scope.onModalClose = () => {
    $scope.showModal = false;
  };

  // This function runs when confirmation modal is submitted.
  $scope.onModalSubmit = (event) => {

    // Initiate the backup for selected schedules.
    if (event === 'Backup Now' && !$scope.isDisabledScheduleSelected) {
      const requestPayload = [];
      $scope.modalData.scheduleList.forEach((obj) => {
        requestPayload.push({ 'name': obj });
      });
      const requestPayloadString = JSON.stringify(requestPayload);
      return StateService.backupSelectedSchedules(requestPayloadString).then(function () {
        $scope.backupMeta.forceUpdate = true;
        $scope.showModal = false;
        notify.info('Backup has been initiated');
      }, function () {
        $scope.backupMeta.forceUpdate = true;
        return Promise.resolve(false);
      });

      // Disable backups for selected schedules
    } else if (event === 'Disable Schedule') {

      $scope.scheduleData.map((schedule) => {
        if ($scope.modalData.scheduleList.includes(schedule.name)) {
          schedule.backup_enabled_flag = false;
        }
      });

      // Make a back end call to update all the schedules
      StateService.handleBackupSchedules('PUT', $scope.scheduleData).then(function () {
        $scope.backupMeta.forceUpdate = true;
        return Promise.resolve(true);
      }, function () {
        $scope.backupMeta.forceUpdate = true;
        return Promise.resolve(false);
      });

      // Enable backups for selected schedules
    } else if (event === 'Enable Schedule') {

      $scope.scheduleData.map((schedule) => {
        if ($scope.modalData.scheduleList.includes(schedule.name)) {
          schedule.backup_enabled_flag = true;
        }
      });

      // Make a back end call to update all the schedules
      StateService.handleBackupSchedules('PUT', $scope.scheduleData).then(function () {
        $scope.backupMeta.forceUpdate = true;
        return Promise.resolve(true);
      }, function () {
        $scope.backupMeta.forceUpdate = true;
        return Promise.resolve(false);
      });
    }
  };

  // Delete backup schedules
  $scope.deleteSelectedItems = (rows) => {

    // Iterate over list of backup schedules to be deleted and delete
    // one by one. We return a list of promises which contains both
    // success and failure cases.
    const deletePromises = Promise.map(rows, function (row) {
      return StateService.handleBackupSchedules('DELETE', row.name)
        .then(function () {
          return '';
        })
        .catch(function () {
          return '';
        });
    });

    // Wait till all Promises(deletePromises) are resolved
    // and return single Promise
    return Promise.all(deletePromises);
  };

  // This callback is called to check if a particular schedule name already exists
  // or not.. If this returns true, an error is displayed to the user
  $scope.validateValue = (key, value) => {
    return $scope.scheduleData.find(schedule => schedule[key] === value) ? true : false;
  };

  // This is called when add or edit operation is carried out and
  // submit is clicked.
  $scope.onSubmit = (event, scheduleId, data) => {

    // prepare request payload.
    const scheduleData = {};
    scheduleData.cron_string = data.cronString;
    scheduleData.archival_objects = data.archival_objects;
    scheduleData.email = data.email;
    scheduleData.backup_enabled_flag = true;
    scheduleData.name = data.name;
    scheduleData.cred_encryption = data.credentials;
    scheduleData.frequency = SCHEDULE_FREQUENCY_CONSTANTS[data.scheduleFrequency];

    // prepare one list 'destinations' containing all
    // types of back up locations.
    scheduleData.destinations = [];

    // Add the local directory configuration to the destination list
    // only when the local directory checkbox is checked
    if (data.localDirectory) {
      data.localDirectoryConfig && data.localDirectoryConfig.forEach((obj) => {
        const localDirectory = {};
        localDirectory.type = 'local_dir';
        localDirectory.id = obj.name;
        localDirectory.details = {};
        localDirectory.details.path = obj.path;
        localDirectory.id = obj.name;
        scheduleData.destinations.push(localDirectory);
      });
    }

    // Add the file server configuration to the destination list
    // only when the file server checkbox is checked
    if (data.fileServer) {
      data.fileServerConfig && data.fileServerConfig.forEach((obj) => {
        const fileServer = {};
        fileServer.type = 'file_server';
        fileServer.id = obj.name;
        fileServer.details = {};
        fileServer.details.remote_ip = obj.remoteIp;
        fileServer.details.remote_port = 22;
        fileServer.details.cred_name = obj.credentials;
        fileServer.details.remote_path = obj.remotePath;
        scheduleData.destinations.push(fileServer);
      });
    }

    const cloudServer = {
      type: 'cloud_server',
      enabled: data.vuSmartMapsCloudServer || false
    };

    scheduleData.destinations.push(cloudServer);

    // For 'Add' operation, we send only the new schedule created
    if (event === 'add') {
      return StateService.handleBackupSchedules('POST', scheduleData).then(function () {
        return Promise.resolve(true);
      }, function () {
        return Promise.resolve(false);
      });

      // For 'Edit' operation, We send list of all schedules
      // after successful 'edit' operation
    } else if (event === 'edit') {
      const index = $scope.scheduleData.findIndex(obj => obj.name === scheduleData.name);
      $scope.scheduleData.splice(index, 1, scheduleData);
      return StateService.handleBackupSchedules('PUT', $scope.scheduleData).then(function () {
        $scope.backupMeta.forceUpdate = true;
        return Promise.resolve(true);
      }, function () {
        return Promise.resolve(false);
      });
    }
  };

  // Close the modal. This gets called when the
  // add / edit modal is opened and closed by the user
  // clicking on 'Cancel'.
  $scope.onModalClose = () => {
    $scope.showModal = false;
  };

  // fetch schedule items to display.
  $scope.fetchBackupItems = () => {
    return StateService.handleBackupSchedules('GET').then(function (data) {
      const scheduleData = JSON.parse(data.json_str);
      $scope.scheduleData = _.cloneDeep(scheduleData);
      scheduleData.map((schedule) => {

        // prepare data to pre populate the schedule form on edit
        // operation
        schedule.status = schedule.backup_enabled_flag ? 'Enabled' : 'Disabled';
        schedule.credentials = schedule.cred_encryption;
        schedule.cronString = schedule.cron_string;
        schedule.scheduleFrequency = Object.keys(SCHEDULE_FREQUENCY_CONSTANTS)
          .find(key => SCHEDULE_FREQUENCY_CONSTANTS[key] === schedule.frequency);
        schedule.localDirectoryConfig = [];
        schedule.fileServerConfig = [];
        schedule.destinations.map((destination) => {
          if (destination.type === 'local_dir') {
            const localDirObj = {};
            localDirObj.name = destination.id;
            localDirObj.path = destination.details.path;
            schedule.localDirectoryConfig = [...schedule.localDirectoryConfig, localDirObj];
          } else if (destination.type === 'file_server') {
            const fileServerObj = {};
            fileServerObj.name = destination.id;
            fileServerObj.remoteIp = destination.details.remote_ip;
            fileServerObj.credentials = destination.details.cred_name;
            fileServerObj.remotePath = destination.details.remote_path;
            schedule.fileServerConfig = [...schedule.fileServerConfig, fileServerObj];
          } else if (destination.type === 'cloud_server') {
            schedule.vuSmartMapsCloudServer = destination.enabled;
          }
        });
        if (schedule.localDirectoryConfig.length) {
          schedule.localDirectory = true;
        }
        if (schedule.fileServerConfig.length) {
          schedule.fileServer = true;
        }
      });
      $scope.backupMeta.forceUpdate = false;
      return scheduleData;
    });
  };

  init();
}
