
// Function to toggle full screen in main panel.
export function toggleFullscreen() {

  // this code will excute inside view so select parent docuemt
  const _document = parent.document;
  let view = _document.querySelector('.app-container');

  if (!view) {
    view = _document.querySelector('.vunet-application');
  }

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
      if (view.requestFullscreen) {
        view.requestFullscreen();
      } else if (view.webkitRequestFullscreen) {
        view.webkitRequestFullscreen();
      } else if (view.mozRequestFullScreen) {
        _document.documentElement.mozRequestFullScreen();
      } else if (view.msRequestFullscreen) {
        view.msRequestFullscreen();
      }
    }
  }
}
