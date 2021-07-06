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
import { VunetDataTable } from 'ui_framework/src/vunet_components/vunet_table/vunet_table';
import './AlertRules.less';
import { apiProvider } from 'ui_framework/src/vunet_components/vunet_service_layer/api/utilities/provider.js';
import { VuBlockStoreConstants } from '../../vublock_store_constants';

export class AlertRules extends React.Component {
  constructor(props) {
    super(props);
  }

  // Function to delete selected rows of alert rules
  deleteSelectedAlertRules = (rows) => {
    const deletePromises = Promise.all(
      rows.map((row) => {
        apiProvider.remove(`${VuBlockStoreConstants.VUBLOCK_STORE_BASE_PATH}` +
          `/${this.props.vuBlockId}/${VuBlockStoreConstants.VUBLOCK_ALERT_RULES}/${row.alert_id}`);
      })
    );
    return deletePromises;
  }

  // Function to trigger when a user creates or edits alert rule
  onSubmitAlertRule = (event, alertRuleID, alertRuleData) => {
    if (event === 'add') {
      const formData = new FormData();
      formData.append('file', alertRuleData.alert_json, alertRuleData.alert_json.name);

      return apiProvider.post(`${VuBlockStoreConstants.VUBLOCK_STORE_BASE_PATH}/${this.props.vuBlockId}/`
        + `${VuBlockStoreConstants.VUBLOCK_ALERT_RULES}`, formData);
    }
  }

  render() {
    const editable =
      (this.props.editable && this.props.editable === 'true') ? true : false;

    const ALERT_RULE_OBJ = {
      headerText: `An '.json' file containing the alert rule data.`,
      referenceLink: '',
      contentIntroduction: 'Upload a JSON file containing the alert rule data.'
    };

    // Function to fetch alert rules
    const fetchAlertRules = async () => {
      return new Promise((resolve, reject) => {
        apiProvider.getAll(`${VuBlockStoreConstants.VUBLOCK_STORE_BASE_PATH}/` +
        `${this.props.vuBlockId}/${VuBlockStoreConstants.VUBLOCK_ALERT_RULES}`)
          .then((data) => {
            return resolve(data.alerts);
          })
          .catch((err) => {
            return reject(err);
          });
      });
    };

    // Meta Information for the VunetDataTable
    const alertRulesMeta = {
      title: 'Alert Rule',
      headers: ['Name'],
      rows: ['alert_name'],
      rowAction: [],
      id: 'alert_id',
      add: editable,
      edit: false,
      selection: editable,
      search: true,
      forceUpdate: true,
      clickOutsideToCloseModal: false,
      table: [
        {
          key: 'alert_json',
          id: true,
          label: 'Alert Rule JSON *',
          type: 'file',
          helpObj: ALERT_RULE_OBJ,
          name: 'alertRuleFile',
          props: {
            required: true
          },
        }
      ],
    };

    return (
      <div className="alert-rules-wrapper">
        <VunetDataTable
          fetchItems={fetchAlertRules}
          deleteSelectedItems={this.deleteSelectedAlertRules}
          metaItem={alertRulesMeta}
          onSubmit={this.onSubmitAlertRule.bind(this)}
        />
      </div>
    );
  }
}

AlertRules.propTypes = {};
