/* globals window */
import _ from 'lodash';
/**
 * ES6 classes don't have a concept of private methods. There are ways that I
 * can hack around it by either making dependent classes or weird things with
 * WeakMaps() etc - but I don't like those approaches.
 * I'm basically going with the notion that anything that starts with a _ is
 * supposed to be considered private.
 */

class StateService {
  constructor($log, $q, dataService, $rootScope) {
    this.$log = $log;
    this.$q = $q;
    this._DataService = dataService;
    this.$rootScope = $rootScope;
    this._currentState = {
      snapshot: 'current',
      user: null,
    };
    if (
      _.has(window.localStorage, 'username') &&
      window.localStorage.username !== ''
    ) {
      this._currentState.user = window.localStorage.username;
    }
  }

  isAuthenticated() {
    if (!!this._currentState.user) {
      return true;
    }
    return false;
  }

  getCurrentUserInfo() {
    return this._DataService.getUserInfo(this._currentState.user);
  }

  // Get Requests
  getActiveSnapshot() {
    return this._currentState.snapshot;
  }

  getActiveSnapshotDetails() {
    return this.$q((resolve) => {
      this.getRepositoryContent().then((response) => {
        const currentRepo = _.findWhere(response, {
          snapshot_id: this._currentState.snapshot,
        });
        resolve(currentRepo.snapshot_details);
      });
    });
  }

  setUser(username) {
    this._currentState.user = username;
    window.localStorage.username = username;
  }

  logoutUser() {
    return this._DataService.logoutUser();
  }

  getUsersList() {
    return this._DataService.getUsersList();
  }

  getDashboardContent() {
    return this._DataService.getDashboardContent(this._currentState.snapshot);
  }

  getRepositoryContent() {
    return this._DataService.getRepositoryContent(this._currentState.snapshot);
  }

  getScanContent() {
    return this._DataService.getScanContent(this._currentState.snapshot);
  }

  getCredentialsContent() {
    return this._DataService.getCredentialsContent(this._currentState.snapshot);
  }

  // Get all deatils of tenant attribute data
  getTenantAttribute(attributeName) {
    return this._DataService.getTenantAttribute(attributeName);
  }

  //adding a tenant attribute data
  addTenantAttribute(attributeName, newAttributeData) {
    return this._DataService.addTenantAttribute(
      attributeName,
      newAttributeData
    );
  }

  //editing tenant attribute data
  editTenantAttribute(attributeName, editedAttributeData) {
    return this._DataService.editTenantAttribute(
      attributeName,
      editedAttributeData
    );
  }

  //deleting tenant attribute data
  deleteTenantAttribute(attributeName, deletedAttributeData) {
    return this._DataService.deleteTenantAttribute(
      attributeName,
      deletedAttributeData
    );
  }

  // Export Excel of tenant attribute data
  exportEmailGroupsData(attributeName, attributeDataExportType) {
    return this._DataService.exportEmailGroupsData(
      attributeName,
      attributeDataExportType
    );
  }

  getNetworkMapContent() {
    return this._DataService.getNetworkMapContent(this._currentState.snapshot);
  }

  getNodeDetails(nodeId) {
    return this._DataService.getNodeDetails(
      this._currentState.snapshot,
      nodeId
    );
  }

  // collect the latest router configuration
  updateRouterConfigInstances(ccmessage) {
    return this._DataService.updateRouterConfigInstances(ccmessage);
  }

  // Get details of all routers configured.
  getAllRouterConfigDetails() {
    return this._DataService.getAllRouterConfigDetails();
  }

  // Get all the instances of a configured router.
  getRouterConfigInstances(configurationCollectorName) {
    return this._DataService.getRouterConfigInstances(
      configurationCollectorName
    );
  }

  // Get the contents of a router configuration at a particular time.
  getRouterConfigContent(configurationCollectorName, configurationId) {
    return this._DataService.getRouterConfigContent(
      configurationCollectorName,
      configurationId
    );
  }

