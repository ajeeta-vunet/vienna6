
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

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import $ from 'jquery';
import chrome from 'ui/chrome';

import { AlertConditionTab } from './alert_condition_tab';
import { reorderList } from 'ui/utils/vunet_list_utils';
import { VunetUserPermissions,
  getDefaultPermission } from 'ui_framework/src/vunet_components/vunet_user_permissions/vunet_user_permissions';
import { VunetSwitch } from 'ui_framework/src/vunet_components/vunet_switch/vunet_switch';
import { VunetModal } from 'ui_framework/src/vunet_components/vunet_modal/vunet_modal';
import { VunetTab } from 'ui_framework/src/vunet_components/vunet_tab/vunet_tab';
import { validateInputTypes, validateInput, getFormValidity, getFormErrorField } from 'ui/utils/vunet_form_validator_utils';
import {
  ALERT_CONFIG_DEFAULTS, NEW_EVAL_CRITERIA_CONDITION_LIST_ITEM,
  NEW_CONDITION_LIST_ITEM, NEW_ACTION_LIST_ITEM, NEW_CHANNEL_LIST_ITEM,
  NEW_RULE_LIST_ITEM
}
  from '../alert_constants';

const ALERT_CONDITION_TAB = 'Set Alert Condition';

export class AlertDetails extends React.Component {
  constructor(props) {
    super(props);

    // initialise default states
    this.state = {
      currentTabId: ALERT_CONDITION_TAB,
      savedObject: this.props.savedObject,
      errorObj: {},
      formValid: true,
      displayUserPermission: false,
      displaySaveAsConfig: false,
      newAlertTitle: this.props.savedObject.title,
      isCollapseUserPermission: true,
      isSaveClicked: false,
      isSaveAsClicked: false,
      isDiscardEnabled: false,
      showDiscardConformationPopup: false
    };

    // error handler, 'objectRequired' format
    this.errorObjectRequried = {
      required: true,
      errorText: ''
    };

    // error handler, 'objectNotRequired' format
    this.errorObjectNotRequired = {
      required: false,
      errorText: ''
    };

    // Data for tabs component
    this.tabs = [{
      id: ALERT_CONDITION_TAB,
      name: ALERT_CONDITION_TAB
    }];

    // Mention the default tab
    this.landingTab = ALERT_CONDITION_TAB;

    // Perform initial processing on data
    // state is passed to this method as a reference and so we don't have to manually update state again here
    this._init(this.state);

    // after initial processing and updating savedObject, create a backup of it
    this.state.savedObjectBackup = this.state.savedObject;
    // create a backup of errorObj object as well.
    // These will be used when user wants to reset the page
    this.state.errorHandlerBackup = this.state.errorObj;
  }

  // This lifecycle method is called everytime a state change occurs
  componentDidUpdate() {
    const hasSavedObjectChanged = !(JSON.stringify(this.state.savedObject) === JSON.stringify(this.state.savedObjectBackup));

    // if savedObject has been updated and discard is disabled, we enable discard
    if (hasSavedObjectChanged &&
      this.state.isDiscardEnabled === false) {
      // eslint-disable-next-line
      this.setState({ isDiscardEnabled: true });
    }

    // if savedObject has not been updated and discard is enabled, we disable discard
    if (!hasSavedObjectChanged &&
      this.state.isDiscardEnabled === true) {
      // eslint-disable-next-line
      this.setState({ isDiscardEnabled: false });
    }
  }

  // initial processing to be done on the data
  // 1) Perform required formatting on certain items (eg parsing string to json)
  // 2) generate errorObj object in required format
  _init = (state) => {
    const savedObject = state.savedObject;

    // enableAdvancedConfig is a new flag we have introduced during UI upliftment
    // if in older alerts advancedConfiguration is already configured, set enableAdvancedConfig to true
    if (savedObject.advancedConfiguration) {
      savedObject.enableAdvancedConfig = true;
    }

    // Create a new key 'parsedWeekdaysList' which containts all the weekdays
    // user can choose which day he wants to genreate the alert
    savedObject.parsedWeekdaysList = JSON.parse(savedObject.weekdays);

    // Create a new key 'alertReportListHandler' which containts list of reports
    savedObject.alertReportListHandler = [];
    if (savedObject.alertReportList) {
      const parsedAlertReportList = JSON.parse(savedObject.alertReportList);
      parsedAlertReportList.forEach(report => {
        savedObject.alertReportListHandler.push(report.name);
      });
    }

    // Create a new key 'alertEmailGroupHandler' which containts list of email groups
    savedObject.alertEmailGroupHandler = [];
    if (savedObject.alertEmailGroup) {
      savedObject.alertEmailGroupHandler = savedObject.alertEmailGroup.split(',');
    }

    // Create a new key 'parsedEvalCriteriaConditionList' which containts the alert rules condition object
    savedObject.parsedEvalCriteriaConditionList = [];
    if (savedObject.evalCriteriaConditionList) {
      savedObject.parsedEvalCriteriaConditionList = JSON.parse(savedObject.evalCriteriaConditionList);

      // In alertRuleEvluationCondition section, 'emailGroup' needs to be comma seperated list
      // 'report' needs to be list of all report names
      _.forEach(savedObject.parsedEvalCriteriaConditionList, (evalCriteriaConditionItem) => {
        _.forEach(evalCriteriaConditionItem.channelList, (channelListItem) => {
          const value = _.cloneDeep(channelListItem.value);
          if (channelListItem.channel === 'emailGroup') {
            channelListItem.value = value.split(',');
          } else if (channelListItem.channel === 'report') {
            const reportList = [];
            value.forEach(report => {
              reportList.push(report.name);
            });
            channelListItem.value = reportList;
          }
        });
      });
    }

    // Create a new key 'parsedEvalCriteria' which containts the Rule Evaluation Script object
    savedObject.parsedEvalCriteria = {};
    if (savedObject.evalCriteria) {
      savedObject.parsedEvalCriteria = JSON.parse(savedObject.evalCriteria);
    }

    // Create a new key 'parsedRuleList' which containts the ruleList object
    savedObject.parsedRuleList = [];
    if (savedObject.ruleList) {
      savedObject.parsedRuleList = JSON.parse(savedObject.ruleList);
    }

    // Create a new key 'parsedAllowedRolesJSON' which containts the user permissions object
    savedObject.parsedAllowedRolesJSON = [];

    if (savedObject.allowedRolesJSON) {
      savedObject.parsedAllowedRolesJSON = JSON.parse(savedObject.allowedRolesJSON);
    } else {
      getDefaultPermission([]).then((userRolesObj)=>{
        savedObject.parsedAllowedRolesJSON = userRolesObj.userRoles;
      });
    }

    // generate an error handler object
    state.errorObj = this._generateErrorObject(savedObject);
  };

