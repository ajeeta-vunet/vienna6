export const AlertConstants = {
  LANDING_PAGE_PATH: '/alerts',
  CREATE_PATH: '/alert',
};

export function createAlertEditUrl(id) {
  return `/alert/${id}`;
}
