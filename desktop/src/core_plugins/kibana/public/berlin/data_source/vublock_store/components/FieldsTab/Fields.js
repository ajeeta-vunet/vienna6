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
import './Fields.less';
import { apiProvider } from 'ui_framework/src/vunet_components/vunet_service_layer/api/utilities/provider.js';
import { VuBlockStoreConstants } from '../../vublock_store_constants';


export class Fields extends React.Component {
  constructor(props) {
    super(props);
  }

  // Function to delete selected rows of fields
  deleteSelectedFields = (rows) => {
    const deletePromises = Promise.all(
      rows.map((row) => {
        apiProvider.remove(`${VuBlockStoreConstants.VUBLOCK_STORE_BASE_PATH}` +
          `/${this.props.vuBlockId}/${VuBlockStoreConstants.VUBLOCK_FIELDS}/${row.field_id}`);
      })
    );
    return deletePromises;
  }

  // Function to trigger when user creates or edits field from the form modal
  onSubmitField = (event, fieldID, fieldData) => {
    const field = {
      field_id: fieldData.field_id,
      name: fieldData.name,
      description: fieldData.description,
      type: fieldData.type ? fieldData.type : 'Integer',
      index: fieldData.index,
      source: fieldData.source,
      unit: fieldData.unit,
    };
    if (event === 'add') {
      return apiProvider.post(`${VuBlockStoreConstants.VUBLOCK_STORE_BASE_PATH}` +
        `/${this.props.vuBlockId}/${VuBlockStoreConstants.VUBLOCK_FIELDS}`, field);
    } else if(event === 'edit') {
      return apiProvider.put(`${VuBlockStoreConstants.VUBLOCK_STORE_BASE_PATH}` +
        `/${this.props.vuBlockId}/${VuBlockStoreConstants.VUBLOCK_FIELDS}/${fieldID}`, field);
    }
  }

  render() {
    const editable = (this.props.editable && this.props.editable === 'true') ? true : false;

    // Function to fetch the fields data
    const fetchFields = async () => {
      return new Promise((resolve, reject) => {
        apiProvider.getAll(`${VuBlockStoreConstants.VUBLOCK_STORE_BASE_PATH}` +
        `/${this.props.vuBlockId}/${VuBlockStoreConstants.VUBLOCK_FIELDS}`)
          .then((data) => { return resolve(data.fields); })
          .catch((err) => { return reject(err); });
      });
    };

    // Meta Information for the VunetDataTable
    const fieldsMeta = {
      title: 'Field',
      headers: ['Name', 'Description', 'Type', 'Index', 'Source', 'Unit'],
      rows: ['name', 'description', 'type', 'index', 'source', 'unit'],
      rowAction: [],
      id: 'field_id',
      add: editable,
      edit: editable,
      selection: editable,
      search: true,
      forceUpdate: true,
      clickOutsideToCloseModal: false,
      table: [
        {
          key: 'field_id',
          id: true,
          label: 'Field ID',
          name: 'field_id',
          type: 'text',
          props: {
            required: true,
            minLength: '4',
            maxLength: '32',
            pattern: '^[^ \n]*$',
          },
          errorText: `Field ID should be between the length 4 and 32 and can have any characters except space.`
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
          }
        },
        {
          key: 'index',
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
          label: 'Source',
          name: 'source',
          type: 'text',
          props: {
            required: true,
            minLength: '4',
            maxLength: '32',
            pattern: '^.+$',
          },
          errorText: `Source should be between the length 4 and 32 and can have any characters.`
        },
        {
          key: 'unit',
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
      <div className="fields-wrapper">
        {
          <VunetDataTable
            fetchItems={fetchFields}
            deleteSelectedItems={this.deleteSelectedFields}
            metaItem={fieldsMeta}
            onSubmit={this.onSubmitField.bind(this)}
          />
        }
      </div>
    );
  }
}