  // Generate errorObj object in the required format
  // 'errorObj' object keys must have the same name as 'savedObject' keys
  // eg 'parsedEvalCriteriaConditionList' is present in both 'errorObj' and 'savedObject'
  _generateErrorObject = (savedObject) => {
    let errorObj = {};
    errorObj = {
      'parsedRuleList': [],
      'parsedEvalCriteriaConditionList': [],
      'title': { ...this.errorObjectRequried },
      'summary': { ...this.errorObjectRequried },
      'description': { ...this.errorObjectRequried },
      'parsedEvalCriteria': {
        'expression': { ...this.errorObjectNotRequired }
      },
      'throttleDuration': savedObject.enableThrottle ? { ...this.errorObjectRequried } : { ...this.errorObjectNotRequired },
      'activeStartTime': savedObject.activeAlertCheck ? { ...this.errorObjectRequried } : { ...this.errorObjectNotRequired },
      'activeEndTime': savedObject.activeAlertCheck ? { ...this.errorObjectRequried } : { ...this.errorObjectNotRequired },
      'advancedConfiguration': savedObject.enableAdvancedConfig ? { ...this.errorObjectRequried } : { ...this.errorObjectNotRequired },
      'alertWhatsappNumber': savedObject.alertByWhatsapp ? { ...this.errorObjectRequried } : { ...this.errorObjectNotRequired },
      'alertEmailId': (savedObject.alertByEmail && savedObject.alertEmailId) ?
        { ...this.errorObjectRequried } : { ...this.errorObjectNotRequired },
      'alertEmailGroupHandler': (savedObject.alertByEmail && savedObject.alertEmailGroupHandler.length > 0) ?
        { ...this.errorObjectRequried } : { ...this.errorObjectNotRequired },
      'alertEmailBody': { ...this.errorObjectNotRequired },
      'runbook_script': savedObject.enable_runbook_automation ? { ...this.errorObjectRequried } : { ...this.errorObjectNotRequired },
      'ansible_playbook_name': savedObject.enable_ansible_playbook ? { ...this.errorObjectRequried } : { ...this.errorObjectNotRequired },
      'ansible_playbook_options': savedObject.enable_ansible_playbook ?
        { ...this.errorObjectRequried } : { ...this.errorObjectNotRequired },
      'alertReportListHandler': savedObject.alertByReport ? { ...this.errorObjectRequried } : { ...this.errorObjectNotRequired },
    };

    // populate the error object with rulelist
    savedObject.parsedRuleList.forEach(() => {
      errorObj.parsedRuleList.push({
        ruleNameAlias: { ...this.errorObjectNotRequired },
        selectedMetric: { ...this.errorObjectRequried },
        ruleTypeDuration: { ...this.errorObjectRequried }
      });
    });

    // populate the error object with parsedEvalCriteriaConditionList

    // parsedEvalCriteriaConditionList errorObject format
    // {
    //   blockLabel: { ...this.errorObjectRequried },
    //   conditionList: [{
    //     value: { ...this.errorObjectRequried }
    //   }],
    //   actionList: [{
    //     value: { ...this.errorObjectRequried }
    //   }],
    //   actionList: [{
    //     value: { ...this.errorObjectRequried }
    //   }]
    // }
    savedObject.parsedEvalCriteriaConditionList.forEach((evalCondition) => {

      // generate conditionList
      const conditionList = [];
      evalCondition.conditionList.forEach((conditionListItem) => {
        const isMetric = conditionListItem.source === 'metric';
        // bmv and metric are requried felds only if source is of type metric
        conditionList.push({
          bmv: isMetric ? { ...this.errorObjectRequried } : { ...this.errorObjectNotRequired },
          metric: isMetric ? { ...this.errorObjectRequried } : { ...this.errorObjectNotRequired },
          value: { ...this.errorObjectRequried }
        });
      });

      // generate actionList
      const actionList = [];
      evalCondition.actionList.forEach(() => {
        actionList.push({
          value: { ...this.errorObjectRequried }
        });
      });

      // generate channelList
      const channelList = [];
      evalCondition.channelList.forEach((channelListItem) => {
        // if actionType is mute then it isn't a required field
        const valueObj = (channelListItem.action === 'mute') ?
          { ...this.errorObjectNotRequired } :
          { ...this.errorObjectRequried };

        channelList.push({
          value: valueObj
        });

      });

      // finally push all the items
      errorObj.parsedEvalCriteriaConditionList.push({
        blockLabel: { ...this.errorObjectNotRequired },
        conditionList,
        actionList,
        channelList
      });
    });
    return errorObj;
  };

  // 1. alert about section
  alertAboutSection = {
    // to update the alert about information
    updateAlertAboutInfo: (type, value) => {
      const savedObject = { ...this.state.savedObject };
      const errorObj = { ...this.state.errorObj };

      switch (type) {
        case 'summary':
          savedObject.summary = value;
          errorObj.summary.errorText = validateInput(value, {
            [validateInputTypes.required]: {
              value: errorObj.summary.required
            },
            [validateInputTypes.maxLength]: {
              value: 100,
            }
          });
          break;

        case 'severity':
          savedObject.severity = value;
          break;

        case 'description':
          savedObject.description = value;
          errorObj.description.errorText = validateInput(value, {
            [validateInputTypes.required]: {
              value: errorObj.description.required
            },
            [validateInputTypes.maxLength]: {
              value: 500,
            }
          });
          break;

        default:
          throw new Error('the update type ' + type + ' not found in alertAboutSection');
      }
      this.setState({
        savedObject,
        formValid: getFormValidity(errorObj),
        errorObj
      });
    }
  };

  // 2. alert condition section
  alertConditionSection = {
    // contains the list of BMVs
    vuMetricList: this.props.vuMetricList,

    // contains callback method for displaying metrics for corresponding BMV
    previewMetric: this.props.previewMetric,

    // add a new condition
    addCondition: () => {
      // shallow clone of savedObject
      const savedObject = { ...this.state.savedObject };
      // deep clone of parsedRuleList
      savedObject.parsedRuleList = _.cloneDeep(savedObject.parsedRuleList);

      // shallow clone of errorObj
      const errorObj = { ...this.state.errorObj };
      // deep clone of parsedRuleList
      errorObj.parsedRuleList = _.cloneDeep(errorObj.parsedRuleList);

      savedObject.parsedRuleList.push(_.cloneDeep(NEW_RULE_LIST_ITEM));

      errorObj.parsedRuleList.push({
        ruleNameAlias: { ...this.errorObjectNotRequired },
        selectedMetric: { ...this.errorObjectRequried },
        ruleTypeDuration: { ...this.errorObjectRequried }
      });
      this.setState({ savedObject, errorObj });
    },

    // delete an existing condition
    deleteCondition: (index) => {
      // shallow clone of savedObject
      const savedObject = { ...this.state.savedObject };
      // deep clone of parsedRuleList
      savedObject.parsedRuleList = _.cloneDeep(savedObject.parsedRuleList);

      // shallow clone of errorObj
      const errorObj = { ...this.state.errorObj };
      // deep clone of parsedRuleList
      errorObj.parsedRuleList = _.cloneDeep(errorObj.parsedRuleList);

      savedObject.parsedRuleList.splice(index, 1);
      errorObj.parsedRuleList.splice(index, 1);

      this.setState({
        savedObject,
        formValid: getFormValidity(errorObj),
        errorObj
      });
    },

    // update a condition item
    updateAlertConfig: (index, type, value) => {
      // shallow clone of savedObject
      const savedObject = { ...this.state.savedObject };
      // deep clone of parsedRuleList
      savedObject.parsedRuleList = _.cloneDeep(savedObject.parsedRuleList);

      // shallow clone of errorObj
      const errorObj = { ...this.state.errorObj };
      // deep clone of parsedRuleList
      errorObj.parsedRuleList = _.cloneDeep(errorObj.parsedRuleList);

      // select required ruleListHandlerItem from the incoming index
      const ruleListHandlerItem = savedObject.parsedRuleList[index];
      // select required errorHandlerItem from the incoming index
      const errorHandlerItem = errorObj.parsedRuleList[index];

      switch (type) {
        case 'metric':
          // here value contains the SELECT element.
          // extract all options from SELECT element
          const options = value.options;
          // get the selected option's 'id' and 'value'
          const selectedMetric = {
            id: options[options.selectedIndex].id,
            title: options[options.selectedIndex].value
          };

          ruleListHandlerItem.selectedMetric = selectedMetric;
          errorHandlerItem.selectedMetric.errorText = validateInput(value, {
            [validateInputTypes.required]: {
              value: errorHandlerItem.selectedMetric.required
            }
          });
          break;

        case 'alertLabel':
          ruleListHandlerItem.ruleNameAlias = value;
          errorHandlerItem.ruleNameAlias.errorText = validateInput(value, {
            [validateInputTypes.required]: {
              value: errorHandlerItem.ruleNameAlias.required
            },
            [validateInputTypes.maxLength]: {
              value: 32,
              errorText: `must be less than 32 characters`
            }
          });
          break;

        case 'duration':
          // if it has content convert string to number
          if (value) {
            value = parseInt(value);
          }
          ruleListHandlerItem.ruleTypeDuration = value;
          errorHandlerItem.ruleTypeDuration.errorText = validateInput(value, {
            [validateInputTypes.required]: {
              value: errorHandlerItem.ruleTypeDuration.required
            },
            [validateInputTypes.minRange]: {
              value: 1,
              errorText: `Time value cannot be less than 1`
            }
          });
          break;

        case 'durationType':
          ruleListHandlerItem.ruleTypeDurationType = value;
          break;

        case 'alertInformationCollector':
          ruleListHandlerItem.informationCollector = !ruleListHandlerItem.informationCollector;
          break;

        default:
          throw new Error('the update type ' + type + ' not found in alertConditionSection');
      }
      this.setState({
        savedObject,
        formValid: getFormValidity(errorObj),
        errorObj
      });
    }
  };

