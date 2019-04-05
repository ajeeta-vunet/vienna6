import { uiModules } from 'ui/modules';
import 'ng-file-upload';
import './about.less';
import { DocTitleProvider } from 'ui/doc_title';

const app = uiModules.get('app/berlin', ['ngFileUpload']);

import UploadLicenseTemplate from'./upload_license.html';
import UploadLicenseCtrl from './upload_license.controller.js';
import { VunetSidebarConstants } from 'ui/chrome/directives/vunet_sidebar_constants';

app.directive('manageAbout', function () {
  return {
    restrict: 'E',
    controllerAs: 'manageAbout',
    controller: manageAbout,
  };
});

function manageAbout($injector,
  $scope,
  $rootScope,
  $http,
  $modal,
  chrome,
  Upload,
  StateService) {

  // Let us keep a copy of tenantData here
  let tenantData = {};
  $scope.File = null;

  // Meta data for tenant information
  $scope.aboutTenantMeta = {
    headers: ['Company Name', 'Email', 'Phone number'],
    rows: ['enterprise_name', 'email', 'phone_no'],
    id: 'enterprise_name',
    edit: false,
    inverted: true,
    inverted_title: 'Company Information',
    table: [{
      key: 'enterprise_name',
      label: 'Company Name',
      id: true,
      name: 'enterprise_name',
      helpText: 'Provide the company name',
      props: {
        type: 'text',
        required: true,
        pattern: '^[a-zA-Z][a-zA-Z0-9!,.()/@#$%^&*\s]{3,100}$'
      },
      errorText: 'Please enter a valid Company name. It should be more than 3 and less than 100 characters'
    },
    {
      key: 'email',
      label: 'Email',
      helpText: 'Provide the email id',
      name: 'email',
      props: {
        type: 'text',
        required: true,
        pattern: '^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+$'
      },
      errorText: 'Please enter a valid email id'
    },
    {
      key: 'phone_no',
      label: 'Phone Number',
      helpText: 'Provide the phone number',
      name: 'phone_no',
      props: {
        type: 'text',
        required: true,
        pattern: '^[0-9]{10}$',
      },
      errorText: 'Please enter a valid phone number'
    }]
  };

  // If its a super-tenant admin, edit is allowed
  if(chrome.isUserFromSuperTenantAdmin()) {
    $scope.aboutTenantMeta.edit = true;
  }

  // Check if current user is an admin..
  $scope.isCurrentUserAdmin = function () {
    return chrome.isCurrentUserAdmin();
  };

  // Open licence upload Modal
  // $scope.uploadVisible = false;
  $scope.openLicenseModal = function () {
    $modal.open({
      animation: true,
      template: UploadLicenseTemplate,
      controller: UploadLicenseCtrl,
      windowClass: 'upload-license-modal'
    }).result.then(function () {

      // Nothing to do once the license upload modal is submitted.
    }, function () {

      // This callback is added to avoid the following
      // warning in console:Possibly unhandled rejection: cancel

      // 'Possibly unhandled rejection: cancel'
    });
  };

  // Meta data for software release
  $scope.aboutSwReleaseMeta = {
    headers: ['Version', 'Berlin', 'Vienna', 'Cairo'],
    rows: ['platformVersion', 'berlinVersion', 'viennaVersion', 'cairoVersion'],
    id: 'platformVersion',
    inverted: true,
    inverted_title: 'Software Release'
  };

  // Meta data for license
  $scope.aboutLicenseMeta = {
    headers: [
      'License Valid Till',
      'API Clients',
      'API Endpoints',
      'Configuration Collector',
      'GB Per Day',
      'Log Instances',
      'Log Sources',
      'Netflow Flows',
      'Netflow Nodes',
      'No. of Nodes',
      'Probes',
      'User Roles',
      'Users'
    ],
    rows: [
      'licence_expiry_date',
      'api_clients',
      'api_endpoints',
      'config_collector',
      'gbperday',
      'log_instances',
      'log_sources',
      'netflow_flows',
      'netflow_nodes',
      'nodes',
      'probes',
      'user_roles',
      'users'
    ],
    id: 'nodes',
    inverted: true,
    inverted_title: 'Licence Information '
  };

  function init() {
    // Always display doc title as 'About'
    const Private = $injector.get('Private');
    const docTitle = Private(DocTitleProvider);
    docTitle.change(VunetSidebarConstants.ABOUT);
  }

  // Fetch software release items
  $scope.fetchSwReleaseItems = () => {
    return StateService.getReleaseInfo().then(function (data) {
      // Release information containing 'r' means production release
      const prodRelease = data.platform_info.version.match(/[r]/i);
      if (prodRelease) {
        $scope.aboutSwReleaseMeta = {
          headers: ['Version', 'Berlin', 'Vienna', 'Cairo'],
          rows: ['platformVersion', 'berlinVersion', 'viennaVersion', 'cairoVersion'],
          id: 'platformVersion',
          inverted: true,
          inverted_title: 'Software Release'
        };
        return [{
          platformVersion: data.platform_info.version,
          cairoVersion: data.platform_info.component_version.cairo,
          berlinVersion: data.platform_info.component_version.berlin,
          viennaVersion: data.platform_info.component_version.vienna
        }];
      } else {
        $scope.aboutSwReleaseMeta = {
          headers: ['Version'],
          rows: ['platformVersion'],
          id: 'platformVersion'
        };
        return [{
          platformVersion: data.platform_info.version
        }];
      }
    });
  };

  // Fetch tenant information
  $scope.fetchTenantItems = () => {
    return StateService.getTenantInfo().then(function (data) {
      tenantData = data;
      return [{
        enterprise_name: data.enterprise_name,
        email: data.email,
        phone_no: data.phone_no,
      }];
    });
  };

  // Fetch licnese information
  $scope.fetchLicenseItems = () => {
    return StateService.getTenantInfo().then(function (data) {
      return [{
        api_clients: data.api_clients,
        api_endpoints: data.api_endpoints,
        config_collector: data.config_collector,
        nodes: data.health_nodes,
        gbperday: data.gb_per_day,
        licence_expiry_date: data.licence_valid,
        log_instances: data.log_instances,
        log_sources: data.log_sources,
        netflow_flows: data.netflow_flows,
        netflow_nodes: data.netflow_nodes,
        probes: data.probes,
        user_roles: data.user_roles,
        users: data.users
      }];
    });
  };

  // There is currently no table action
  $scope.onTableAction = () => {
    return Promise.resolve(true);
  };

  // Submit the edited tenant data
  $scope.tenantDataSubmit = (event, enterpriseId,  details) => {
    const data = {
      enterprise_name: details.enterprise_name,
      email: details.email,
      phone_no: details.phone_no,

      // Rest populate from local variable
      tenant_description: tenantData.tenant_description,
      tenant_created_time: tenantData.tenant_created_time,
      name: tenantData.name
    };

    return StateService.updateTenantInfo(data).then(function () {
      // We don't need to do anything more..
      return Promise.resolve(true);
    });
  };

  init();
}
