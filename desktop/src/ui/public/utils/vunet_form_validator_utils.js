import _ from 'lodash';
import { isArray, isObject } from './vunet_type_check_utils';

// Types for validateInput method
export const validateInputTypes = {
  required: 'required',
  maxLength: 'maxLength',
  minLength: 'minLength',
  minRange: 'minRange',
  maxRange: 'maxRange',
  email: 'email',
  mobileNumber: 'mobileNumber',
  regex: 'regex'
};

// this method is used to validate a string if mentioned conditions are satisfied

// condition object format
// {
//   required: {
//     value: true
//     errorText: 'required'
//   },
//   maxLength: {
//     value: 25,
//     errorText: 'length needs to be greater'
//   },
//   minLength: {
//     value: 5,
//     errorText: 'length needs to be lesser'
//   },
//   maxRange: {
//     value: 100,
//     errorText: 'Max value cannot exceed 100.'
//   },
//   minRange: {
//     value: 5,
//     errorText: 'Min value should be greater than 5.'
//   },
//   email: {
//     value: true
//     errorText: 'please enter a valid email id',
//   }
//   mobileNumber: {
//     value: true,
//     errorText: 'please enter a valid mobile no',
//   }
//   regex: {
//     value: RegExp(/^[A-Za-z]+$/),
//     errorText: 'regex expression not satisfied'
//   }
// }
// mention what all checks you require.
// errorText in all checks is optional. This can be used to provide custom error message

// input: string, conditions the string needs to satisfy
// output: error text (this is empty string if no error is found)
export const validateInput = (text, conditionsObj) => {
  let errorText = '';
  _.forOwn(conditionsObj, (objValue, objKey) => {
    switch (objKey) {
      case validateInputTypes.required:
        if (objValue.value && text.length === 0) {
          errorText = (objValue.errorText ? objValue.errorText : 'This field is required.');
        }
        break;

      case validateInputTypes.maxLength:
        if (text.length > objValue.value) {
          errorText = (objValue.errorText ? objValue.errorText : `content must be less than ${objValue.value} characters.`);
        }
        break;

      case validateInputTypes.minLength:
        if (text.length < objValue) {
          errorText = (objValue.errorText ? objValue.errorText : `content must be greater than ${objValue.value} characters.`);
        }
        break;

      case validateInputTypes.maxRange:
        if (text > objValue.value) {
          errorText = (objValue.errorText ? objValue.errorText : `Max value cannot exceed ${objValue.value}.`);
        }
        break;

      case validateInputTypes.minRange:
        if (text < objValue.value) {
          errorText = (objValue.errorText ? objValue.errorText : `Min value should be greater than ${objValue.value}.`);
        }
        break;

      case validateInputTypes.email:
        // if text is empty do check, there is no error
        // or if value = false, don't check
        if (!text || !objValue.value) { return; }

        const emailRegex = RegExp(/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/);
        const emails = text.split(',');
        emails.forEach((email) => {
          if (!emailRegex.test(email.trim())) {
            errorText = (objValue.errorText ? objValue.errorText : `Please provide valid email address with separated by a comma ','`);
          }
        });
        break;

      case validateInputTypes.mobileNumber:
        // if text is empty do check, there is no error
        // or if value = false, don't check
        if (!text || !objValue.value) { return; }

        // regex checks following conditions
        // 1. Optional plus at the starting.
        // 2. Only a single plus can appear at the starting.
        // 3. There should be a minimum of nine digits.
        const mobileNumberRegex = RegExp(/^\s*\+?\s*([0-9][\s-]*){9,}$/);
        const mobileNumbers = text.split(',');
        mobileNumbers.forEach((mobileNumber) => {
          if (!mobileNumberRegex.test(mobileNumber.trim())) {
            errorText = (objValue.errorText ? objValue.errorText : `Please provide valid mobile number separated by a comma ','`);
          }
        });
        break;

      case validateInputTypes.regex:
        if (!objValue.value.test(text)) {
          errorText = (objValue.errorText ? objValue.errorText : 'Condition does not match.');
        }
        break;

      default:
        errorText = '';
    }
    // exit loop if an error is found
    if (errorText) {
      return false;
    }
  });
  return errorText;
};

