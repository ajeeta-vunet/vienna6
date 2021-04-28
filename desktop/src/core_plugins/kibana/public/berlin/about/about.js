import { uiModules } from 'ui/modules';
import 'ng-file-upload';
import './about.less';
import { DocTitleProvider } from 'ui/doc_title';

const app = uiModules.get('app/berlin', ['ngFileUpload']);

import { VunetSidebarConstants } from 'ui/chrome/directives/vunet_sidebar_constants';
import { COMPANY_NAME_HELP_OBJ, EMAIL_HELP_OBJ,  PHONE_HELP_OBJ } from './about_constants';

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
    //id: 'enterprise_name', Company name needed to be edited. and the id field was disabled.
    edit: false,
    inverted: true,
    inverted_title: 'Company Information',
    table: [{
      key: 'enterprise_name',
      label: 'Company Name',
      //id: true,
      name: 'enterprise_name',
      helpObj: COMPANY_NAME_HELP_OBJ,
      props: {
        type: 'text',
        required: true,
        pattern: '^[a-zA-Z][a-zA-Z0-9!,.()/@#$%^& *\s]{3,100}$'//space also accepted now in the company name.
      },
      errorText: 'Please enter a valid Company name. It should be more than 3 and less than 100 characters'
    },
    {
      key: 'email',
      label: 'Email',
      helpObj: EMAIL_HELP_OBJ,
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
      helpObj: PHONE_HELP_OBJ,
      name: 'phone_no',
      props: {
        type: 'text',
        required: true,
        pattern: '^[0-9]{10}$',
      },
      errorText: 'Please enter a valid phone number'
    }]
  };

  // Meta data for software release
  $scope.aboutSwReleaseMeta = {
    headers: ['Version', 'Vienna', 'Cairo'],
    rows: ['platformVersion', 'viennaVersion', 'cairoVersion'],
    id: 'platformVersion',
    inverted: true,
    inverted_title: 'Software Release'
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
          headers: ['Version', 'Vienna', 'Cairo'],
          rows: ['platformVersion', 'viennaVersion', 'cairoVersion'],
          id: 'platformVersion',
          inverted: true,
          inverted_title: 'Software Release'
        };
        return [{
          platformVersion: data.platform_info.version,
          cairoVersion: data.platform_info.component_version.cairo,
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
