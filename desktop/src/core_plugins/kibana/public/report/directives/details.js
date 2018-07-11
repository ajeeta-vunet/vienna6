const _ = require('lodash');

const app = require('ui/modules').get('app/report');

app.directive('reportDetails', function ($compile) {
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

          _.forEach(section.visuals, function (vis) {

            // Create a new scope and populate it
            vis.$scope = $scope.$new();
            vis.$scope.panel = vis;
            vis.$scope.panel_id = sectionId + '.' + visId;
            vis.$scope.parentUiState = $scope.uiState;
            let multiplier = 0;

            if (vis.visType === 'business_metric' || vis.visType === 'metric' || vis.visType === 'health_metric') {

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

              const $visdiv = $compile('<report-panel class=\'col-md-3\'>')(vis.$scope);
              $visdiv.appendTo($rowdiv);

              vis.$scope.width = '250px';
              vis.$scope.height = '170px';
              metricVisCount += 1;

              // If we are adding a new row... increase the height..
              if (multiplier) {
                height += metricHeight;
              }
            } else if (vis.visType === 'line' || vis.visType === 'pie' ||
              vis.visType === 'area' || vis.visType === 'bar' ||
              vis.visType === 'horizontal_bar' || vis.visType === 'histogram' ||
              vis.visType === 'gauge' || vis.visType === 'heatmap') {
              // We should reset metric vis count as it must start from scratch again
              metricVisCount = 0;

              // If we don't have space, add a page break..
              if (height + chartHeight > pageHeight) {
                addPageBreak($el);
                height = 0;
              }

              if (vis.visType === 'pie') {
                vis.$scope.width = '650px';
              } else {
                vis.$scope.width = '1150px';
              }

              vis.$scope.height = '270px';

              const $visdiv = $compile('<report-panel>')(vis.$scope);
              $visdiv.appendTo($el);
              height += chartHeight;
            } else {
              // We should reset metric vis count as it must start from scratch again
              metricVisCount = 0;

              // We always start any other chart (UVMap, HBMap, Table,
              // Matrix, Search etc.) in a new page
              addPageBreak($el);
              height = 0;
              metricVisCount = 0;

              // We can start it from the earlier ending page
              if(vis.visType === 'table') {
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
      }
      init();
    }
  };
});
