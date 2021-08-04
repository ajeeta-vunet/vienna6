export const convertArraytoJSON = (array) => {
  const json = [];
  let object;
  for (const i in array) { // Iterate the array
    let objects = [];
    let j = 0;
    let found = false;
    object = array[i]; // Store each item in the array
    const key = object.split("|")[0]; // Extract the content before the occurance of "|"
    for (j in json) {
      if (json[j].hasOwnProperty(key)) {
        objects = json[j][key];
        found = true;
        break;
      }
    }
    if (found) {
      objects.push(object.split("|")[1]);
      json[j][key] = objects;
    } else {
      const objects = [];
      const item = {};
      objects.push(object.split("|")[1]);
      item[key] = objects;
      json.push(item);
    }
  }
  return json;
};
