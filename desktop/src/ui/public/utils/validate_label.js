const _ = require('lodash');

// This function returns true if same name is there in a list.
export function validateLabel(labelList, modelVal) {

  // check if the label exist in the list.
  // If so return true to invalidate the form.
  if (_.includes(labelList, modelVal)) {
    return true;
  } else {
    return false;
  }

}