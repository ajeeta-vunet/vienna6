// ------------------------- NOTICE ------------------------------- //
//                                                                  //
//                   CONFIDENTIAL INFORMATION                       //
//                   ------------------------                       //
//     This Document contains Confidential Information or           //
//     Trade Secrets, or both, which are the property of VuNet      //
//     Systems Ltd.  This document may not be copied, reproduced,   //
//     reduced to any electronic medium or machine readable form    //
//     or otherwise duplicated and the information herein may not   //
//     be used, disseminated or otherwise disclosed, except with    //
//     the prior written consent of VuNet Systems Ltd.              //
//                                                                  //
// ------------------------- NOTICE ------------------------------- //

// Copyright 2020 VuNet Systems Ltd.
// All rights reserved.
// Use of copyright notice does not imply publication.

export const BackupConstants = {
  BACKUP_PATH: '/backup',
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

export const OBJECTS_TO_BE_BACKED_UP_HELP_OBJ = {
  headerText: 'Objects to be backed up',
  referenceLink: '',
  contentIntroduction: 'Select the types of information objects to be backed up. vuSmartMaps can be ' +
  'configured to back up the internal configurations and active data. By default, all configurations ' +
  'are archived. The configurations that can be archived is grouped into categories listed below.',
  contentList: [{
    title: 'vuSmartMaps Objects:',
    description: 'Analytics configurations for storyboards, visualizations, reports, alert rules etc.'
  },
  {
    title: 'Data Sources and Integrations:',
    description: 'Configuration information for all currently configured data sources in the system.'
  },
  {
    title: 'Service Configuration files:',
    description: 'Configuration settings for all vuSmartMaps internal components.'
  },
  {
    title: 'ETL Confiuration:',
    description: 'Data processing pipeline configurations.'
  },
  {
    title: 'Active Data:',
    description: 'Active Data currently residing in the system. Use this option with caution, ' +
    'as this might result in a large backup file getting created.'
  },
  {
    title: 'User Info',
    description: 'All user and bookkeeping information. Eg: mySQL database backup'
  }
]
};

export const BACKUP_LOCATION_HELP_OBJ = {
  headerText: 'Backup location',
  referenceLink: '',
  contentIntroduction: 'The location to which the backup file created should be uploaded. ' +
  'The location can be a local file folder and/or an external file server reachable through SSH. ' +
  'Multiple locations can be configured.'
};

export const CREDENTIAL_HELP_OBJ = {
  headerText: 'Credential for back up file encryption',
  referenceLink: '',
  contentIntroduction: 'The password from this Credential object is used to encrypt the backup ' +
  'file created.'
};

export const EMAIL_FOR_BACKUP_STATUS_HELP_OBJ = {
  headerText: 'Email for backup status',
  referenceLink: '',
  contentIntroduction: 'The status of backup activity along with details of errors, if any, are ' +
  'notified to the Email IDs listed here.'
};

export const SCHEDULE_HELP_OBJ = {
  headerText: 'Schedule',
  referenceLink: '',
  contentIntroduction: 'Frequency at which backup should be executed.'
};
