export const SCHEDULE_NAME_HELP_OBJ = {
  headerText: 'Name of scan being scheduled.',
  referenceLink: '',
  contentIntroduction: 'The name of the scan that is being scheduled.'
};

export const SEED_IP_HELP_OBJ = {
  headerText: 'The seed IP of network that needs to be scanned.',
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
  headerText: 'The IP address from where the packets for scan should be sent.',
  referenceLink: '',
  contentIntroduction: 'Source IP indicated the device from which the packets for Network Discovery are sent.'
};

export const IP_SOURCE_HELP_OBJ = {
  headerText: 'Select the type of IP source input. The options are Seed IP or through a xls file.',
  referenceLink: '',
  contentIntroduction: 'User can either enter the seed IP of the network to be scanned or upload a xls' +
  ' file containing IP addresses that need to be scanned.'
}

export const HOP_COUNT_HELP_OBJ = {
  headerText: 'The number of hops to be taken during the Network Scan.',
  referenceLink: '',
  contentIntroduction: 'Hop count refers to the number of devices that a piece of data travels through.'
};

export const SOURCE_IP_FILE_HELP_OBJ = {
  headerText: `An '.xls' file containing the list of IP addressess that needs to be scanned.`,
  referenceLink: '',
  contentIntroduction: 'Upload a xls file containing list of Source IP address that needs to scanned during network discovery.'
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