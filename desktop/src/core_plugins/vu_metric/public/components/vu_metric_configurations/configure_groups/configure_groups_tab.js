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

import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import createSelectHandler from '../../lib/create_select_handler';
import createTextHandler from '../../lib/create_text_handler';
import { validateInput, validateInputTypes } from 'ui/utils/vunet_form_validator_utils';
import { vuMetricConstants } from '../../lib/vu_metric_constants';
import './configure_groups_tab.less'

class ConfigureGroupsTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      intersectionList: [],
      configureGroupsHelp: false
    }
  }

  componentDidMount = () => {
    this.getIntersectionList();
  }

  // This fucntion will be used to add agroup
  addConfigureGroupsBlock = (index) => {
    const newModelAfterAddingBucket = _.cloneDeep(this.props.model)
    const newErrorModel = _.cloneDeep(this.props.errorModel)
    newModelAfterAddingBucket.aggregations.splice(index + 1, 0, vuMetricConstants.BUCKET_DEFAULTS);
    newModelAfterAddingBucket.enableTableFormat = true;
    newModelAfterAddingBucket.tabularFormat = 'horizontal';
    this.props.onChange(newModelAfterAddingBucket);

    // we are populating the errorHandler object here
    newErrorModel.aggregations.splice(index + 1, 0, _.cloneDeep(vuMetricConstants.BUCKET_ERROR_DEFAULTS));
    this.props.onErrorChange(newErrorModel);
  }

  // This fucntion will be used to delete a group
  deleteConfigureGroupsBlock = (index) => {
    const newModelAfterDeletingBucket = _.cloneDeep(this.props.model);
    const newErrorModel = _.cloneDeep(this.props.errorModel);
    newModelAfterDeletingBucket.aggregations.splice(index, 1);
    this.props.onChange(newModelAfterDeletingBucket);

    newErrorModel.aggregations.splice(index, 1);
    this.props.onErrorChange(newErrorModel);
  }

  // This function will be used to the move the bucket up in priority along with moving the error handler object
  movePriorityUpForGroup = (index) => {
    const newModelAfterMovingBucket = _.cloneDeep(this.props.model)
    const newErrorModelAfterMovingBucket = _.cloneDeep(this.props.errorModel)
    newModelAfterMovingBucket.aggregations.splice(index - 1, 0, newModelAfterMovingBucket.aggregations.splice(index, 1)[0]);
    newErrorModelAfterMovingBucket.aggregations.splice(index - 1, 0, newErrorModelAfterMovingBucket.aggregations.splice(index, 1)[0]);
    this.props.onChange(newModelAfterMovingBucket);
    this.props.onErrorChange(newErrorModelAfterMovingBucket);
  }

  // This function will be used to the move the bucket low in priority along with moving the error handler object
  movePriorityDownForGroup = (index) => {
    const newModelAfterMovingBucket = _.cloneDeep(this.props.model)
    const newErrorModelAfterMovingBucket = _.cloneDeep(this.props.errorModel)
    newModelAfterMovingBucket.aggregations.splice(index + 1, 0, newModelAfterMovingBucket.aggregations.splice(index, 1)[0]);
    newErrorModelAfterMovingBucket.aggregations.splice(index + 1, 0, newErrorModelAfterMovingBucket.aggregations.splice(index, 1)[0]);
    this.props.onChange(newModelAfterMovingBucket);
    this.props.onErrorChange(newErrorModelAfterMovingBucket);
  }

  // this function will be used to handle collapsing and expanding of group block
  collapseExpandGroupBlock = (bucket, index) => {
    const model = _.cloneDeep(this.props.model);
    const bucketToChange = bucket;
    if (bucketToChange.collapsed) {
      bucketToChange.collapsed = false;
      model.aggregations.splice(index, 1, bucketToChange);
      this.props.onChange(model);
    }
    else if (!bucketToChange.collapsed) {
      bucketToChange.collapsed = true;
      model.aggregations.splice(index, 1, bucketToChange);
      this.props.onChange(model);
    }
  }

  // This function will be used to get the interesection list of all the fields 
  // in all the configured index pattterns
  getIntersectionList = async () => {
    let indexPatternsForAllMetrics = []
    this.props.model.metrics.map((metric) => {
      const indexPatternDeatils = this.props.vis.API.indexPatterns.get(metric.index.id)
      indexPatternsForAllMetrics.push(indexPatternDeatils);
    })
    // ALl aaggretable fields of all selected index-patterns are stored in indexPatternsFieldsForAllMetricsResolved
    const indexPatternsFieldsForAllMetricsResolved = [];
    await Promise.all(indexPatternsForAllMetrics).then(resp => {
      resp.map((res) => {
        indexPatternsFieldsForAllMetricsResolved.push(res.fields.filter(function (field) {
          if (field.aggregatable) {
            return field;
          }
        }))
      })
    });

    // Here we are taking an intersection of all the comon fields in all the fields in selcted index patterns
    let intersectionList = indexPatternsFieldsForAllMetricsResolved[0];
    indexPatternsFieldsForAllMetricsResolved.map((singleIndexPatternFields) => {
      intersectionList = intersectionList.filter((field) => {
        let flag = false;
        singleIndexPatternFields.map((singlePatternField) => {
          if (singlePatternField.name == field.name) {
            flag = true;
          }
        })
        return flag
      })
    })
    this.setState({
      intersectionList: intersectionList
    });
  }


  /// This function will be used to set the field, fieldType and index of the field and this will
  // again call handleChangeForBuckets which will go into the else loop to update the model with
  // the latest values. The handleChangeForBuckets from here will go to else loop because the length
  // of the keys will be 3 
  initializeFieldAndFieldType = (part, index) => {
    this.state.intersectionList.map((field) => {
      if (field.name == part.field) {

        // This has been done to initialze the Interval as hourly and the customInterval as 2h when a field
        // of type date is being selected
        if (field.type == 'date') {
          let partWithIntervalAndCustomInterval = { field: field.name, fieldType: field.type, index: field.indexPattern.id, interval: 'hourly', customInterval: '2h' }
          this.handleChangeForBuckets(partWithIntervalAndCustomInterval, index);
        }
        else {
          let part = { field: field.name, fieldType: field.type, index: field.indexPattern.id }
          this.handleChangeForBuckets(part, index);
        }
      }
    })

    // This will be required when the user selects the 1st option with is empty
    if (part.field === '') {
      let part = { field: '', fieldType: '', index: '' }
      this.handleChangeForBuckets(part, index);
    }
  }

  //  This function will be used to handle the changes related to text and select change for buckets
  handleChangeForBuckets = (part, index) => {
    const key = Object.keys(part);
    const errorModel = _.cloneDeep(this.props.errorModel);
    // part will always be a single key value pair object
    // This has been used to set the field, fieldType and index of the field 
    // the if will only be called when field id updated and inside if we are
    // calling another function to update fieldType for field (i.e. number string etc)
    // and index for the field
    if (key.length == 1 && key[0] === 'field') {
      this.initializeFieldAndFieldType(part, index);
    }
    else {
      const model = _.cloneDeep(this.props.model);
      const bucketToChange = this.props.model.aggregations[index];
      const changedBucket = _.assign({}, bucketToChange, part);
      model.aggregations.splice(index, 1, changedBucket);
      this.props.onChange(model);
    }

    if (key.length == 1 && key[0] === 'field') {
      errorModel.aggregations[index].field.errorText = validateInput(part.field,
        {
          [validateInputTypes.required]: {
            value: true,
            errorText: 'This field is required.'
          },
        }
      )
    }
    else if (key.length == 1 && key[0] === 'size') {
      errorModel.aggregations[index].size.errorText = validateInput(part.size,
        {
          [validateInputTypes.required]: {
            value: true,
            errorText: 'This field is required.'
          },
          [validateInputTypes.maxRange]: {
            value: vuMetricConstants.BUCKETING_SIZE,
            errorText: 'Maximun bucketing size should be less than or equal to' + vuMetricConstants.BUCKETING_SIZE + '.'
          },
          [validateInputTypes.minRange]: {
            value: 1,
            errorText: 'Minimum bucketing size is 1.'
          }
        }
      )
    }
    else if (key.length == 1 && key[0] === 'customLabel') {
      errorModel.aggregations[index].customLabel.errorText = validateInput(part.customLabel,
        {
          [validateInputTypes.maxLength]: {
            value: 70,
            errorText: 'Bucketing label cannot exceed 70 characters.'
          }
        }
      )
    }

    else if (key.length == 1 && key[0] === 'customInterval') {
      errorModel.aggregations[index].customInterval.errorText = validateInput(part.customInterval,
        {
          [validateInputTypes.required]: {
            value: true,
            errorText: 'This field is required.'
          }
        }
      )
    }

    if (key.length == 1 && key[0] === 'interval' && part.interval === 'custom') {
      errorModel.aggregations[index].customInterval = {
        errorText: '',
        required: true
      }
      errorModel.aggregations[index].customInterval.errorText = validateInput(this.props.model.aggregations[index].customInterval,
        {
          [validateInputTypes.required]: {
            value: true,
            errorText: 'This field is required.'
          }
        }
      )
    }

    if (key.length == 1 && key[0] === 'field' || (key.length == 1 && key[0] === 'interval' && part.interval !== 'custom')) {
      if (errorModel.aggregations[index].customInterval) {
        errorModel.aggregations[index] = vuMetricConstants.BUCKET_ERROR_DEFAULTS;
      }
    }

    this.props.onErrorChange(errorModel)

  }

  render() {
    const handleSelectChange = createSelectHandler(this.handleChangeForBuckets);
    const handleTextChange = createTextHandler(this.handleChangeForBuckets);
    const errorModel = _.cloneDeep(this.props.errorModel);

    const bucketIntersectionOptions = this.state.intersectionList.map((field) =>
      <option
        key={field.name}
        value={field.name}
        className="bucket-intersection-field-option"
      >
        {field.name}
      </option>
    );

    const generateConfigureGroupsBlock = (bucket, index) => {
      return (
        <div className="configure-group-block-container" key={index} >
          <div className="configure-group-header-functions-row">
            <div className="left-side-functions">
              <div className="group-expander-icon">
                <i className={(bucket.collapsed ? 'icon-arrow-down' : 'icon-arrow-up')}
                  onClick={() => this.collapseExpandGroupBlock(bucket, index)}></i>
              </div>
              {bucket.customLabel ?
                <div className="group-name">
                  {bucket.customLabel}
                </div>
                :
                <div className='dummy-group-name'>
                  Group Name
                </div>
              }
              <div className="vu-group-icons-container">
                {this.props.model.aggregations.length > 1 &&
                  <div className="change-group-priority">
                    <i
                      className={'icon-arrow-up ' +
                        (index === 0 ? 'disabled-icon' : null)
                      }
                      onClick={() => this.movePriorityUpForGroup(index)}></i>
                    <i
                      className={'icon-arrow-down ' +
                        (index === this.props.model.aggregations.length - 1 ? 'disabled-icon' : null)
                      }
                      onClick={() => this.movePriorityDownForGroup(index)}></i>
                  </div>
                }
                <div className="delete-group">
                  <i className="icon-delete" onClick={() => this.deleteConfigureGroupsBlock(index)} ></i>
                </div>
                {(this.props.model.aggregations.length < 4) ?
                  (
                    <div className="add-new-group">
                      <i
                        className={'icon-add-plus ' +
                          ((this.props.model.aggregations.length > 1 && this.props.model.actionButtonsData.length >= 1) ? 'disabled-icon' : null)
                        }
                        onClick={() => {
                          (this.props.model.aggregations.length > 1 && this.props.model.actionButtonsData.length >= 1) ?
                            null
                            :
                            this.addConfigureGroupsBlock(index)
                        }
                        }
                      ></i>
                      <span
                        className={
                          ((this.props.model.aggregations.length > 1 && this.props.model.actionButtonsData.length >= 1) ? 'disabled-icon' : null)
                        }
                      >Add Sub Groups</span>
                    </div>
                  )
                  :
                  null
                }
              </div>
            </div>
          </div>
          {
            !bucket.collapsed &&
            (
              <div className="bucket-configuration-row row">
                <div className="col-sm-4 form-group">
                  <label htmlFor="bucketFieldName"> Field
                    <sup> *</sup>
                  </label>
                  <select
                    className="bucket-field form-control"
                    id={'bucketFieldName' + index}
                    placeholder="Select the grouping field."
                    value={bucket.field}
                    onChange={handleSelectChange('field', index)}
                  >
                    <option key='none' value=''></option>
                    {bucketIntersectionOptions}
                  </select>
                  {errorModel.aggregations[index].field.errorText &&
                    (
                      <div className='error-text'>{errorModel.aggregations[index].field.errorText}</div>
                    )
                  }
                </div>
                {bucket.fieldType == 'date' ?
                  (
                    <div className="col-sm-4 form-group">
                      <label htmlFor="bucketInterval"> Interval
                        <sup> *</sup>
                      </label>
                      <select
                        className="bucket-interval form-control"
                        id={'bucketInterval' + index}
                        placeholder="Select the interval for the grouping field."
                        value={bucket.interval}
                        onChange={handleSelectChange('interval', index)}
                      >
                        <option value="millisecond">Millisecond</option>
                        <option value="second">Second</option>
                        <option value="minute">Minute</option>
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                  )
                  :
                  (
                    <div className="col-sm-4 form-group">
                      <label htmlFor="bucketSize"> Number Of Entries In Each Group
                        <sup> *</sup>
                      </label>
                      <input
                        className="bucket-field form-control"
                        id={'bucketSize' + index}
                        type="number"
                        placeholder="Type the number of entries for the grouping field."
                        value={bucket.size}
                        onChange={handleTextChange('size', index)}
                      />
                      {errorModel.aggregations[index].size.errorText &&
                        (
                          <div className='error-text'>{errorModel.aggregations[index].size.errorText}</div>
                        )
                      }
                    </div>
                  )
                }
                {(bucket.fieldType == 'date' && bucket.interval == 'custom') ?
                  (
                    <div className="col-sm-4 form-group">
                      <label htmlFor="customInterval"> Custom Interval
                        <sup> *</sup>
                      </label>
                      <input
                        className="custom-interval form-control"
                        id={'customInterval' + index}
                        type="text"
                        placeholder="Type the custom interval for the group."
                        value={bucket.customInterval}
                        onChange={handleTextChange('customInterval', index)}
                      />
                      {errorModel.aggregations[index].customInterval.errorText &&
                        (
                          <div className='error-text'>{errorModel.aggregations[index].customInterval.errorText}</div>
                        )
                      }
                    </div>
                  )
                  :
                  null
                }

                <div className="col-sm-4 form-group">
                  <label htmlFor="bucketLabel"> Label
                  </label>
                  <input
                    className="bucket-label form-control"
                    id={'bucketLabel' + index}
                    type="text"
                    placeholder="Type the label for the group."
                    value={bucket.customLabel}
                    onChange={handleTextChange('customLabel', index)}
                  />
                  {errorModel.aggregations[index].customLabel.errorText &&
                    (
                      <div className='error-text'>{errorModel.aggregations[index].customLabel.errorText}</div>
                    )
                  }
                </div>

              </div>
            )
          }

        </div >
      )
    }



    return (
      <div className="configure-groups-tab-container" >
        <div className="configure-groups-description">
          Configure the grouping values based on which metrics should be categorized.
          For example, to display the population for each state in each country, configure country and state as the grouping fields. <br></br>
          Configure a grouping field. Optionally, a label can be assigned to this grouping level. Configure the Number of Entries to limit
          the number of entries displayed in each group. For example, show the top 5 states only.
        </div>
        {this.props.model.aggregations.length == 0 &&
          (
            <div className="row add-bucket-default-container">
              <div className="add-new-group-deault" onClick={() => this.addConfigureGroupsBlock(0)}>
                <i className="icon-add-plus" ></i>
                <span>Add Sub Groups</span>
              </div>
            </div>
          )
        }
        {
          this.props.model.aggregations.map((bucket, index) => {
            return (
              generateConfigureGroupsBlock(bucket, index)
            );
          })
        }

        {
          (this.props.model.aggregations.length > 1 && this.props.model.actionButtonsData.length >= 1) ?
            (
              <div className='only-two-buckets-if-action-buttons-configured' >
                <b>NOTE : </b>Maximum of two buckets are allowed if action buttons are configured.
            </div>
            )
            :
            null
        }

      </div >
    );
  }
}

ConfigureGroupsTab.propTypes = {
  onChange: PropTypes.func,
  vis: PropTypes.object,
  model: PropTypes.object,
  errorModel: PropTypes.object,
};

export default ConfigureGroupsTab;
