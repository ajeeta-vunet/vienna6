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
import './GoldenSignals.less';
import { apiProvider } from 'ui_framework/src/vunet_components/vunet_service_layer/api/utilities/provider.js';
import { VuBlockStoreConstants } from '../../vublock_store_constants';

export class GoldenSignals extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
    };
  }

  // Function to delete selected rows of golden signals
  deleteSelectedGoldenSignals = (rows) => {
    const deletePromises = Promise.all(
      rows.map((row) => {
        apiProvider.remove(`${VuBlockStoreConstants.VUBLOCK_STORE_BASE_PATH}` +
          `/${this.props.vuBlockId}/${VuBlockStoreConstants.VUBLOCK_GOLDEN_SIGNALS}/${row.goldensignal_id}`);
      })
    );
    return deletePromises;
  }

  // Function to trigger when a user creates or edits golden signal through form modal
  onSubmitGoldenSignal = (event, goldenSignalID, goldenSignalData) => {
    const goldenSignal = {
      goldensignal_id: goldenSignalData.goldensignal_id,
      name: goldenSignalData.name,
      description: goldenSignalData.description,
      type: goldenSignalData.type ? goldenSignalData.type : 'Integer',
      index: goldenSignalData.index,
      source: goldenSignalData.source,
      unit: goldenSignalData.unit,
    };
    if (event === 'add') {
      return apiProvider.post(`${VuBlockStoreConstants.VUBLOCK_STORE_BASE_PATH}` +
        `/${this.props.vuBlockId}/${VuBlockStoreConstants.VUBLOCK_GOLDEN_SIGNALS}`, goldenSignal);
    } else if(event === 'edit') {
      return apiProvider.put(`${VuBlockStoreConstants.VUBLOCK_STORE_BASE_PATH}` +
        `/${this.props.vuBlockId}/${VuBlockStoreConstants.VUBLOCK_GOLDEN_SIGNALS}/${goldenSignalID}`, goldenSignal);
    }
  };

  render() {
    const editable = (this.props.editable && this.props.editable === 'true') ? true : false;

    // Function to fetch golden signals that are stored
    const fetchGoldenSignals = async () => {
      return new Promise((resolve, reject) => {
        apiProvider.getAll(`${VuBlockStoreConstants.VUBLOCK_STORE_BASE_PATH}` +
        `/${this.props.vuBlockId}/${VuBlockStoreConstants.VUBLOCK_GOLDEN_SIGNALS}`)
          .then((data) => { return resolve(data.goldensignals); })
          .catch((err) => { return reject(err); });
      });
    };

    const goldenSignalsMeta = {
      title: 'Golden Signal',
      headers: ['Name', 'Description', 'Type', 'Index', 'Source', 'Unit'],
      rows: ['name', 'description', 'type', 'index', 'source', 'unit'],
      rowAction: [],
      id: 'goldensignal_id',
      add: editable,
      edit: editable,
      selection: editable,
      search: true,
      forceUpdate: true,
      clickOutsideToCloseModal: false,
      table: [
        {
          key: 'goldensignal_id',
          id: true,
          label: 'Golden Signal ID',
          name: 'goldensignal_id',
          type: 'text',
          props: {
            required: true,
            minLength: '4',
            maxLength: '32',
            pattern: '^[^ \n]*$',
          },
          errorText: `Golden Signal ID should be between the length 4 and 32 and can have any characters except space.`
        },
        {
          key: 'name',
          label: 'Name',
          name: 'name',
          type: 'text',
          props: {
            required: true,
            minLength: '4',
            maxLength: '32',
            pattern: '^.+$',
          },
          errorText: `Name should be between the length 4 and 32 and can have any characters.`,
        },
        {
          key: 'description',
          id: true,
          label: 'Description',
          name: 'description',
          type: 'text',
          props: {
            required: true,
            minLength: '4',
            maxLength: '100',
            pattern: '^.{4,100}$',
          },
          errorText: `Description text should be between 4 to 100 characters.`,
        },
        {
          key: 'type',
          label: 'Data Type for Field',
          type: 'select',
          name: 'type',
          options: [
            { key: 'integer', label: 'Integer', name: 'active', value: 'Integer' },
            { key: 'string', label: 'String', name: 'active', value: 'String' }
          ],
          props: {
            required: true,
          },
        },
        {
          key: 'index',
          id: true,
          label: 'Index',
          name: 'index',
          type: 'text',
          props: {
            required: true,
            minLength: '4',
            maxLength: '32',
            pattern: '^[^ \n]*$',
          },
          errorText: `Index should be between the length 4 and 32 and can have any characters except space.`
        },
        {
          key: 'source',
          id: true,
          label: 'Source',
          name: 'source',
          type: 'text',
          props: {
            required: true,
            minLength: '4',
            maxLength: '32',
            pattern: '^.+$',
          },
          errorText: `Source should be between the length 4 and 32 and can have any characters.`,
        },
        {
          key: 'unit',
          id: true,
          label: 'Unit',
          name: 'unit',
          type: 'text',
          props: {
            required: true,
            minLength: '4',
            maxLength: '32',
            pattern: '^.+$',
          },
          errorText: `Unit should be between the length 4 and 32 and can have any characters.`
        },
      ],
    };

    return (
      <div className="golden-signals-wrapper">
        {
          <VunetDataTable
            fetchItems={fetchGoldenSignals}
            deleteSelectedItems={this.deleteSelectedGoldenSignals}
            metaItem={goldenSignalsMeta}
            onSubmit={this.onSubmitGoldenSignal.bind(this)}
          />
        }
      </div>
    );
  }
}

GoldenSignals.propTypes = {};