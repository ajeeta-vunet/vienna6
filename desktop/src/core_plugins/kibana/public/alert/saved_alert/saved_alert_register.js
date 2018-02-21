import { SavedObjectRegistryProvider } from 'ui/saved_objects/saved_object_registry';
import './saved_alerts';

SavedObjectRegistryProvider.register((savedAlerts) => {
  return savedAlerts;
});
