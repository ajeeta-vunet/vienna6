// Add the column name to list as it added to search table
export function addColumn(columns, columnName) {
  if (columns.includes(columnName)) {
    return;
  }

  columns.push(columnName);
}
// Remove the column name to list as it removed from search table
export function removeColumn(columns, columnName) {
  if (!columns.includes(columnName)) {
    return;
  }

  columns.splice(columns.indexOf(columnName), 1);
}

// Remove the custom column name once the column removed from list
export function removeCustomColumn(customColumns, columnName) {
  const customColumnsIndex = customColumns.findIndex(function (customColumn) {
    return Object.keys(customColumn)[0] === columnName;
  });

  if (customColumnsIndex >= 0) {
    customColumns.splice(customColumnsIndex, 1);
  }
}
// Move the column left or right in search table
export function moveColumn(columns, columnName, newIndex) {
  if (newIndex < 0) {
    return;
  }

  if (newIndex >= columns.length) {
    return;
  }

  if (!columns.includes(columnName)) {
    return;
  }

  columns.splice(columns.indexOf(columnName), 1);  // remove at old index
  columns.splice(newIndex, 0, columnName);  // insert before new index
}
