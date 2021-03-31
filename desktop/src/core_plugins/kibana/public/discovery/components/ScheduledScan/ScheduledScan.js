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

// Copyright 2021 VuNet Systems Ltd.
// All rights reserved.
// Use of copyright notice does not imply publication.

import React from 'react';
import { VunetDataTable } from '../../../../../../../ui_framework/src/vunet_components/vunet_table/vunet_table';
import { createNewScheduledScan, editScheduleScan, deleteScheduledScan, createNewScan, reScan } from '../../api_calls';
import './ScheduledScan.less';
import chrome from 'ui/chrome';
import { SCHEDULE_NAME_HELP_OBJ,
  SEED_IP_HELP_OBJ,
  SCHEDULE_HELP_OBJ,
  CREDENTIAL_HELP_OBJ,
  SOURCE_IP_HELP_OBJ,
  SCHEDULE_INFO_HELP_OBJ,
  SCHEDULE_NOW_HELP_OBJ,
  SCHEDULE_FREQUENCY_CONSTANTS,
  IP_SOURCE_HELP_OBJ,
  HOP_COUNT_HELP_OBJ,
  SOURCE_IP_FILE_HELP_OBJ
} from './scheduledScan_constants';

export class ScheduledScan extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      listOfScheduledScans: [],
      multiSelectCredentialsArray: [],
      multiSelectSourceIpArray: [],
    };
  }

  componentDidMount() {
    this.prepareMulitSelectList();
  }

  //this is called to prepare data for multiselect options array.
  prepareMulitSelectList = () => {
    const credList = this.props.credList.credentials;
    let sourceIpList = this.props.sourceIpAddressList && this.props.sourceIpAddressList.source_ip_address;

    // eslint-disable-next-line prefer-const
    let multiSelectCredentialsArray = [];
    // eslint-disable-next-line prefer-const
    let multiSelectSourceIpArray = [];

    credList && credList.map((credential) => {
      multiSelectCredentialsArray.push({
        key: credential,
        label: credential,
        name: credential,
        value: credential,
      });
    });
    sourceIpList && sourceIpList.replace(/ /g, '');
    sourceIpList = sourceIpList && sourceIpList.split(',');
    sourceIpList && sourceIpList.map((sourceIp) => {
      multiSelectSourceIpArray.push({
        key: sourceIp,
        label: sourceIp,
        name: sourceIp,
        value: sourceIp,
      });
    });

    this.setState({
      multiSelectCredentialsArray: multiSelectCredentialsArray,
      multiSelectSourceIpArray: multiSelectSourceIpArray
    });
  }

  //this method is called to convert the cronString to user understandable format.
  convertCronToString = (schedules) => {
    schedules && schedules.map((schedule) => {
      const cronExpression = schedule.schedule_string;
      const cron = cronExpression.split(' ');
      const dayOfMonth = cron[2];
      const month = cron[3];
      const dayOfWeek = cron[4];

      let cronToString = '';

      if(dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
        cronToString = 'Daily';
      }else if(dayOfMonth !== '*' && month !== '*' && dayOfWeek === '*') {
        cronToString = 'Yearly';
      }else if(dayOfMonth === '*' && month === '*' && dayOfWeek !== '*') {
        cronToString = 'Weekly';
      }else if(dayOfMonth !== '*' && month === '*' && dayOfWeek === '*') {
        cronToString = 'Monthly';
      }else if(schedule.schedule_string === '') {
        cronToString = 'Not Scheduled';
      }
      schedule.frequency = cronToString;
      //this is done to convert data fetched form backend to be matched with data
      //expected form vunet_dynamic_form_builder.js
      if(schedule.schedule_string === '') {
        schedule.cronString = '* * * * *';
        schedule.schedule_string = '* * * * *';
        schedule.scheduleAt = false;
      }else {
        schedule.cronString = schedule.schedule_string;
        schedule.scheduleAt = true;
      }
      schedule.cred_list = schedule.cred_list && schedule.cred_list.split(',');
      schedule.scheduleFrequency = Object.keys(SCHEDULE_FREQUENCY_CONSTANTS)
        .find(key => SCHEDULE_FREQUENCY_CONSTANTS[key] === schedule.frequency);
      if(schedule.scheduleFrequency === undefined) schedule.scheduleFrequency = 'day';
    });
    return schedules;
  }

  // this function will be used to the fetch the values for ScanList
  fetchScheduledScanList = async () => {
    let urlBase = chrome.getUrlBase();
    urlBase = urlBase + '/asset/schedule/';

    const response = await fetch(urlBase, {
      method: 'GET'
    });

    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
    }

    const data = await response.json();
    this.setState({ listOfScheduledScans: data.schedules });
    return this.convertCronToString(data.schedules);
  }

  // This will be used to delete the selected entries from the table
  deleteSelectedItemsForScanList = (rows) => {

    // Wait till all Promises(deletePromises) are resolved
    // and return single Promise
    const deletePromises = Promise.all(
      rows.map((row) => {
        deleteScheduledScan(row.config_id);
      })
    );

    return deletePromises;
  }

  // This will be used on submit of Schedule Scan.
  onSubmit = (event, configId, scanData) => {

    const url = chrome.getUrlBase();
    const tenantId = url.substring(url.indexOf('api/') + 4, url.indexOf('/bu/'));
    const buId = url.substring(url.indexOf('bu/') + 3, url.length);

    const formData = new FormData();
    const scanNowFormData = new FormData();

    const scanNowData = {
      'tenant_id': tenantId,
      'bu_id': buId,
      'start_ip': '',
      'end_ip': '',
      'source_ip': typeof scanData.source_ip === 'string' ? scanData.source_ip.split(',') : scanData.source_ip,
      'excluded_ip': scanData.excluded_ip.length > 0 ? scanData.excluded_ip.split(',') : [],
      'cred_list': scanData.cred_list ? scanData.cred_list : [],
      'schedule_name': scanData.schedule_name,
      'schedule_string': '',
      'user_details': '',
      'name': scanData.schedule_name,
    };

    if(scanData.source_file) {
      scanNowData.hop_count = 1;
      scanNowFormData.append('file', scanData.source_file, scanData.source_file.name);
    }else {
      scanNowData.seed_ip = scanData.seed_ip;
      scanNowData.hop_count = scanData.hop_count;
    }

    scanNowFormData.append('json', JSON.stringify(scanNowData));
    if (scanData.schedule_now) {
      createNewScan(chrome, scanNowFormData);
    }

    const scheduleScanData = {
      tenant_id: tenantId,
      bu_id: buId,
      start_ip: '',
      end_ip: '',
      excluded_ip: scanData.excluded_ip.length > 0 ? scanData.excluded_ip.split(',') : [],
      cred_list: scanData.cred_list ? scanData.cred_list : [],
      schedule_name: scanData.schedule_name,
      schedule_string: scanData.cronString,
      user_details: '',
      source_ip: typeof scanData.source_ip === 'string' ? scanData.source_ip.split(',') : scanData.source_ip,
      name: scanData.schedule_name,
    };

    if(scanData.source_file) {
      scheduleScanData.hop_count = 1;
      formData.append('file', scanData.source_file, scanData.source_file.name);
    }else {
      scheduleScanData.seed_ip = scanData.seed_ip;
      scheduleScanData.hop_count = scanData.hop_count;
    }

    if(event === 'edit') delete scheduleScanData.seed_ip;

    formData.append('json', JSON.stringify(scheduleScanData));
    if (event === 'add' && scanData.scheduleAt) {
      return createNewScheduledScan(formData);
    }else if(event === 'edit') {
      return editScheduleScan(configId, formData);
    }else {
      return Promise.resolve(true);
    }
  }

  onRowAction = (e, configId) => {
    reScan(configId);
    return Promise.resolve(false);
  };

  validateValue = (key, value) => {
    return this.state.listOfScheduledScans && this.state.listOfScheduledScans.find(schedule => schedule[key] === value) ? true : false;
  };

  render() {

    const scheduleScanMeta = {
      // headers: ['Config ID', 'Schedule Name', 'Schedule At', 'Seed IP', 'Start IP', 'End IP'],
      // rows: ['config_id', 'schedule_name', 'frequency', 'seed_ip', 'start_ip', 'end_ip'],
      headers: ['Scan ID', 'Schedule Name', 'Frequency', 'Seed IP', 'Source IP'],
      rows: ['config_id', 'schedule_name', 'frequency', 'seed_ip', 'source_ip'],
      rowAction: [{ name: 'Scan Now', icon: 'fa-play', toolTip: 'Scan Now.' }],
      id: 'config_id',
      add: true,
      edit: true,
      isDescending: true,
      ascendingOrder: false,
      title: 'Scan',
      selection: true,
      search: true,
      forceUpdate: false,
      // wrapTableCellContents: true,
      default: {
        start_ip: '',
        end_ip: '',
        excluded_ip: [],
        seed_ip: '',
        cred_list: [],
        schedule_name: '',
        user_details: '',
        source_ip: [],
        cronString: '0 0 * * *',
        scheduleAt: false,
        enterSeedIP: false,
        enterSourceFile: false,
        scheduleFrequency: 'day',
        schedule_now: true,
        hop_count: 100,
        selectIPSource: 'seedIP'
      },
      table:
             [
               {
                 key: 'schedule_name',
                 id: true,
                 validationCallback: this.validateValue,
                 label: 'Schedule Name *',
                 type: 'text',
                 helpObj: SCHEDULE_NAME_HELP_OBJ,
                 name: 'scheduleName',
                 props: {
                   required: true,
                   maxLength: '32',
                   pattern: '^[a-zA-Z0-9_.-]+([a-zA-Z0-9_]+)*$'
                 },
                 errorText: `Name should be unique and can have alpha-numeric characters. _ , . and - 
                is also allowed but the name should not exceed 32 characters.`
               }, {
                 key: 'selectIPSource',
                 id: true,
                 label: 'Select IP Source *',
                 type: 'select',
                 helpObj: IP_SOURCE_HELP_OBJ,
                 name: 'select_ip_source',
                 options: [
                   {
                     key: 'seedIP',
                     label: 'Seed IP',
                     name: 'seedIP',
                     value: 'seedIP',
                   },
                   {
                     key: 'sourceIPFile',
                     label: 'Source IP File',
                     name: 'sourceIPFile',
                     value: 'sourceIPFile',
                   }
                 ],
                 props: {
                   required: true
                 },
                 rules: {
                   name: 'IP_rule',
                   options: [{
                     value: 'seedIP',
                     actions: [{
                       hide: ['source_file']
                     }]
                   },
                   {
                     value: 'sourceIPFile',
                     actions: [{
                       hide: ['seed_ip', 'hop_count']
                     }]
                   }]
                 }
               }, {
                 key: 'seed_ip',
                 id: true,
                 label: 'Seed IP *',
                 type: 'text',
                 helpObj: SEED_IP_HELP_OBJ,
                 name: 'seedIp',
                 props: {
                   required: true,
                   // eslint-disable-next-line max-len
                   pattern: '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))$'
                 },
                 errorText: `Please enter a Seed IP that matches this pattern: '256.256.256.128/24'.`
               }, {
                 key: 'source_file',
                 id: true,
                 label: 'IP File *',
                 type: 'file',
                 helpObj: SOURCE_IP_FILE_HELP_OBJ,
                 name: 'ipFile',
                 props: {
                   required: true,
                 },
               }, {
                 key: 'hop_count',
                 label: 'Hop Count *',
                 type: 'text',
                 helpObj: HOP_COUNT_HELP_OBJ,
                 name: 'hopCount',
                 props: {
                   required: true,
                   pattern: `^([1-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])$`
                 },
                 errorText: `Please enter a number that is >0 or <=255`
               }, {
                 key: 'source_ip',
                 label: 'Source IP *',
                 type: 'multiSelect',
                 helpObj: SOURCE_IP_HELP_OBJ,
                 name: 'source_ip',
                 options: this.state.multiSelectSourceIpArray,
                 props: {
                   required: true
                 }
               }, {
                 key: 'cred_list',
                 label: 'Credentials *',
                 type: 'multiSelect',
                 helpObj: CREDENTIAL_HELP_OBJ,
                 name: 'cred_list',
                 options: this.state.multiSelectCredentialsArray,
                 props: {
                   required: true
                 }
               }, {
                 key: 'schedule_info',
                 label: 'Schedule Information :',
                 name: 'schedule_info',
                 helpObj: SCHEDULE_INFO_HELP_OBJ,
                 type: 'header'
               }, {
                 key: 'schedule_now',
                 id: true,
                 name: 'schedule_now',
                 label: 'Run Now',
                 helpObj: SCHEDULE_NOW_HELP_OBJ,
                 type: 'checkbox',
               }, {
                 key: 'scheduleAt',
                 name: 'scheduleAt',
                 label: 'Schedule it at',
                 helpObj: SCHEDULE_HELP_OBJ,
                 type: 'checkbox',
                 errorText: `Please select an appropriate schedule frequency`,
                 props: {
                 },
                 rules: {
                   name: 'disableCronString',
                   options: [
                     {
                       value: false,
                       actions: [{
                         hide: ['cronString']
                       }]
                     }
                   ]
                 }
               }, {
                 key: 'cronString',
                 type: 'crontab',
                 name: 'schedule',
                 props: {
                   required: true
                 }
               },
               //  {
               //    key: 'start_ip',
               //    label: 'Start IP',
               //    type: 'text',
               //    name: 'start_ip',
               //    props: {
               //      required: false,
               //      // eslint-disable-next-line max-len
               //      pattern: '^(([1-9]?\\d|1\\d\\d|25[0-5]|2[0-4]\\d)\\.){3}([1-9]?\\d|1\\d\\d|25[0-5]|2[0-4]\\d)$'
               //    },
               //    errorText: 'Invalid IP-address.'
               //  },
               //  {
               //    key: 'end_ip',
               //    label: 'End IP',
               //    type: 'text',
               //    name: 'end_ip',
               //    props: {
               //      required: false,
               //      pattern: '^(([1-9]?\\d|1\\d\\d|25[0-5]|2[0-4]\\d)\\.){3}([1-9]?\\d|1\\d\\d|25[0-5]|2[0-4]\\d)$'
               //    },
               //    errorText: 'Invalid IP-address.'
               //  },
               //  {
               //    key: 'excluded_ip',
               //    label: 'Excluded IP',
               //    type: 'text',
               //    name: 'excluded_ip',
               //    props: {
               //      required: false,
               //      // eslint-disable-next-line max-len
               //      pattern: '^((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)|\\*)(,((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)|\\*))*$'
               //    },
               //    errorText: 'Invalid IP-address.'
               //  },
             ]
    };
    return(
      <div className="scheduled-scan-table">
        {
          <VunetDataTable
            fetchItems={this.fetchScheduledScanList}
            deleteSelectedItems={this.deleteSelectedItemsForScanList}
            metaItem={scheduleScanMeta}
            onSubmit={this.onSubmit}
            rowAction={this.onRowAction}
          />
        }
      </div>
    );
  }
}