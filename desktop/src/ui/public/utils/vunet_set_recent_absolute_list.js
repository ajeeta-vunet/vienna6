export function setRecentAbsoluteTimeList(from, to) {

  // Create a time Obect.
  const timeObj = {
    from: from,
    to: to
  };

  // Gets localStorage items if it is there new time
  // object pushes to the list, if not creates an empty list
  const recentTimeValuesList = JSON.parse(localStorage.getItem('recentTimeValues')) || [];

  const sameObj = JSON.stringify(timeObj);

  // Check if time object is already there in the list.
  // If it is there remove it from that index and push it as a new.
  recentTimeValuesList.map((obj, index) => {
    if (obj.from === JSON.parse(sameObj).from && obj.to === JSON.parse(sameObj).to) {
      recentTimeValuesList.splice(index, 1);
    }
  });

  // If list is more than 5 items remove the 5th item.
  if (recentTimeValuesList.length >= 5) {
    recentTimeValuesList.splice(0, 1);
  }

  // Push time object in to a list.
  recentTimeValuesList.push(timeObj);

  // Store the list items in to a localStorage.
  localStorage.setItem('recentTimeValues', JSON.stringify(recentTimeValuesList));
}
