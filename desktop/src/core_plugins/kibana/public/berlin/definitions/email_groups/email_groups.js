import { uiModules } from 'ui/modules';
const app = uiModules.get('app/berlin');
import { EMAIL_GROUPS_NAME_HELP_OBJ,
  EMAIL_GROUPS_MEMBER_EMAILS_HELP_OBJ } from '../definition_constants';

app.directive('vunetEmailgroups', function () {
  return {
    restrict: 'E',
    controllerAs: 'VunetEmailgroups',
    controller: VunetEmailgroups,
  };
});
function VunetEmailgroups($scope,
  $http,
  Promise,
  StateService) {

  $scope.isRecieptsListValid = false;

  // This function is for check if the added group name already exists
  $scope.checkEmailGroupForSameName = (key, value) => {
    let emailGroupHasSameName = false;

    // Check the new value with existing names..
    $scope.emailGroupData.forEach(emailGroup => {
      if(value === emailGroup.name) {
        emailGroupHasSameName = true;
      }
    });

    if(emailGroupHasSameName) {
      return true;
    } else {
      return false;
    }
  };

  $scope.checkValidityOfRecipientsList = (key, value) => {
    const emails = value.split(',');
    /* eslint-disable */
    // defining the individual email validator here
    const emailRegForMultipeEmails = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    /* eslint-enable */

    // The validation operation is provided with the model value as an argument
    // and must return a true or false value depending on the response of that validation.

    let atLeastOneInvalid = false;

    // Email Space regex to catch spaces in email
    const emailSpaceRegex = /[\s]+/;

    emails.forEach(email => {

      // Check if there is any spaces in the emails
      if (emailSpaceRegex.test(email) === true) {
        atLeastOneInvalid = true;
      }

      if (emailRegForMultipeEmails.test(email.trim()) === false) {
        atLeastOneInvalid = true;
      }
    });

    if(atLeastOneInvalid) {
      return true;
    } else{
      return false;
    }
  };

  $scope.emailgroupsMeta = {
    headers: ['Group Name', 'Group Description', 'Member Emails'],
    rows: ['name', 'description', 'recipients'],
    id: 'name',
    add: true,
    title: 'Email-Groups',
    edit: true,
    table: [
      {
        key: 'name',
        label: 'Email Group Name',
        type: 'text',
        name: 'group name',
        validationCallback: $scope.checkEmailGroupForSameName,
        id: true,
        helpObj: EMAIL_GROUPS_NAME_HELP_OBJ,
        props: {
          required: true,
          maxLength: '64',
          minLength: '2',
          pattern: '^[a-zA-Z0-9][a-zA-Z0-9 _.@-]*$'
        },
        errorText: 'Email Group name should be unique and should have minimum 2 characters and maiximun 64 characters and it can\'t' +
                    'have special characters except (whitespace,.,@,_,-) and it can\'t start with any of the given special characters.' +
                    ' NOTE: After submit of the form this field cannot be edited.'
      },
      {
        key: 'description',
        label: 'Group Description',
        type: 'text',
        name: 'group description',
        props: {
          required: true,
		      pattern:'[a-zA-z0-9]+',
        },
		    errorText: 'Group description should contain only alpha numeric characters.'
      },
      {
        key: 'recipients',
        label: 'Group Member Emails',
        type: 'text',
        name: 'member emails',
        helpObj: EMAIL_GROUPS_MEMBER_EMAILS_HELP_OBJ,
        validationCallback: $scope.checkValidityOfRecipientsList,
        props: {
          required: true,
          maxLength: '1024',
          /* eslint-disable */
          pattern: '^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$'
          /* eslint-enable */
        },
        errorText: `Please provide valid email address. You can enter multiple email address separated by a comma ','`
      }
    ]
  };

  //defining the attribute name
  const attributeName = 'email-group';

  // Function to fetch email groups
  $scope.fetchEmailgroups = () => {
    return StateService.getTenantAttribute(attributeName).then(function (emailGroupsData) {
      $scope.emailGroupData = emailGroupsData.attributes;
      return emailGroupsData.attributes;
    });
  };

  // Function to submit items of table
  $scope.onEmailGroupsSubmit = (event, userId, data) => {

    // Create an emailGroup object
    const emailGrp = {
      'name': data.name,
      'description': data.description,
      'recipients': data.recipients
    };

    if(event === 'add') {
      return StateService.addTenantAttribute(attributeName, emailGrp).then(function () {
        return Promise.resolve(true);
      }, function () {
        return Promise.resolve(false);
      });
    }
    else if (event === 'edit') {
      return StateService.editTenantAttribute(attributeName, emailGrp).then(function () {
        return Promise.resolve(true);
      }, function () {
        return Promise.resolve(false);
      });
    }
  };

  // Function to delete items from table
  $scope.deleteSelectedEmailgroups = (rows) => {
    // Iterate over list of email groups to be deleted and delete
    // one by one. We return a list of promises which contains both
    // success and failure cases.
    const deletePromises = Promise.map(rows, function (row) {

      return StateService.deleteTenantAttribute(attributeName, row.name).then(() => {
        return '';
      })
        .catch(function () {
          return '';
        });
    });

    // Wait till all Promises are resolved and return single Promise
    return Promise.all(deletePromises);
  };

  //Function to export email-groups
  $scope.exportEmailGroupsData = () => {
    const emailGroupsExportType = 'excel';
    return StateService.exportEmailGroupsData(attributeName, emailGroupsExportType).then(() => {
      return Promise.resolve(true);
    }, function () {
      return Promise.resolve(false);
    });
  };

}
