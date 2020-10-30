import $ from 'jquery';
import { vunetConstants } from 'ui/vunet_constants.js';
// Function to toggle full screen in main panel.
export function toggleFullscreen() {

  const _document = parent.document;
  let view = _document.querySelector('#kibana-body');

  if (!view) {
    view = _document.querySelector('.vunet-application');
  }
  // This function is called everytime we toggle fullscreen
  function onFullScreenChange() {
    const fullScreenElement = _document.fullscreenElement || _document.msFullscreenElement
                              || _document.mozFullScreenElement || _document.webkitFullscreenElement;

    // If we go to fullscreen we wait fo 100ms and then calculate the height of the container to be shown
    if (fullScreenElement) {
      setTimeout(function () {
        const kuiLocalNavHeight = $('.kuiLocalNav').height();
        const filterHeight = $('.filter-row-in-search').height();
        const heightToSetOnFullscreenMode = $(window).height() - kuiLocalNavHeight;
        $('.alert-body-container').height(heightToSetOnFullscreenMode - vunetConstants.ALERT_BODY_CONTAINER);
        $('.report-body-container').height(heightToSetOnFullscreenMode);
        $('.menubar-fixed-top-containing-filterbar').height(heightToSetOnFullscreenMode - filterHeight);
        $('.event-container').height(heightToSetOnFullscreenMode);
        // Do not remove the below code as this may be helpful in future
        // $('.react-grid-layout').height(heightToSetOnFullscreenMode - 40);
      }, 100);
    }

    // If we exit fullscreen we again calculate the height of the container to be shown in different way
    else {
      const kuiLocalNavHeight = $('.kuiLocalNav').height();
      const topbarHeight = $('.topbar-container').height();
      const filterHeight = $('.filter-row-in-search').height();
      const heightToSet = $(window).height() - topbarHeight - kuiLocalNavHeight;
      $('.alert-body-container').height(heightToSet - vunetConstants.ALERT_BODY_CONTAINER);
      $('.report-body-container').height(heightToSet);
      $('.event-container').height(heightToSet);
      $('.menubar-fixed-top-containing-filterbar').height(heightToSet - filterHeight);
      // Do not remove the below code as this may be helpful in future
      // $('.react-grid-layout').height(heightToSet - 40);
    }
  }

  if (_document.onfullscreenchange === null) {
    _document.onfullscreenchange = onFullScreenChange;
  } else if (_document.onmsfullscreenchange === null) {
    _document.onmsfullscreenchange = onFullScreenChange;
  } else if (_document.onmozfullscreenchange === null) {
    _document.onmozfullscreenchange = onFullScreenChange;
  } else if (_document.onwebkitfullscreenchange === null) {
    _document.onwebkitfullscreenchange = onFullScreenChange;
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
