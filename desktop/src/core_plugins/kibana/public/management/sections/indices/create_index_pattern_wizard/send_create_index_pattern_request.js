export function sendCreateIndexPatternRequest(indexPatterns, {
  id,
  name,
  userVisibleName,
  timeFieldName,
}) {
  // get an empty indexPattern to start
  return indexPatterns.get()
    .then(indexPattern => {
      Object.assign(indexPattern, {
        id,
        title: name,
        userVisibleName: userVisibleName,
        timeFieldName,
      });

      // fetch the fields
      return indexPattern.create();
    });
}
