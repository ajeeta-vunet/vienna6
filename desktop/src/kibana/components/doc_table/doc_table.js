define(function (require) {
  var _ = require('lodash');

  var html = require('text!components/doc_table/doc_table.html');
  var getSort = require('components/doc_table/lib/get_sort');
  require('css!components/doc_table/doc_table.css');
  require('directives/truncated');
  require('components/doc_table/components/table_header');
  require('components/doc_table/components/table_row');

  require('modules').get('kibana')
  .directive('docTable', function (config, Private, Notifier) {
    var formats = Private(require('components/index_patterns/_field_formats'));

    return {
      restrict: 'E',
      template: html,
      scope: {
        savedSearch: '=',
        filter: '=?',
      },
      link: function ($scope) {
        var notify = new Notifier();
        $scope.columns = [];
        $scope.persist = $scope.persist || {};


        var prereq = (function () {
          var fns = [];

          return function register(fn) {
            fns.push(fn);

            return function () {
              fn.apply(this, arguments);

              if (fns.length) {
                _.pull(fns, fn);
                if (!fns.length) {
                  $scope.$root.$broadcast('ready:vis');
                }
              }
            };
          };
        }());

        $scope.addRows = function (foo) {
          $scope.limit += 50;
        };

        $scope.$on('$destroy', function () {
          if ($scope.searchSource) $scope.searchSource.destroy();
        });

        $scope.$watch('savedSearch', prereq(function (savedSearch) {
          if (!(savedSearch && savedSearch.searchSource)) return;

          $scope.persist.sorting = savedSearch.sort;
          $scope.persist.columns = savedSearch.columns;
          $scope.searchSource = savedSearch.searchSource;
          $scope.indexPattern = savedSearch.searchSource.get('index');

          $scope.searchSource.size(config.get('discover:sampleSize'));
          $scope.searchSource.sort(getSort(savedSearch.sort, $scope.indexPattern));

          // Set the watcher after initialization
          $scope.$watch('persist.sorting', function (sorting) {
            if (!$scope.indexPattern || !$scope.searchSource || !sorting) return;
            $scope.searchSource.sort(getSort(sorting, $scope.indexPattern));
            $scope.searchSource.fetch();
          });

          // TODO: we need to have some way to clean up result requests
          $scope.searchSource.onResults().then(function onResults(resp) {
            // Reset infinite scroll limit
            $scope.limit = 50;

            // Abort if something changed
            if ($scope.searchSource !== savedSearch.searchSource) return;

            $scope.hits = resp.hits.hits;

            return $scope.searchSource.onResults().then(onResults);
          }).catch(notify.fatal);

          $scope.searchSource.onError(notify.error).catch(notify.fatal);
        }));

      }
    };
  });
});