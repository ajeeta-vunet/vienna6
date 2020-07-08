import { uiModules } from 'ui/modules';
import chrome from 'ui/chrome';
const app = uiModules.get('app/berlin');

app.directive('manageRoles', function () {
  return {
    restrict: 'E',
    controllerAs: 'manageRoles',
    controller: manageRoles,
    scope: true
  };
});

function manageRoles($scope,
  $http,
  $route,
  $rootScope,
  StateService,
  Promise
) {

  // This callback is called to check if a particular row should be allowed
  // to delete.. We can not allow user to delete the 'VunetAdmin' user group..
  $scope.deleteIconCheckCallback = (rowIds) => {
    return rowIds.find(rowId => rowId === 'VunetAdmin') ? true : false;
  };

  // This callback is called to check if a particular row should be allowed
  // to edit.. We do not allow VunetAdmin user to be edited.
  $scope.editIconCheckCallback = (row) => {

    // Get current logged in user details
    const curUser = chrome.getCurrentUser();

    if (row.name === 'VunetAdmin') {
      return true;
    }

    return false;
  };

  // This is meta-data for user roles table..
  $scope.roleMeta = {
    headers: ['Name', 'Permission Set', 'Tenant Id', 'BU Id', 'Search String'],
    rows: ['name', 'permissions', 'tenant_id', 'bu_id', 'search_string'],
    id: 'name',
    add: true,
    edit: true,
    title: 'Roles',
    selection: true,
    search: true,
    deleteIconCheckCallback: $scope.deleteIconCheckCallback,
    editIconCheckCallback: $scope.editIconCheckCallback,
    table:
    [
      {
        key: 'name',
        id: true,
        label: 'Role Name',
        type: 'text',
        name: 'rolename',
        props: {
          required: true,
          pattern: '^[a-zA-Z0-9]{3,25}$'
        },
        errorText: `Role name should contain minimum of 3 characters and maximum of
                   25 characters without special characters and spaces.NOTE: On submit
                   of the form this field cannot be edited.`
      },
      {
        key: 'permissions',
        label: 'Permission Set',
        type: 'multiSelect',
        multiple: true,
        options: [
          {
            key: 'ViewObject',
            label: 'ViewObject',
            name: 'ViewObject',
            value: 'ViewObject'
          },

          {
            key: 'ManageObject',
            label: 'ManageObject',
            name: 'ManageObject',
            value: 'ManageObject'
          },

          {
            key: 'ManageDataSources',
            label: 'ManageDataSources',
            name: 'ManageDataSources',
            value: 'ManageDataSources'
          },

          {
            key: 'ManageDataSettings',
            label: 'ManageDataSettings',
            name: 'ManageDataSettings',
            value: 'ManageDataSettings'
          },

          {
            key: 'ManageDataEnrichment',
            label: 'ManageDataEnrichment',
            name: 'ManageDataEnrichment',
            value: 'ManageDataEnrichment'
          },

          {
            key: 'ManageFiles',
            label: 'ManageFiles',
            name: 'ManageFiles',
            value: 'ManageFiles'
          },

          {
            key: 'ManagePreferences',
            label: 'ManagePreferences',
            name: 'ManagePreferences',
            value: 'ManagePreferences'
          },

          {
            key: 'ManageUsers',
            label: 'ManageUsers',
            name: 'ManageUsers',
            value: 'ManageUsers'
          },

          {
            key: 'ManageLicense',
            label: 'ManageLicense',
            name: 'ManageLicense',
            value: 'ManageLicense'
          },

          {
            key: 'ManageAgent',
            label: 'ManageAgent',
            name: 'ManageAgent',
            value: 'ManageAgent'
          },

          {
            key: 'DataFetchAPIs',
            label: 'DataFetchAPIs',
            name: 'DataFetchAPIs',
            value: 'DataFetchAPIs'
          },

          {
            key: 'ManageDiagnostic',
            label: 'ManageDiagnostic',
            name: 'ManageDiagnostic',
            value: 'ManageDiagnostic'
          },
        ],
        props: {
        },
      },
      {
        key: 'tenant_id',
        label: 'Tenant Id',
        type: 'text',
        name: 'tenantId',
        id: 'true',
        props: {
          pattern: '^[0-9]{1,16}$',
          required: true
        },
        errorText: 'Tenent Id should be an integer and must use less than 16 digits'
      },
      {
        key: 'bu_id',
        label: 'Bu Id',
        type: 'text',
        name: 'buId',
        id: 'true',
        props: {
          pattern: '^[0-9]{1,16}$',
          required: true
        },
        errorText: 'BU Id should be an integer and must use less than 16 digits'
      },
      {
        key: 'search_string',
        label: 'Search String',
        type: 'text',
        name: 'searchString',
        props: {
          pattern: '^(.{0,999})$'
        },
        errorText: 'Search String should not exceed 1000 characters'
      }
    ]
  };

  function init() {
  }

  // Delete user roles
  $scope.deleteSelectedItems = (rows) => {

    // Iterate over list of users to be deleted and delete
    // one by one. We return a list of promises which contains both
    // success and failure cases.
    const deletePromises = Promise.map(rows, function (row) {

      return StateService.deleteRole(row.name, row.tenant_id, row.bu_id)
        .then(function () {
          return '';
        })
        .catch(function () {
          return '';
        });
    });

    // Wait till all Promises(deletePromises) are resolved and
    // return single Promise
    return Promise.all(deletePromises);
  };

  // This function is called to fetch all the roles from backend..
  $scope.fetchItems = () => {
    return StateService.getRolesList().then(function (data) {
      let index = 0;
      data.user_groups.forEach(element => {
        data.user_groups[index].permissions = element.permissions.split(',');
        index++;
      });

      return data.user_groups;
    });
  };

  // This is called when a role is either created or edited..
  $scope.onSubmit = (event, userId,  userData) =>   {
    //Removing the spaces from the permission values. Eg: 'View Object' --> 'ViewObject'
    let  index = 0;
    userData.permissions.forEach(function (element) {
      userData.permissions[index] = element.split(' ').join('');
      index++;
    });

    //adding ViewObject permission if its not there and ManageObject claim is present.
    //By adding ManageObject claim, it is implied that it has ViewObject claim too.
    if(userData.permissions.includes('ManageObject') && !userData.permissions.includes('ViewObject')) {
      userData.permissions.unshift('ViewObject');
    }

    if(event  === 'add') {
      const user = { user_group: {
        'name': userData.name,
        'tenantId': userData.tenant_id,
        'buId': userData.bu_id,
        'permissions': userData.permissions,
        'search_string': userData.search_string
      } };
      return StateService.addRole(user).then(function () {
        $rootScope.changeUserTab = true;
        $route.reload();
        return Promise.resolve(true);
      }, function () {
        return Promise.resolve(false);
      });
    }
    else if(event === 'edit') {
      const user = { user_group:
        {
          'tenantId': userData.tenant_id,
          'buId': userData.bu_id,
          'name': userData.name,
          'permissions': userData.permissions,
          'search_string': userData.search_string ? userData.search_string : ''
        }
      };

      return StateService.editRole(userId, user).then(function () {
        return Promise.resolve(true);
      }, function () {
        return Promise.resolve(false);
      });
    }
  };

  init();
}
