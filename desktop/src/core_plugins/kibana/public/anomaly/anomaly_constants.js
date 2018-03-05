export const AnomalyConstants = {
  LANDING_PAGE_PATH: '/anomalies',
  CREATE_PATH: '/anomaly',
};

export function createAnomalyEditUrl(id) {
  return `/anomaly/${id}`;
}
