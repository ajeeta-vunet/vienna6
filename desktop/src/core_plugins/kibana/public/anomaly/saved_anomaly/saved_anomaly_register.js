import { SavedObjectRegistryProvider } from 'ui/saved_objects/saved_object_registry';
import './saved_anomalies';

SavedObjectRegistryProvider.register((savedAnomalies) => {
  return savedAnomalies;
});
