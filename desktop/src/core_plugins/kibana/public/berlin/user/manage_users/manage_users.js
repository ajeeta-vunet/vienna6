import { uiModules } from 'ui/modules';
import _ from 'lodash';
import chrome from 'ui/chrome';
const app = uiModules.get('app/berlin');

app.directive('manageUsers', function () {
  return {
    restrict: 'E',
    controllerAs: 'manageUsers',
    controller: manageUsers,
    scope: true
  };
});

function manageUsers($scope,
  $http,
  StateService,
  Promise,
  $rootScope
) {

  const userInfo = chrome.getCurrentUser();
  const logginInUserName = userInfo[0];

  // This accessor function is called to get the value to be shown for a
  // given column.. Here we do return title from the home_page and mobile_kpi
  // objects..
  $scope.accessor = (columnName, data) => {
    if((columnName === 'home_page') || (columnName === 'mobile_kpi')) {
      try{
        return (typeof data === 'object') ? data.title : JSON.parse(data).title;
      } catch(e) {
        return data;
      }
    }
  };

  // This function is called when user-group changes to a new one. It tries to
  // load the meta-data options for home-page and mobile-kpi..
  $scope.fetchDashboards = (key, state) => {

    // There is a case this is called with empty value when a new user is
    // getting created, in such a case, we need not do anything and just return
    // and wait for user to select a user-role
    if (state === undefined || state === '') {
      return '';
    }

    switch(key) {

      // As of now, only user_group is supported
      case 'user_group':
        const homePage = $scope.userMeta.table.find(_table => _table.key === 'home_page');
        const mobileKpi = $scope.userMeta.table.find(_table => _table.key === 'mobile_kpi');
        homePage.options = [];
        homePage.options.push({ key: 'empty_home_page_val', label: '', name: 'home', value: '' });
        mobileKpi.options = [];
        mobileKpi.options.push({ key: 'empty_mobile_kpi_val', label: '', name: 'mobileKpi', value: '' });

        // Get the tenant and bu id from state (it may not be set yet)
        const tenantId = state.tenant_id;
        const buId = state.bu_id;

        // If tenantId and buId is not populated, let us not talk to backend
        if (tenantId === undefined || buId === undefined) {
          return;
        }

        // Get dashboard for the passed user-group, tenant-id and bu-id combination..
        StateService.getDashboards(state[key], tenantId, buId).then(function (dashboards) {

          // To sort the "Home Page" dropdown values under Settings->User->User Management->Edit
          dashboards.sort((a,b) => (a.title < b.title) ? -1 : 1);

          // Check if API call gets succeed then populate homePage
          // and mobileKpi options.
          dashboards.forEach(dashboard => {
            homePage.options.push({ key: dashboard.id,
              label: dashboard.title,
              name: 'home',
              value: $scope.accessor('home_page', JSON.stringify(dashboard)),
              obj: dashboard });

            mobileKpi.options.push({ key: dashboard.id,
              label: dashboard.title,
              name: 'mobileKpi',
              value: $scope.accessor
              ('mobile_kpi', JSON.stringify(dashboard)) });
          });
        }).catch();
    }
  };

  // This callback is called to check if a particular user-name already exists
  // or not.. If this returns true, an error is displayed to the user
  $scope.validateValue =  (key, value) => {
    return $scope.user_data.find(typeOneData => typeOneData[key] === value) ? true : false;
  };

  // This callback is called to check if a particular row should be allowed
  // to delete.. We can not allow user to delete the 'VunetAdmin' user group..
  $scope.deleteIconCheckCallback = (rowIds) => {
    return rowIds.find(rowId => rowId === 'VunetAdmin') ? true : false;
  };

  // This callback is called to check if a particular row should be allowed
  // to edit.. We do not allow VunetAdmin user to be edited
  $scope.editIconCheckCallback = (row) => {

    // Get current logged in user details
    const curUser = chrome.getCurrentUser();

    if (row.name === 'VunetAdmin') {
      return true;
    }

    return false;
  };

  // Meta-data for user table..
  $scope.userMeta = {
    headers: ['Name', 'Email', 'Groups', 'Active', 'Home Page', 'Tenant Id', 'BU Id', 'Action'],
    rows: ['name', 'email', 'user_group', 'active', 'home_page', 'tenant_id',  'bu_id'],
    columnData: [{ columnName: 'home_page', func: $scope.accessor },
      { columnName: 'mobile_kpi', func: $scope.accessor }],
    noSortColumns: ['Home Page'],
    add: true,
    edit: true,
    id: 'name',
    title: 'User',
    selection: true,
    search: true,
    wrapTableCellContents: true,
    default: { active: 'Yes', allow_console_login: 'No' },
    deleteIconCheckCallback: $scope.deleteIconCheckCallback,
    editIconCheckCallback: $scope.editIconCheckCallback,
    table:
    [
      {
        key: 'name',
        id: true,
        validationCallback: $scope.validateValue,
        label: 'Username',
        name: 'username',
        type: 'text',
        props: {
          required: true,
          pattern: '^[a-zA-Z0-9][a-zA-Z0-9_.@-]{2,29}$'
        },
        errorText: 'Username should be unique and a single word between 3-30 characters. Username may only contain alphanumeric' +
                   ' characters with special characters ( _@.- ) and can only begin with an alphabet or a number. NOTE: On submit of' +
                   ' the form this field cannot be edited.'
      }, {
        key: 'email',
        label: 'Email',
        type: 'email',
        name: 'email',
        props: {
          required: true,
          pattern: '^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,7})+$'
        },
        errorText: 'Invalid email.'
      },
      {
        key: 'password',
        label: 'Password',
        type: 'password',
        helpText: 'Enter a strong password',
        name: 'password',
        props: {
          pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#-])[A-Za-z\\d@$!%*?&#-]{8,24}$',
          placeholder: '*****'
        },
        errorText: 'Your password must be a single word between 8-24 characters with at' +
        'least one uppercase letter, one lowercase letter, one number and one special character ( @$!%*?&#- ).'
      },
      {
        key: 'user_group',
        label: 'Group',
        type: 'multiSelect',
        callback: $scope.fetchDashboards,
        name: 'group',
        options: [],
        resetKeys: { 'home_page': '', 'mobile_kpi': '' },
        props: {
          pattern: '.*',
          required: true
        }
      },
      {
        key: 'active',
        label: 'Active',
        type: 'radio',
        name: 'active',
        checked: true,
        options: [
          { key: 'yes', label: 'Yes', name: 'active', value: 'Yes' },
          { key: 'no', label: 'No', name: 'active', value: 'No' },
        ],
        props: {
        },
      },
      {
        key: 'tenant_id',
        label: 'Tenant Id',
        type: 'text',
        name: 'tenantId',
        props: {
          pattern: '.*',
          required: true
        }
      },
      {
        key: 'bu_id',
        label: 'Bu Id',
        type: 'text',
        name: 'buId',
        props: {
          pattern: '.*',
          required: true
        }
      },
      {
        key: 'allow_console_login',
        label: 'Admin Console',
        type: 'radio',
        name: 'adminConsole',
        options: [
          { key: 'yes', label: 'Yes', name: 'allow_console_login', value: 'Yes' },
          { key: 'no', label: 'No', name: 'allow_console_login', value: 'No' },
        ],
        props: {
          required: true
        },
      },
      {
        key: 'mobile_kpi',
        label: 'Mobile KPI',
        type: 'multiSelect',
        name: 'mobileKpi',
        options: [],
        props: {
          pattern: '.*',
          required: true
        }
      },
      {
        key: 'home_page',
        label: 'Home Page',
        type: 'select',
        name: 'homepage',
        options: [],
        props: {
          pattern: '.*',
          required: false
        }
      }
    ]
  };


  // Init function is called during initialization..
  function init() {
    StateService.getRolesList().then(roles => {

      // To sort the "Group" dropdown values under Settings->User->User Management->Edit
      roles.user_groups.sort((a,b) => (a.name < b.name) ? -1 : 1);

      const userGroup = $scope.userMeta.table.find(_table => _table.key === 'user_group');
      userGroup.options = [];
      userGroup.options.push({ key: 'select', label: 'select', name: 'group', value: '' });
      roles.user_groups.forEach(role => {
        if(userGroup.options) {
          userGroup.options.push({ key: role.name, label: role.name, name: 'group', value: role.name });
        }
      });
    });
  }

  // Delete users
  $scope.deleteSelectedItems = (rows) => {

    // Iterate over list of users to be deleted and delete
    // one by one. We return a list of promises which contains both
    // success and failure cases.
    const deletePromises = Promise.map(rows, function (row) {
      return StateService.deleteUser(row.name)
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

  // There is nothing to be done for table action..
  $scope.onTableAction = () => {
    return Promise.resolve(true);
  };

  // There is nothing to be done for row action..
  $scope.onRowAction = () => {
    return Promise.resolve(false);
  };


  // This function is called to get the Id-Title corresponding to a home
  // dashboard or mobile-kpi dashboard. This is always called irrespective
  // of whether user changes or not. So there are two cases, one is when
  // user selects a new value or second is when user doesn't touch it.
  // When user selects a new value, we gets a string and then use options to
  // identify the id and return an id-title pair. When user doesn't touch it
  // we receives a string of id-title pair. In this case, we return the same
  // value as it is. We differentiate the two cases using '{' as curly braces
  // won't be there in a dashboard title but it will be there in id-title pair.
  const getIdTitle = (type, title) => {
    const homePage = $scope.userMeta.table.find(_table => _table.key === 'home_page');
    const mobileKpi = $scope.userMeta.table.find(_table => _table.key === 'mobile_kpi');
    if(type === 'home_page' && homePage && title !== undefined) {
      // If title contains '{' we return the same as is.
      const indexOf = title.indexOf('{');
      if (indexOf < 0) {
        const selectedHomePage = homePage.options.find(option => option.value === title);

        // Check selectedHomePage doesn't have key as empty_home_page_val.
        if (selectedHomePage && selectedHomePage.key !== 'empty_home_page_val') {
          return JSON.stringify({
            id: selectedHomePage.key,
            title: selectedHomePage.value
          });
        } else {
          return '';
        }
      } else {
        return title;
      }
    } else if(type === 'mobile_kpi' && mobileKpi) {
      // If we have reached here, it means user has changed the mobile-kpi
      // so we would have just got the title. Find the id and then return
      // id-title pair
      const selectedMobilekpi = mobileKpi.options.find(option => option.value === title);
      if (selectedMobilekpi) {
        return {
          id: selectedMobilekpi.key,
          title: selectedMobilekpi.value
        };
      }
    }
    return '';
  };

  // This function is called to create a list of id-title pair for mobile KPI.
  // This also has two cases, one where user has change mobile-kpi and another
  // where user hasn't change. When user hasn't change, it will come with the
  // old string as is and we differentiate the two using '{'.
  const mobileKpi = (mobileKpiList) => {
    const selectedMobileKpis = [];
    if (mobileKpiList && mobileKpiList.indexOf('{') < 0) {
      _.each(mobileKpiList, function (mobileKpi) {
        // If it doesn't have the '{', it means someone has changed..
        const selectedMobileKpi = getIdTitle('mobile_kpi', mobileKpi);
        if(selectedMobileKpi && selectedMobileKpi !== '') {
          selectedMobileKpis.push(selectedMobileKpi);
        }
      });
      return JSON.stringify(selectedMobileKpis);
    } else {
      return mobileKpiList ? mobileKpiList : '';
    }
  };

  // This function is called when submit button for either add or edit
  // is called... It prepares the user object and invoke a state-service..
  $scope.onSubmit = (event, userId,  userData) =>   {
    if(event  === 'add') {
      const user = { user: {
        'name': userData.name,
        'tenant_id': userData.tenant_id,
        'bu_id': userData.bu_id,
        'active': userData.active,
        'home_page': getIdTitle('home_page', userData.home_page),
        'mobile_kpi': mobileKpi(userData.mobile_kpi),
        'email': userData.email,
        'password': userData.password,
        'user_groups': userData.user_group,
        'allow_console_login': userData.allow_console_login
      } };
      return StateService.addUser(user).then(function () {
        return Promise.resolve(true);
      }, function () {
        return Promise.resolve(false);
      });
    }
    else if(event === 'edit') {
      const user = { user:
        {
          'tenant_id': userData.tenant_id,
          'bu_id': userData.bu_id,
          'active': userData.active,
          'home_page': getIdTitle('home_page', userData.home_page),
          'mobile_kpi': mobileKpi(userData.mobile_kpi),
          'email': userData.email,
          'password': userData.password,
          'user_groups': userData.user_group,
          'allow_console_login': userData.allow_console_login
        }
      };
      // If the edited user is the logged in user we emit an event to show admin console icon in topbar's logout dropdown
      if(userData.name === logginInUserName) {
        $rootScope.$emit('adminConsole', userData.allow_console_login);
      }
      return StateService.editUser(userId, user).then(function () {
        return Promise.resolve(true);
      }, function () {
        return Promise.resolve(false);
      });
    }
  };

  $scope.user_data = [];

  // This function is called to fetch all user Data from the backend
  $scope.fetchItems = () => {
    return StateService.getUsersList().then(function (userData) {
      $scope.user_data = userData;
      // Adding a space to all user groups at the end. 
      // For example ['GroupA', 'GroupB'] -->  ['GroupA ', 'GroupB ']
      // This is done to wrap each group to a line
      $scope.user_data.forEach((user, index) =>{
        user.user_group.forEach((group,i)=>{
          $scope.user_data[index].user_group[i] = group + " "
        })      
      })
      return $scope.user_data;
    });
  };


  init();
}
