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
import { createNewScheduledScan, editScheduleScan, deleteScheduledScan, createNewScan } from '../../api_calls';
import './ScheduledScan.less';
import chrome from 'ui/chrome';
import { SCHEDULE_NAME_HELP_OBJ,
  SEED_IP_HELP_OBJ,
  SCHEDULE_HELP_OBJ,
  CREDENTIAL_HELP_OBJ,
  SOURCE_IP_HELP_OBJ,
  SCHEDULE_INFO_HELP_OBJ,
  SCHEDULE_NOW_HELP_OBJ,
  SCHEDULE_FREQUENCY_CONSTANTS
} from './scheduledScan_constants';

export class ScheduledScan extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      listOfScheduledScans: {},
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
      }
      schedule.frequency = cronToString;
      //this is done to convert data fetched form backend to be matched with data
      //expected form vunet_dynamic_form_builder.js
      schedule.cronString = schedule.schedule_string;
      schedule.cred_list = schedule.cred_list && schedule.cred_list.split(',');
      schedule.scheduleFrequency = Object.keys(SCHEDULE_FREQUENCY_CONSTANTS)
        .find(key => SCHEDULE_FREQUENCY_CONSTANTS[key] === schedule.frequency);
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

    const scanNowData = {
      'tenant_id': tenantId,
      'bu_id': buId,
      'start_ip': '',
      'end_ip': '',
      'source_ip': typeof scanData.source_ip === 'string' ? scanData.source_ip.split(',') : scanData.source_ip,
      'excluded_ip': scanData.excluded_ip.length > 0 ? scanData.excluded_ip.split(',') : [],
      'seed_ip': scanData.seed_ip,
      'cred_list': scanData.cred_list ? scanData.cred_list : [],
      'schedule_name': '',
      'schedule_string': '',
      'user_details': '',
      'name': scanData.schedule_name
    };

    if (scanData.schedule_now) {
      createNewScan(chrome, scanNowData);
    }

    const scheduleScanData = {
      start_ip: '',
      end_ip: '',
      excluded_ip: scanData.excluded_ip.length > 0 ? scanData.excluded_ip.split(',') : [],
      seed_ip: scanData.seed_ip,
      cred_list: scanData.cred_list ? scanData.cred_list : [],
      schedule_name: scanData.schedule_name,
      schedule_string: scanData.cronString,
      user_details: '',
      source_ip: typeof scanData.source_ip === 'string' ? scanData.source_ip.split(',') : scanData.source_ip
    };

    if (event === 'add') {
      return createNewScheduledScan(scheduleScanData);
    }else if(event === 'edit') {
      return editScheduleScan(configId, scheduleScanData);
    }
  }

  onRowAction = (e, configId) => {
    //fetch details of a single scan using configId and use the details fetched to call the scan now API.

    const selectedScan = this.state.listOfScheduledScans &&
            this.state.listOfScheduledScans.find((scheduledScan) => {
              return scheduledScan.config_id === configId;
            });

    const url = chrome.getUrlBase();
    const tenantId = url.substring(url.indexOf('api/') + 4, url.indexOf('/bu/'));
    const buId = url.substring(url.indexOf('bu/') + 3, url.length);
    const scanNowDate = {
      'tenant_id': tenantId,
      'bu_id': buId,
      'start_ip': selectedScan.start_ip,
      'end_ip': selectedScan.end_ip,
      'source_ip': selectedScan.source_ip,
      'excluded_ip': selectedScan.excluded_ip,
      'seed_ip': selectedScan.seed_ip,
      'cred_list': selectedScan.cred_list,
      'schedule_name': '',
      'schedule_string': '',
      'user_details': '',
      'name': selectedScan.schedule_name
    };

    createNewScan(chrome, scanNowDate);
    return Promise.resolve(false);
  };

  render() {
    const scheduleScanMeta = {
      // headers: ['Config ID', 'Schedule Name', 'Schedule At', 'Seed IP', 'Start IP', 'End IP'],
      // rows: ['config_id', 'schedule_name', 'frequency', 'seed_ip', 'start_ip', 'end_ip'],
      headers: ['Config ID', 'Schedule Name', 'Frequency', 'Seed IP', 'Source IP'],
      rows: ['config_id', 'schedule_name', 'frequency', 'seed_ip', 'source_ip'],
      rowAction: [{ name: 'Scan Now', icon: 'fa-play', toolTip: 'Click here to run this Scan now.' }],
      id: 'config_id',
      add: true,
      edit: true,
      title: 'New Scheduled Scan',
      selection: true,
      search: true,
      forceUpdate: false,
      wrapTableCellContents: true,
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
        scheduleAt: true,
        scheduleFrequency: 'day',
      },
      table:
             [
               {
                 key: 'schedule_name',
                 label: 'Schedule Name *',
                 type: 'text',
                 helpObj: SCHEDULE_NAME_HELP_OBJ,
                 name: 'scheduleName',
                 props: {
                   required: true
                 }
               },
               {
                 key: 'seed_ip',
                 label: 'Seed IP *',
                 type: 'text',
                 helpObj: SEED_IP_HELP_OBJ,
                 name: 'seedIp',
                 props: {
                   required: true
                 }
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
               },
               {
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
               },
               {
                 key: 'schedule_now',
                 name: 'schedule_now',
                 label: 'Run Now',
                 helpObj: SCHEDULE_NOW_HELP_OBJ,
                 type: 'checkbox',
               },
               {
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
               },
               {
                 key: 'cronString',
                 //  label: 'Schedule *',
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