import { visualizationLoader } from 'plugins/kibana/report/components/panel/lib/visualization';
import { searchLoader } from 'plugins/kibana/report/components/panel/lib/search';
export function loadPanelFunction(Private) { // Inject services here
  return function (panel, $scope) { // Function parameters here
    const visualLoader = Private(visualizationLoader);
    const sLoader = Private(searchLoader);
    const panelTypes = {
      visualization: visualLoader,
      search: sLoader
    };

    try {
      return panelTypes[panel.type](panel, $scope);
    } catch (e) {
      throw new Error('Loader not found for unknown panel type: ' + panel.type);
    }

  };
}
