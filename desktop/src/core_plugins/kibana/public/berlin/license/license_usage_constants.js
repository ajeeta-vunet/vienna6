//This holds the license validity section related legend data
export const LICENSE_VALIDITY_LEGEND = [
  { severity: 'severity-normal', text: '> 90 days' },
  { severity: 'severity-impending', text: '61-90 days' },
  { severity: 'severity-error', text: '31-60 days' },
  { severity: 'severity-critical', text: '<= 30 days' },
];

//This holds the license usage section related legend data
export const LICENSE_USAGE_LEGEND = [
  { severity: 'severity-normal', text: '> 0-90% Normal' },
  { severity: 'severity-impending', text: '91-100% Impending' },
  { severity: 'severity-error', text: '101-109% Crossed' },
  { severity: 'severity-critical', text: '>= 110% Breached' },
];