  // 3. alert rule evaluation condition section
  alertRuleEvaluationConditionSection = {
    // containing the list of email groups
    allEmailGroups: this.props.allEmailGroups,

    // containing the list of reports
    allReportTitles: this.props.allReportTitles,

    // option to match all condition or match any conditions
    enableMatchAllCondition: (index, type) => {
      // shallow clone of savedObject
      const savedObject = { ...this.state.savedObject };
      // deep clone of parsedEvalCriteriaConditionList
      savedObject.parsedEvalCriteriaConditionList = _.cloneDeep(savedObject.parsedEvalCriteriaConditionList);

      // if type = all, then all radioButton is selected
      if (type === 'all') {
        savedObject.parsedEvalCriteriaConditionList[index].matchAll = true;
      } else {
        savedObject.parsedEvalCriteriaConditionList[index].matchAll = false;
      }
      this.setState({ savedObject });
    },

    // enable or disable the alert
    enableAlert: (index) => {
      // shallow clone of savedObject
      const savedObject = { ...this.state.savedObject };
      // deep clone of parsedEvalCriteriaConditionList
      savedObject.parsedEvalCriteriaConditionList = _.cloneDeep(savedObject.parsedEvalCriteriaConditionList);

      const evalCriteriaCondition = savedObject.parsedEvalCriteriaConditionList[index];
      evalCriteriaCondition.generateAlert = !evalCriteriaCondition.generateAlert;
      this.setState({ savedObject });
    },

    // add a new logic block
    addLogicBlock: () => {
      // shallow clone of savedObject
      const savedObject = { ...this.state.savedObject };
      // deep clone of parsedEvalCriteriaConditionList
      savedObject.parsedEvalCriteriaConditionList = _.cloneDeep(savedObject.parsedEvalCriteriaConditionList);

      // shallow clone of errorObj
      const errorObj = { ...this.state.errorObj };
      // deep clone of parsedEvalCriteriaConditionList
      errorObj.parsedEvalCriteriaConditionList = _.cloneDeep(errorObj.parsedEvalCriteriaConditionList);

      savedObject.parsedEvalCriteriaConditionList.push(_.cloneDeep(NEW_EVAL_CRITERIA_CONDITION_LIST_ITEM));
      errorObj.parsedEvalCriteriaConditionList.push({
        blockLabel: { ...this.errorObjectNotRequired },
        conditionList: [{
          bmv: { ...this.errorObjectNotRequired },
          metric: { ...this.errorObjectNotRequired },
          value: { ...this.errorObjectRequried }
        }],
        actionList: [{
          value: { ...this.errorObjectRequried }
        }],
        channelList: [{
          value: { ...this.errorObjectRequried }
        }]
      });
      this.setState({ savedObject, errorObj });
    },

    // delete an existing logic block
    deleteLogicBlock: (index) => {
      // shallow clone of savedObject
      const savedObject = { ...this.state.savedObject };
      // deep clone of parsedEvalCriteriaConditionList
      savedObject.parsedEvalCriteriaConditionList = _.cloneDeep(savedObject.parsedEvalCriteriaConditionList);

      // shallow clone of errorObj
      const errorObj = { ...this.state.errorObj };
      // deep clone of parsedEvalCriteriaConditionList
      errorObj.parsedEvalCriteriaConditionList = _.cloneDeep(errorObj.parsedEvalCriteriaConditionList);

      savedObject.parsedEvalCriteriaConditionList.splice(index, 1);
      errorObj.parsedEvalCriteriaConditionList.splice(index, 1);

      this.setState({
        savedObject,
        formValid: getFormValidity(errorObj),
        errorObj
      });
    },

    // move a block up by 1 position
    moveLogicBlockUp: (index) => {
      // shallow clone of savedObject
      const savedObject = { ...this.state.savedObject };
      // deep clone of parsedEvalCriteriaConditionList
      savedObject.parsedEvalCriteriaConditionList = _.cloneDeep(savedObject.parsedEvalCriteriaConditionList);

      // shallow clone of errorObj
      const errorObj = { ...this.state.errorObj };
      // deep clone of parsedEvalCriteriaConditionList
      errorObj.parsedEvalCriteriaConditionList = _.cloneDeep(errorObj.parsedEvalCriteriaConditionList);

      // move savedObject item up
      savedObject.parsedEvalCriteriaConditionList = reorderList(
        savedObject.parsedEvalCriteriaConditionList,
        index,
        index - 1
      );

      // move errorObj item up
      errorObj.parsedEvalCriteriaConditionList = reorderList(
        errorObj.parsedEvalCriteriaConditionList,
        index,
        index - 1
      );

      this.setState({ savedObject, errorObj });
    },

    // move a block down by 1 position
    moveLogicBlockDown: (index) => {
      // shallow clone of savedObject
      const savedObject = { ...this.state.savedObject };
      // deep clone of parsedEvalCriteriaConditionList
      savedObject.parsedEvalCriteriaConditionList = _.cloneDeep(savedObject.parsedEvalCriteriaConditionList);

      // shallow clone of errorObj
      const errorObj = { ...this.state.errorObj };
      // deep clone of parsedEvalCriteriaConditionList
      errorObj.parsedEvalCriteriaConditionList = _.cloneDeep(errorObj.parsedEvalCriteriaConditionList);

      // move savedObject item up
      savedObject.parsedEvalCriteriaConditionList = reorderList(
        savedObject.parsedEvalCriteriaConditionList,
        index,
        index + 1
      );

      // move savedObject item up
      errorObj.parsedEvalCriteriaConditionList = reorderList(
        errorObj.parsedEvalCriteriaConditionList,
        index,
        index + 1
      );

      this.setState({ savedObject, errorObj });
    },

    // expand/collapse the logic block
    expandLogicBlock: (index) => {
      // shallow clone of savedObject
      const savedObject = { ...this.state.savedObject };
      // deep clone of parsedEvalCriteriaConditionList
      savedObject.parsedEvalCriteriaConditionList = _.cloneDeep(savedObject.parsedEvalCriteriaConditionList);
      const conditionListItem = savedObject.parsedEvalCriteriaConditionList[index];
      conditionListItem.expanded = !conditionListItem.expanded;
      this.setState({ savedObject });
    },

    // update an existing logic block
    updateLogicBlock: (index, type, value) => {
      // shallow clone of savedObject
      const savedObject = { ...this.state.savedObject };
      // deep clone of parsedEvalCriteriaConditionList
      savedObject.parsedEvalCriteriaConditionList = _.cloneDeep(savedObject.parsedEvalCriteriaConditionList);
      const evalCriteriaConditionItem = savedObject.parsedEvalCriteriaConditionList[index];

      // shallow clone of errorObj
      const errorObj = { ...this.state.errorObj };
      // deep clone of parsedEvalCriteriaConditionList
      errorObj.parsedEvalCriteriaConditionList = _.cloneDeep(errorObj.parsedEvalCriteriaConditionList);
      const evalCriteriaConditionErrorItem = errorObj.parsedEvalCriteriaConditionList[index];

      switch (type) {
        case 'blockLabel':
          evalCriteriaConditionItem.blockLabel = value;
          evalCriteriaConditionErrorItem.blockLabel.errorText = validateInput(value, {
            [validateInputTypes.required]: {
              value: evalCriteriaConditionErrorItem.blockLabel.required
            }
          });
          break;

        default:
          throw new Error('the update type ' + type + ' not found in alertRuleEvaluationConditionSection');
      }
      this.setState({
        savedObject,
        formValid: getFormValidity(errorObj),
        errorObj
      });
    },


    // add a 'conditionList' item
    addConditionListItem: (conditionBlockIndex) => {
      // shallow clone of savedObject
      const savedObject = { ...this.state.savedObject };
      // deep clone of parsedEvalCriteriaConditionList
      savedObject.parsedEvalCriteriaConditionList = _.cloneDeep(savedObject.parsedEvalCriteriaConditionList);
      const conditionList = savedObject.parsedEvalCriteriaConditionList[conditionBlockIndex].conditionList;

      // shallow clone of errorObj
      const errorObj = { ...this.state.errorObj };
      // deep clone of parsedEvalCriteriaConditionList
      errorObj.parsedEvalCriteriaConditionList = _.cloneDeep(errorObj.parsedEvalCriteriaConditionList);
      const conditionListErrorHandler = errorObj.parsedEvalCriteriaConditionList[conditionBlockIndex].conditionList;

      conditionList.push(_.cloneDeep(NEW_CONDITION_LIST_ITEM));
      conditionListErrorHandler.push({
        bmv: { ...this.errorObjectNotRequired },
        metric: { ...this.errorObjectNotRequired },
        value: { ...this.errorObjectRequried }
      });
      this.setState({ savedObject, errorObj });
    },

    // delete a 'conditionList' item
    deleteConditionListItem: (conditionBlockIndex, conditionListIndex) => {
      // shallow clone of savedObject
      const savedObject = { ...this.state.savedObject };
      // deep clone of parsedEvalCriteriaConditionList
      savedObject.parsedEvalCriteriaConditionList = _.cloneDeep(savedObject.parsedEvalCriteriaConditionList);
      const conditionList = savedObject.parsedEvalCriteriaConditionList[conditionBlockIndex].conditionList;

      // shallow clone of errorObj
      const errorObj = { ...this.state.errorObj };
      // deep clone of parsedEvalCriteriaConditionList
      errorObj.parsedEvalCriteriaConditionList = _.cloneDeep(errorObj.parsedEvalCriteriaConditionList);
      const conditionListErrorHandler = errorObj.parsedEvalCriteriaConditionList[conditionBlockIndex].conditionList;
      conditionList.splice(conditionListIndex, 1);
      conditionListErrorHandler.splice(conditionListIndex, 1);

      this.setState({
        savedObject,
        formValid: getFormValidity(errorObj),
        errorObj
      });
    },

    // update a 'conditionList' item
    updateConditionList: (conditionBlockIndex, conditionListIndex, type, value) => {
      // shallow clone of savedObject
      const savedObject = { ...this.state.savedObject };
      // deep clone of parsedEvalCriteriaConditionList
      savedObject.parsedEvalCriteriaConditionList = _.cloneDeep(savedObject.parsedEvalCriteriaConditionList);
      const conditionList = savedObject.parsedEvalCriteriaConditionList[conditionBlockIndex].conditionList;
      const conditionListItem = conditionList[conditionListIndex];

      // shallow clone of errorObj
      const errorObj = { ...this.state.errorObj };
      // deep clone of parsedEvalCriteriaConditionList
      errorObj.parsedEvalCriteriaConditionList = _.cloneDeep(errorObj.parsedEvalCriteriaConditionList);
      const conditionListErrorHandler = errorObj.parsedEvalCriteriaConditionList[conditionBlockIndex].conditionList;
      const conditionListErrorHandlerItem = conditionListErrorHandler[conditionListIndex];

      switch (type) {
        case 'source':
          conditionListItem.source = value;

          // whenever source is changed, we need to reset the value of other items in that row
          conditionListItem.comparison = ALERT_CONFIG_DEFAULTS.comparison;
          conditionListItem.value = '';
          conditionListItem.bmv = '';
          conditionListItem.metric = '';
          conditionListItem.selectedBmvMetricList = [];

          // when source is of type metric, bmv and metric fields are required
          conditionListErrorHandlerItem.bmv = { ...this.errorObjectNotRequired };
          conditionListErrorHandlerItem.metric = { ...this.errorObjectNotRequired };
          if (value === 'metric') {
            conditionListErrorHandlerItem.bmv = { ...this.errorObjectRequried };
            conditionListErrorHandlerItem.metric = { ...this.errorObjectRequried };
          }
          else if (value === 'severity') {
            conditionListItem.value = ALERT_CONFIG_DEFAULTS.severity;
          }
          break;

        case 'comparison':
          conditionListItem.comparison = value;
          break;

        case 'value':
          // duration takes value of type number
          // if it has content convert string to number
          if (value && conditionListItem.source === ALERT_CONFIG_DEFAULTS.duration) {
            value = parseInt(value);
            if (isNaN(value)) {
              throw new Error('error in alertRuleEvaluationConditionSection. source duration needs to be a number');
            }
          }
          conditionListItem.value = value;
          conditionListErrorHandlerItem.value.errorText = validateInput(value, {
            [validateInputTypes.required]: {
              value: conditionListErrorHandlerItem.value.required
            }
          });
          break;

        case 'bmv':
          let selectedBmvData = undefined;
          // iterate over vuMetricList and get the data for the selected bvm
          this.props.vuMetricList.forEach((bmv) => {
            if (bmv.title === value) {
              selectedBmvData = bmv;
              // get the metrics for a bmv and update the 'metrics' dropdown to display available metrics for selected bmv
              this.props.getMetricsForBmv(bmv.id).then((metricList) => {
                conditionListItem.selectedBmvMetricList = metricList;
                this.setState({
                  savedObject,
                  formValid: getFormValidity(errorObj),
                  errorObj
                });
              });
            }
          });
          conditionListItem.bmv = selectedBmvData;
          conditionListErrorHandlerItem.bmv.errorText = validateInput(value, {
            [validateInputTypes.required]: {
              value: conditionListErrorHandlerItem.bmv.required
            }
          });
          break;

        case 'metric':
          conditionListItem.metric = value;
          conditionListErrorHandlerItem.metric.errorText = validateInput(value, {
            [validateInputTypes.required]: {
              value: conditionListErrorHandlerItem.metric.required
            }
          });
          break;

        default:
          throw new Error('the update type ' + type + ' not found in alertRuleEvaluationConditionSection');
      }
      this.setState({
        savedObject,
        formValid: getFormValidity(errorObj),
        errorObj
      });
    },


    // add a 'actionList' item
    addActionListItem: (conditionBlockIndex) => {
      // shallow clone of savedObject
      const savedObject = { ...this.state.savedObject };
      // deep clone of parsedEvalCriteriaConditionList
      savedObject.parsedEvalCriteriaConditionList = _.cloneDeep(savedObject.parsedEvalCriteriaConditionList);
      const actionList = savedObject.parsedEvalCriteriaConditionList[conditionBlockIndex].actionList;

      // shallow clone of errorObj
      const errorObj = { ...this.state.errorObj };
      // deep clone of parsedEvalCriteriaConditionList
      errorObj.parsedEvalCriteriaConditionList = _.cloneDeep(errorObj.parsedEvalCriteriaConditionList);
      const actionListErrorHandler = errorObj.parsedEvalCriteriaConditionList[conditionBlockIndex].actionList;
      actionList.push(_.cloneDeep(NEW_ACTION_LIST_ITEM));
      actionListErrorHandler.push({
        value: { ...this.errorObjectRequried }
      });
      this.setState({ savedObject, errorObj });
    },

    // delete a 'actionList' item
    deleteActionListItem: (conditionBlockIndex, actionListIndex) => {
      // shallow clone of savedObject
      const savedObject = { ...this.state.savedObject };
      // deep clone of parsedEvalCriteriaConditionList
      savedObject.parsedEvalCriteriaConditionList = _.cloneDeep(savedObject.parsedEvalCriteriaConditionList);
      const actionList = savedObject.parsedEvalCriteriaConditionList[conditionBlockIndex].actionList;

      // shallow clone of errorObj
      const errorObj = { ...this.state.errorObj };
      // deep clone of parsedEvalCriteriaConditionList
      errorObj.parsedEvalCriteriaConditionList = _.cloneDeep(errorObj.parsedEvalCriteriaConditionList);
      const actionListErrorHandler = errorObj.parsedEvalCriteriaConditionList[conditionBlockIndex].actionList;

      actionList.splice(actionListIndex, 1);
      actionListErrorHandler.splice(actionListIndex, 1);
      this.setState({
        savedObject,
        formValid: getFormValidity(errorObj),
        errorObj
      });
    },

    // update a 'actionList' item
    updateActionList: (conditionBlockIndex, actionListIndex, type, value) => {
      // shallow clone of savedObject
      const savedObject = { ...this.state.savedObject };
      // deep clone of parsedEvalCriteriaConditionList
      savedObject.parsedEvalCriteriaConditionList = _.cloneDeep(savedObject.parsedEvalCriteriaConditionList);
      const actionList = savedObject.parsedEvalCriteriaConditionList[conditionBlockIndex].actionList;
      const actionListItem = actionList[actionListIndex];

      // shallow clone of errorObj
      const errorObj = { ...this.state.errorObj };
      // deep clone of parsedEvalCriteriaConditionList
      errorObj.parsedEvalCriteriaConditionList = _.cloneDeep(errorObj.parsedEvalCriteriaConditionList);
      const actionListErrorHandler = errorObj.parsedEvalCriteriaConditionList[conditionBlockIndex].actionList;
      const actionListErrorHandlerItem = actionListErrorHandler[actionListIndex];

      switch (type) {
        case 'action':
          actionListItem.action = value;

          // when actiontype changes reset all other fields
          // for different destination types we set their respective default values
          actionListItem.value = '';
          if (value === ALERT_CONFIG_DEFAULTS.actionListSet) {
            actionListItem.destination = ALERT_CONFIG_DEFAULTS.actionListSetDestination;
          } else if (value === ALERT_CONFIG_DEFAULTS.actionListAdd) {
            actionListItem.destination = ALERT_CONFIG_DEFAULTS.actionListAddDestination;
          } else if (value === ALERT_CONFIG_DEFAULTS.actionListRemove) {
            actionListItem.destination = ALERT_CONFIG_DEFAULTS.actionListRemoveDestination;
          }

          // when resetting all fields, if destination was set to severity, our value's defualt is 'warning'
          if (actionListItem.destination === 'severity') {
            actionListItem.value = ALERT_CONFIG_DEFAULTS.severity;
          }
          break;

        case 'destination':
          actionListItem.destination = value;

          // if destination was set to severity, our value's defualt is 'warning'
          if (actionListItem.destination === 'severity') {
            actionListItem.value = ALERT_CONFIG_DEFAULTS.severity;
          }
          break;

        case 'value':
          actionListItem.value = value;
          actionListErrorHandlerItem.value.errorText = validateInput(value, {
            [validateInputTypes.required]: {
              value: actionListErrorHandlerItem.value.required
            }
          });
          break;

        default:
          throw new Error('the update type ' + type + ' not found in alertRuleEvaluationConditionSection');
      }
      this.setState({
        savedObject,
        formValid: getFormValidity(errorObj),
        errorObj
      });
    },


    // add a 'channelList' item
    addChannelListItem: (conditionBlockIndex) => {
      // shallow clone of savedObject
      const savedObject = { ...this.state.savedObject };
      // deep clone of parsedEvalCriteriaConditionList
      savedObject.parsedEvalCriteriaConditionList = _.cloneDeep(savedObject.parsedEvalCriteriaConditionList);
      const channelList = savedObject.parsedEvalCriteriaConditionList[conditionBlockIndex].channelList;

      // shallow clone of errorObj
      const errorObj = { ...this.state.errorObj };
      // deep clone of parsedEvalCriteriaConditionList
      errorObj.parsedEvalCriteriaConditionList = _.cloneDeep(errorObj.parsedEvalCriteriaConditionList);
      const channelListErrorHandler = errorObj.parsedEvalCriteriaConditionList[conditionBlockIndex].channelList;
      channelList.push(_.cloneDeep(NEW_CHANNEL_LIST_ITEM));
      channelListErrorHandler.push({
        value: { ...this.errorObjectRequried }
      });
      this.setState({ savedObject, errorObj });
    },

    // delete a 'channelList' item
    deleteChannelListItem: (conditionBlockIndex, channelListIndex) => {
      // shallow clone of savedObject
      const savedObject = { ...this.state.savedObject };
      // deep clone of parsedEvalCriteriaConditionList
      savedObject.parsedEvalCriteriaConditionList = _.cloneDeep(savedObject.parsedEvalCriteriaConditionList);
      const channelList = savedObject.parsedEvalCriteriaConditionList[conditionBlockIndex].channelList;

      // shallow clone of errorObj
      const errorObj = { ...this.state.errorObj };
      // deep clone of parsedEvalCriteriaConditionList
      errorObj.parsedEvalCriteriaConditionList = _.cloneDeep(errorObj.parsedEvalCriteriaConditionList);
      const channelListErrorHandler = errorObj.parsedEvalCriteriaConditionList[conditionBlockIndex].channelList;

      channelList.splice(channelListIndex, 1);
      channelListErrorHandler.splice(channelListIndex, 1);

      this.setState({
        savedObject,
        formValid: getFormValidity(errorObj),
        errorObj
      });
    },

    // update a 'channelList' item
    updateChannelList: (conditionBlockIndex, channelListIndex, type, value) => {
      // shallow clone of savedObject
      const savedObject = { ...this.state.savedObject };
      // deep clone of parsedEvalCriteriaConditionList
      savedObject.parsedEvalCriteriaConditionList = _.cloneDeep(savedObject.parsedEvalCriteriaConditionList);
      const channelList = savedObject.parsedEvalCriteriaConditionList[conditionBlockIndex].channelList;
      const channelListItem = channelList[channelListIndex];

      // shallow clone of errorObj
      const errorObj = { ...this.state.errorObj };
      // deep clone of parsedEvalCriteriaConditionList
      errorObj.parsedEvalCriteriaConditionList = _.cloneDeep(errorObj.parsedEvalCriteriaConditionList);
      const channelListErrorHandler = errorObj.parsedEvalCriteriaConditionList[conditionBlockIndex].channelList;
      const channelListErrorHandlerItem = channelListErrorHandler[channelListIndex];
      switch (type) {
        case 'action':
          channelListItem.action = value;

          // whenever action changes reset value and channel
          // for channel we give its defualt value
          channelListItem.value = '';
          if (value === ALERT_CONFIG_DEFAULTS.channelListAdd) {
            channelListItem.channel = ALERT_CONFIG_DEFAULTS.channelListAddchannel;
          } else if (value === ALERT_CONFIG_DEFAULTS.channelListUpdate) {
            channelListItem.channel = ALERT_CONFIG_DEFAULTS.channelListUpdateChannel;
          } else if (value === ALERT_CONFIG_DEFAULTS.channelListMute) {
            channelListItem.channel = ALERT_CONFIG_DEFAULTS.channelListMuteChannel;
          }

          // add todo same as actionlist, dont give whatsapp to all
          // for action === 'mute' we disable the value input
          // hence value input is not required
          channelListErrorHandlerItem.value.required = true;
          if (value === 'mute' || channelListItem.channel === 'ticketingSystem') {
            channelListErrorHandlerItem.value = this.errorObjectNotRequired;
          }
          break;

        case 'channel':
          channelListItem.channel = value;

          // whenever channel changes reset value
          channelListItem.value = '';

          // for channel === 'ticketingSystem' we disable the value input
          // hence value input is not required
          // and we clear data in the value field
          channelListErrorHandlerItem.value.required = true;
          if (value === 'ticketingSystem' || channelListItem.action === 'mute') {
            channelListErrorHandlerItem.value = this.errorObjectNotRequired;
          }
          break;

        case 'value':
          channelListItem.value = value;
          const errorChecks = {};
          errorChecks[validateInputTypes.required] = {
            value: channelListErrorHandlerItem.value.required
          };

          // if channel is email, add email check
          // if channel is whatsApp, add mobileNumber check
          if (channelListItem.channel === 'emailId') {
            errorChecks[validateInputTypes.email] = { value: true };
          } else if (channelListItem.channel === 'whatsApp') {
            errorChecks[validateInputTypes.mobileNumber] = { value: true };
          }
          channelListErrorHandlerItem.value.errorText = validateInput(value, errorChecks);
          break;

        default:
          throw new Error('the update type ' + type + ' not found in alertRuleEvaluationConditionSection');
      }
      this.setState({
        savedObject,
        formValid: getFormValidity(errorObj),
        errorObj
      });
    },
  };

