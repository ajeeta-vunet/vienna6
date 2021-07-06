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
import './Storyboards.less';
import { apiProvider } from 'ui_framework/src/vunet_components/vunet_service_layer/api/utilities/provider.js';
import { VuBlockStoreConstants } from '../../vublock_store_constants';

export class Storyboards extends React.Component {
  constructor(props) {
    super(props);
  }

  // Function to delete selected rows of storyboards
  deleteSelectedStoryboards = (rows) => {
    const deletePromises = Promise.all(
      rows.map((row) => {
        apiProvider.remove(`${VuBlockStoreConstants.VUBLOCK_STORE_BASE_PATH}` +
          `/${this.props.vuBlockId}/${VuBlockStoreConstants.VUBLOCK_STORYBOARDS}/${row.storyboard_id}`);
      })
    );
    return deletePromises;
  }

  // Function to trigger when a user creates a storyboard through form modal
  onSubmitStoryboard = (event, storyboardID, storyboardData) => {
    if (event === 'add') {
      const formData = new FormData();
      formData.append('file', storyboardData.storyboard_json, storyboardData.storyboard_json.name);
      return apiProvider.post(`${VuBlockStoreConstants.VUBLOCK_STORE_BASE_PATH}` +
      `/${this.props.vuBlockId}/${VuBlockStoreConstants.VUBLOCK_STORYBOARDS}`, formData);
    }
  }

  render() {
    const editable =
      (this.props.editable && this.props.editable === 'true') ? true : false;

    const STORYBOARD_OBJ = {
      headerText: `An '.json' file containing the storyboard data.`,
      referenceLink: '',
      contentIntroduction: 'Upload a JSON file containing the storyboard data.'
    };

    // Function to fetch storyboards that are stored
    const fetchStoryBoards = async () => {
      return new Promise((resolve, reject) => {
        apiProvider.getAll(`${VuBlockStoreConstants.VUBLOCK_STORE_BASE_PATH}/` +
        `${this.props.vuBlockId}/${VuBlockStoreConstants.VUBLOCK_STORYBOARDS}`)
          .then((data) => { return resolve(data.storyboards); })
          .catch((err) => { return reject(err); });
      });
    };

    const storyBoardsMeta = {
      title: 'Storyboard',
      headers: ['Name'],
      rows: ['storyboard_name'],
      rowAction: [],
      id: 'storyboard_id',
      add: editable,
      edit: false,
      selection: editable,
      search: true,
      forceUpdate: true,
      clickOutsideToCloseModal: false,
      table: [
        {
          key: 'storyboard_json',
          id: true,
          label: 'Storyboard JSON *',
          type: 'file',
          helpObj: STORYBOARD_OBJ,
          name: 'storyboardFile',
          props: {
            required: true
          },
        }
      ],
    };

    return (
      <div className="storyboards-wrapper">
        <VunetDataTable
          fetchItems={fetchStoryBoards}
          metaItem={storyBoardsMeta}
          onSubmit={this.onSubmitStoryboard.bind(this)}
          deleteSelectedItems={this.deleteSelectedStoryboards}
        />
      </div>
    );
  }
}

Storyboards.propTypes = {};