  // Get the diff contents of a router configuration at a particular time.
  getRouterConfigDiffContent(
    configurationCollectorName,
    configurationId1,
    configurationId2
  ) {
    return this._DataService.getRouterConfigDiffContent(
      configurationCollectorName,
      configurationId1,
      configurationId2
    );
  }

  // Collect the configuration of the device identified by the configuration collector datasource name.
  collectConfigurationForDevice(configurationCollectorName, ccmessage) {
    return this._DataService.collectConfigurationForDevice(
      configurationCollectorName,
      ccmessage
    );
  }

  // Get current snapshot id
  getCurrentSnapshotId() {
    return this._DataService.getCurrentSnapshotId(this._currentState.snapshot);
  }

  // Get scan notification
  getScanNotification() {
    return this._DataService.getScanNotification();
  }

  getNotifications() {
    return this._DataService.getNotifications();
  }

  getUserInfo(name) {
    return this._DataService.getUserInfo(name.toString());
  }

  // Get tenant information
  getTenantInfo() {
    return this._DataService.getTenantInfo();
  }

  // Get release information
  getReleaseInfo() {
    return this._DataService.getReleaseInfo();
  }

  // Get list of roles/groups
  getRolesList() {
    return this._DataService.getRolesList();
  }

  // Get list of license modules and there usage limit
  getLicenseUsageLimit() {
    return this._DataService.getLicenseUsageLimit();
  }

  // Get list of license modules and there active usage
  getLicenseActiveUsage() {
    return this._DataService.getLicenseActiveUsage();
  }

  // Get preference information
  getPreferenceDetails() {
    return this._DataService.getPreferenceDetails();
  }

  // Get server information
  getServerInformation() {
    return this._DataService.getServerInformation();
  }

  // Get list of snmp credential names, used by data sources
  getSnmpCredentialNames() {
    return this._DataService.getCredentialNames('snmp');
  }

  // Get list of SSH credential names, used by data sources
  getSshCredentialNames() {
    return this._DataService.getCredentialNames('ssh');
  }

  // Get credentials
  getCredentials(credType) {
    return this._DataService.getCredentials(credType);
  }

  createCredentials(credType, jsonString) {
    return this._DataService.createCredentials(credType, jsonString);
  }

  deleteCredentials(credType, name) {
    return this._DataService.deleteCredentials(credType, name);
  }

  // Edit server information
  editServerInformation(serverInformation) {
    return this._DataService.editServerInformation(serverInformation);
  }

  // edit preferences
  editPreference(preference, slugifiedHeader) {
    return this._DataService.editPreference(preference, slugifiedHeader);
  }

  // Setting Internal State
  setSnapshot(snapshot) {
    this._currentState.snapshot = snapshot;
    // Others (like navbar) listen for this event and take any actions needed.
    this.$rootScope.$broadcast('vusop:snapshotChanged', snapshot);
  }

  // POST Requests
  updateSubnets(subnets) {
    return this._DataService.updateSubnets(subnets);
  }

  updateCredentials(credentials) {
    return this._DataService.updateCredentials(credentials);
  }

  addUser(user) {
    return this._DataService.addUser(user);
  }

  editUser(username, user) {
    return this._DataService.editUser(username.toString(), user);
  }

  addRole(role) {
    return this._DataService.addRole(role);
  }

  editRole(name, role) {
    return this._DataService.editRole(name.toString(), role);
  }

  updateNodePosition(nodeId, nodePosition) {
    return this._DataService.updateNodePosition(
      this._currentState.snapshot,
      nodeId,
      nodePosition
    );
  }

  updateAllNodePosition(nodePositionList) {
    return this._DataService.updateAllNodePosition(
      this._currentState.snapshot,
      nodePositionList
    );
  }

  updateMetadata(nodeId, metaData) {
    return this._DataService.updateMetadata(
      this._currentState.snapshot,
      nodeId,
      metaData
    );
  }