  // 4. alert rule evaluation script section
  alertRuleEvaluationScriptSection = {
    // update rule evaluation script
    updateScript: (value) => {
      // shallow clone of savedObject
      const savedObject = { ...this.state.savedObject };
      // deep clone of parsedEvalCriteria
      savedObject.parsedEvalCriteria = _.cloneDeep(savedObject.parsedEvalCriteria);

      // shallow clone of errorObj
      const errorObj = { ...this.state.errorObj };
      // deep clone of parsedEvalCriteria
      errorObj.parsedEvalCriteria = _.cloneDeep(errorObj.parsedEvalCriteria);

      savedObject.parsedEvalCriteria.expression = value;
      errorObj.parsedEvalCriteria.expression.errorText = validateInput(value, {
        [validateInputTypes.maxLength]: {
          value: 5000,
        }
      });

      this.setState({
        savedObject,
        formValid: getFormValidity(errorObj),
        errorObj
      });
    }
  };

  // 5. alert control section
  alertControlSection = {
    // containing the list of email groups
    allEmailGroups: this.props.allEmailGroups,

    // containing the list of reports
    allReportTitles: this.props.allReportTitles,

    // update alert control information
    updateAlertControlInfo: (type, value) => {
      // shallow clone of savedObject
      const savedObject = { ...this.state.savedObject };
      // shallow clone of errorObj
      const errorObj = { ...this.state.errorObj };
      switch (type) {
        case 'enableAlarmMode':
          savedObject.enableAlarmMode = !savedObject.enableAlarmMode;
          break;

        case 'enableThrottle':
          savedObject.enableThrottle = !savedObject.enableThrottle;
          // if false, reset all values
          if (!savedObject.enableThrottle) {
            savedObject.throttleDuration = '';
            savedObject.throttleDurationType = '';
            errorObj.throttleDuration = { ...this.errorObjectNotRequired };
          } else {
            // assign a default duration type
            savedObject.throttleDurationType = ALERT_CONFIG_DEFAULTS.throttleDurationType;
            savedObject.throttleDuration = ALERT_CONFIG_DEFAULTS.throttleDuration;
            errorObj.throttleDuration = { ...this.errorObjectRequried };
          }
          break;

        case 'throttleDuration':
          // if it has content convert string to number
          if (value) {
            value = parseInt(value);
          }
          savedObject.throttleDuration = value;

          errorObj.throttleDuration.errorText = validateInput(value, {
            [validateInputTypes.required]: {
              value: errorObj.throttleDuration.required
            },
            [validateInputTypes.minRange]: {
              value: 1,
              errorText: `Time value cannot be less than 1`
            }
          });
          break;

        case 'throttleDurationType':
          savedObject.throttleDurationType = value;
          break;

        case 'enableAlertForADay':
          // deep clone parsedWeekdaysList
          savedObject.parsedWeekdaysList = _.cloneDeep(savedObject.parsedWeekdaysList);
          savedObject.parsedWeekdaysList.forEach((day) => {
            if (day.name === value) {
              day.selected = !day.selected;
            }
          });
          break;

        case 'enableAlertDuration':
          // deep clone parsedWeekdaysList
          savedObject.parsedWeekdaysList = _.cloneDeep(savedObject.parsedWeekdaysList);
          savedObject.activeAlertCheck = !savedObject.activeAlertCheck;
          // if false, reset all values
          if (!savedObject.activeAlertCheck) {
            savedObject.activeStartTime = '';
            errorObj.activeStartTime = { ...this.errorObjectNotRequired };
            savedObject.activeEndTime = '';
            errorObj.activeEndTime = { ...this.errorObjectNotRequired };
            savedObject.parsedWeekdaysList.forEach(val => val.selected = true);
          } else {
            errorObj.activeStartTime = { ...this.errorObjectRequried };
            errorObj.activeEndTime = { ...this.errorObjectRequried };
          }
          break;

        case 'startTime':
          savedObject.activeStartTime = value;
          errorObj.activeStartTime.errorText = validateInput(value, {
            [validateInputTypes.required]: {
              value: errorObj.activeStartTime.required
            }
          });
          break;

        case 'endTime':
          savedObject.activeEndTime = value;
          errorObj.activeEndTime.errorText = validateInput(value, {
            [validateInputTypes.required]: {
              value: errorObj.activeEndTime.required
            }
          });
          break;

        case 'enableAlertAdvancedConfig':
          savedObject.enableAdvancedConfig = !savedObject.enableAdvancedConfig;
          // if false, reset all values
          if (!savedObject.enableAdvancedConfig) {
            savedObject.advancedConfiguration = '';
            errorObj.advancedConfiguration = { ...this.errorObjectNotRequired };
          } else {
            errorObj.advancedConfiguration = { ...this.errorObjectRequried };
          }
          break;

        case 'advancedConfig':
          savedObject.advancedConfiguration = value;
          errorObj.advancedConfiguration.errorText = validateInput(value, {
            [validateInputTypes.required]: {
              value: errorObj.advancedConfiguration.required,
            },
            [validateInputTypes.maxLength]: {
              value: 500,
            }
          });
          break;

        case 'enableAlertTicket':
          savedObject.alertByTicket = !savedObject.alertByTicket;
          break;

        case 'enableAlertWhatsapp':
          savedObject.alertByWhatsapp = !savedObject.alertByWhatsapp;
          // if false, reset all values
          if (!savedObject.alertByWhatsapp) {
            savedObject.alertWhatsappNumber = '';
            errorObj.alertWhatsappNumber = { ...this.errorObjectNotRequired };
          } else {
            errorObj.alertWhatsappNumber = { ...this.errorObjectRequried };
          }
          break;

        case 'whatsappNumber':
          savedObject.alertWhatsappNumber = value;
          errorObj.alertWhatsappNumber.errorText = validateInput(value, {
            [validateInputTypes.required]: {
              value: errorObj.alertWhatsappNumber.required,
            },
            [validateInputTypes.mobileNumber]: {
              value: true
            },
            [validateInputTypes.maxLength]: {
              value: 512,
            }
          });
          break;

        case 'enableAlertEmail':
          // deep clone alertEmailGroupHandler
          savedObject.alertEmailGroupHandler = _.cloneDeep(savedObject.alertEmailGroupHandler);
          savedObject.alertByEmail = !savedObject.alertByEmail;
          // if false, reset all values
          if (!savedObject.alertByEmail) {
            savedObject.alertEmailId = '';
            errorObj.alertEmailId = { ...this.errorObjectNotRequired };
            savedObject.alertEmailGroupHandler = [];
            errorObj.alertEmailGroupHandler = { ...this.errorObjectNotRequired };
            savedObject.alertEmailBody = '';
            errorObj.alertEmailBody = { ...this.errorObjectNotRequired };
          } else {
            errorObj.alertEmailId = { ...this.errorObjectRequried };
            errorObj.alertEmailGroupHandler = { ...this.errorObjectRequried };
            errorObj.alertEmailBody = { ...this.errorObjectNotRequired };
          }
          break;

        case 'alertEmailId':
          // either alertEmailId or alertEmailGroupList is requried
          // this field is required if 'alertEmailGroupHandler' is empty
          const isAlertEmailIdRequired = !savedObject.alertEmailGroupHandler.length;
          errorObj.alertEmailId.required = isAlertEmailIdRequired;

          // if 'alertEmailId' is required, clear the error for 'alertEmailGroupHandler'
          if (isAlertEmailIdRequired) {
            errorObj.alertEmailGroupHandler = { ...this.errorObjectNotRequired };
          }

          savedObject.alertEmailId = value;
          errorObj.alertEmailId.errorText = validateInput(value, {
            [validateInputTypes.required]: {
              value: errorObj.alertEmailId.required,
              errorText: 'Either "Recipient List" or "Email Group" is required'
            },
            [validateInputTypes.email]: {
              value: true
            },
            [validateInputTypes.maxLength]: {
              value: 512,
            }
          });
          break;

        case 'alertEmailGroupList':
          // either alertEmailId or alertEmailGroupList is requried
          // this field is required if 'alertEmailId' is empty
          const isAlertEmailGroupListRequired = !savedObject.alertEmailId;
          errorObj.alertEmailGroupHandler.required = isAlertEmailGroupListRequired;

          // if 'alertEmailGroupList' is required, clear the error for 'alertEmailId'
          if (isAlertEmailGroupListRequired) {
            errorObj.alertEmailId = { ...this.errorObjectNotRequired };
          }

          // deep clone alertEmailGroupHandler
          savedObject.alertEmailGroupHandler = _.cloneDeep(savedObject.alertEmailGroupHandler);
          savedObject.alertEmailGroupHandler = value;
          errorObj.alertEmailGroupHandler.errorText = validateInput(value, {
            [validateInputTypes.required]: {
              value: errorObj.alertEmailGroupHandler.required,
              errorText: 'Either "Recipient List" or "Email Group" is required'
            }
          });
          break;

        case 'alertEmailBody':
          savedObject.alertEmailBody = value;
          errorObj.alertEmailBody.errorText = validateInput(value, {
            [validateInputTypes.required]: {
              value: errorObj.alertEmailBody.required
            },
            [validateInputTypes.maxLength]: {
              value: 5000,
            }
          });
          break;

        case 'enableAlertRunbook':
          savedObject.enable_runbook_automation = !savedObject.enable_runbook_automation;
          // if false, reset all values
          if (!savedObject.enable_runbook_automation) {
            savedObject.runbook_script = '';
            errorObj.runbook_script = { ...this.errorObjectNotRequired };
          } else {
            errorObj.runbook_script = { ...this.errorObjectRequried };
          }
          break;

        case 'alertRunbookScript':
          savedObject.runbook_script = value;
          errorObj.runbook_script.errorText = validateInput(value, {
            [validateInputTypes.required]: {
              value: errorObj.runbook_script.required
            },
            [validateInputTypes.maxLength]: {
              value: 255,
            }
          });
          break;

        case 'enableAlertAnsible':
          savedObject.enable_ansible_playbook = !savedObject.enable_ansible_playbook;
          // if false, reset all values
          if (!savedObject.enable_ansible_playbook) {
            savedObject.ansible_playbook_name = '';
            errorObj.ansible_playbook_name = { ...this.errorObjectNotRequired };
            savedObject.ansible_playbook_options = '';
            errorObj.ansible_playbook_options = { ...this.errorObjectNotRequired };
          } else {
            errorObj.ansible_playbook_name = { ...this.errorObjectRequried };
            errorObj.ansible_playbook_options = { ...this.errorObjectRequried };
          }
          break;

        case 'ansiblePlaybookName':
          savedObject.ansible_playbook_name = value;
          errorObj.ansible_playbook_name.errorText = validateInput(value, {
            [validateInputTypes.required]: {
              value: errorObj.ansible_playbook_name.required,
            },
            [validateInputTypes.maxLength]: {
              value: 255,
            }
          });
          break;

        case 'ansiblePlaybookOptions':
          savedObject.ansible_playbook_options = value;
          errorObj.ansible_playbook_options.errorText = validateInput(value, {
            [validateInputTypes.maxLength]: {
              value: 255,
            }
          });
          break;

        case 'enableAlertReport':
          // deep clone alertReportListHandler
          savedObject.alertReportListHandler = _.cloneDeep(savedObject.alertReportListHandler);
          savedObject.alertByReport = !savedObject.alertByReport;
          // if false, reset all values
          if (!savedObject.alertByReport) {
            savedObject.alertReportListHandler = [];
            errorObj.alertReportListHandler = { ...this.errorObjectNotRequired };
          } else {
            errorObj.alertReportListHandler = { ...this.errorObjectRequried };
          }
          break;

        case 'alertReportList':
          // deep clone alertReportListHandler
          savedObject.alertReportListHandler = _.cloneDeep(savedObject.alertReportListHandler);
          savedObject.alertReportListHandler = value;
          errorObj.alertReportListHandler.errorText = validateInput(value, {
            [validateInputTypes.required]: {
              value: errorObj.alertReportListHandler.required
            }
          });
          break;

        default:
          throw new Error('the update type ' + type + ' not found in alertControlSection');
      }
      this.setState({
        savedObject,
        formValid: getFormValidity(errorObj),
        errorObj
      });
    }
  };

