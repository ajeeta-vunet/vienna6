
// Function to toggle full screen in main panel.
export function toggleFullscreen() {

  // this code will excute inside iframe so select parent docuemt
  const _document = parent.document;
  const iframe = _document.querySelector('.vienna-container iframe');

  // check if fullscreen mode is available
  if (_document.fullscreenEnabled ||
      _document.webkitFullscreenEnabled ||
      _document.mozFullScreenEnabled ||
      _document.msFullscreenEnabled) {

    // check if in full screen
    if (_document.fullscreen || _document.webkitIsFullScreen || _document.mozFullScreen) {

      // check browser specific function
      if (_document.exitFullscreen) {
        _document.exitFullscreen();
      } else if (_document.webkitExitFullscreen) {
        _document.webkitExitFullscreen();
      } else if (_document.mozCancelFullScreen) {
        _document.mozCancelFullScreen();
      } else if (_document.msExitFullscreen) {
        _document.msExitFullscreen();
      }
    } else {

      // check browser specific function
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      } else if (iframe.webkitRequestFullscreen) {
        iframe.webkitRequestFullscreen();
      } else if (iframe.mozRequestFullScreen) {
        _document.documentElement.mozRequestFullScreen();
      } else if (iframe.msRequestFullscreen) {
        iframe.msRequestFullscreen();
      }
    }
  }
}