// validate a list of error objects
// check '_validateObject()' below to see how a error object is validated
const _validateList = (valid, errorObjectList, dataObjectList) => {
  let result = undefined;
  errorObjectList.forEach((object, i) => {
    if (dataObjectList) {
      result = _validateObject(valid, errorObjectList[i], dataObjectList[i]) // eslint-disable-line      
      errorObjectList[i] = result.errorObject;
      valid = result.valid;
    }
    else {
      result = _validateObject(valid, errorObjectList[i], undefined) // eslint-disable-line
      valid = result.valid;
    }
  });
  return {
    valid,
    errorObjectList
  };
};


// USE CASE 1
// iterate over object values and check if any of the values has a string of length > 0
// if a string with length > 0 is present then, it means an error is present. it will return false
// if all values of the object have empty string, then it means there are no errors. it will return true
// Eg: no error (all values are empty string)
// {
//   a : '',
//   b : [{
//     bb : ''
//   }],
// }
// Eg: error (all values are not empty string)
// {
//   a : '',
//   b : [{
//     bb : 'this field is required'
//   }],
// }

// USE CASE 2
// optionally a third parameter 'dataObject' can be provided.
// if the dataObject has any errors we update its respective key in errorObject

// Eg: a and c are empty string
// dataObject = {
//   a : '',
//   b : '',
//   c : [{
//     cc : 'value'
//   }],
//   d : {
//     dd1: '',
//     dd2: '',
//   }
// }

// we update the same key in its error object
// errorObject = {
//   a : {
//     required: true,
//     errorText: 'this field is required'
//   },
//   b : {
//     required: false,
//     errorText: ''
//   },
//   c : [{
//     cc : {
//       required: true,
//       errorText: ''
//     }
//   }],
//   d : {
//     dd1: {
//       required: true,
//       errorText: 'this field is required'
//     },
//     dd2: {
//       required: false,
//       errorText: ''
//     },
//   }
// }
const _validateObject = (valid, errorObject, dataObject) => {
  _.forOwn(errorObject, (value, key) => {

    // dataObject[key] is a list
    if (isArray(value)) {
      // we are evaluating dataObject here
      if (dataObject) {
        const result = _validateList(valid, errorObject[key], dataObject[key]);
        errorObject[key] = result.errorObjectList;
        valid = result.valid;
      }
      // we are evaluating errorObject here
      else {
        const result = _validateList(valid, errorObject[key]);
        valid = result.valid;
      }
    }
    // dataObject[key] is a object and it does not contain 'required' property
    // if it contains 'required' property then it is the end of the chain, we don't have to iterate further
    else if (isObject(value) && !value.hasOwnProperty('required')) {
      // we are evaluating dataObject here
      if (dataObject) {
        const result = _validateObject(valid, errorObject[key], dataObject[key]);
        errorObject[key] = result.errorObject;
        valid = result.valid;
      }
      // we are evaluating errorObject here
      else {
        const result = _validateObject(valid, errorObject[key], undefined);
        valid = result.valid;
      }
    }
    // dataObject[key] is a string
    else {
      // we are evaluating dataObject here
      // this is required when a form's inputs are not dirty yet but, they are required fields

      // Note: If the conditions 1 & 2 & 3 or 4 are satisfied, then fill its respective error field
      // 1) if dataObject is present
      // 2) dataObject's required is true
      // 3) If dataObject's value is of type string/number,  value.length is 0
      // 4) If dataObject's value is of type object, check is value is an
      if (dataObject && errorObject[key].required &&
        (dataObject[key].length === 0 || (isObject(dataObject[key]) && _.isEmpty(dataObject[key]))
        )
      ) {
        errorObject[key].errorText = 'This field is required.';
        valid = false;
      }
      // we are evaluating errorObject here
      // if dataObject is not present, we are evaluating errorObject.
      // when errorObject has an item with length not 0
      // then it means the form has an error. set valid to false
      else if (!dataObject && errorObject[key].errorText.length > 0) {
        valid = false;
      }
    }
  });
  return {
    valid,
    errorObject
  };
};

// iterate over a form's error object and checks if the form is valid or not.
// check '_validateObject()' above to see how the error object is validated.
export const getFormValidity = (errorsObject) => {
  const { valid } = _validateObject(true, errorsObject, undefined);
  return valid;
};

// iterate over a form's error object and checks if the form is valid or not.
// incase dataObject has any errors update its respective key in errorObject
export const getFormErrorField = (errorsObject, dataObject) => {
  const { valid, errorObject } = _validateObject(true, errorsObject, dataObject);
  return { valid, errorObject };
};