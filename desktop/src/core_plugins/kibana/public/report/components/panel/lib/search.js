export function searchLoader(savedSearches) { // Inject services here
  return function (panel, $scope) { // Function parameters here
    return savedSearches.get(panel.id)
      .then(function (savedSearch) {
        panel.columns = panel.columns || savedSearch.columns;
        panel.sampleSize = panel.sampleSize || savedSearch.sampleSize;
        panel.customColumns = panel.customColumns || (typeof savedSearch.customColumns === 'string') ?
          JSON.parse(savedSearch.customColumns) :
          savedSearch.customColumns;
        panel.sort = panel.sort || savedSearch.sort;

        $scope.$watchCollection('panel.columns', function () {
          $scope.state.save();
        });

        $scope.$watchCollection('panel.sort', function () {
          $scope.state.save();
        });

        return {
          savedObj: savedSearch,
          panel: panel,
          uiState: savedSearch.uiStateJSON ? JSON.parse(savedSearch.uiStateJSON) : {},
          // editUrl: savedSearches.urlFor(panel.id)
        };
      });
  };
}
