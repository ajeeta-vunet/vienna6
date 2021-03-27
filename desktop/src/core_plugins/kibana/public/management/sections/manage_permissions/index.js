import { FeatureCatalogueRegistryProvider, FeatureCatalogueCategory } from 'ui/registry/feature_catalogue';
import uiRoutes from 'ui/routes';
import managePermissionsTemplate from 'plugins/kibana/management/sections/manage_permissions/manage_permissions.html';
import { SavedObjectRegistryProvider } from 'ui/saved_objects/saved_object_registry';
import { management } from 'ui/management';
import { ManagePermissions } from 'plugins/kibana/management/sections/manage_permissions/manage_permissions';

uiRoutes
  .when('/management/kibana/manage_permissions', {
    template: managePermissionsTemplate,
    resolve: {
      dashboardsList: function ($injector, Private) {
        const config = $injector.get('config');
        const services = Private(SavedObjectRegistryProvider).byLoaderPropertiesName;
        const dashboardService = services.dashboards;

        return dashboardService.find('', config.get('savedObjects:listingLimit'))
          .then(result => {
            const sortedDashboards = result.hits;
            //Case-insensitive sorting for dashbaords
            sortedDashboards.sort(function (a, b) {
              if(a.title.toLowerCase() < b.title.toLowerCase()) { return -1; }
              if(a.title.toLowerCase() > b.title.toLowerCase()) { return 1; }
              return 0;
            });
            return sortedDashboards;
          });
      },
      userRolesList: function (StateService) {
        return StateService.getRolesList().then(function (data) {
          //Filtering roles array without "VunetAdmin" role
          const listOfRoles = data.user_groups.filter(role => role.name !== 'VunetAdmin');
          //Case-insensitive sorting for roles
          listOfRoles.sort(function (a, b) {
            if(a.name.toLowerCase() < b.name.toLowerCase()) { return -1; }
            if(a.name.toLowerCase() > b.name.toLowerCase()) { return 1; }
            return 0;
          });
          return listOfRoles;
        });
      },
      permissionsList: function () {
        //A hardcoded permissions array made "None" as deafult permission
        const PermissionPriority = [
          {
            id: 1,
            key: 'modify',
            name: 'Modify',
            value: 0
          },
          {
            id: 2,
            key: 'view',
            name: 'View',
            value: 0
          },
          {
            id: 3,
            key: 'none',
            name: 'None',
            value: 1
          }
        ];
        return PermissionPriority;
      },
      savedDashboardService: function (savedDashboards) {
        return savedDashboards;
      },
      savedVisualizationService: function (savedVisualizations) {
        return savedVisualizations;
      },
      savedSearcheService: function (savedSearches) {
        return savedSearches;
      },
      notify: function ($injector) {
        const Notifier = $injector.get('Notifier');
        const notify = new Notifier({ location: 'Dashboard' });
        return notify;
      },



    }
  });

management.getSection('kibana').register('manage_permissions', {
  display: 'Manage Permissions',
  order: 40,
  url: '#/management/kibana/manage_permissions'
});

FeatureCatalogueRegistryProvider.register(() => {
  return {
    id: 'managepermissions',
    title: 'Manage Permissions',
    description: 'Modify dashboard user role permissions',
    icon: '',
    path: '/app/kibana#/management/kibana/manage_permissions',
    showOnHomePage: false,
    category: FeatureCatalogueCategory.ADMIN
  };
});
