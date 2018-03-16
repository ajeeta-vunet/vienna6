import { SavedObjectRegistryProvider } from 'ui/saved_objects/saved_object_registry';
import { FilterManagerProvider } from 'ui/filter_manager';
import { loadPanelFunction } from 'plugins/kibana/report/components/panel/lib/load_panel';

require('ui/modules')
  .get('app/report')
  .directive('reportPanel', function (savedVisualizations, savedSearches, Notifier, Private) {
    const _ = require('lodash');
    const loadPanel = Private(loadPanelFunction);
    const filterManager = Private(FilterManagerProvider);

    const services = Private(SavedObjectRegistryProvider).byLoaderPropertiesName;

    require('ui/visualize');
    require('ui/doc_table');

    const getPanelId = function (panel) {
      return ['P', panel.panelIndex].join('-');
    };

    return {
      restrict: 'E',
      template: require('plugins/kibana/report/components/panel/panel.html'),
      requires: '^reportDetails',
      link: function ($scope, $el) {
        // using $scope inheritance, panels are available in AppState
        const $state = $scope.state;
        const printReport = $scope.printReport;
        $scope.$el = $el;

        // receives $scope.panel from the report grid directive, seems like should be isolate?
        $scope.$watch('id', function () {
          if (!$scope.panel.id || !$scope.panel.type) return;

          loadPanel($scope.panel, $scope)
            .then(function (panelConfig) {

              // These could be done in loadPanel, putting them here to make them more explicit
              $scope.savedObj = panelConfig.savedObj;
              if(_.has($scope.savedObj, 'visState')) {
                $scope.vis_type = $scope.savedObj.visState.type;
              }

              $scope.printingReport = printReport;
              // $scope.editUrl = panelConfig.editUrl;

              $scope.$on('$destroy', function () {
                panelConfig.savedObj.destroy();
                $scope.parentUiState.removeChild(getPanelId(panelConfig.panel));
              });

              // create child ui state from the savedObj
              const uiState = panelConfig.uiState || {};
              $scope.uiState = $scope.parentUiState.createChild(getPanelId(panelConfig.panel), uiState, true);

              $scope.filter = function (field, value, operator) {
                const index = $scope.savedObj.searchSource.get('index').id;
                filterManager.add(field, value, operator, index);
              };

            })
            .catch(function (e) {
              $scope.error = e.message;

              // If the savedObjectType matches the panel type, this means the object itself has been deleted,
              // so we shouldn't even have an edit link. If they don't match, it means something else is wrong
              // with the object (but the object still exists), so we link to the object editor instead.
              const objectItselfDeleted = e.savedObjectType === $scope.panel.type;
              if (objectItselfDeleted) return;

              const type = $scope.panel.type;
              const service = _.find(services, { type: type });
              if (!service) return;

              // const id = $scope.panel.id;
              // $scope.editUrl = '#settings/objects/' + service.name + '/' + id + '?notFound=' + e.savedObjectType;
            });
        });

        $scope.remove = function () {
          _.pull($state.panels, $scope.panel);
        };
      }
    };
  });
