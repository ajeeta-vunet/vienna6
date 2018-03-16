export const ReportConstants = {
  LANDING_PAGE_PATH: '/reports',
  CREATE_PATH: '/report',
};

export function createReportEditUrl(id) {
  return `/report/${id}`;
}

export function createReportPrintUrl(id) {
  return `/report/print/${id}`;
}
