import { toggleFullscreen } from 'ui/utils/vunet_fullscreen';
import { prepareLinkInfo } from 'ui/utils/link_info_eval.js';
/* globals $, window */

// THE FOLLOWING THINGS WILL BE TAKEN CARE LATER OR NOT BEING USED FOR NOW:
// 1. Login broadcast i.e. vusop:login as login page not implemented till now
// 2.Scan and snapshot not being used for now (getActiveSnapshot , getActiveSnapshotDetails , getCurrentSnapshotId , getCurrentScanNotification)

// import { uiModules } from 'ui/modules';
// const module = uiModules.get('kibana', ['kibana']);
// module.controller('TopbarCtrl', function ($scope, StateService, $rootScope, $interval, POLLING_TIME, $timeout, chrome, $window) {
// });

class TopbarCtrl {
  constructor($scope, StateService, $rootScope, $route, Private, timefilter, $interval, POLLING_TIME, $timeout, chrome, $window, kbnUrl) {
    // Getting the Idle session Timeout from chrome_vunet.js and starting timeout function

    // here we are capture the emit send by manage_users.js for change in admin console access
    $rootScope.$on('adminConsole', function (event, adminConsole) {
      if(adminConsole === 'Yes') {
        $scope.allow_console_access = true;
      }
      else {
        $scope.allow_console_access = false;
      }
    });

    const currentRouteWhileGeneralSettings = window.location.href;
    $scope.showUserSettingsModal = false;
    $scope.allow_console_access = false;

    //To fetch the username
    StateService.getCurrentUserInfo().then(function (data) {
      $scope.userData = data;
      $scope.userName = data.name;
      // We are creating the data for general settings user form.
      $scope.modifiedUserData = {
        'name': data.name,
        'email': data.email,
        'newPassword': '',
        'confirmPassword': ''
      };
      $scope.userSettingsModalData.editData = $scope.modifiedUserData;
      if (data.allow_console_login === 'Yes') {
        $scope.allow_console_access = true;
      }
    });

    $scope.openAdminConsole = () => {
      const adminConsoleUrl = 'https://' + window.location.hostname + '/admin-console/';
      $window.open(adminConsoleUrl);
    };

    $scope.openUserSettings = () => {
      $scope.showUserSettingsModal = true;
    };

    $scope.onUserSettingsModalClose = () => {
      $scope.showUserSettingsModal = false;
    };

    //Function to store new password so that it can be compared
    $scope.storeEnteredPassword = (key, data) => {
      $scope.newPasswordToCompare = data;
    };

    //Callback to check if both the entered passwords are the same
    $scope.checkIfPasswordsMatch = (key, data) => {
      if ($scope.newPasswordToCompare === data) {
        return false;
      }
      else {
        return true;
      }

    };
    $scope.userSettingsModalData = {
      isForm: true,
      title: 'General Settings ',
      editData: $scope.modifiedUserData,
      item: [{
        key: 'name',
        label: 'Username',
        id: true,
        type: 'text',
        name: 'username',
        props: {
          required: true,
        },
      },
      {
        key: 'email',
        label: 'Email',
        type: 'email',
        name: 'email',
        props: {
          required: true,
          pattern: '^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,5})+$'
        },
        errorText: 'Please enter a valid email address.'
      },
      {
        key: 'newPassword',
        label: 'New Password',
        type: 'password',
        helpText: 'Enter a strong password',
        name: 'newPassword',
        validationCallback: $scope.storeEnteredPassword,
        props: {
          required: true,
          pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#-])[A-Za-z\\d@$!%*?&#-]{8,24}$'
        },
        errorText: `Your password must be a single word between 8-24 characters with atleast 
                    one uppercase letter, one lowercase letter, one number and one special character
                    ( @$!%*?&amp;#- ).`
      },
      {
        key: 'confirmPassword',
        label: 'Confirm New Password',
        type: 'password',
        name: 'confirmNewPassword',
        validationCallback: $scope.checkIfPasswordsMatch,
        props: {
          required: true,
        },
        errorText: `The Passwords don't match.`
      }]
    };

    // SUbmit call of user-setting modal
    $scope.onUserSettingsModalSubmit = (data) => {
      $scope.userData.password = data.newPassword;
      $scope.userData.email = data.email;
      const user = { user: $scope.userData };
      const dataToSend = user;
      StateService.editUser(data.name, dataToSend).then(() => {
        //This is done to update email id in user table if user is on manage users tab
        if (currentRouteWhileGeneralSettings.includes('/berlin/user')) {
          $route.reload();
        }
        $scope.modifiedUserData.email = dataToSend.user.email;
      });
      $scope.showUserSettingsModal = false;
    };

    //Fullscreen function
    $scope.toggleFullscreen = function () {
      toggleFullscreen();
    };

    $scope.session_idle_timeout = chrome.getSessionIdleTimeout();
    $scope.myTimeOut = $timeout(function () { $scope.idleTimeout(); }, $scope.session_idle_timeout);

    // This is to disable run-diagnostic once diagnostic is already displayed
    $scope.diagnostic_display_on = false;

    // Not being used for now. Please don't clean this code
    // $scope.data.activeSnapshot = StateService.getActiveSnapshot();

    $scope.userLoggedIn = StateService.isAuthenticated();

    //Initialising the unified notifications length to 0.
    $scope.notificationLength = 0;

    // Not being used for now. Please don't clean this code
    // $rootScope.$on('vusop:snapshotChanged', () => {
    //   StateService.getActiveSnapshotDetails().then((snapshotDetails) => {
    //     $scope.snapshotDetails = snapshotDetails;
    //   });
    // });

    // This is called when vusop:login message is broadcasted..(NOT WORKING :- As login() is not integrated)
    // $rootScope.$on('vusop:login', (event, passed) => {
    //   if (passed) {
    //     $scope.handleUserLoggedIn();
    //   }
    // });

    // This function is called to check if the current user is a Super Admin or
    // not, A user is Super Tenant Admin if its tenant-id is 1 and its user
    // permissions are 'admin'
    $scope.isSuperTenantAdmin = chrome.isUserFromSuperTenantAdmin();

    // Run diagnostics
    $scope.run_diagnostic = () => {

      // We are displaying diagnostics
      $scope.diagnostic_display_on = true;
      StateService.requestDiagnostic().then(function (data) {

        //This is how the diagnostic data is expected from backend
        // $scope.diagnostic_data = [
        //   ["shipper", [
        //     ["/var/log/ Usage", "50%"],
        //     ["/home Usage", "30%"],
        //     ["Data Collector", "Running"],
        //     ["Web Server", "Running"],
        //     ["Visualization Server", "Running"],
        //     ["Data Acquisition Server", "Running"],
        //     ["Log Management", "Configured"],
        //     ["Redis", "Running"],
        //     ["Memory Usage", "30%"]
        //   ]],
        //   ["analyser", [
        //     ["Data Collector", "Running"],
        //     ["Log Management", "Configured"]
        //   ]]
        // ];


        $scope.diagnostic_data = data;
        $scope.modalData.isForm = false;
        $scope.modalData.title = 'Diagnostic Output';

        // Creating the modal message i.e table for displaying the diagnostic results
        $scope.modalData.message = createNotificationTable();
        function createNotificationTable() {
          let table = '<div>';
          $scope.diagnostic_data.forEach(data => {
            table += '<h4>' + data[0] + '</h4>';
            table += '<table class="table table-hover table-striped  table-bordered">';
            data[1].forEach(_data => {
              table += '<tr><td>' + _data[0] + '</td><td>' + _data[1] + '</td></tr>';
            });
            table += '</table></div>';
          });
          return table;
        }

        $scope.showModal = true;
        $scope.diagnostic_display_on = false;
      });
    };

    // Stop the Idle timer and go to login page
    $scope.stopIdleTimerAndGoToLoginPage = () => {

      // Reload the location, which redirect the user to the login page. This
      // happens because of the reason explained below.
      // This function is called only after the user logged out. The location
      // reload, triggers the $stateChangeStart event. The listener for this event
      // is defined in index.js. This listener checks whether the user is
      // logged in or not and as the user is already logged out, it redirect the
      // user to login page.
      window.location.href = window.location.origin + '/vunet.html#/login';
    };

    // Listener for IdleTimeout event of the session idle timer
    $scope.idleTimeout = () => {
      // username becomes empty when the user logout.
      // If the user already logged out from any other tab, just redirect him
      // to login page
      if (window.localStorage.username === '') {
        $scope.stopIdleTimerAndGoToLoginPage();
      } else {
        // If the user is logged in, Log out the user.
        // This also calls the REST API to logout the user in the backend
        $scope.logout();
      }
    };

    $scope.showModal = false;

    // Modal data use for both logout and diagnostic pop-up
    $scope.modalData = {
      title: '',
      message: ''
    };

    // This function is called when user clicks on logout button
    $scope.buttonLogout = () => {
      // $scope.showLogoutDropdown  = !$scope.showLogoutDropdown
      $scope.modalData.isForm = false;
      $scope.modalData.title = 'Logout confirmation';
      $scope.modalData.message = '<h4> Are you sure you want to Logout ? </h4>';
      $scope.showModal = true;
    };

    //vunet_modal for logout
    $scope.onModalClose = () => {
      $scope.showModal = false;
    };

    // Logout support from modal
    $scope.onModalSubmit = () => {
      if ($scope.modalData.title === 'Logout confirmation') {
        StateService.logoutUser().then(() => {
          // Remove the username
          window.localStorage.username = '';
          $scope.stopIdleTimerAndGoToLoginPage();
          $scope.showModal = false;
        });
      }
    };

    //LOGOUT after session timeout
    $scope.logout = () => {
      StateService.logoutUser().then(() => {
        // Remove the username
        window.localStorage.username = '';
        $scope.stopIdleTimerAndGoToLoginPage();
      });
    };


    // Redirect the user to login page, immediately after the user logged out
    // from any other tab
    $window.addEventListener('storage', function (event) {
      // username becomes empty when the user logout.
      if (event.key === 'username' && event.newValue === '') {
        $scope.stopIdleTimerAndGoToLoginPage();
      }
    }, false);

    //Reset timer on events and start again
    $scope.resetTimerAndStartAgain = () => {
      $timeout.cancel($scope.myTimeOut);
      $scope.myTimeOut = $timeout(function () { $scope.idleTimeout(); }, $scope.session_idle_timeout);
    };

    //Resting the Idle timer on various actions
    $window.addEventListener('mousemove', function () {
      $scope.resetTimerAndStartAgain();
    });
    $window.addEventListener('keydown', function () {
      $scope.resetTimerAndStartAgain();
    });
    $window.addEventListener('DOMMouseScroll', function () {
      $scope.resetTimerAndStartAgain();
    });
    $window.addEventListener('mousewheel', function () {
      $scope.resetTimerAndStartAgain();
    });
    $window.addEventListener('mousedown', function () {
      $scope.resetTimerAndStartAgain();
    });


    // function to get the notifications
    $scope.getNotifications = () => {

      //This is how the notificationResponse data is expected from backend
      // const data = {
      //   Alerts: [{ timestamp: '2018-10-24 11:05:50', name: 'fliashsafkjhlkjasofihasj;fjasphf1', summary: 'Kanasufgaskufgoaiwhfoiashfoiwhfoasfasfashfhoashfoiusajlfhausgfha', type: 'warning' },
      //     { timestamp: '2018-10-24 11:10:00', name: 'Romil2', summary: 'Kanungo2', type: 'warning' },
      //     { timestamp: '2018-10-24 11:15:50', name: 'Romil3', summary: 'Kanungo3', type: 'warning' }],
      //   Storage: []
      // };

      // Don't call getNotifications for print report.
      if (!$rootScope.printReport) {

        StateService.getNotifications().then(function (data) {

        // Declaring the alert notifications count variable.
          let alertCount = 0;

          // If few alerts already exists, Get the latest alert
          // object and compare it with incoming alert notification
          // response and update the unified notification count.
          if ($scope.notificationResponse) {

          //getting the latest alert object
            const latestAlertObj = $scope.notificationResponse.Alerts[0];

            // Iterate over the new alert notification response
            for (let item = 0; item < data.Alerts.length; item++) {

            // Compare the latest alert object and the objects in the
            // new alert notification response
            // We use angular.equals to compare two objects which ignores
            // $$hash_key present in the object
            /*eslint-disable*/
              if (angular.equals(data.Alerts[item], latestAlertObj)) {
                /*eslint-enable*/
              // When there is a match update the alert notification
              // count and come out of the loop
                break;
              }

              // If match is not found keep increamenting the
              // alert notification count
              alertCount = alertCount + 1;
            }
          }
          else {

          // When alerts are generated for the first time,
          // The alert notification count is equal to no of alert
          // notifications received.
            alertCount = data.Alerts.length;
          }

          // Updating the UI with new alert notifications received
          $scope.notificationResponse = data;

          // Calculating the  count of unified notifications
          $scope.notificationLength = $scope.notificationLength + alertCount + data.Storage.length;
          // notificationLength is stored in newNotificationLength to reset
          // the newNotificationLength value after read the alerts.
          $scope.newNotificationLength = $scope.notificationLength;
          // Notifications count should not exceed 5.
          if ($scope.notificationLength > 5) {
            $scope.notificationLength = 5;
          }
        });
      }
    };

    // This function is called when a user successfully logs
    $scope.handleUserLoggedIn = () => {

      // Function to get scan notifications
      $scope.getNotifications();

      // An interval function which keeps polling from front end based on polling time.
      $interval(function () {
        // Commenting for time being but will be used later .Please dont delete the code
        // $scope.getCurrentScanNotification();
        $scope.getNotifications();
      }, POLLING_TIME);

    };

    // This is a case where user was already logged in and the window was
    // refreshed, we treat this as if user has just logged in
    if ($scope.userLoggedIn) {
      $scope.handleUserLoggedIn();
    }

    $scope.dropdownClose = true;
    // This function will be called when user clicks on the notification
    // count that is displayed over notification icon. On click we trigger
    // a click function on drop down button which will show the notification
    // drop down.
    $scope.showNotificationDropdown = () => {
      $scope.dropdownClose = !$scope.dropdownClose;
      if ($scope.dropdownClose === true) {
        $scope.newNotificationLength = 0;
      }
      $scope.notificationLength = 0;
    };

    //This function is called when ever user clicks
    // on notification icon or clicks anyware when
    // dropdown is opened.
    $scope.handleDropdownclose = () => {
      // This is to handle when user clicks other than
      // notification icon to close the dropdown.
      if ($scope.dropdownIsOpen === false && $scope.dropdownClose === false) {
        // calls this function when user clicks anywhere
        //other than notification icon to close the dropdown
        // and to reset the dropdownClose to true, for new notification.
        $scope.showNotificationDropdown();
      }
    };
    // This function will collapse the notification drop down.
    $scope.closeNotificationDropdown = () => {
      $('#notification-icon').removeClass('open');
    };

    // When user clicks on any notification, Redirect to alerts
    // dashboard or storage section based on the notification.
    $scope.showNotificationInformation = (header, notification) => {

      if (header === 'Alerts') {
        // We need to redirect to alerts dashboard in vienna
        // We will handle this in the next phase.
      }
      else if (header === 'Storage' &&
        (notification.type === 'archive_success' ||
          notification.type === 'archive_failure')) {
        // $state.go('data_source.storage.archived_indices');
      }
      else if (header === 'Storage' &&
        (notification.type === 'restore_success' ||
          notification.type === 'restore_failure')) {
        // $state.go('data_source.storage.live_indices');
      }
    };

    $scope.viewNotificationDetails = (notificationSummary) => {
      // If notification summary present, that will be used as search string
      // Also, we do not want any current applied filters/search to
      // to be preserved
      const referencePage = prepareLinkInfo(
        'event/',
        '',
        '',
        false,
        'summary',
        notificationSummary,
        'vunet-*-*-notification-*',
        'now/d',
        'now/d',
        undefined,
        Private,
        timefilter);
      kbnUrl.redirect(referencePage);
    };
    // This function keeps polling to the backend with to check if
    // the snapshot is created or not.
    // $scope.getCurrentScanNotification = () => {
    //   StateService.getScanNotification().then(function (data) {
    //     $scope.response = data;
    //     if (data.status === 'SCAN_COMPLETED') {
    //       Notification.success({
    //         message: 'Scan has been completed. Please check the repository',
    //         delay: NOTIFICATION_TIMEOUT,
    //       });
    //     }
    //   });
    // };
  }
}

TopbarCtrl.$inject = ['$scope', 'StateService', '$rootScope', '$route', 'Private',
  'timefilter', '$interval', 'POLLING_TIME', '$timeout',
  'chrome', '$window', 'kbnUrl'];
/*eslint-disable*/
export default TopbarCtrl;
/*eslint-enable*/