  doPathAnalysis(pathAnalysis) {
    return this._DataService.doPathAnalysis(
      this._currentState.snapshot,
      pathAnalysis
    );
  }

  searchNetwork(searchText) {
    return this._DataService.searchNetwork(
      this._currentState.snapshot,
      searchText
    );
  }

  addScanNow(scanNow) {
    return this._DataService.addScanNow(scanNow);
  }

  deleteSnapshot(snapshot) {
    return this._DataService.deleteSnapshot(snapshot.toString());
  }

  deleteUser(name) {
    return this._DataService.deleteUser(name.toString());
  }

  // The super tenant can manage the roles of any tenant. So the tenantId and
  // buId are passed from the controllers. For the other functions, the
  // tenantId and buId are added to the urlBase itself as it is always going
  // to be the logged in user's tenant / bu.
  deleteRole(name, tenantId, buId) {
    return this._DataService.deleteRole(
      name.toString(),
      tenantId.toString(),
      buId.toString()
    );
  }

  // Export data enrichment file(s)
  exportDataEnrichment(data) {
    return this._DataService.exportDataEnrichment(data);
  }

  fileImport(fileData, upload, newSnapshot) {
    return this._DataService.fileImport(
      this._currentState.snapshot,
      fileData,
      upload,
      newSnapshot
    );
  }

  // update licence
  updateLicenceDetails(fileData, upload) {
    return this._DataService.updateLicenceDetails(fileData, upload);
  }

  // update tenant information
  updateTenantInfo(tenantData) {
    return this._DataService.updateTenantInfo(tenantData);
  }

  getListOfDatesHavingData() {
    return this._DataService.getListOfDatesHavingData();
  }

  //Getting action buttons bmv
  getActionButtonsDataForBusinessMetric() {
    return this._DataService.getActionButtonsDataForBusinessMetric();
  }

  //Start the action for the action button
  initiateAction(actionName, agrsToSend) {
    return this._DataService.initiateAction(
      actionName,
      agrsToSend,
      this._currentState.user
    );
  }

  // get all live indices
  getLiveIndices() {
    return this._DataService.getLiveIndices();
  }

  // perform operations on live indices
  updateLiveIndices(action) {
    return this._DataService.updateLiveIndices(action);
  }

  // get all archived indices
  getArchivedIndices() {
    return this._DataService.getArchivedIndices();
  }

  // perform operations on archived indices
  updateArchivedIndices(action) {
    return this._DataService.updateArchivedIndices(action);
  }

  openDataForDate(date, identifier) {
    return this._DataService.openDataForDate(
      this._currentState.snapshot,
      date,
      identifier
    );
  }

  archiveDataForDate(date, identifier) {
    return this._DataService.archiveDataForDate(
      this._currentState.snapshot,
      date,
      identifier
    );
  }

  restoreDataForDate(date, identifier) {
    return this._DataService.restoreDataForDate(
      this._currentState.snapshot,
      date,
      identifier
    );
  }

  deleteArchiveDataForDate(date, identifier) {
    return this._DataService.deleteArchiveDataForDate(
      this._currentState.snapshot,
      date,
      identifier
    );
  }

  // This function is called to fetch the list of data-source-types
  getDataSourceTypeList() {
    return this._DataService.getDataSourceTypeList();
  }

  // This function is called to fetch the details of a specifc data-source-types
  getDataSources(sourceType) {
    return this._DataService.getDataSources(sourceType);
  }

  // This function is called to add instance to a specifc data-source-types
  addDataSources(sourceType, name, data) {
    return this._DataService.addDataSources(sourceType, name, data);
  }

  // This function is called to update instance of a specifc data-source-types
  updateDataSources(sourceType, name, data) {
    return this._DataService.updateDataSources(sourceType, name, data);
  }

  // This function is called to delete instance of a specifc data-source-types
  deleteDataSources(sourceType, name) {
    return this._DataService.deleteDataSources(sourceType, name);
  }

