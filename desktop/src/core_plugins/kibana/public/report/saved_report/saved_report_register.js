import { SavedObjectRegistryProvider } from 'ui/saved_objects/saved_object_registry';
import './saved_reports';

SavedObjectRegistryProvider.register((savedReports) => {
  return savedReports;
});
