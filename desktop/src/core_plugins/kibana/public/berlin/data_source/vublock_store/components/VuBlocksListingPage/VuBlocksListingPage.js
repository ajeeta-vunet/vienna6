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
import { VunetVublockTable } from 'ui_framework/src/vunet_components/vunet_table/vublock_table';
import './VuBlocksListingPage.less';
import { apiProvider } from 'ui_framework/src/vunet_components/vunet_service_layer/api/utilities/provider.js';
import { VuBlockStoreConstants } from '../../vublock_store_constants';

export class VuBlocksListingPage extends React.Component {
  constructor(props) {
    super(props);
  }

  onSubmitVuBlock = (event, vuBlockId, vuBlockData) => {
    const vuBlock = {
      name: vuBlockData.name,
      description: vuBlockData.description,
      type: vuBlockData.type ? vuBlockData.type : 'Component',
      instance_identifier: vuBlockData.instance_identifier
    };
    if (event === 'add') {
      return apiProvider.post(VuBlockStoreConstants.VUBLOCK_STORE_BASE_PATH, vuBlock);
    }
  }

  render() {

    const fetchVuBlocks = async () => {
      return apiProvider.getAll(VuBlockStoreConstants.VUBLOCK_STORE_BASE_PATH);
    };

    const vublocksMeta = {
      title: 'VuBlock',
      headers: ['Name', 'Description', 'Type', 'Instance Identifier', 'Completion'],
      rows: [ { 'name': 'name', 'type': 'link' }, { 'name': 'description', 'type': 'string' },
        { 'name': 'type', 'type': 'string' }, { 'name': 'instance_identifier', 'type': 'string' },
        { 'name': 'completion_percentage', 'type': 'progressbar' }],
      id: 'vublock_id',
      pagination: true,
      toolbar: true,
      footerbar: true,
      add: true,
      edit: false,
      selection: false,
      search: true,
      rowAction: false,
      forceUpdate: false,
      clickOutsideToCloseModal: false,
      search: true,
      table: [
        {
          key: 'name',
          id: true,
          label: 'Name',
          name: 'name',
          type: 'text',
          props: {
            required: true,
            minLength: '4',
            maxLength: '32',
            pattern: '^.+$',
          },
          errorText: `VuBlock Name should be between the length 4 and 32 and can have any characters.`
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
          errorText: `Description text should be between 4 to 100 characters.`
        },
        {
          key: 'type',
          label: 'Type of VuBlock',
          type: 'select',
          name: 'type',
          options: [
            { key: 'component', label: 'Component', name: 'active', value: 'Component' },
            { key: 'logical', label: 'Logical', name: 'active', value: 'Logical' }
          ],
          props: {
            required: true,
          },
        },
        {
          key: 'instance_identifier',
          id: true,
          label: 'Instance Identifier',
          name: 'instance_identifier',
          type: 'text',
          props: {
            required: true,
            minLength: '4',
            maxLength: '32',
            pattern: '^[^ \n]*$',
          },
          errorText: `Index should be between the length 4 and 32 and can have any characters except space.`
        },
      ],
    };

    return (
      <div className="vublocks-wrapper">
        {
          <VunetVublockTable
            fetchItems={fetchVuBlocks}
            metaItem={vublocksMeta}
            onSubmit={this.onSubmitVuBlock.bind(this)}
          />
        }
      </div>
    );
  }
}