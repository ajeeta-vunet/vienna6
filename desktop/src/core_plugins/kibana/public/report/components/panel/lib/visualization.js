import { FilterBarClickHandlerProvider } from 'ui/filter_bar/filter_bar_click_handler';

export function visualizationLoader(savedVisualizations, Private) {
  const filterBarClickHandler = Private(FilterBarClickHandlerProvider);

  return function (panel, $scope) { // Function parameters here
    return savedVisualizations.get(panel.id)
      .then(function (savedVis) {
        // $scope.state comes via $scope inheritence from the report app. Don't love this.
        savedVis.vis.listeners.click = filterBarClickHandler($scope.state);

        return {
          savedObj: savedVis,
          panel: panel,
          uiState: savedVis.uiStateJSON ? JSON.parse(savedVis.uiStateJSON) : {},
          // editUrl: savedVisualizations.urlFor(panel.id)
        };
      });
  };
}
