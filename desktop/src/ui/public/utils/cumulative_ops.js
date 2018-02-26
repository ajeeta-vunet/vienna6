// This function does the cumulative operation as chosen by the user.
// The operation is done on the current data using the new value. We
// return the updated value of the current data.
// The assumption is that the updated current data would be passed back
// to this function as currentData
// Supported operations are 'sum', 'avg', 'min' and 'max'
export function doCumulativeOperation(operation, currentData, newValue, currentIndex) {
  if (operation === 'sum' || operation === 'avg') {
    if (currentData === -1) {
      currentData = 0;
    }
    if (operation === 'sum') {
      currentData += newValue;
    } else if (operation === 'avg') {
      // We calculate the average as (prev_sum + current_value) / currentIndex
      // where we calculate the prev_sum as (currentData * (currentIndex -1))
      currentData = ((currentData * (currentIndex - 1)) + newValue) / currentIndex;
    }
  } else if (operation === 'max') {
    if (currentData === -1) {
      currentData = newValue;
    } else if (newValue > currentData) {
      currentData = newValue;
    }
  } else if (operation === 'min') {
    if (currentData === -1) {
      currentData = newValue;
    } else if (newValue < currentData) {
      currentData = newValue;
    }
  }
  return currentData;
}
