import angular from 'angular';
const module = require('ui/modules').get('kibana');

module.directive('multipleEmails', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, ctrl) {
      // Array of functions to execute, as a pipeline,
      // whenever the control reads value from the DOM.
      // The functions are called in array order,
      // each passing its return value through to the next.
      // The last return value is forwarded to the $validators collection.
      ctrl.$parsers.unshift(function (viewValue) {
        if (viewValue !== '') {
          const emails = viewValue.split(',');

          /* eslint-disable */
          // defining the individual email validator here
          const emailReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          /* eslint-enable */

          // The validation operation is provided with the model value as an argument
          // and must return a true or false value depending on the response of that validation.
          const validityArr = emails.map(function (email) {
            return emailReg.test(email.trim());
          }); // sample return is [true, true, true, false, false, false]

          let atLeastOneInvalid = false;
          angular.forEach(validityArr, function (value) {
            // check if atleast one email entered in the email textbox is invalid
            if(value === false) {
              atLeastOneInvalid = true;
            }
          });

          if(!atLeastOneInvalid) {
            // syntax : $setValidity(validationErrorKey, isValid);
            // The validationErrorKey will be assigned to $error[validationErrorKey]
            ctrl.$setValidity('multipleEmails', true);
            return viewValue;
          } else {
            ctrl.$setValidity('multipleEmails', false);
            return viewValue;
          }
        }
        else {
          ctrl.$setValidity('multipleEmails', true);
          return '';
        }
      });
    }
  };
});