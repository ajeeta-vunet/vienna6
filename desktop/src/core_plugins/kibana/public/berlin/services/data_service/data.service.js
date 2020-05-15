/* globals window, setTimeout, Blob */
import _ from 'lodash';
import chrome from 'ui/chrome';
import { Notifier } from 'ui/notify';

/**
 * This will act as the actual component that will talk to the API.
 *
 * This should never be accessed directly from anywhere in the app - the
 * stateService should be used for that.
 *
 * The service will be responsible for intelligently fetching data - it will
 * cache the data after the first call and attempt to always reuse that same
 * data.
 */


class DataService {
  constructor($log,
    FileSaver,
    $http,
    $q,
    $cacheFactory,
    BASE_URL,
    VUINSITE_BASE_URL,
    Notification,
    NOTIFICATION_TIMEOUT,
    USER_BASE_URL,
    EMAIL_PREF_CONST) {

    this.$log = $log;
    this.$http = $http;
    this.FileSaver = FileSaver;
    this.$q = $q;
    this.$http.defaults.withCredentials = true;
    // this.$http.defaults.cache = true;
    // this.state = $state;
    this.emailPrefConst = EMAIL_PREF_CONST;
    this.vuInsiteUrlBase = VUINSITE_BASE_URL + 'topologies/';
    this.loginUrl = USER_BASE_URL + 'session/';
    this.UserUrl = USER_BASE_URL + 'users/';
    this.releaseUrl = BASE_URL + '/' + 'release_info/';
    this.runDiagnosticUrl = BASE_URL + '/diagnostic/';
    this.Notification = Notification;
    this.Notification_timeout = NOTIFICATION_TIMEOUT;
    // this.$httpDefaultCache = $cacheFactory.get('$http');

    // Set tenant-data
    const tenantBuData = chrome.getTenantBu();
    this.tenantId = tenantBuData[0];
    this.buId = tenantBuData[1];

    this.baseUrl = BASE_URL;
    this.urlBase = BASE_URL + '/' + this.tenantId + '/bu/' + this.buId;
    this.tenantUrl = BASE_URL + '/' + this.tenantId;
    this.data_store_url = this.urlBase + '/data_store/';
    this.data_source_url = this.urlBase + '/data_source/';
    this.cred_url = this.urlBase + '/credentials/';
    this.configurationCollectionUrl = this.urlBase + '/configurations/';
  }

  /**
   * private method for all GET requests
   */
  _getRequest(url, moduleString, config) {
    config = config || {};
    return this.$q((resolve, reject) => {
      this.$http.get(url, config).then((response) => {
        resolve(response.data);
      }, (errorResponse) => {
        this._handleErrorResponse(errorResponse, moduleString);
        reject(errorResponse);
      });
    });
  }

  /**
   * private method for all POST requests
   */
  _postRequest(url, data, moduleString, config) {
    config = config || {};
    return this.$q((resolve, reject) => {
      this.$http.post(url, data, config).then((response) => {
        // Invalidate the `get` cache since we have newer data.
        // this.$httpDefaultCache.removeAll();
        resolve(response.data);
      }, (errorResponse) => {
        this._handleErrorResponse(errorResponse, moduleString);
        reject(errorResponse);
      });
    });
  }