  // This function is called to import xls file containing instances of a
  // one or multiple data-source-types
  importDataSources(fileData, upload) {
    return this._DataService.importDataSources(fileData, upload);
  }

  // This function is called to import xls file containing
  // one or multiple data-source-types for a vublock
  importVublockDataSources(fileData, upload, vuBlockId) {
    return this._DataService.importVublockDataSources(fileData, upload, vuBlockId);
  }

  downloadImportVuBlockErrors(vuBlockId) {
    return this._DataService.downloadImportVuBlockErrors(vuBlockId);
  }

  // This function is called to export all the data-source-types
  // for a vublock to a xls file
  exportDataSources(vuBlockID) {
    return this._DataService.exportDataSources(vuBlockID);
  }

  // Export one or more vublocks to a json file
  exportvuBlock(vuBlockList) {
    return this._DataService.exportvuBlock(vuBlockList);
  }

  // Import the json file containing the data for one or more vublocks
  // into the vublock configuration index.
  importvuBlock(fileData, upload) {
    return this._DataService.importvuBlock(fileData, upload);
  }

  // get vendor and devices list
  getVendorAndDeviceList() {
    return this._DataService.getVendorAndDeviceList();
  }

  // get standalone shipper list
  getStandaloneShipperList() {
    return this._DataService.getStandaloneShipperList();
  }
  // Import data enrichment file
  importDataEnrichment(fileData, upload) {
    return this._DataService.importDataEnrichment(fileData, upload);
  }

  //Import data to elastic search
  importData(
    file,
    indexName,
    docType,
    isTimeseries,
    timeField,
    timeFormat,
    customField,
    upload
  ) {
    return this._DataService.importData(
      file,
      indexName,
      docType,
      isTimeseries,
      timeField,
      timeFormat,
      customField,
      upload
    );
  }

  // This function is called to refresh data receive flag for a given instance
  // of a specifc data-source-types
  refreshDataSouce(sourceType, index, esIndexName, interval) {
    return this._DataService.refreshDataSouce(
      sourceType,
      index,
      esIndexName,
      interval
    );
  }

  downloadDataSourceAgentConfiguration(
    dataSourceType,
    dataSourceinstance,
    environment,
    data
  ) {
    return this._DataService.downloadDataSourceAgentConfiguration(
      dataSourceType,
      dataSourceinstance,
      environment,
      data
    );
  }

  // function to download the data source agent package and install script
  downloadDataSourceAgent(
    dataSourceType,
    dataSourceinstance,
    environment,
    data
  ) {
    return this._DataService.downloadDataSourceAgent(
      dataSourceType,
      dataSourceinstance,
      environment,
      data
    );
  }

  // Download the most recent configuration of all devices
  downloadMostRecentConfigurationOfAllDevices() {
    return this._DataService.downloadMostRecentConfigurationOfAllDevices();
  }

  // Download most recent configuration of a device
  downloadMostRecentConfigurationOfSingleDevice(configurationCollectorName) {
    return this._DataService.downloadMostRecentConfigurationOfSingleDevice(
      configurationCollectorName
    );
  }

  // Download a configuration item
  downloadSingleConfigurationItem(configurationCollectorName, configurationId) {
    return this._DataService.downloadSingleConfigurationItem(
      configurationCollectorName,
      configurationId
    );
  }

  // function to download the data enrichment file
  downloadSampleDataEnrichment() {
    return this._DataService.downloadSampleDataEnrichment();
  }

  // Get all the configured hosts
  getHostLandscapeList() {
    return this._DataService.getHostLandscapeList();
  }

  // Get all the vuBlocks
  getvuBlockList() {
    return this._DataService.getvuBlockList();
  }

  // Get all details of a vuBlock
  getvuBlockDetails(vuBlockName) {
    return this._DataService.getvuBlockDetails(vuBlockName);
  }