  // dynamically calculate the height of the page
  checkHeightDynamically() {
    setTimeout(function () {
      const topbarHeight = $('.topbar-container').height();
      const vunetTabsHeight = $('.content-header-wrapper').height();
      const alertHeaderConatinerHeight = $('.alert-titlebar-container').height();
      const heightToSet = $(window).height() - topbarHeight - vunetTabsHeight - alertHeaderConatinerHeight;
      const heightToSetOnFullscreenMode = $(window).height() - vunetTabsHeight - alertHeaderConatinerHeight;
      const elementToSelect = parent.document;
      if (elementToSelect.fullscreen || elementToSelect.webkitIsFullScreen || elementToSelect.mozFullScreen) {
        $('.alert-condition-tab-wrapper').height(heightToSetOnFullscreenMode - 50);
      }
      else {
        $('.alert-condition-tab-wrapper').height(heightToSet - 50);
      }
    }, 10);
  }

  // Set the id of the selected tab to display its contents
  onTabChange = id => {
    this.setState({
      currentTabId: id
    });
  };

  // switch used to enable/disable the alert
  onEnableAlert = () => {
    this.setState({
      savedObject: {
        ...this.state.savedObject,
        enableAlert: !this.state.savedObject.enableAlert
      }
    });
  }

  // when userPermissions form the title bar is clicked
  onUserPermissions = () => {
    this.setState({
      displayUserPermission: !this.state.displayUserPermission
    });
    // update the height of the page
    this.checkHeightDynamically();
  }

