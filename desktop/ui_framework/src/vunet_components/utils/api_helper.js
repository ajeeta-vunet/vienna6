import _ from 'lodash';
import chrome from 'ui/chrome';

class APIHelper {

  // https://127.0.0.1/api/default/users/testadmin/
  // https://127.0.0.1/vuSmartMaps/api/1/bu/1/notifications/
  // https://127.0.0.1/vuSmartMaps/api/1/bu/1/fgw/?file_type=images

  currentState = {
    user: null,
  }

  PRE_HTTP = 'http://'
  PRE_HTTPS = 'https://'
  BASE_URL = '/vuSmartMaps/api/';
  USER_BASE_URL = '/api/default/';

  constructor() {
    this.loginUrl = this.USER_BASE_URL + 'session/';
    this.UserUrl = this.USER_BASE_URL + 'users/';
    this.releaseUrl = this.BASE_URL + '/' + 'release_info/';
    this.runDiagnosticUrl = this.BASE_URL + '/diagnostic/';
    // Set tenant-data
    const tenantBuData = chrome.getTenantBu();
    this.tenantId = tenantBuData[0];
    this.buId = tenantBuData[1];

    this.baseUrl = this.BASE_URL;
    this.urlBase = this.BASE_URL + '/' + this.tenantId + '/bu/' + this.buId;
    this.tenantUrl = this.BASE_URL + '/' + this.tenantId;
    this.data_store_url = this.urlBase + '/data_store/';
    this.data_source_url = this.urlBase + '/data_source/';
    this.cred_url = this.urlBase + '/credentials/';
    this.configurationCollectionUrl = this.urlBase + '/configurations/';

    if(window) {
      this.hostname = window.location.hostname;
      this.origin = window.location.origin;
    }

    if (_.has(window.localStorage, 'username') && window.localStorage.username !== '') {
      this.currentState.user = window.localStorage.username;
    }
  }

  isAuthenticated() {
    if(!!this.currentState.user) {
      return true;
    }
    return false;
  }

  // Function to set username in browser's localstorage
  setUser(username) {
    this.currentState.user = username;
    window.localStorage.username = username;
  }

  // Function to fetch Images.
  getUploadedImages() {
    if (this.origin && this.origin !== '') {
      const url = this.origin.concat(this.urlBase,
        '/fgw/?file_type=images');
      return fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(res => res.json())
        .then((result) => {
          return result;
        }, (error) => {
          return error;
        });
    } else {
      return null;
    }
  }

  getNotifications() {
    if (this.origin && this.origin !== '') {
      const url = this.origin.concat(this.urlBase,
        '/notifications');
      return fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(res => res.json())
        .then((result) => {
          return result;
        }, (error) => {
          return error;
        });
    } else {
      return null;
    }
  }

  // Get User details of the user currently signed in
  getCurrentUserInfo() {
    if (this.currentState.user && this.currentState.user != null) {
      return this.getUserInfo(this.currentState.user);
    } else {
      return null;
    }
  }

  // Sign out the user who's currently signed in
  logoutUser() {
    if (this.origin && this.origin !== '') {
      const url = this.origin.concat(this.loginUrl, 'logout/');
      return fetch(url, {
        method: 'POST',
        body: '',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(res => res.json())
        .then((result) => {
          return result;
        }, (error) => {
          return error;
        });
    } else {
      return null;
    }
  }

  // Get User details for the user with username in parameter
  getUserInfo(username) {
    if (this.origin && this.origin !== '') {
      const url = this.origin.concat(this.UserUrl,
        username, '/');
      return fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(res => res.json())
        .then((result) => {
          return result;
        }, (error) => {
          return error;
        });
    } else {
      return null;
    }
  }

  // Stop timer and redirect to login page
  stopIdleTimerAndGoToLoginPage() {
    window.localStorage.removeItem('lastActiveTime');
    window.localStorage.removeItem('username');
    window.location.href = window.location.origin + '/vunet.html';
  }

  // Editing user object
  editUser(username, user) {
    if (this.origin && this.origin !== '') {
      const url = this.origin.concat(this.UserUrl, username, '/');
      return fetch(url, {
        method: 'PUT',
        body: JSON.stringify(user),
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(res => res.json())
        .then((result) => {
          return result;
        }, (error) => {
          return error;
        });
    } else {
      return null;
    }
  }

  // Request for Diagnostics
  requestDiagnostic() {
    if (this.origin && this.origin !== '') {
      const url = this.origin.concat(this.runDiagnosticUrl);
      return fetch(url, {
        method: 'POST',
        body: '',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(res => res.json())
        .then((result) => {
          return result;
        }, (error) => {
          return error;
        });
    } else {
      return null;
    }
  }

}

module.exports = APIHelper;
