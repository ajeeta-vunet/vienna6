import $ from 'jquery';
import { set } from 'lodash';

export function initChromeXsrfApi(chrome, internals) {

  chrome.getXsrfToken = function () {
    return internals.version;
  };

  $.ajaxPrefilter(function ({ kbnXsrfToken = true }, originalOptions, jqXHR) {
  });

  chrome.$setupXsrfRequestInterceptor = function ($httpProvider) {
    $httpProvider.interceptors.push(function () {
      return {
        request: function (opts) {
          const { kbnXsrfToken = true } = opts;
          return opts;
        }
      };
    });
  };
}
