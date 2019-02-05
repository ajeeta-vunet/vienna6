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
  StateService
) {

  // This callback is called to check if a particular row should be allowed
  // to delete.. We can not allow user to delete the 'admin' user group..
  $scope.deleteIconCheckCallback = (rowIds) => {
    return rowIds.find(rowId => rowId === 'admin') ? true : false;
  };

  // This callback is called to check if a particular row should be allowed
  // to edit.. We allow only testadmin user to edit the 'admin' role
  $scope.editIconCheckCallback = (row) => {

    // Get current logged in user details
    const curUser = chrome.getCurrentUser();

    // Row being edited belongs to 'testadmin' and current user is 'testadmin'
    // we allow edit..
    if (row.name === 'admin' && curUser[0] !== 'testadmin') {
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
        type: 'radio',
        checked: true,
        options: [
          { key: 'admin', label: 'Admin', name: 'permissions', value: 'admin' },
          { key: 'modify', label: 'Modify', name: 'permissions', value: 'modify' },
          { key: 'view', label: 'View', name: 'permissions', value: 'view' },
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

  // Delete a role - Only one role can be deleted at a time..
  $scope.deleteSelectedItems = (row) => {
    return StateService.deleteRole(row[0].name, row[0].tenant_id, row[0].bu_id).then(function () {
      return new Promise((resolve) => resolve(''));
    });
  };

  // This function is called to fetch all the roles from backend..
  $scope.fetchItems = () => {
    return StateService.getRolesList().then(function (data) {
      return data.user_groups;
    });
  };

  // This is called when a role is either created or edited..
  $scope.onSubmit = (event, userId,  userData) =>   {
    if(event  === 'add') {
      const user = { user_group: {
        'name': userData.name,
        'tenantId': userData.tenant_id,
        'buId': userData.bu_id,
        'permissions': userData.permissions,
        'search_string': userData.search_string
      } };
      return StateService.addRole(user).then(function () {
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
