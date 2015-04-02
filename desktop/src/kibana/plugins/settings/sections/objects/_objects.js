define(function (require) {
  var _ = require('lodash');
  var angular = require('angular');
  var saveAs = require('file_saver');
  var registry = require('plugins/settings/saved_object_registry');
  var objectIndexHTML = require('text!plugins/settings/sections/objects/_objects.html');

  require('routes')
  .when('/settings/objects', {
    template: objectIndexHTML
  });

  require('modules').get('apps/settings')
  .directive('kbnSettingsObjects', function (config, Notifier, Private, kbnUrl) {
    return {
      restrict: 'E',
      controller: function ($scope, $injector, $q, AppState) {

        var $state = $scope.state = new AppState();
        $scope.currentTab = null;
        $scope.selectedItems = [];

        var getData = function (filter) {
          var services = registry.all().map(function (obj) {
            var service = $injector.get(obj.service);
            return service.find(filter).then(function (data) {
              return { service: service, serviceName: obj.service, title: obj.title, data: data.hits };
            });
          });

          $q.all(services).then(function (data) {
            $scope.services = _.sortBy(data, 'title');
            $scope.changeTab($state.tab ? {title: $state.tab} : $scope.services[0]);
          });
        };

        $scope.toggleAll = function () {
          if ($scope.selectedItems.length === $scope.currentTab.data.length) {
            $scope.selectedItems.length = 0;
          } else {
            $scope.selectedItems = [].concat($scope.currentTab.data);
          }
        };

        $scope.toggleItem = function (item) {
          var i = $scope.selectedItems.indexOf(item);
          if (i >= 0) {
            $scope.selectedItems.splice(i, 1);
          } else {
            $scope.selectedItems.push(item);
          }
        };

        $scope.open = function (item) {
          kbnUrl.change(item.url.substr(1));
        };

        $scope.edit = function (service, item) {
          var params = {
            service: service.serviceName,
            id: item.id
          };

          kbnUrl.change('/settings/objects/{{ service }}/{{ id }}', params);
        };

        $scope.bulkDelete = function () {
          $scope.currentTab.service.delete(_.pluck($scope.selectedItems, 'id')).then(function (resp) {
            $scope.currentTab.data = _.difference($scope.currentTab.data, $scope.selectedItems);
            $scope.selectedItems.length = 0;
          });
        };

        $scope.bulkExport = function () {
          var promises = $scope.selectedItems.map(getExportedItems($scope.currentTab.service));
          $q.all(promises).then(saveToFile);
        };

        $scope.exportAll = function () {
          var promises = $scope.services.reduce(function (promises, service) {
            return promises.concat(service.data.map(getExportedItems(service.service)));
          }, []);

          $q.all(promises).then(saveToFile);
        };

        function getExportedItems(service) {
          return function (item) {
            return service.get(item.id).then(function (obj) {
              return obj.export();
            });
          };
        }

        function saveToFile(results) {
          var blob = new Blob([angular.toJson(results, true)], {type: 'application/json'});
          saveAs(blob, 'export.json');
        }

        $scope.importAll = function () {};

        $scope.changeTab = function (obj) {
          $scope.currentTab = _.find($scope.services, {title: obj.title});
          $scope.selectedItems.length = 0;
          $state.tab = obj.title;
          $state.save();
        };

        $scope.$watch('advancedFilter', function (filter) {
          getData(filter);
        });
      }
    };
  });
});
