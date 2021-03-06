import _ from 'lodash';
import html from 'ui/doc_table/doc_table.html';
import { getSort } from 'ui/doc_table/lib/get_sort';
import 'ui/doc_table/doc_table.less';
import 'ui/directives/truncated';
import 'ui/directives/infinite_scroll';
import 'ui/doc_table/components/table_header';
import 'ui/doc_table/components/table_row';
import { uiModules } from 'ui/modules';
import { searchExportAsCsv } from 'ui/utils/search_export_csv';

import { getLimitedSearchResultsMessage } from './doc_table_strings';

uiModules.get('kibana')
  .directive('docTable', function (config, Notifier, getAppState, pagerFactory, $filter, courier) {
    return {
      restrict: 'E',
      template: html,
      scope: {
        sorting: '=',
        columns: '=',
        customColumns: '=',
        hits: '=?', // You really want either hits & indexPattern, OR searchSource
        indexPattern: '=?',
        searchSource: '=?',
        searchTitle: '=?',
        printReport: '=?',
        infiniteScroll: '=?',
        filter: '=?',
        filters: '=?',
        minimumVisibleRows: '=?',
        onAddColumn: '=?',
        onChangeSortOrder: '=?',
        onMoveColumn: '=?',
        onRemoveColumn: '=?',
        sampleSize: '=',
      },
      link: function ($scope, $el) {
        const notify = new Notifier();

        $scope.$watch('minimumVisibleRows', (minimumVisibleRows) => {
          $scope.limit = Math.max(minimumVisibleRows || 50, $scope.limit || 50);
        });

        $scope.persist = {
          sorting: $scope.sorting,
          columns: $scope.columns
        };

        const limitTo = $filter('limitTo');
        const calculateItemsOnPage = () => {
          $scope.pager.setTotalItems($scope.hits.length);
          $scope.pageOfItems = limitTo($scope.hits, $scope.pager.pageSize, $scope.pager.startIndex);
        };

        $scope.limitedResultsWarning = getLimitedSearchResultsMessage($scope.sampleSize);

        $scope.addRows = function () {
          $scope.limit += 50;
        };

        // This exists to fix the problem of an empty initial column list not playing nice with watchCollection.
        $scope.$watch('columns', function (columns) {
          if (columns.length !== 0) return;

          const $state = getAppState();
          $scope.columns.push('_source');
          if ($state) $state.replace();
        });

        $scope.$watchCollection('columns', function (columns, oldColumns) {
          if (oldColumns.length === 1 && oldColumns[0] === '_source' && $scope.columns.length > 1) {
            _.pull($scope.columns, '_source');
          }

          if ($scope.columns.length === 0) {
            const timeFieldName = $scope.indexPattern.timeFieldName;
            if ($scope.indexPattern && timeFieldName) {
              $scope.columns.push(timeFieldName);
            }
            $scope.columns.push('_source');
          }
        });


        $scope.$watch('searchSource', function () {
          if (!$scope.searchSource) return;

          $scope.indexPattern = $scope.searchSource.get('index');

          $scope.searchSource.size($scope.sampleSize);
          $scope.searchSource.sort(getSort($scope.sorting, $scope.indexPattern));

          // Set the watcher after initialization
          $scope.$watchCollection('sorting', function (newSort, oldSort) {
            // Don't react if sort values didn't really change
            if (newSort === oldSort) return;
            $scope.searchSource.sort(getSort(newSort, $scope.indexPattern));
            $scope.searchSource.fetchQueued();
          });

          $scope.$on('$destroy', function () {
            if ($scope.searchSource) $scope.searchSource.destroy();
          });

          function onResults(resp) {
            // Reset infinite scroll limit
            $scope.limit = 50;

            // Abort if something changed
            if ($scope.searchSource !== $scope.searchSource) return;

            $scope.hits = resp.hits.hits;
            if ($scope.hits.length === 0) {
              $el.trigger('renderComplete');
            }

            // We limit the number of returned results, but we want to show the actual number of hits, not
            // just how many we retrieved.
            $scope.totalHitCount = resp.hits.total;
            let numPageHits = 50;

            // If we are printing report, lets make sure we print everything
            // in 1 page..
            if($scope.printReport) {
              numPageHits = $scope.totalHitCount;
              $scope.limit = numPageHits;
            }

            $scope.pager = pagerFactory.create($scope.hits.length, numPageHits, 1);
            calculateItemsOnPage();

            return $scope.searchSource.onResults().then(onResults);
          }

          function startSearching() {
            $scope.searchSource.onResults()
              .then(onResults)
              .catch(error => {
                notify.error(error);
                startSearching();
              });
          }
          startSearching();
          courier.fetch();
        });

        $scope.exportAsCsv = function () {
          const filename = $scope.searchTitle + '.csv';
          searchExportAsCsv(filename, config, $scope.hits, $scope.columns, $scope.indexPattern);
        };

        $scope.pageOfItems = [];
        $scope.onPageNext = () => {
          $scope.pager.nextPage();
          calculateItemsOnPage();
        };

        $scope.onPagePrevious = () => {
          $scope.pager.previousPage();
          calculateItemsOnPage();
        };

        $scope.shouldShowLimitedResultsWarning = () => (
          !$scope.pager.hasNextPage && $scope.pager.totalItems < $scope.totalHitCount
        );
      }
    };
  });
