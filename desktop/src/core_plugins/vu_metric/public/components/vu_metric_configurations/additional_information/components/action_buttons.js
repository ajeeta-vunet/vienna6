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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import { VunetDataTable } from 'ui_framework/src/vunet_components/vunet_table/vunet_table';
import { VunetHelp } from 'ui_framework/src/vunet_components/vunet_help/vunet_help'
import { vuMetricConstants } from '../../../lib/vu_metric_constants';
const chrome = require('ui/chrome');

class ActionButtons extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showActionButtonsTable: true,
      actionButtonsHelp: false,
      actionButtonsDropdown: []
    }
  }

  componentDidMount() {
    const urlBase = chrome.getUrlBase();
    // We are fetching the action scripts here
    fetch(urlBase + '/rba/' + '?type=action')
      .then(res => res.json())
      .then(result => this.setState(
        {
          actionButtonsDropdown: result.actions
        }
      ))
  }

  // this function will be used to the fetch the saved values for action buttons
  fetchItemsForActionButtons = () => {
    return new Promise((resolve) => resolve(this.props.model.actionButtonsData));
  }

  // This will be used to delete the selected entries from the table
  deleteSelectedItemsForActionButtons = (rows) => {
    let model = { ...this.props.model }
    rows.map((row) => {
      const indexToFind = model.actionButtonsData.indexOf(row);
      model.actionButtonsData.splice(indexToFind, 1)
    })
    this.props.onChange(model);
    return Promise.resolve('');
  }

  // This will be used on submit of action buttons
  onSubmitForActionButtons = (event, actionButtonId, actionButtonData) => {
    let model = _.cloneDeep(this.props.model);
    if (event === 'add') {
      let newActionButton = {
        actionName: actionButtonData.actionName,
        actionColor: actionButtonData.actionColor
      }
      model.actionButtonsData.push(newActionButton);
      this.props.onChange(model);
      return Promise.resolve(true);

    }
    else if (event == 'edit') {
      let actionButtonsDataToFindIndexOf = {};
      model.actionButtonsData.map((actionButton) => {
        if (actionButton.actionName == actionButtonId) {
          actionButtonsDataToFindIndexOf = actionButton;
        }
      })

      const indexOfData = model.actionButtonsData.indexOf(actionButtonsDataToFindIndexOf)
      let changedActionButtonsData = {
        actionName: actionButtonData.actionName,
        actionColor: actionButtonData.actionColor
      }

      model.actionButtonsData.splice(indexOfData, 1, changedActionButtonsData)
      this.props.onChange(model);
      return Promise.resolve(true);
    }
  }

  // This function will be used to show hide action buttons table
  showHideActionButtonsTable = () => {
    if (this.state.showActionButtonsTable) {
      this.setState(
        {
          showActionButtonsTable: false
        }
      )
    }
    else if (!this.state.showActionButtonsTable) {
      this.setState(
        {
          showActionButtonsTable: true
        }
      )
    }
  }

  // This function will be used to check if the action name is unique or not
  validateActionName = (key, value) => {
    return this.props.model.actionButtonsData.find(actionButton => actionButton[key] === value) ? true : false;
  }

  // This function will be used to show the help block for action buttons
  showActionButtonsHelp = () => {
    this.setState(
      {
        actionButtonsHelp: !this.state.actionButtonsHelp
      }
    )
  }

  /**
   * Will resolve color code to color name
   * @param {*} key the key of color, which will always be actionColor
   * @param {*} value Value of color
   */
  // resolveActionColor(key, value) {
  //   try {
  //     return colorOptions.find(a => a.value === value).label;
  //   } catch (e) {
  //     return value;
  //   }
  // }

  render() {

    let actionButtonsMeta = {
      headers: ['Action Name', 'Action Color'],
      rows: ['actionName', 'actionColor',],
      id: 'actionName',
      add: true,
      edit: true,
      title: 'Action Buttons',
      selection: true,
      search: false,
      maxRows: 3,
      // columnData: [{ columnName: 'actionColor', func: this.resolveActionColor }],
      default: { actionName: '', actionColor: vuMetricConstants.COLOR_CONSTANTS.RED },
      table:
        [
          {
            key: 'actionName',
            label: 'Action Name *',
            type: 'select',
            name: 'actionName',
            validationCallback: this.validateActionName,
            options: [
              { key: 'empty', label: '', name: 'actionName', value: '' }
            ],
            props: {
              required: true,
            },
            errorText: 'Action Name should be unique.'
          },
          {
            key: 'actionColor',
            label: 'Action Color *',
            type: 'select',
            name: 'actionColor',
            options: [
              { key: vuMetricConstants.COLOR_CONSTANTS.RED, label: 'Red', name: 'actionColor', value: vuMetricConstants.COLOR_CONSTANTS.RED },
              { key: vuMetricConstants.COLOR_CONSTANTS.GREEN, label: 'Green', name: 'actionColor', value: vuMetricConstants.COLOR_CONSTANTS.GREEN },
              { key: vuMetricConstants.COLOR_CONSTANTS.ORANGE, label: 'Orange', name: 'actionColor', value: vuMetricConstants.COLOR_CONSTANTS.ORANGE },
              { key: vuMetricConstants.COLOR_CONSTANTS.YELLOW, label: 'Yellow', name: 'actionColor', value: vuMetricConstants.COLOR_CONSTANTS.YELLOW }
            ],
            props: {
              required: true
            }
          }
        ]
    };


    this.state.actionButtonsDropdown.map((actionButtton) => {
      actionButtonsMeta.table[0].options.push({
        key: actionButtton, label: actionButtton, name: 'actionName', value: actionButtton
      })
    })

    // actionButtonsMeta.default.actionName = this.state.actionButtonsDropdown[0];

    const actionButtonsHelpMeta = {
      headerText: 'Helping Hand',
      referenceLink: '/vuDoc/user_guide/visualization.html#configuration-options',
      contentIntroduction: ' Add action buttons into the visualization. Clicking on the action button will trigger an action in the ' +
        'system based on the playbook script configured for the action button. Useful to trigger corrective actions ' +
        'like restarting a service on a server being monitored when the service is misbehaving.'
    }

    return (
      <div className="action-buttons-container">
        <div className="row action-buttons-header-row">
          <div className="action-buttons-expander-icon" onClick={() => this.showHideActionButtonsTable()}>
            <i className={(this.state.showActionButtonsTable ? 'icon-arrow-up' : 'icon-arrow-down')}></i>
          </div>
          <div className="action-buttons-heading">
            Action Buttons
          </div>
          <div className="action-buttons-tooltip">
            <i className="action-buttons-help-icon icon-help-blue"
              onClick={this.showActionButtonsHelp}
              data-tip="Click the help icon to open the help section block" />
            <ReactTooltip />
          </div>
        </div>

        {
          this.state.actionButtonsHelp &&
          (
            <VunetHelp
              metaData={actionButtonsHelpMeta}
              onClose={this.showActionButtonsHelp.bind(this)}
            />
          )
        }

        {(this.state.showActionButtonsTable && this.props.model.aggregations.length <= 2) ?
          (
            <div className="action-buttons-table">
              <VunetDataTable
                fetchItems={this.fetchItemsForActionButtons}
                deleteSelectedItems={this.deleteSelectedItemsForActionButtons}
                metaItem={actionButtonsMeta}
                onSubmit={this.onSubmitForActionButtons}
              />
            </div>
          )
          :
          (
            null
          )
        }
        {this.props.model.aggregations.length > 2 &&
          (
            <div className='no-action-buttons-for-more-than-two-buckets' >
              <b>NOTE : </b>Action Buttons cannot be configured if there are more than two buckets configured.
            </div>
          )
        }
      </div>

    );
  }
}


ActionButtons.propTypes = {
  model: PropTypes.object, //  This is the parameters object 
  onChange: PropTypes.func, // This is the callback function for form changes to update the latest model to state
};

export default ActionButtons;