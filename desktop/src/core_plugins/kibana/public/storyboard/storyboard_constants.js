export const StoryBoardConstants = {
  LANDING_PAGE_PATH: '/storyboards',
  CREATE_NEW_STORYBOARD_URL: '/storyboard',
};

export function createStoryboardEditUrl(id) {
  return `/storyboard/${id}`;
}