/**
 * Used to reorder items in a array.
 * @param  {array[string]} list
 * @param {number} from
 * @param {number} to
 * @return  {array[string]}
 *
 * example:
 * const arr = [ 'a', 'b', 'c', 'd', 'e'];
 * reorderString(arr,3,1); //["a", "d", "b", "c", "e"]
 * const arr = [ 'a', 'b', 'c', 'd', 'e'];
 * reorderString(arr,0,2); //["b", "c", "a", "d", "e"]
 */
export const reorderList = (list, from, to) => {
  list.splice(to, 0, list.splice(from, 1)[0]);
  return list;
};