  _postFileRequest(url, data, moduleString, config, fileName) {
    config = config || {};
    return this.$q((resolve, reject) => {
      this.$http.post(url, data, config).then((response) => {
        const contentType = response.headers('Content-Type');

        // Get the filename from the Content-Disposition header
        // A sample for the value of Content-Disposition header is shown below
        // Content-Disposition:attachment; filename="heartbeat.zip"
        const contentDispositionHeader = response.headers('Content-Disposition');
        if (contentDispositionHeader && contentDispositionHeader !== undefined) {
          fileName = contentDispositionHeader.split(';')[1].trim().split('=')[1];
          fileName = fileName.replace(/"/g, '');
        }

        // Create the blob object from the response data
        const blob = new Blob([response.data], {
          type: contentType
        });

        // Save the file
        this.FileSaver.saveAs(blob, fileName);
      }, (errorResponse) => {
        this._handleErrorResponse(errorResponse, moduleString);
        reject(errorResponse);
      });
    });
  }

  /**
  * Method for downloading file
  */
  _getFileRequest(url, moduleString, config) {
    config = config || {};
    return this.$q((resolve, reject) => {
      this.$http.get(url, config).then((response) => {
        // Get the content type from response
        const contentType = response.headers('Content-Type');

        let fileName = 'download';
        // Get the filename from the Content-Disposition header
        // A sample for the value of Content-Disposition header is shown below
        // Content-Disposition:attachment; filename="configurations-20171007-134145.zip"
        const contentDispositionHeader = response.headers('Content-Disposition');
        if (contentDispositionHeader !== undefined) {
          fileName = contentDispositionHeader.split(';')[1].trim().split('=')[1];
          fileName = fileName.replace(/"/g, '');
        }

        // Create the blob object from the response data
        const blob = new Blob([response.data], { type: contentType });

        // Save the file
        this.FileSaver.saveAs(blob, fileName);

      }, (errorResponse) => {
        this._handleErrorResponse(errorResponse, moduleString);
        reject(errorResponse);
      });
    });
  }

  /**
   * private method for all PUT requests
   */
  _putRequest(url, data, moduleString, config) {
    config = config || {};
    return this.$q((resolve, reject) => {
      this.$http.put(url, data, config).then((response) => {
        // Invalidate the `get` cache since we have newer data.
        // this.$httpDefaultCache.removeAll();
        resolve(response.data);
      }, (errorResponse) => {
        this._handleErrorResponse(errorResponse, moduleString);
        reject(errorResponse);
      });
    });
  }


  /**
   * private method for all DELETE requests
   *
   */
  _deleteRequest(url, moduleString, config) {

    config = config || {};
    return this.$q((resolve, reject) => {
      this.$http.delete(url, config).then((response) => {
        // this.$httpDefaultCache.removeAll();
        resolve(response.data);
      }, (errorResponse) => {
        this._handleErrorResponse(errorResponse, moduleString);
        reject(errorResponse);
      });
    });
  }

  // Function to handle error response.
  /**
   * This function uses error-string sent by backend and if that is not available,
   * it uses module-string.
   */
  _handleErrorResponse(errorResponse, moduleString) {
    let errorString;
    if (errorResponse.data && errorResponse.data['error-string']) {
      errorString = 'Error : ' + errorResponse.data['error-string'];
    } else {
      errorString = 'Error in ' + moduleString;
    }
    const notify = new Notifier();
    notify.error(errorString);
    this.$log.error(errorResponse);

    // If user session times out, refresh and take him back to login page.
    // Need to find a permanent solution.
    if (errorResponse.data && errorResponse.data['error-code']) {
      if (errorResponse.data['error-code'] === '403') {
        window.localStorage.username = '';
        setTimeout(function () {
          window.location.reload();
        }, 2000);
      }
      else if (errorResponse.data['error-code'] === '401') {
        window.localStorage.username = '';
      }
      // If the user is admin
      else if (errorResponse.data['error-code'] === '474') {
        // this.state.go('details');
      }
      // Else if the user is member
      else if (errorResponse.data['error-code'] === '475') {
        // this.state.go('mdetails');
      }
    }
  }

  /**
   * A wrapper that will fetch data about a snaphot.
   */
  _fetchSnapshot(snapshot) {
    const url = this.urlBase + '/snapshot/' + snapshot + '/alldetails/';
    return this._getRequest(url, 'getting all details');
  }


  // Fetch reports content based on query param
  _fetchReportsContent(snapshot, queryType) {
    let url = this.urlBase + '/snapshot/' + snapshot + '/reports/';
    if (queryType === 'inventory') {
      url = url + '?type=inventory';
    }
    else if (queryType === 'vulnerability') {
      url = url + '?type=vulnerability';
    }
    return this._getRequest(url, 'fetching reports');
  }

  /**
   * Extract only the dashboard data from the API request.
   * Converts the column-first data that we get from the server to row-first so
   * that we can render it easily.
   */
  _pluckDashboardContent(data) {
    return this.$q((resolve) => {
      const dashContent = _.map(data.spa.dashboard_view, (table) => {
        const tableCols = _.map(table.columns, (c) => {
          c.vals = _.pluck(c.column_values, 'value');
          return [c.column_name].concat(c.vals);
        });
        const tableData = [];
        _.each(tableCols, (col, index) => {
          _.each(col, (val, jIndex) => {
            if (!tableData[jIndex]) {
              tableData[jIndex] = [];
            }
            tableData[jIndex][index] = val;
          });
        });

        return {
          name: table.name,
          render_type: table.render_type,
          data: tableData
        };
      });
      resolve(dashContent);
    });
  }

  _pluckRepositoryContent(data) {
    return this.$q((resolve) => {
      resolve(data.snapshots);
    });
  }

  _pluckScanDetailsContent(data) {
    return this.$q((resolve) => {
      resolve(data.scan_data);
    });
  }

  _pluckCredentialsContent(data) {
    return this.$q((resolve) => {
      resolve(data.credentials_data);
    });
  }

  _pluckAlertContent(data) {
    return this.$q((resolve) => {
      resolve(data);
    });
  }

  _pluckNetworkMapContent(data) {
    return this.$q((resolve) => {
      resolve(data.network_view);
    });
  }

  _pluckReportsContent(data) {
    return this.$q((resolve) => {
      resolve(data);
    });
  }

  // Pluck the current snapshot_id
  _pluckCurrentSnapshotId(data) {
    return this.$q((resolve) => {
      resolve(data.current_snapshot_id);
    });
  }

  getDashboardContent(snapshot) {
    return this._fetchSnapshot(snapshot)
      .then(_.bind(this._pluckDashboardContent, this));
  }


  // Returns the list of repositories for the given snapshot
  getRepositoryContent(snapshot) {
    return this._fetchSnapshot(snapshot)
      .then(_.bind(this._pluckRepositoryContent, this));
  }

  getReportsContent(snapshot, queryType) {
    return this._fetchReportsContent(snapshot, queryType)
      .then(_.bind(this._pluckReportsContent, this));
  }

  // Returns the list of subnets that we show on the Scan Details page.
  getScanContent(snapshot) {
    return this._fetchSnapshot(snapshot)
      .then(_.bind(this._pluckScanDetailsContent, this));
  }

  getCredentialsContent(snapshot) {
    return this._fetchSnapshot(snapshot)
      .then(_.bind(this._pluckCredentialsContent, this));
  }

  // Get the list of tenant attribute data
  getTenantAttribute(attributeName) {
    const url = this.tenantUrl + '/attributes/' + attributeName + '/';
    return this._getRequest(url, 'getting list of ' + attributeName);
  }

  //Add a new tenant attribute data
  addTenantAttribute(attributeName, newAttributeData) {
    const url = this.tenantUrl + '/attributes/' + attributeName + '/';
    return this._postRequest(url, newAttributeData, 'creating an ' + attributeName);
  }

  //Edit tenant attribute data
  editTenantAttribute(attributeName, editedAttributeData) {
    const url = this.tenantUrl + '/attributes/' + attributeName + '/' + editedAttributeData.name + '/';
    return this._putRequest(url, editedAttributeData, 'editing an ' + attributeName);
  }

  //Delete tenant attribute data
  deleteTenantAttribute(attributeName, deletedAttributeData) {
    const url = this.tenantUrl + '/attributes/' + attributeName + '/' + deletedAttributeData + '/';
    return this._deleteRequest(url, 'Deleting an ' + attributeName);
  }

  // Export data of the tenant attribute
  exportEmailGroupsData(attributeName, attributeDataExportType) {
    const url = this.tenantUrl + '/attributes/' + attributeName + '/?export=' + attributeDataExportType;
    return this._getFileRequest(url, 'getting the' + attributeDataExportType + 'file of ' + attributeName, { responseType: 'blob' });
  }

  getNetworkMapContent(snapshot) {
    return this._fetchSnapshot(snapshot)
      .then(_.bind(this._pluckNetworkMapContent, this));
  }

  // Get current snapshot_id
  getCurrentSnapshotId(snapshot) {
    return this._fetchSnapshot(snapshot)
      .then(_.bind(this._pluckCurrentSnapshotId, this));
  }

  getNodeDetails(snapshot, nodeId) {
    const url = this.urlBase + '/snapshot/' + snapshot + '/node/' + nodeId + '/attributes/';

    return this._getRequest(url, 'getting node details');
  }

  // Function to get status of the scan.
  getScanNotification() {
    const url = this.urlBase + '/get_status/';
    // this.$httpDefaultCache.remove(url);
    return this._getRequest(url, 'getting scan notification');
  }

  // Function to fetch the notifications
  getNotifications() {
    const url = this.urlBase + '/notifications/';
    // the below function will remove the cache and always fetch the contents
    // from backend.
    // this.$httpDefaultCache.remove(url);
    return this._getRequest(url, 'getting notifications');
  }

  //Function to get the list of users
  getUsersList() {
    const url = this.UserUrl;
    return this._getRequest(url, 'getting list of users');
  }

  // Get the list of roles accesible to the logged in user
  getRolesList() {
    const url = this.getRolesUrl(this.tenantId, this.buId);
    return this._getRequest(url, 'getting list of roles');
  }

  // Get user info of a given user
  getUserInfo(name) {
    const url = this.UserUrl + name + '/';
    return this._getRequest(url, 'getting user');
  }

  // Get the contents of data enrichment group
  getDataEnrichmentContents(groupName) {
    const url = this.urlBase + '/data_enrich_config/' + groupName + '/';
    return this._getRequest(url, 'getting data enrichment content');
  }

  // Update the contents of data enrichment group
  updateDataEnrichmentContent(dataEnrichment, groupName, key) {
    const url = this.urlBase + '/data_enrich_config/' + groupName + '/' + key + '/';
    return this._putRequest(url, dataEnrichment, 'updating data enrichment entry');
  }

  //add an entry in data enrichment group
  addDataEnrichmentContent(groupName, dataEnrichment) {
    const url = this.urlBase + '/data_enrich_config/' + groupName + '/';
    return this._postRequest(url, dataEnrichment, 'adding data enrichment entry');
  }

  // Get list of data enrichment objects.
  getDataEnrichmentGroups() {
    const url = this.urlBase + '/data_enrich_config/';
    return this._getRequest(url, 'getting data enrichment groups');
  }

  // Get tenant information
  getTenantInfo() {
    const url = this.tenantUrl + '/';
    return this._getRequest(url, 'getting tenant information');
  }

  // Get release version
  getReleaseInfo() {
    const url = this.releaseUrl;
    return this._getRequest(url, 'getting release information');
  }

  getListOfDatesHavingData() {
    const url = this.urlBase + '/data_store/';
    return this._getRequest(url, 'getting data store information');
  }

  // get preferences information
  getPreferenceDetails() {
    const url = this.tenantUrl + '/preferences/';
    return this._getRequest(url, 'getting preferences');
  }

  // Get server information
  getServerInformation() {
    const url = this.tenantUrl + '/server_information/';
    return this._getRequest(url, 'getting server information');
  }

  // update server information
  editServerInformation(serverInformation) {
    const url = this.tenantUrl + '/server_information/';
    return this._postRequest(url, serverInformation, 'editing server information');
  }

  getDataSourceTypeList() {
    const url = this.urlBase + '/data_source_type/';
    // We always fetch the data from backend because we want some delay in its
    // controller to load the template html so that we can insert elements
    // based on this response
    // this.$httpDefaultCache.remove(url);
    return this._getRequest(url, 'getting list of data source types');
  }

  getDataSources(sourceType) {
    const url = this.urlBase + '/data_source/' + sourceType + '/';
    // this.$httpDefaultCache.remove(url);
    return this._getRequest(url, 'getting instances for data source ' + sourceType);
  }

  // Get credentials
  getCredentials(credType) {
    const url = this.cred_url + credType + '/';
    // this.$httpDefaultCache.remove(url);
    return this._getRequest(url, 'getting instances for credentials');
  }

  // Get credential names
  getCredentialNames(credType) {
    const url = this.cred_url + credType + '/?field=name';
    // this.$httpDefaultCache.remove(url);
    return this._getRequest(url, 'getting names for credentials');
  }


  /**
   * POST Requests
   */

  refreshDataSouce(sourceType, name, index, interval) {
    const convertedName = name.replace(/ /g, '-');
    const url = this.urlBase + '/data_source/' + sourceType + '/' + convertedName + '/data/' + interval + '/';
    // We need to remove this url from cache as we want to hit the backend
    // everytime this URL is invoked
    // this.$httpDefaultCache.remove(url);
    return this._postRequest(url, { 'index': index }, 'refreshing data for ' + name + ' for ' + sourceType);
  }

  //Getting action buttons bmv
  getActionButtonsDataForBusinessMetric() {
    const url = this.urlBase + '/rba/' + '?type=action';
    return this._getRequest(url, 'getting list of action buttons for BMV');
  }

  //Start the action for the action button
  initiateAction(actionName, agrsToSend, userName) {
    const url = this.urlBase + '/rba/' + actionName + '/';
    agrsToSend.userName = userName;
    return this._postRequest(url, agrsToSend, 'Initiating the action');
  }

  // get all live indices
  getLiveIndices() {
    const url = this.data_store_url + 'live_indices/';
    return this._getRequest(url, 'getting live indices');
  }

  // perform operations on live indices
  updateLiveIndices(action) {
    const url = this.data_store_url + 'live_indices/';
    return this._postRequest(url, action, 'updating live indices');
  }

  // get all archived indices
  getArchivedIndices() {
    const url = this.data_store_url + 'archived_indices/';
    return this._getRequest(url, 'getting archived indices');
  }

  // downloading sample data enrichments file
  downloadSampleDataEnrichment() {
    const url = this.urlBase + '/data_enrich_config/' + '?file_type=sample&file_format=xlsx';
    return this._getFileRequest(url, 'getting sample data enrichment files', { responseType: 'blob' });
  }

  // Get all the vuBlocks
  getvuBlockList() {
    const url = this.urlBase + '/vublock';
    return this._getRequest(url, 'getting vublock list');
  }

  // Get all details of a vuBlock
  getvuBlockDetails(vuBlockName) {
    const url = this.urlBase + '/vublock/' + vuBlockName + '/storyboard';
    return this._getRequest(url, 'getting vublock details');
  }

  // Get details of a tab clicked on vuBlock details page
  getvuBlockTabDetails(vuBlockName, tabName) {
    const url = this.urlBase + '/vublock/' + vuBlockName + '/' + tabName;
    return this._getRequest(url, 'getting tab details for' + tabName);
  }

  // update the current status of vuBlock
  updateVuBlockStatus(vuBlockName, data) {
    const url = this.urlBase + '/vublock/' + vuBlockName;
    return this._putRequest(url, data, 'update vuBlock status');
  }

  // get wizard data for editing an instance under vuBlock
  getWizardDataForSource(vuBlockName, sourceInstanceName) {
    const url = this.urlBase + '/vublock/' + vuBlockName +
                '/source/' + sourceInstanceName + '?template';
    return this._getRequest(url, 'getting wizard data');
  }

  // update source instance
  updateDataSource(vuBlockName, sourceInstanceName, data) {
    const url = this.urlBase + '/vublock/' + vuBlockName +
      '/source/' + sourceInstanceName;
    return this._putRequest(url, data, 'update data source');
  }

  getAgentConfiguration(vuBlockName, sourceInstanceName) {
    const url = this.urlBase + '/vublock/' + vuBlockName +
      '/source/' + sourceInstanceName + '?agent-config';
    return this._getRequest(url, 'getting agent configuration');
  }


  // perform operations on archived indices
  updateArchivedIndices(action) {
    const url = this.data_store_url + 'archived_indices/';
    return this._postRequest(url, action, 'updating archived indices');
  }

  openDataForDate(snapshotId, date, identifier) {
    const url = this.urlBase + '/data_store/' + date + '-' + identifier;
    const action = { 'action': 'open' };
    return this._postRequest(url, action, 'opening a archived/close data');
  }

  archiveDataForDate(snapshotId, date, identifier) {
    const url = this.urlBase + '/data_store/' + date + '-' + identifier;
    const action = { 'action': 'archive' };
    return this._postRequest(url, action, 'archiving a data');
  }

  restoreDataForDate(snapshotId, date, identifier) {
    const url = this.urlBase + '/data_store/' + date + '-' + identifier;
    const action = { 'action': 'retrieve' };
    return this._postRequest(url, action, 'retrieving an archived data');
  }

  updateSubnets(subnets) {
    const url = this.urlBase + '/scan_details/';
    return this._postRequest(url, subnets, 'updating scan information');
  }

  updateCredentials(credentials) {
    const url = this.urlBase + '/credentials/';
    return this._postRequest(url, credentials, 'updating credentials');
  }


  // Add a user
  addUser(user) {
    const url = this.UserUrl;
    return this._postRequest(url, user, 'adding user');
  }

  // Create a role.
  addRole(role) {
    const url = this.getRolesUrl(role.user_group.tenantId, role.user_group.buId);
    return this._postRequest(url, role, 'creating role');
  }

  // Edit the role
  editRole(name, role) {
    const url = this.getRolesUrl(role.user_group.tenantId, role.user_group.buId) + name + '/';
    return this._putRequest(url, role, 'editing a role');
  }

  // Edit the user
  editUser(username, user) {
    const url = this.UserUrl + username + '/';
    return this._putRequest(url, user, 'editing user');
  }

  updateNodePosition(snapshot, nodeId, nodePosition) {
    const url = this.urlBase + '/snapshot/' + snapshot + '/node/' + nodeId + '/node_coordinates/';
    return this._postRequest(url, nodePosition, 'updating node position');
  }

  updateAllNodePosition(snapshot, nodePositionList) {
    const url = this.urlBase + '/snapshot/' + snapshot + '/node' + '/node_coordinates/';
    return this._postRequest(url, nodePositionList, 'updating positions for all nodes');
  }

  updateMetadata(snapshot, nodeId, metaData) {
    const url = this.urlBase + '/meta_data/object/' + nodeId + '/';
    return this._postRequest(url, metaData, 'updating meta data');
  }

  doPathAnalysis(snapshot, pathAnalysis) {
    const url = this.vuInsiteUrlBase + snapshot + '/scenario/path_analysis/';
    return this._postRequest(url, pathAnalysis, 'performing path analysis');
  }

  searchNetwork(snapshot, searchText) {
    const url = this.urlBase + '/snapshot/' + snapshot + '/search/';
    return this._postRequest(url, { string: searchText }, 'performing search');
  }

  addScanNow(scanNow) {
    const url = this.urlBase + '/snapshot/';
    return this._postRequest(url, scanNow, 'triggering the scan');
  }

  // Get details of all routers configured.
  getAllRouterConfigDetails() {
    const url = this.data_source_url + 'configurationcollector/';
    return this._getRequest(url, 'getting all routers configured');
  }

  // update all the instances of a configured router.
  updateRouterConfigInstances(ccmessage) {
    const url = this.configurationCollectionUrl;
    return this._postRequest(url, ccmessage, 'updating all configuration instances of a configured router');
  }

  // Get all the instances of a configured router.
  getRouterConfigInstances(configurationCollectorName) {
    const url = this.configurationCollectionUrl + configurationCollectorName + '/';
    // this.$httpDefaultCache.remove(url);
    return this._getRequest(url, 'getting all configuration instances of ' + configurationCollectorName);
  }

  // Get the contents of a router configuration at a particular time.
  getRouterConfigContent(configurationCollectorName, configurationId) {
    const url = this.configurationCollectionUrl + configurationCollectorName + '/' + configurationId + '/';
    return this._getRequest(url, 'getting the contents of a router configuration');
  }

  // Get the diff contents of a router configuration at a particular time.
  getRouterConfigDiffContent(configurationCollectorName, configurationId1, configurationId2) {
    const url = this.configurationCollectionUrl + configurationCollectorName + '/' +
      configurationId1 + '/' + '?datatype=diff&id=' + configurationId2;
    return this._getRequest(url, 'getting the diff contents of a router configuration');
  }

  // Collect the configuration of the device identified by the configuration collector datasource name.
  collectConfigurationForDevice(configurationCollectorName, ccmessage) {
    const url = this.configurationCollectionUrl + configurationCollectorName + '/';
    return this._postRequest(url, ccmessage, 'Collect the configuration of a device');
  }

  // update tenant information
  updateTenantInfo(tenantData) {
    const url = this.tenantUrl + '/';
    return this._putRequest(url, tenantData, 'updating tenant data');
  }

  // edit preference
  editPreference(preference, slugifiedHeader) {
    const url = this.tenantUrl + '/preferences/' + slugifiedHeader + '/';
    return this._putRequest(url, preference, 'editing preferences');
  }

  // Function to import the file.
  fileImport(snapshot, fileData, upload, newSnapshot) {
    let url = '';
    if (newSnapshot) {
      url = this.urlBase + '/upload_file/';
    }
    else {
      url = this.urlBase + '/snapshot/' + snapshot + '/upload_file/';
    }
    return this.$q((resolve, reject) => {
      upload.upload({ url: url, file: fileData }).then((response) => {
        resolve(response);
      }, (errorResponse) => {
        this._handleErrorResponse(errorResponse, 'importing file. Please check the file type.');
        reject(errorResponse);
      });
    });
  }

  // Function to upload licence file
  updateLicenceDetails(fileData, upload) {
    const url = this.tenantUrl + '/' + 'upload_licence/';
    return this.$q((resolve, reject) => {
      upload.upload({ url: url, file: fileData }).then((response) => {
        resolve(response);
      }, (errorResponse) => {
        this._handleErrorResponse(errorResponse, 'updating licence.');
        reject(errorResponse);
      });
    });
  }

  // Logout function
  logoutUser() {
    const url = this.loginUrl + 'logout/';
    return this._postRequest(url, '', 'logging out the user');
  }

  addDataSources(sourceType, name, data) {
    const convertedName = name.replace(/ /g, '-');
    const url = this.urlBase + '/data_source/' + sourceType + '/' + convertedName + '/';
    return this._postRequest(url, data, 'adding instance for ' + sourceType);
  }

  updateDataSources(sourceType, name, data) {
    const convertedName = name.replace(/ /g, '-');
    const url = this.urlBase + '/data_source/' + sourceType + '/' + convertedName + '/';
    return this._putRequest(url, data, 'updating instance for ' + sourceType);
  }

  // Function to import the file.
  importDataSources(fileData, upload) {
    const url = this.urlBase + '/data_source/upload_file/';
    return this.$q((resolve, reject) => {
      upload.upload({ url: url, file: fileData }).then((response) => {
        resolve(response);
      }, (errorResponse) => {
        this._handleErrorResponse(errorResponse, 'importing data sources. Please check the file.');
        reject(errorResponse);
      });
    });
  }

  // get vendor and devices list
  getVendorAndDeviceList() {
    const url = this.urlBase + '/data_source/vendor_device_info/';
    return this._getRequest(url, 'getting vendor device information');
  }

  // Importing data enrichment file.
  importDataEnrichment(fileData, upload) {
    const url = this.urlBase + '/data_enrich_config/';
    return this.$q((resolve, reject) => {
      upload.upload({ url: url, file: fileData }).then((response) => {
        resolve(response);
      }, (errorResponse) => {
        this._handleErrorResponse(errorResponse, 'importing data enrichment. Please check the file.');
        reject(errorResponse);
      });
    });
  }

  //Import data to elasticsearch
  importData(file, indexName, docType, isTimeseries, timeField, timeFormat, customField, upload) {
    const url = this.urlBase + '/data/';
    return this.$q((resolve, reject) => {
      upload.upload({
        url: url,
        file: file,
        data: {
          'index_name': indexName,
          'doc_type': docType,
          'is_time_series_data': isTimeseries,
          'timestamp_field': timeField,
          'customized_timestamp_format': timeFormat,
          'custom_field_dict': customField
        }
      }).then((response) => {
        resolve(response);
      }, (errorResponse) => {
        this._handleErrorResponse(errorResponse, 'Importing data. Please check the file.');
        reject(errorResponse);
      });
    });
  }

  downloadDataSourceAgentConfiguration(sourceType, dataSourceInstance, environment, data) {
    const convertedName = dataSourceInstance.replace(/ /g, '-');
    const url = this.urlBase + '/data_source/' + sourceType + '/' + convertedName + '/environment/' + environment + '/agent_config/';
    return this._postFileRequest(url, data, 'fetching agent configuration for ' +
      sourceType, { responseType: 'blob' }, sourceType + '.yml');
  }

  // function to download the data source agent package and install script
  downloadDataSourceAgent(sourceType, dataSourceInstance, environment, data) {
    const convertedName = dataSourceInstance.replace(/ /g, '-');
    const url = this.urlBase + '/data_source/' + sourceType + '/' + convertedName +
      '/environment/' + environment + '/agent_install_script/';
    return this._postFileRequest(url, data, 'fetching agent for ' + sourceType, { responseType: 'blob' }, '');
  }

  // Request backend to run diagnostic and report the resuls
  requestDiagnostic() {
    return this._postRequest(this.runDiagnosticUrl, '', 'requesting to run diagnostics');
  }

  // Create credentials
  createCredentials(credType, jsonString) {
    const url = this.cred_url + credType + '/';
    return this._postRequest(url, jsonString, 'creating instances for ' + credType + ' credentials');
  }



  /**
   * DELETE Requests
   */

  // Delete credentials
  deleteCredentials(credType, name) {
    const url = this.cred_url + credType + '/' + name + '/';
    return this._deleteRequest(url, 'deleting instances for SNMP credentials');
  }

  deleteDataSources(sourceType, name) {
    const convertedName = name.replace(/ /g, '-');
    const url = this.urlBase + '/data_source/' + sourceType + '/' + convertedName + '/';
    return this._deleteRequest(url, 'deleting instance for ' + sourceType);
  }

  deleteSnapshot(snapshot) {
    const url = this.urlBase + '/snapshot/' + snapshot + '/';
    return this._deleteRequest(url, 'deleting the snapshot');
  }


  // Delete user
  deleteUser(name) {
    const url = this.UserUrl + name + '/';
    return this._deleteRequest(url, 'deleting user');
  }

  // Delete Role
  deleteRole(name, tenantId, buId) {
    const url = this.getRolesUrl(tenantId, buId) + name + '/';
    return this._deleteRequest(url, 'deleting a role');
  }

  // Delete a row in data enrichment object
  deleteDataEnrichmentContent(groupName, key) {
    const url = this.urlBase + '/data_enrich_config/' + groupName + '/' + key + '/';
    return this._deleteRequest(url, 'deleting data enrichment content');
  }

  // Export data enrichment file(s).
  exportDataEnrichment(fileNames, fileType) {
    const url = this.urlBase + '/data_enrich_config/' + '?' + 'selected_files=' + fileNames + '&file_format=' + fileType;
    return this._getFileRequest(url, 'getting existing data enrichment files', { responseType: 'blob' });
  }

  deleteArchiveDataForDate(snapshot, date, identifier) {
    const url = this.urlBase + '/data_store/' + date + '-' + identifier;
    return this._deleteRequest(url, 'deleting archived data');
  }

  // Download the most recent configuration of all devices
  downloadMostRecentConfigurationOfAllDevices() {
    const url = this.configurationCollectionUrl + '?datatype=recentconfiguration&format=txt';
    return this._getFileRequest(url, 'downloading most recent configuration of all devices', { responseType: 'blob' });
  }

  // Download most recent configuration of a device
  downloadMostRecentConfigurationOfSingleDevice(configurationCollectorName) {
    const url = this.configurationCollectionUrl + configurationCollectorName + '/?datatype=recentconfiguration&format=txt';
    return this._getFileRequest(url, 'downloading most recent configuration of a device', { responseType: 'blob' });
  }

  // Download a configuration item
  downloadSingleConfigurationItem(configurationCollectorName, configurationId) {
    const url = this.configurationCollectionUrl + configurationCollectorName + '/' + configurationId + '/?format=txt';
    return this._getFileRequest(url, 'downloading a configuration item', { responseType: 'blob' });
  }

  // Get the url for accesing the user roles for the given tenantId and buId
  getRolesUrl(tenantId, buId) {
    return this.baseUrl + '/' + tenantId + '/bu/' + buId + '/user_groups/';
  }

  //get dashbpoard list
  getDashboards(group, tenantId, buId) {
    const url = this.urlBase + '/dashboard/?user_group=' + group + '&tenant_id=' + tenantId + '&bu_id=' + buId;
    return this._getRequest(url, 'getting list of dashboards');
  }

  //mobile dashboard : get dashboards details
  getMobileDashboardsDetails(dashboard, startTime, endTime) {
    const url = this.urlBase + '/dashboard/' + dashboard + '/?start_time=' + startTime + '&end_time=' + endTime + '&mobile_kpi=true';
    return this._getRequest(url, 'getting details of mobile dashboards');
  }

  // Handle add, edit, update and deletion of schedules
  // related to vusmartmaps backup
  handleBackupSchedules(method, data) {
    let url = this.urlBase + '/vuconfig/settings/';
    if(method === 'GET') {
      return this._getRequest(url, 'getting list of backup schedules');
    }
    else if(method === 'POST') {
      return this._postRequest(url, data, 'adding new schedule');
    }
    else if(method === 'PUT') {
      return this._putRequest(url, data, 'updating list of backup schedules');
    }
    else if(method === 'DELETE') {
      url = url + data + '/';
      return this._deleteRequest(url, 'deleting selected backup schedules');
    }
  }

  // Initiate backup for selected schedules
  backupSelectedSchedules(data) {
    const url = this.urlBase + '/vuconfig/';
    return this._postRequest(url, data, 'initiate backup for selected schedules');
  }

  // Uploads the file information.
  uploadFgwFiles(fileName, upload) {
    const url = this.urlBase + '/fgw/';
    return this.$q((resolve, reject) => {
      upload.upload({ url: url, file: fileName }).then((response) => {
        resolve(response);
      }, (errorResponse) => {
        this._handleErrorResponse(errorResponse, 'updating file.');
        reject(errorResponse);
      });
    });
  }

  // Gets the list of Uploaded file gate way files.
  getFgwFiles() {
    const url = this.urlBase + '/fgw/';
    return this._getRequest(url, 'getting list of file information');
  }

  // Downloads file gate way files.
  downloadFgwFile(rowId) {
    const url = this.urlBase + '/fgw/' + rowId;
    return this._getFileRequest(url, 'downloading a file', { responseType: 'blob' });
  }

  // Deletes file gate way file.
  deleteFgwFiles(rowId) {
    const url = this.urlBase + '/fgw/' + rowId;
    return this._deleteRequest(url, 'Deleting a File ' + rowId);
  }

  // Function to fetch data retention settings.
  getDataRetentionDuration() {
    const url = this.tenantUrl + '/preferences/RetentionPreference/';
    return this._getRequest(url, 'getting data retention duration');
  }

  // Update the data retention settings.
  updateDataRetentionSettings(dataretention) {
    const url = this.tenantUrl + '/preferences/RetentionPreference/';
    return this._putRequest(url, dataretention, 'updating data enrichment entry');
  }

  // Function to fetch Images.
  getUploadedImages() {
    const url = this.urlBase + '/fgw/?file_type=images';
    return this._getRequest(url, 'getting images');
  }

  // Uploads the Image Information.
  uploadImageFile(upload, usageType, File, imageName) {
    const url = this.urlBase + '/fgw/?file_type=images&usage_type=' + usageType + '&image_name=' + imageName;
    return this.$q((resolve, reject) => {
      upload.upload({ url: url, file: File }).then((response) => {
        resolve(response);
      }, (errorResponse) => {
        this._handleErrorResponse(errorResponse, 'updating file.');
        reject(errorResponse);
      });
    });
  }

  // Deletes the Image file.
  deleteUploadedImage(rowId) {
    const url = this.urlBase + '/fgw/?file_type=images&image_name=' + rowId;
    return this._deleteRequest(url, 'Deleting an Image ' + rowId);
  }

}

DataService.$inject = ['$log',
  'FileSaver',
  '$http',
  '$q',
  '$cacheFactory',
  'BASE_URL',
  'VUINSITE_BASE_URL',
  'Notification',
  'NOTIFICATION_TIMEOUT',
  'USER_BASE_URL',
  'EMAIL_PREF_CONST'];
/*eslint-disable */
export default DataService;
/*eslint-enable */
