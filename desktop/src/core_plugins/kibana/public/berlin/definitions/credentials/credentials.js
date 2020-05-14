import { uiModules } from 'ui/modules';
const app = uiModules.get('app/berlin');
import './vunet_credentials.less';

app.directive('vunetCredentials', function () {
  return {
    restrict: 'E',
    controllerAs: 'vunetCredentials',
    controller: vunetCredentials,
  };
});
function vunetCredentials($scope,
  $http,
  Promise,
  StateService) {

  $scope.sshMeta = {
    headers: ['Name', 'User Id', 'Port'],
    rows: ['name', 'user_id', 'port'],
    id: 'name',
    add: true,
    title: 'a SSH Credential',
    default: { port: 22 },
    table: [
      {
        key: 'name',
        label: 'Name',
        type: 'text',
        name: 'name',
        props: {
          required: true,
          maxLength: '12',
          pattern: '^[a-zA-Z0-9_.-]+$'
        },
        errorText: `Name can have alpha-numeric characters. _, . and - is also
                    allowed but the name should not exceed 12 characters.`
      },
      {
        key: 'port',
        label: 'Port',
        type: 'text',
        name: 'port',
        props: {
          required: true,
          pattern: `^([1-9]|[1-9][0-9]|[1-9][0-9][0-9]|[1-9][0-9][0-9][0-9]|[1-5][0-9]
                     [0-9][0-9][0-9]|6[0-4][0-9][0-9][0-9]|65[0-4][0-9][0-9]|655[0-2][0-9]|6553[0-5])$`
        },
        errorText: 'Port should be between 1 - 65535 (inclusive).'
      },
      {
        key: 'user_id',
        label: 'User ID',
        type: 'text',
        name: 'userId',
        props: {
          required: true,
          maxLength: '64',
          pattern: '^[a-zA-Z0-9_.@-]+$'
        },
        errorText: `User Id can have alpha-numeric characters. _, @, . and - is also 
                    allowed and userId should not exceed 64 characters.`
      },
      {
        key: 'password',
        label: 'Password',
        type: 'password',
        name: 'password',
        props: {
          required: true,
          autoComplete: 'off',
          pattern: '^(.){1,64}$'
        },
        errorText: 'Password should not exceed 64 characters '
      },
      {
        key: 'priv_password',
        label: 'Privilege Password',
        type: 'password',
        name: 'privPassword',
        props: {
          required: true,
          autoComplete: 'off',
          pattern: '^(.){1,64}$'
        },
        errorText: 'Privilege Password should not exceed 64 characters'
      },
      {
        key: 'key_file',
        label: 'Key File',
        type: 'textarea',
        name: 'keyFile',
        props: {
        }
      }
    ]
  };

  $scope.telnetMeta = {
    headers: ['Name', 'User Id', 'Port'],
    rows: ['name', 'user_id', 'port'],
    id: 'name',
    add: true,
    default: { port: 23 },
    title: 'a Telnet Credential',
    table: [
      {
        key: 'name',
        label: 'Name',
        type: 'text',
        name: 'name',
        props: {
          required: true,
          maxLength: '12',
          pattern: '^[a-zA-Z0-9_.-]+$'
        },
        errorText: `Name can have alpha-numeric characters. _, . and - is also
                    allowed but the name should not exceed 12 characters.`
      },
      {
        key: 'port',
        label: 'Port',
        type: 'text',
        name: 'port',
        props: {
          required: true,
          pattern: `^([1-9]|[1-9][0-9]|[1-9][0-9][0-9]|[1-9][0-9][0-9][0-9]|[1-5][0-9][0-9][0-9][0-9]|6[0-4][0-9]
                      [0-9][0-9]|65[0-4][0-9][0-9]|655[0-2][0-9]|6553[0-5])$`
        },
        errorText: 'Port should be between 1 - 65535 (inclusive).'
      },
      {
        key: 'user_id',
        label: 'User ID',
        type: 'text',
        name: 'userId',
        props: {
          required: true,
          maxLength: '64',
          pattern: '^[a-zA-Z0-9_.@-]+$'
        },
        errorText: 'User Id can have alpha-numeric characters. _, @, . and - is also allowed and userId should not exceed 64 characters.'
      },
      {
        key: 'password',
        label: 'Password',
        type: 'password',
        name: 'password',
        props: {
          required: true,
          autoComplete: 'off',
          pattern: '^(.){1,64}$'
        },
        errorText: 'Password should not exceed 64 characters'
      },
      {
        key: 'priv_password',
        label: 'Privilege Password',
        type: 'password',
        name: 'privPassword',
        props: {
          required: true,
          autoComplete: 'off',
          pattern: '^(.){1,64}$'
        },
        errorText: 'Privilege Password should not exceed 64 characters'
      }
    ]
  };

  $scope.snmpMeta = {
    headers: ['Name', 'Version', 'Port', 'Auth Protocol', 'Priv Protocol'],
    rows: ['name', 'version', 'port', 'auth_protocol', 'priv_protocol'],
    id: 'name',
    add: true,
    default: { port: 161, version: 'v1', security_level: 'no-auth-no-priv', auth_protocol: 'MD5', priv_protocol: 'AES128bit' },
    title: 'a SNMP Credential',
    table: [
      {
        key: 'name',
        label: 'Name',
        type: 'text',
        name: 'name',
        props: {
          required: true,
          maxLength: '12',
          pattern: '^[a-zA-Z0-9_.-]+$'
        },
        errorText: `Name can have alpha-numeric characters. _, . and - is also allowed
                    but the name should not exceed 12 characters.`
      },
      {
        key: 'version',
        label: 'Version',
        type: 'select',
        options: [
          { key: 'v1', label: 'v1', name: 'version', value: 'v1' },
          { key: 'v2c', label: 'v2c', name: 'version', value: 'v2c' },
          { key: 'v3', label: 'v3', name: 'version', value: 'v3' }
        ],
        name: 'version',
        props: {
          required: true
        },
        rules: {
          name: 'version_rule',
          options: [{
            value: 'v1',
            actions: [{
              hide: ['username', 'security_level', 'auth_protocol', 'auth_key', 'priv_protocol', 'privacy_key']
            }]
          },
          {
            value: 'v2c',
            actions: [{
              hide: ['username', 'security_level', 'auth_protocol', 'auth_key', 'priv_protocol', 'privacy_key']
            }]
          },
          {
            value: 'v3',
            actions: [{
              hide: ['community_string']
            }]
          }]
        }
      },
      {
        key: 'port',
        label: 'Port',
        type: 'text',
        value: 161,
        name: 'port',
        props: {
          required: true,
          pattern: `^([1-9]|[1-9][0-9]|[1-9][0-9][0-9]|[1-9][0-9][0-9][0-9]|[1-5][0-9][0-9][0-9][0-9]|6[0-4][0-9][0-9]
                        [0-9]|65[0-4][0-9][0-9]|655[0-2][0-9]|6553[0-5])$`
        },
        errorText: 'Port should be between 1 - 65535 (inclusive).'
      },
      {
        key: 'community_string',
        label: 'Community',
        type: 'text',
        name: 'communityString',
        props: {
          required: true,
          pattern: '^(.){1,64}$'
        },
        errorText: 'Community string should not exceed 64 characters.'
      },
      {
        key: 'username',
        label: 'Username',
        type: 'text',
        helpText: 'Security/User name to be used for communication',
        name: 'username',
        props: {
          required: true,
          pattern: '^(.){1,64}$'
        },
        errorText: 'User name should not exceed 64 characters. '
      },
      {
        key: 'security_level',
        label: 'Security Level',
        type: 'select',
        helpText: 'Security level configured in the device',
        name: 'securityLevel',
        options: [
          { key: 'noAuthNoPriv', label: 'NoAuthNoPriv', name: 'securityLevel', value: 'no-auth-no-priv' },
          { key: 'authNoPriv', label: 'AuthNoPriv', name: 'securityLevel', value: 'auth-no-priv' },
          { key: 'authPriv', label: 'AuthPriv', name: 'securityLevel', value: 'auth-priv' }
        ],
        props: {
          required: true
        },
        rules: {
          name: 'securityLevel_rule',
          options: [
            {
              value: 'no-auth-no-priv',
              actions: [{
                hide: ['auth_protocol', 'auth_key', 'priv_protocol', 'privacy_key']
              }]
            },
            {
              value: 'auth-no-priv',
              actions: [{
                hide: ['priv_protocol', 'privacy_key']
              }]
            }]
        }
      },
      {
        key: 'auth_protocol',
        label: 'Auth Protocol',
        type: 'select',
        helpText: 'Authentication protocol to authenticate user',
        name: 'authProtocol',
        options: [
          { key: 'MD5', label: 'MD5', name: 'authProtocol', value: 'MD5' },
          { key: 'SHA', label: 'SHA', name: 'authProtocol', value: 'SHA' }
        ],
        props: {
        }
      },
      {
        key: 'auth_key',
        label: 'Auth Key',
        type: 'password',
        name: 'authKey',
        helpText: 'Key string to be used for authentication',
        props: {
          required: true,
          pattern: '^(.){8,56}$'
        },
        errorText: 'Value should be greater than or equal to 8 characters and less than 56 characters.'
      },
      {
        key: 'priv_protocol',
        label: 'Privacy Protocol',
        type: 'select',
        helpText: 'Privacy protocol to be used to encrypt data',
        name: 'privacyProtocol',
        options: [
          { key: 'AES128bit', label: 'AES128bit', name: 'privacyProtocol', value: 'AES128bit' },
          { key: 'DES', label: 'DES', name: 'privacyProtocol', value: 'DES' },
          { key: 'AES192bit', label: 'AES192bit', name: 'privacyProtocol', value: 'AES192bit' },
          { key: 'AES256bit', label: 'AES256bit', name: 'privacyProtocol', value: 'AES256bit' },
          { key: 'TripleDES', label: 'Triple DES', name: 'privacyProtocol', value: 'TripleDES' }
        ],
        props: {
          required: true
        }
      },
      {
        key: 'privacy_key',
        label: 'Privacy Key',
        type: 'password',
        name: 'privacyKey',
        helpText: 'Key string to be used for data encryption',
        props: {
          required: true,
          pattern: '^(.){8,56}$'
        },
        errorText: 'Value should be greater than or equal to 8 characters and less than 56 characters.'
      }
    ]
  };

  $scope.userCredentialMeta = {
    headers: ['Name', 'Username'],
    rows: ['name', 'user_name'],
    id: 'name',
    add: true,
    title: 'a User Credential',
    table: [
      {
        key: 'name',
        label: 'Name',
        type: 'text',
        name: 'name',
        props: {
          required: true,
          maxLength: '12',
          pattern: '^[a-zA-Z0-9_.-]+$'
        },
        errorText: `Name can have alpha-numeric characters. _, . and - 
                    is also allowed but the name should not exceed 12
                    characters.`
      },
      {
        key: 'user_name',
        label: 'Username',
        type: 'text',
        name: 'username',
        props: {
          required: true,
          maxLength: '64',
          pattern: '.*'
        },
        errorText: 'User Name should not exceed 64 characters'
      },
      {
        key: 'password',
        label: 'Password',
        type: 'password',
        name: 'password',
        props: {
          required: true,
          autoComplete: 'off',
          pattern: '^(.){1,64}$'
        },
        errorText: 'Password should not exceed 64 characters '
      }
    ]
  };

  function init() {
    // StateService.getUserData($rootScope);
    $scope.sshRestKey = 'ssh';
    $scope.telnetRestKey = 'telnet';
    $scope.snmpRestKey = 'snmp';
    $scope.userCredentialRestKey = 'user';
  }

  // Function to fetch items of table
  $scope.fetchDetails = (restKey) => {
    return StateService.getCredentials(restKey).then(function (credDetails) {
      if (restKey === 'ssh') {
        return credDetails.creds;
      } else if (restKey === 'telnet') {
        return credDetails.creds;
      } else if (restKey === 'snmp') {
        return credDetails.creds;
      } else if (restKey === 'user') {
        return credDetails.creds;
      }
    });
  };

  // Function to submit items of table
  $scope.onSubmit = (event, userId, data, restKey) => {
    // Store data in to local variable.
    let credentialsData = data;

    // Prepare data for snmp.
    if (restKey === 'snmp') {
      // Prepare data for version v1 and v2c.
      if (credentialsData.version === 'v1' || credentialsData.version === 'v2c') {
        credentialsData = {
          name: credentialsData.name,
          port: credentialsData.port,
          version: credentialsData.version,
          community_string: credentialsData.community_string
        };
      } else if (credentialsData.version === 'v3') {

        // Prepare data for v3 having auth-priv.
        if (credentialsData.security_level === 'auth-priv') {
          credentialsData = {
            name: credentialsData.name,
            port: credentialsData.port,
            version: credentialsData.version,
            user_name: credentialsData.username,
            security_level: credentialsData.security_level,
            priv_protocol: credentialsData.priv_protocol,
            priv_key: credentialsData.privacy_key,
            auth_protocol: credentialsData.auth_protocol,
            auth_key: credentialsData.auth_key,
          };
        } else if (credentialsData.security_level === 'no-auth-no-priv') {
          // Prepare data for v3 having no-auth-no-priv.
          credentialsData = {
            name: credentialsData.name,
            port: credentialsData.port,
            version: credentialsData.version,
            username: credentialsData.username,
            security_level: credentialsData.security_level,
          };
        } else if (credentialsData.security_level === 'auth-no-priv') {
          // Prepare data for v3 having auth-no-priv.
          credentialsData = {
            name: credentialsData.name,
            port: credentialsData.port,
            version: credentialsData.version,
            username: credentialsData.username,
            security_level: credentialsData.security_level,
            auth_protocol: credentialsData.auth_protocol,
            auth_key: credentialsData.auth_key,
          };
        }
      }
    }

    return StateService.createCredentials(restKey, credentialsData).then(function () {
      return Promise.resolve(true);
    }, function () {
      return Promise.resolve(false);
    });
  };

  // Function to delete items from table
  $scope.deleteSelectedCredentials = (rows, restKey) => {

    // Iterate over list of users to be deleted and delete
    // one by one. We return a list of promises which contains both
    // success and failure cases.
    const deletePromises = Promise.map(rows, function (row) {

      return StateService.deleteCredentials(restKey, row.name)
        .then(function () {
          return '';
        })
        .catch(function () {
          return '';
        });
    });

    // Wait till all Promises are resolved and return single Promise
    return Promise.all(deletePromises);
  };

  init();
}
