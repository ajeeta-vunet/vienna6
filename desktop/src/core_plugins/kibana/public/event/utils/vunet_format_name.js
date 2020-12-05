import _ from 'lodash';

//this function is used to generate the field heading to be displaced in the UI.
//this is done by replacing any character other than aphabets with space and then capitalising
//first letter of each word.
export function generateHeading(key) {
  key.replace(/[^a-zA-Z]+/g, ' ');
  return(_.startCase(key));
}

//this function is used to generate the class name to be used in the JSX tags..
export function generateClassname(key) {
  return key.replace(/[^a-zA-Z-_]+/g, '');
}