  // Get details of a tab clicked on vuBlock details page
  getvuBlockTabDetails(vuBlockName, tabName) {
    return this._DataService.getvuBlockTabDetails(vuBlockName, tabName);
  }

  // Get details of a tab clicked on vuBlock details page
  getLogicalvuBlockComponentsDetails(vuBlockName, tabName) {
    return this._DataService.getLogicalvuBlockComponentsDetails(vuBlockName, tabName);
  }

  // update vuBlock status
  updateVuBlockStatus(vuBlockName, data) {
    return this._DataService.updateVuBlockStatus(vuBlockName, data);
  }

  // get wizard data for editing an instance under vuBlock
  getWizardDataForSource(vuBlockName, sourceInstanceName) {
    return this._DataService.getWizardDataForSource(
      vuBlockName,
      sourceInstanceName
    );
  }

  // update source instance
  updateDataSource(vuBlockName, sourceInstanceName, data) {
    return this._DataService.updateDataSource(
      vuBlockName,
      sourceInstanceName,
      data
    );
  }

  // add source instance
  addDataSource(vuBlockName, data) {
    return this._DataService.addDataSource(vuBlockName, data);
  }

  // delete source instance
  deleteDataSource(vuBlockName, sourceInstanceID) {
    return this._DataService.deleteDataSource(vuBlockName, sourceInstanceID);
  }

  getAgentConfiguration(vuBlockName, sourceInstanceName) {
    return this._DataService.getAgentConfiguration(
      vuBlockName,
      sourceInstanceName
    );
  }

  requestDiagnostic() {
    return this._DataService.requestDiagnostic();
  }

  //get dashbpoard list
  getDashboards(group, tenantId, buId) {
    return this._DataService.getDashboards(group, tenantId, buId);
  }

  //mobile dashboard : get details of dashboards
  getMobileDashboardsDetails(dashboard, startTime, endTime) {
    return this._DataService.getMobileDashboardsDetails(
      dashboard,
      startTime,
      endTime
    );
  }

  // Gets the list of Uploaded file gate way files.
  handleBackupSchedules(method, data) {
    return this._DataService.handleBackupSchedules(method, data);
  }

  // Initiate backup for selected schedules
  backupSelectedSchedules(data) {
    return this._DataService.backupSelectedSchedules(data);
  }

  // Uploads the file information.
  uploadFgwFiles(fileName, upload) {
    return this._DataService.uploadFgwFiles(fileName, upload);
  }

  // Gets the list of Uploaded files.
  getFgwFiles() {
    return this._DataService.getFgwFiles();
  }

  // Downloads the file (File Management Interface).
  downloadFgwFile(rowId) {
    return this._DataService.downloadFgwFile(rowId);
  }

  // Download the agent and configuration.
  downloadAgentConfig(target, agentConfig, env, agentName) {
    return this._DataService.downloadAgentConfig(target, agentConfig, env, agentName);
  }

  // Deletes a file.
  deleteFgwFiles(rowId) {
    return this._DataService.deleteFgwFiles(rowId);
  }

  // Function to fetch data retention settings.
  getDataRetentionDuration() {
    return this._DataService.getDataRetentionDuration();
  }

  // Update the data retention settings.
  updateDataRetentionSettings(dataretention) {
    return this._DataService.updateDataRetentionSettings(dataretention);
  }

  // Function to fetch Images.
  getUploadedImages() {
    return this._DataService.getUploadedImages();
  }

  // Uploads the Image Information.
  uploadImageFile(upload, usageType, File, imageName) {
    return this._DataService.uploadImageFile(
      upload,
      usageType,
      File,
      imageName
    );
  }

  // Deletes the Image file.
  deleteUploadedImage(rowId) {
    return this._DataService.deleteUploadedImage(rowId);
  }
}

StateService.$inject = ['$log', '$q', 'DataService', '$rootScope'];
/*eslint-disable */
export default StateService;
/*eslint-enable */
//angular.module('app/berlin').service('StateService', StateService);
