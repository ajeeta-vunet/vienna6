import {
  FeatureCatalogueRegistryProvider,
  FeatureCatalogueCategory,
} from 'ui/registry/feature_catalogue';
import uiRoutes from 'ui/routes';
import manageVisualizationsTemplate from 'plugins/kibana/management/sections/manage_visualizations/manage_visualizations.html';
import { management } from 'ui/management';
import { ManageVisualizations } from 'plugins/kibana/management/sections/manage_visualizations/manage_visualizations';
import { getSavedObject } from 'ui/utils/kibana_object.js';

const Promise = require('bluebird');

uiRoutes.when('/management/kibana/manage_visualizations', {
  template: manageVisualizationsTemplate,
  resolve: {
    dashboardsList: function (Private) {
      const result = Promise.resolve(
        getSavedObject('dashboard', ['title', 'panelsJSON'], 10000, Private)
      );
      return result;
    },
    visualizationsList: function (Private) {
      const result = Promise.resolve(
        getSavedObject(
          'visualization',
          ['title', 'allowedRolesJSON', 'visState'],
          10000,
          Private
        )
      );
      return result;
    },
    reportsList: function (Private) {
      const result = Promise.resolve(
        getSavedObject('report', ['title', 'sectionJSON'], 10000, Private)
      );
      return result;
    },
    alertRulesList: function (Private) {
      const result = Promise.resolve(
        getSavedObject('alert', ['title', 'ruleList'], 10000, Private)
      );
      return result;
    },
  },
});

management.getSection('kibana').register('manage_visualizations', {
  display: 'Manage Visualizations',
  order: 40,
  url: '#/management/kibana/manage_visualizations',
});

FeatureCatalogueRegistryProvider.register(() => {
  return {
    id: 'manage_visualizations',
    title: 'Manage Visualizations',
    description: 'Display all visualizations and the linked data of them',
    icon: '',
    path: '/app/kibana#/management/kibana/manage_visualizations',
    showOnHomePage: false,
    category: FeatureCatalogueCategory.ADMIN,
  };
});
