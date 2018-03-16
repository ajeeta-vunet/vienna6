const _ = require('lodash');
const $ = require('jquery');

const app = require('ui/modules').get('app/report');

app.directive('reportDetails', function ($compile) {
  return {
    restrict: 'E',
    require: '^reportApp', // must inherit from the reportApp
    link: function ($scope, $el) {

      function init() {

        let sectionId = 2;
        _.forEach($scope.sections, function (section) {
          // Create a section div with proper style
          const h3Header = '<h3 style=\'text-align: center;color:#01b5d5 !important;padding-top:12px;\'>';
          const h3HeaderEnd = '</h3> <p style=\'font-size:14px;white-space: pre-wrap;\'>';
          const pHeaderEnd = '</p> <div class=\'page-break\'></div>';
          const $sectiondiv = $(h3Header + sectionId + '. ' + section.id + h3HeaderEnd + section.description + pHeaderEnd);
          $sectiondiv.appendTo($el);
          let visId = 1;
          _.forEach(section.visuals, function (vis) {
            // Create a pagebreak div - We need to create a new one for
            // each visual..
            const $pagebreakdiv = $('<div class=\'page-break\'></div>');

            // Create a new scope and populate it
            vis.$scope = $scope.$new();
            vis.$scope.panel = vis;
            vis.$scope.panel_id = sectionId + '.' + visId;
            vis.$scope.parentUiState = $scope.uiState;

            const $visdiv = $compile('<report-panel style="height:600px">')(vis.$scope);
            $visdiv.appendTo($el);

            // Append the pagebreak div
            $pagebreakdiv.appendTo($el);
            visId = visId + 1;
          });
          sectionId = sectionId + 1;
        });
      }

      init();
    }
  };
});
