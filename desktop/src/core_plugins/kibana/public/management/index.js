import 'plugins/kibana/management/sections';
import 'plugins/kibana/management/styles/main.less';
import 'ui/filters/start_from';
import 'ui/field_editor';
import uiRoutes from 'ui/routes';
import { uiModules } from 'ui/modules';
import appTemplate from 'plugins/kibana/management/app.html';
//import landingTemplate from 'plugins/kibana/management/landing.html';
import { management } from 'ui/management';
import { FeatureCatalogueRegistryProvider, FeatureCatalogueCategory } from 'ui/registry/feature_catalogue';
import 'ui/kbn_top_nav';
import { DocTitleProvider } from 'ui/doc_title';
import { VunetSidebarConstants } from 'ui/chrome/directives/vunet_sidebar_constants';

uiRoutes
  .when('/management', {
    // Load the 'Index patterns' tab by default.
    redirectTo: '/management/kibana/indices/'
  });

uiRoutes
  .when('/management/:section', {
    redirectTo: '/management'
  });

require('ui/index_patterns/route_setup/load_default')({
  whenMissingRedirectTo: '/management/kibana/index'
});

uiModules
  .get('apps/management')
  .directive('kbnManagementApp', function (Private, $location, timefilter) {
    return {
      restrict: 'E',
      template: appTemplate,
      transclude: true,
      scope: {
        sectionName: '@section',
        omitPages: '@omitBreadcrumbPages',
        pageTitle: '='
      },

      link: function ($scope) {
        timefilter.enabled = false;
        $scope.sections = management.items.inOrder;
        $scope.section = management.getSection($scope.sectionName) || management;

        // Always display doc title as 'Manage Resources'
        const docTitle = Private(DocTitleProvider);
        docTitle.change(VunetSidebarConstants.MANAGE_RESOURCES);

        if ($scope.section) {
          $scope.section.items.forEach(item => {
            item.active = `#${$location.path()}`.indexOf(item.url) > -1;
          });
        }
      }
    };
  });

uiModules
  .get('apps/management')
  .directive('kbnManagementLanding', function (kbnVersion) {
    return {
      restrict: 'E',
      link: function ($scope) {
        $scope.sections = management.items.inOrder;
        $scope.kbnVersion = kbnVersion;
      }
    };
  });

FeatureCatalogueRegistryProvider.register(() => {
  return {
    id: 'management',
    title: 'Management',
    description: 'Your center console for managing the Elastic Stack.',
    icon: '/plugins/kibana/assets/app_management.svg',
    path: '/app/kibana#/management',
    showOnHomePage: false,
    category: FeatureCatalogueCategory.ADMIN
  };
});
