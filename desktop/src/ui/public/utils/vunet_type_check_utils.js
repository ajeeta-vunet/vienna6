// isArray(        ); // false
// isArray(    null); // false
// isArray(    true); // false
// isArray(       1); // false
// isArray(   'str'); // false
// isArray(      {}); // false
// isArray(new Date); // false
// isArray(      []); // true
export const isArray = (a) => {
  return (!!a) && (a.constructor === Array);
};

// isObject(        ); // false
// isObject(    null); // false
// isObject(    true); // false
// isObject(       1); // false
// isObject(   'str'); // false
// isObject(      []); // false
// isObject(new Date); // false
// isObject(      {}); // true
export const isObject = (a) => {
  return (!!a) && (a.constructor === Object);
};
