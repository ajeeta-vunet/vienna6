export const AnomalyConstants = {
  LANDING_PAGE_PATH: '/anomalys',
  CREATE_PATH: '/anomaly',
};

export function createAnomalyEditUrl(id) {
  return `/anomaly/${id}`;
}
