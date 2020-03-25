import { SavedObjectRegistryProvider } from 'ui/saved_objects/saved_object_registry';
import './saved_storyboards';

SavedObjectRegistryProvider.register((savedStoryboards) => {
  return savedStoryboards;
});
