const _ = require('lodash');

const app = require('ui/modules').get('app/report');

app.directive('reportDetails', function ($compile, savedVisualizations, Promise) {
  return {
    restrict: 'E',
    require: '^reportApp', // must inherit from the reportApp
    link: function ($scope, $el) {

      function addPageBreak($el) {
        const pageBreakScope = $scope.$new();
        const $pagebreakdiv = $compile('<div class=\'page-break\'></div>')(pageBreakScope);
        $pagebreakdiv.appendTo($el);
      }

      function init() {
        let sectionId = 1;
        const pageHeight = 540;
        const metricHeight = 170;
        const chartHeight = 270;
        const numberOfMetricInRow = 4;


        // This approach is used so as to catch the error thrown
        // when a BM visualisation does not exist but is added in
        // report.
        // We get all the BM visualisation objects and then
        // prepare layouts for all the charts and metrics.
        Promise.map($scope.sections, function (section) {
          return Promise.map(section.visuals, function (vis) {
            return savedVisualizations.get(vis.id)
              .then(function (result) {
                return result;
              })
              .catch(function () {
                // If BM vis object does not exist
                // return empty object.
                return {};
              });
          });
        }).then(function (results) {
          // Wait till metricVisList is ready and then set the
          // width and height for the visualization layouts
          _.forEach($scope.sections, function (section) {
            let visId = 1;
            let metricVisCount = 0;

            // We are doing the page break based on the height of the
            // visualization we have added in a page. For this, we take
            // 170px as height of metric (Normal metric, health metric and
            // business metric) and 270px as height for all sort of charts
            // (line, pie, bar, area etc..), everything else starts from
            // a new page
            let height = 0;

            // Add page break for each section
            if (sectionId > 1) {
              addPageBreak($el);
            }

            let $rowdiv;
            _.forEach(section.visuals, function (vis, index) {

              // Create a new scope and populate it
              vis.$scope = $scope.$new();
              vis.$scope.panel = vis;
              vis.$scope.panel_id = sectionId + '.' + visId;
              vis.$scope.parentUiState = $scope.uiState;
              let multiplier = 0;

              let metricVisLength = 0;
              let aggregationLength = 0;

              let visObj = undefined;
              if (vis.visType === 'business_metric' || vis.visType === 'metric') {
                // Get the savedObj of BM vis in the current iteration.
                visObj = results[sectionId - 1].find(function (obj) {
                  return obj.id === vis.id;
                });

                // If vis does not exist, we jump to the next iteration.
                if (visObj === undefined) {
                  return;
                }
              }

              if (vis.visType === 'business_metric') {
                // Count the number of metrics to display.
                visObj.visState.params.metrics.map((metric) => {
                  if (!metric.hideMetric) {
                    metricVisLength += 1;
                  }
                });

                if (visObj.visState.params.aggregations) {
                  aggregationLength = visObj.visState.params.aggregations.length;
                }
              } else if (vis.visType === 'metric' && visObj) {
                // We use aggrgeaton length to figure out if we should put
                // metric in // single page or part of the page
                visObj.visState.aggs.map(function (agg) {
                  if (agg.schema === 'metric') {
                    metricVisLength += 1;
                  } else if (agg.schema === 'group') {
                    aggregationLength += 1;
                  }
                });

              }

              if ((vis.visType === 'metric' && aggregationLength === 0) ||
                vis.visType === 'health_metric' ||
                (vis.visType === 'business_metric' &&
                  metricVisLength === 1 &&
                  aggregationLength === 0)) {

                // If we need to add a new row, we should check for space
                // availability
                if (metricVisCount % numberOfMetricInRow === 0) {
                  multiplier = 1;
                } else {
                  multiplier = 0;
                }

                // Check if we have space, if we don't we will add a page-break..
                if (height + (multiplier * metricHeight) > pageHeight) {
                  addPageBreak($el);
                  height = 0;
                  metricVisCount = 0;
                }

                // This is the 1st one, so add a row... we add only one row
                // in a page
                if (metricVisCount === 0) {
                  // First append a row
                  const newScope = $scope.$new();
                  $rowdiv = $compile('<div class=\'row\'></div>')(newScope);
                  $rowdiv.appendTo($el);
                }

                metricVisCount += 1;

                // Here we are doing this because of the new VU-Metric scenarios
                if (vis.visType === 'business_metric' && metricVisLength === 1 && aggregationLength === 0) {
                  // We are overriding the previous height as the new heights are changed
                  vis.$scope.width = '350px';
                  vis.$scope.height = '150px';
                  const $visdiv = $compile('<report-panel class=\'col-md-4\'>')(vis.$scope);
                  $visdiv.appendTo($rowdiv);
                }
                else {
                  const $visdiv = $compile('<report-panel class=\'col-md-3\'>')(vis.$scope);
                  $visdiv.appendTo($rowdiv);

                  vis.$scope.width = '250px';
                  vis.$scope.height = '170px';
                }
                // If we are adding a new row... increase the height..
                if (multiplier) {
                  height += metricHeight;
                }
              } else if (vis.visType === 'line' ||
                vis.visType === 'pie' ||
                vis.visType === 'area' ||
                vis.visType === 'bar' ||
                vis.visType === 'horizontal_bar' ||
                vis.visType === 'histogram' ||
                vis.visType === 'heatmap' ||
                (vis.visType === 'business_metric' &&
                  metricVisLength > 1 &&
                  visObj.visState.params.metrics.length <= 2 &&
                  aggregationLength === 0 && visObj.visState.params.enableTableFormat === false)) {
                //  visObj.visState.params.metrics.length <=4  has been added as we will show bmv in half page
                // when less than 5 metric are there in multi-metric case
                // We should reset metric vis count as it must start from scratch again
                metricVisCount = 0;

                // If we don't have space, add a page break..
                if (height + chartHeight > pageHeight) {
                  addPageBreak($el);
                  height = 0;
                }

                vis.$scope.height = '270px';

                if (vis.visType === 'pie') {
                  vis.$scope.width = '950px';
                }
                else if (vis.visType === 'business_metric') {
                  vis.$scope.width = '100%';
                  vis.$scope.height = '350px';
                }
                else {
                  vis.$scope.width = '1150px';
                }



                const $visdiv = $compile('<report-panel>')(vis.$scope);
                $visdiv.appendTo($el);
                height += chartHeight;
              } else {
                // We should reset metric vis count as it must start from scratch again
                metricVisCount = 0;

                // We always start any other chart (UVMap, HBMap, Table,
                // Matrix, Search etc.) in a new page if it is
                // not first one in the report.
                if (index !== 0) {
                  addPageBreak($el);
                }
                height = 0;
                metricVisCount = 0;

                // We can start it from the earlier ending page
                if (vis.visType === 'table' || vis.visType === 'business_metric'
                  || vis.visType === 'customer_journey_map'
                  || vis.visType === 'status_indicator_and_kpi') {
                  // Set width to 100% for table visulaization.
                  vis.$scope.height = '100%';
                } else {
                  // For other visualizations, set the height to 540px, which is
                  // the height of a page.
                  vis.$scope.height = pageHeight + 'px';
                }
                vis.$scope.width = '1150px';
                const $visdiv = $compile('<report-panel>')(vis.$scope);
                $visdiv.appendTo($el);

                // Always add page break once the thing is done..
                addPageBreak($el);
              }

              visId = visId + 1;
            });
            sectionId = sectionId + 1;
          });
        });
      }
      init();
    }
  };
});