  updateUserPermission = (allowedRoles) => {
    // update the state
    this.setState({
      savedObject: {
        ...this.state.savedObject,
        parsedAllowedRolesJSON: allowedRoles
      }
    });
  }

  // update the alert title
  updateAlertTitle = (value) => {
    const errorObj = { ...this.state.errorObj };
    errorObj.title = { ...this.state.errorObj.title };

    // get title error text
    errorObj.title.errorText = validateInput(value, {
      [validateInputTypes.required]: {
        value: errorObj.title.required
      },
      [validateInputTypes.maxLength]: {
        value: 65
      },
      [validateInputTypes.regex]: {
        value: RegExp(/^[^#?%\/\\]+$/),
        errorText: 'Title content must not contain /, \, #, %, ?.'
      }
    });

    this.setState({
      newAlertTitle: value,
      errorObj: errorObj,
      formValid: getFormValidity(errorObj),
    });
  }

  // reset the alert page, update data to previously saved alert
  resetPage = () => {
    this.setState({
      savedObject: this.state.savedObjectBackup,
      errorObj: this.state.errorHandlerBackup
    });
  }

  // method to call when save button is clicked
  onSave = () => {
    // if its a new alert
    // 1. we need to display/hide the SaveAsConfig container
    // 2. maintain a flag 'isSaveClicked' to disable save-as button
    if (this.props.isNewAlert) {
      // invert save button clicked state
      this.setState({
        isSaveClicked: !this.state.isSaveClicked
      }, () => {
        // 1. validate the form and display error fields if any
        // 2. display/hide the SaveAsConfig container
        this.toggleSaveAsContainer();
      });
    }
    // if its an existing alert
    // 1. validate the form and display error fields if any
    // 2. if no erros, make a final save
    else {
      this.performFinalSave();
    }
  }

  // when final save-as gets clicked
  onSaveAs = () => {
    // invert save-as button clicked state
    this.setState({
      isSaveAsClicked: !this.state.isSaveAsClicked
    }, () => {
      // 1. validate the form and display error fields if any
      // 2. display/hide the SaveAsConfig container
      this.toggleSaveAsContainer();
    });
  }

  // We do two things here
  // 1. validate the form and display error fields if any
  // 2. display/hide the SaveAsConfig container
  toggleSaveAsContainer = () => {
    const { valid, errorObject } = getFormErrorField(this.state.errorObj, this.state.savedObject);

    // invert the saveAsContainer's display state
    const displaySaveAsConfig = !this.state.displaySaveAsConfig;

    this.setState({
      newAlertTitle: this.state.savedObject.title,
      errorObj: errorObject,
      formValid: valid,
      displaySaveAsConfig: displaySaveAsConfig
    });
    // update the height of the page
    this.checkHeightDynamically();
  }

  // We do two things here
  // 1. validate the form and display error fields if any
  // 2. if no erros, make a final save to send response to backend
  performFinalSave = () => {
    const { valid, errorObject } = getFormErrorField(this.state.errorObj, this.state.savedObject);
    this.setState({
      errorObj: errorObject,
      formValid: valid,
    });
    // If the form is valid, use callback to save the alert
    // 1. we close it perform final save
    // 2. reset states isSaveClicked and isSaveAsClicked
    // 3. push our latest alert title into savedObject
    // 4. perform final save
    if (valid) {
      this.setState({
        savedObject: {
          ...this.state.savedObject,
          title: this.state.newAlertTitle
        },
        displaySaveAsConfig: false,
        isSaveAsClicked: false,
        isSaveClicked: false
      }, () => {
        // we need to clone the state when passing its value on the callback
        // or else it will be passed as a reference and the callback function is capable of updating the state
        this.props.saveAlert(_.cloneDeep(this.state.savedObject));
      });
    }
  }

  getUserPermissionMeta = () => {
    const currentUser = chrome.getCurrentUser();
    const owner = { 'name': currentUser[0], 'role': currentUser[1], 'permission': currentUser[2] };
    return { owner };
  }

  render() {
    const {
      canUserModifyAlert
    } = this.props;
    const {
      currentTabId,
      savedObject,
      errorObj,
      formValid,
      displayUserPermission,
      displaySaveAsConfig,
      newAlertTitle,
      isSaveAsClicked,
      isSaveClicked,
      isDiscardEnabled,
      showDiscardConformationPopup
    } = this.state;
    return (
      <div className="content-wrapper container-fluid">
        <div className="alert-titlebar-wrapper">
          {/* Title Bar container */}
          <div className="alert-titlebar-container">
            <div className="titlebar-header">
              <span className="alert-name">{savedObject.title}</span>

              <div className="header-spacer" />
              { canUserModifyAlert  &&
                <div
                  className="user-permissions-container titlebar-button hover-effect"
                  onClick={this.onUserPermissions}
                >

                  <i className="button-icon icon-advanced-config" />
                  <span className="icon-text">User Permissions</span>
                </div>
              }


              <div
                // if isDiscardEnabled flag is false, disable the button
                className={'discard-button-container titlebar-button hover-effect ' +
                  (!isDiscardEnabled ? 'disabledIcon' : null)}
                onClick={() => {
                  if (isDiscardEnabled) {
                    this.setState({ showDiscardConformationPopup: true });
                  }
                }}
              >
                <i className="button-icon icon-discard" />
                <span className="icon-text">Discard</span>
              </div>

              {/* hide save button if user doesn't have permission to modify */}
              {canUserModifyAlert &&
                <div
                  // if form
                  // 1) is invalid or
                  // 2) save-as button is clicked
                  // we disable save button
                  className={'save-button-container titlebar-button hover-effect ' +
                    ((!formValid || isSaveAsClicked) ? 'disabledIcon' : null)
                  }
                  onClick={() => {
                    // if form
                    // 1) is valid or
                    // 2) save-as button was not clicked
                    // we can perform click operation
                    if (formValid && !isSaveAsClicked) {
                      this.onSave();
                    }
                  }}
                >
                  <i className="button-icon icon-save" />
                  <span className="icon-text">Save</span>
                </div>
              }
              {/* hide save button if user doesn't have permission to modify */}
              {canUserModifyAlert &&
                <div
                  // if form
                  // 1) is invalid or
                  // 2) save button is clicked
                  // we disable save button
                  className={'save-button-container titlebar-button hover-effect ' +
                    ((!formValid || isSaveClicked) ? 'disabledIcon' : null)
                  }
                  onClick={() => {
                    // if form
                    // 1) is valid or
                    // 2) save button was not clicked or
                    // we can perform click operation
                    if (formValid && !isSaveClicked) {
                      this.onSaveAs();
                    }
                  }}
                >
                  <i className="button-icon icon-save" />
                  <span className="icon-text">Save As</span>
                </div>
              }
            </div>

            {/* SaveAs Container */}
            {displaySaveAsConfig &&
              <div className="saveas-wrapper">
                <div className="saveas-container">
                  <input
                    className={'form-control ' + (errorObj.title.errorText && 'errorInput')}
                    type="text"
                    value={newAlertTitle}
                    onChange={(e) => { this.updateAlertTitle(e.target.value); }}
                  />
                  <div
                    // if form is invalid or save button is clicked, we disable save-as button
                    className={'save-button-container ' + (!formValid ? 'disabledIcon' : null)}
                    onClick={() => {
                      if (formValid) {
                        this.performFinalSave();
                      }
                    }}
                  >
                    <i className="save-icon icon-save-file-option" />
                    <span className="button-title">Save</span>
                  </div>
                </div>
                {errorObj.title.errorText &&
                  (
                    <div className="save-as-error-text errorFieldText">{errorObj.title.errorText}</div>
                  )
                }
              </div>
            }

            {/* Advanced config Container */}
            {displayUserPermission &&
              <VunetUserPermissions
                owner={this.getUserPermissionMeta().owner}
                allowedRoles={savedObject.parsedAllowedRolesJSON}
                onChange={this.updateUserPermission.bind(this)}
              />
            }
          </div>
        </div>

        {/* Tabs Header */}
        <div className="content-header-wrapper">
          <div className="content-header row">
            <div className="header-tabs ">
              <VunetTab
                tabs={this.tabs}
                landingTab={this.landingTab}
                switchTab={this.onTabChange.bind(this)}
              />
            </div>

            <div className="header-spacer" />
            {/* Execute button should not visible for people who doe not have permission
            to modify the alert rules */}
            { canUserModifyAlert &&
            <div className="execute-button-container hover-effect">
              <button
                className="form-control execute-button"
                onClick={this.props.executeLogs}
              >
                Execute
              </button>
            </div>
            }

            <div className="header-switch-container">
              <VunetSwitch
                onChange={this.onEnableAlert.bind(this)}
                checked={savedObject.enableAlert}
              />
              <span className="header-switch-text">
                Enable Alert
              </span>
            </div>
          </div>
        </div>
        {/* Tabs Body */}
        <div className="content-body">
          {/* display the respective tab according the id */}
          {currentTabId === ALERT_CONDITION_TAB &&
            <AlertConditionTab
              alertConditionSectionObj={this.alertConditionSection}
              alertRuleEvaluationScriptSectionObj={this.alertRuleEvaluationScriptSection}
              alertRuleEvaluationConditionSectionObj={this.alertRuleEvaluationConditionSection}
              alertAboutSectionObj={this.alertAboutSection}
              alertControlSectionObj={this.alertControlSection}
              alertConfig={savedObject}
              errorObj={errorObj}
            />
          }
        </div>

        {/* A popup to confirm if user wants to discard all changes */}
        <VunetModal
          showModal={showDiscardConformationPopup}
          data={{
            isForm: false,
            title: 'Discard',
            message: '<span>Are you sure you want to discard all unsaved changes?</span>'
          }}
          onClose={() => {
            this.setState({ showDiscardConformationPopup: false });
          }}
          onSubmit={() => {
            this.setState({ showDiscardConformationPopup: false });
            this.resetPage();
          }}
        />
      </div>
    );
  }
}

AlertDetails.propTypes = {
  savedObject: PropTypes.object, // containing the saved alert information
  isNewAlert: PropTypes.bool, // flag which denotes if its a new alert
  vuMetricList: PropTypes.array, // containing the list of BMVs
  getMetricsForBmv: PropTypes.func, // contains callback method for getting metrics for corresponding BMV
  allEmailGroups: PropTypes.array, // containing the list of email groups
  allReportTitles: PropTypes.array, // containing the list of reports
  errorObj: PropTypes.object, // form error object
  previewMetric: PropTypes.func, // contains callback method for displaying metrics for corresponding BMV
  saveAlert: PropTypes.func, // callback to save the alert
  canUserModifyAlert: PropTypes.bool, // user permission, if user has permission to modify alert
  executeLogs: PropTypes.func, // callback function to execute alert
};
