export const SCHEDULE_NAME_HELP_OBJ = {
  headerText: 'Name of scan being scheduled.',
  referenceLink: '',
  contentIntroduction: 'The name of the scan that is being scheduled.'
};

export const SEED_IP_HELP_OBJ = {
  headerText: 'The seed ip of network that needs to be scanned.',
  referenceLink: '',
  contentIntroduction: 'Seed IP indicates the range of IP addresses that should be scanned in the network.'
};

export const SCHEDULE_INFO_HELP_OBJ = {
  headerText: 'Schedule Information Section',
  referenceLink: '',
  contentIntroduction: 'User can either schedule a scan now or at a particular time.'
};

export const SCHEDULE_NOW_HELP_OBJ = {
  headerText: 'Run Scan Now',
  referenceLink: '',
  contentIntroduction: 'User can run a scan now by checking this checkbox.'
};

export const SCHEDULE_HELP_OBJ = {
  headerText: 'The time at which the scan has to be scheduled.',
  referenceLink: '',
  contentIntroduction: 'The time, date or year when the scan should be scheduled.',
  contentList: [{
    title: 'Day:',
    description: 'Schedule the scan daily at a specified time.'
  },
  {
    title: 'Week:',
    description: 'Schedule the scan weekly at specified day and time.'
  },
  {
    title: 'Month:',
    description: 'Schedule the scan monthly at specified date and time.'
  },
  {
    title: 'Year:',
    description: 'Schedule the scan yearly at specified date and time.'
  }
  ]
};

export const CREDENTIAL_HELP_OBJ = {
  headerText: 'The list of credentials that should be used while scanning the network.',
  referenceLink: '',
  contentIntroduction: 'List of credential specify the credentials that shoudl be used while scanning the network for devices.'
};

export const SOURCE_IP_HELP_OBJ = {
  headerText: 'The IP address from where Scan should be initiated.',
  referenceLink: '',
  contentIntroduction: 'Source IP indicates the IP address of the system from which Scan was started.'
};

// A dict to get more user intuitive values for
// schedule frequencies.
export const SCHEDULE_FREQUENCY_CONSTANTS = {
  minute: 'Minute',
  hour: 'Hourly',
  day: 'Daily',
  week: 'Weekly',
  month: 'Monthly',
  year: 'Yearly',
};