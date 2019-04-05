import $ from 'jquery';
// This function is used to add row-highligh class to checked row to highlight it
export function highlightSelectedRow() {
  // Set timeout has been used as kuiCheckBox:checked was taking some time to get applied to dom tree
  setTimeout(function () {
    const rowsToAddHighlight = $('.kuiCheckBox:checked').parent().parent().parent();
    rowsToAddHighlight.addClass('row-highlight');
  }, 10);
}
// This function is used to remove row-highligh class when checkbox is unchecked for a row
export function deHighlightRow() {
  const rowsToRemoveHighlight = $('.kuiCheckBox').parent().parent().parent();
  rowsToRemoveHighlight.removeClass('row-highlight');
}