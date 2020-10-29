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
import { VunetSwitch } from 'ui_framework/src/vunet_components/vunet_switch/vunet_switch';
import { VunetHelp } from 'ui_framework/src/vunet_components/vunet_help/vunet_help'
import { validateInput, validateInputTypes } from 'ui/utils/vunet_form_validator_utils';
import { getFiltersFromSavedSearch } from 'ui/filter_manager/filter_manager.js';
import { vuMetricConstants } from '../../lib/vu_metric_constants';
import createSelectHandler from '../../lib/create_select_handler';
import createTextHandler from '../../lib/create_text_handler';
import ConfigureLabelAndContents from './components/configure_label_and_contents';
import ConfigureThresholds from './components/configure_thresholds';
import './configure_metrics_tab.less'

class ConfigureMetricsTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDataStoreIndexName: '',
      dataSetsIconHelp: false,
      indexPatterns: [],
      savedSearches: []
    };
    this.indexPatternFields = [];
    this.sameLabelExists = [];
    this.errorIfSearchNotFound = [];
  }

  componentDidMount() {
    this.getIndexPatterns().then(indexPatterns =>
      this.setState(
        {
          indexPatterns: indexPatterns
        }
        , () => {
          if (this.props.model.metrics[0].index.title === '') {
            this.setSelectedIndexPattern(this.state.indexPatterns[0].attributes.title, 0)
          }
        }
      )
    )
    this.getSavedSearches().then(savedSearches =>
      this.setState(
        {
          savedSearches: savedSearches
        }
      )
    )
    this.initializeIndexPatternFieldsForSavedObjects();
  };

  // This function will be used to set index pattern fields for all the metrics for a saved object
  initializeIndexPatternFieldsForSavedObjects = async () => {

    let indexPatternsForAllMetrics = []
    this.props.model.metrics.map((metric) => {
      const indexPatternDeatils = this.props.vis.API.indexPatterns.get(metric.index.id)
      indexPatternsForAllMetrics.push(indexPatternDeatils);
    })
    // ALl aaggretable fields of all selected index-patterns are stored in indexPatternsFieldsForAllMetricsResolved
    const indexPatternsFieldsForAllMetricsResolved = [];
    await Promise.all(indexPatternsForAllMetrics).then(resp => {
      resp.map((res) => {
        if (res.fields) {
          indexPatternsFieldsForAllMetricsResolved.push(res.fields.filter(function (field) {
            if (field.aggregatable) {
              return field;
            }
          }))
        }
      })
    });

    this.indexPatternFields = indexPatternsFieldsForAllMetricsResolved;
  }

  // This function will be used to fetch all the index patterns
  getIndexPatterns = async () => {
    const resp = await this.props.vis.API.savedObjectsClient.find({
      type: 'index-pattern',
      fields: ['title'],
      search_fields: ['title'],
      perPage: 10000
    });

    // Here we are performing case insenstive comparison for sorting
    let sortedIndexPatterns = resp.savedObjects.sort(function (a, b) {
      a = a.attributes.title.toLowerCase();
      b = b.attributes.title.toLowerCase();
      if (a == b) return 0;
      if (a > b) return 1;
      return -1;
    });

    return sortedIndexPatterns;
  }

  // This function will fetch the list of saved searches
  getSavedSearches = async () => {
    const resp = await this.props.vis.API.savedObjectsClient.find({
      type: 'search',
      search_fields: ['title', 'allowedRolesJSON'],
      perPage: 10000
    });

    // Here we are performing case insenstive comparison for sorting
    let sortedSavedSearchs = resp.savedObjects.sort(function (a, b) {
      a = a.attributes.title.toLowerCase();
      b = b.attributes.title.toLowerCase();
      if (a == b) return 0;
      if (a > b) return 1;
      return -1;
    });

    return sortedSavedSearchs;
  }

  // This fucntion will be used to set the selected indexx patterns
  setSelectedIndexPattern = (indexPatternName, metricIndex) => {
    const savedObjectFound = this.state.indexPatterns.find((indexPattern) => {
      return indexPattern.attributes.title === indexPatternName
    })
    const savedObjIndexPattern = {}
    savedObjIndexPattern.index = {
      'id': savedObjectFound.id,
      'title': savedObjectFound.attributes.title
    }
    this.getIndexPatternFields(indexPatternName, metricIndex, savedObjIndexPattern)
  }

  // This function will be used to get all the fields for the particular selected index-pattern and then populate
  // the fetched index pattern fields in the Metric Fields dropdown.
  getIndexPatternFields = async (indexPatternName, metricIndex, savedObjIndexPattern) => {
    await this.setIndexPatternFields(indexPatternName, metricIndex)
    const model = _.cloneDeep(this.props.model);
    const metricToChange = this.props.model.metrics[metricIndex];
    const changedMetricWithoutindexFields = _.assign({}, metricToChange, savedObjIndexPattern);
    model.metrics.splice(metricIndex, 1, changedMetricWithoutindexFields);
    this.props.onChange(model);
  }

  // This function willl be used to set the index patern fields of the particular index in the array
  setIndexPatternFields = async (indexPatternNameForTheMetric, index) => {
    var indexPatternResultMeta = this.state.indexPatterns.find(indexPatternMeta => indexPatternMeta.attributes.title === indexPatternNameForTheMetric);
    const indexPatternDeatils = await this.props.vis.API.indexPatterns.get(indexPatternResultMeta.id);
    let fields = indexPatternDeatils.fields
      .sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      })
      .filter(function (field) {
        if (field.aggregatable) {
          return field;
        }
      })

    if (this.indexPatternFields.length === this.props.model.metrics.length) {
      this.indexPatternFields[index] = fields;
    }
    else {
      this.indexPatternFields.splice(index, 0, fields);
    }
  }


  // This fucntion will be used to set the selected indexx patterns for search based on index id
  setSelectedIndexPatternForSearch = (indexPatternId, metricIndex) => {
    const savedObjectFound = this.state.indexPatterns.find((indexPattern) => {
      return indexPattern.id === indexPatternId
    })

    // If we are able to find an object for saved object i.e savedObjectFound we updated the index id and title 
    // and call a function to fetch the index pattern fields for that index
    if (savedObjectFound) {
      const savedObjIndexPattern = {}

      // We preapare an object with index key which has id and title values for that index.
      savedObjIndexPattern.index = {
        'id': savedObjectFound.id,
        'title': savedObjectFound.attributes.title
      }
      this.getIndexPatternFields(savedObjIndexPattern.index.title, metricIndex, savedObjIndexPattern)
    }
    else {
      const model = _.cloneDeep(this.props.model);

      this.errorIfSearchNotFound = [];

      // We push false in the array for the number of metric configured
      model.metrics.map((metric) => {
        this.errorIfSearchNotFound.push(false);
      });

      // For the metric we are working on and saved object is not found we make the value true at that index.
      this.errorIfSearchNotFound[metricIndex] = true;

      this.props.disablePreviewButtonIfErrorInSavedSearchFound(this.errorIfSearchNotFound)
    }

  }

  // This function will be used to set the selected saved search
  setSelectedSavedSearch = (savedSearchName, metricIndex) => {

    // This is the $filter used to calcute the filter in the saved search
    const filterInjector = this.props.filterInjectorForSavedSearch

    const savedSearchFound = this.state.savedSearches.find((savedSearch) => {
      return savedSearch.attributes.title === savedSearchName
    })
    const savedSearchObj = {}
    savedSearchObj.savedSearch = {
      'id': savedSearchFound.id,
      'title': savedSearchFound.attributes.title,
      'allowedRolesJSON': savedSearchFound.attributes.allowedRolesJSON
    }
    // Here we are processing the savedSearchObj to find out searchSourceJSONObj, savedSearchQuery and savedSearchFilters
    let searchSourceJSONObj = JSON.parse(savedSearchFound.attributes.kibanaSavedObjectMeta.searchSourceJSON);

    // get the filter query from the saved search
    let savedSearchQuery = searchSourceJSONObj.query.query;

    // Check whether any filter is added to the saved search
    let savedSearchFilters = searchSourceJSONObj.filter;

    // Getting the index to be updated
    let indexPatternIdToUpdateForSearch = searchSourceJSONObj.index;

    // Now we are calling setSelectedIndexPatternForSearch to update index-pattern in model accordingly
    this.setSelectedIndexPatternForSearch(indexPatternIdToUpdateForSearch, metricIndex)

    _.each(savedSearchFilters, function (savedSearchFilter) {
      const filter = _.omit(savedSearchFilter, function (val, key) {
        if (key === 'meta' || key[0] === '$') return true;
        return false;
      });
      // There might be no search query but filter in a saved search. So check whether empty for the first time
      // Get the query applied in the filter and append
      if (savedSearchQuery === '') {
        savedSearchQuery = ' (' + getFiltersFromSavedSearch(savedSearchFilter, filter, filterInjector) + ')';
      }
      else {
        // Append the query from the filters
        savedSearchQuery = savedSearchQuery + ' AND (' + getFiltersFromSavedSearch(savedSearchFilter, filter, filterInjector) + ')';
      }
    });

    // This will be used to set the selected saved search in the component and then update the same
    const model = _.cloneDeep(this.props.model);
    const metricToChange = model.metrics[metricIndex];
    const changedMetric = _.assign({}, metricToChange, savedSearchObj);
    changedMetric.showSavedSearch = true;
    changedMetric.savedSearchFilter = savedSearchQuery;
    model.metrics.splice(metricIndex, 1, changedMetric);
    this.props.onChange(model);
  }

  // This function will be called when user switches the build metric based on search toggle.
  onBuildMetricFromSearchChange = (metricIndex, checked) => {
    if (!checked) {
      const savedSearchObj = {}
      savedSearchObj.savedSearch = {
        'id': '',
        'title': '',
      }
      const model = _.cloneDeep(this.props.model);

      // This has been done to update the errorIfSearchNotFound array when user switches back to build metric based on search
      this.errorIfSearchNotFound = [];

      // We push false in the array for the number of metric configured
      model.metrics.map((metric) => {
        this.errorIfSearchNotFound.push(false);
      });
      this.props.disablePreviewButtonIfErrorInSavedSearchFound(this.errorIfSearchNotFound)

      const metricToChange = this.props.model.metrics[metricIndex];
      const changedMetric = _.assign({}, metricToChange, savedSearchObj);
      changedMetric.showSavedSearch = false;
      model.metrics.splice(metricIndex, 1, changedMetric);
      this.props.onChange(model);

    }
    else {
      this.setSelectedSavedSearch(this.state.savedSearches[0].attributes.title, metricIndex);
    }
  }

  // This function will be used to show fields dropdown when the metric type is not equal to count
  showFieldDropdownWhenMetricTypeNotCount = (metric, index, handleSelectChange, handleTextChange, errorModel) => {
    if (this.props.model.metrics[index].type !== 'count') {
      let groupedOptions = {};
      let selectedIndexFieldsArray = []
      if (this.indexPatternFields.length) {
        if (this.props.model.metrics[index].type == 'cardinality' || this.props.model.metrics[index].type == 'latest') {
          this.indexPatternFields[index].map((field) =>
            selectedIndexFieldsArray.push({
              key: field.name,
              value: field.name,
              optgroup: field.type
            })
          );

        }
        else {
          const filteredFieldsByNumber = this.indexPatternFields[index].filter((field) => {
            if (field.type == 'number') {
              return field;
            }
          })
          filteredFieldsByNumber.map((field) =>
            selectedIndexFieldsArray.push({
              key: field.name,
              value: field.name,
              optgroup: field.type
            })
          );
        }


        selectedIndexFieldsArray.forEach(option => {
          if (!groupedOptions[option.optgroup]) {
            groupedOptions[option.optgroup] = [];
          }
          groupedOptions[option.optgroup].push({
            value: option.value,
            text: option.text
          });
        });

      }

      if (this.props.model.metrics[index].type !== 'expression') {
        return (
          <div className="col-sm-4 form-group">
            <label htmlFor="metricFieldName"> Field
              <sup> *</sup>
            </label>
            <select
              className="metric-field form-control"
              id={'metricFieldName' + index}
              placeholder=""
              value={metric.field}
              onChange={handleSelectChange('field', index)}
            >
              <option key='null' value=''></option>
              {Object.keys(groupedOptions).map((group, index) => {
                return (
                  <optgroup key={index} label={group}>
                    {
                      groupedOptions[group].map(option => {
                        return (
                          <option key={option.value} value={option.value}>
                            {option.value}
                          </option>
                        )
                      })
                    }
                  </optgroup>
                );
              })}
            </select>
            {
              errorModel.metrics[index].field.errorText &&
              (
                <div className='error-text'>{errorModel.metrics[index].field.errorText}</div>
              )
            }
          </div>
        )
      }
      else {
        return (
          <div className="metric-expression-block-container">
            <div className="col-sm-2 form-group">
              <label htmlFor="expressionField"> Expression
                <sup> *</sup>
              </label>
              <input
                className="expression-field form-control"
                id={'expressionField' + index}
                placeholder=""
                value={metric.field}
                onChange={handleTextChange('field', index)}
              />
              {
                errorModel.metrics[index].field.errorText &&
                (
                  <div className='error-text'>{errorModel.metrics[index].field.errorText}</div>
                )
              }
            </div>
            <div className="col-sm-2 form-group">
              <label htmlFor="expressionFormat"> Format
                <sup> *</sup>
              </label>
              <select
                className="expression-format form-control"
                id={'expressionFormat' + index}
                placeholder=""
                value={metric.format}
                onChange={handleSelectChange('format', index)}
              >
                <option value=""></option>
                <option value="bits">Bits</option>
                <option value="bytes">Bytes</option>
                <option value="currency">Currency</option>
                <option value="number">Number</option>
                <option value="percentage">Percentage</option>
                <option value="time">Time</option>
              </select>
              {
                errorModel.metrics[index].format.errorText &&
                (
                  <div className='error-text'>{errorModel.metrics[index].format.errorText}</div>
                )
              }
            </div>
          </div>
        )
      }
    }
  }

  // This will be exectued to build metric either based on data store index or search
  metricBasedOnIndexOrSearch = (metric, index) => {
    if (!metric.showSavedSearch) {
      const indexPatternsOptions = this.state.indexPatterns.map((indexPattern) =>
        <option
          key={indexPattern.id}
          id={indexPattern.id}
          value={indexPattern.attributes.title}
          className="index-pattern-options"
        >
          {indexPattern.attributes.title}
        </option>
      );
      return (
        <div className="col-sm-4 form-group" >
          <label htmlFor="dataStoreIndex"> Data Store Index
            <sup> *</sup>
          </label>
          <select
            className="data-store-index form-control"
            id={'dataStoreIndex' + index}
            value={metric.index.title != '' ? metric.index.title : this.state.indexPatterns[0]}
            onChange={(e) => this.setSelectedIndexPattern(e.target.value, index)}
          >
            {indexPatternsOptions}
          </select>
        </div>
      )
    }
    else if (metric.showSavedSearch) {
      const savedSearchOptions = this.state.savedSearches.map((search) =>
        <option
          key={search.id}
          id={search.id}
          value={search.attributes.title}
          className="saved-search-options"
        >
          {search.attributes.title}
        </option>
      );
      return (
        <div className="col-sm-4 form-group">
          <label htmlFor="dataSavedSearch"> Data Saved Search
            <sup> *</sup>
          </label>
          <select
            className="data-search-index form-control"
            id={'dataSavedSearch' + index}
            placeholder="Example: vunet-1-1-server-health-* "
            value={metric.savedSearch.title != '' ? metric.savedSearch.title : this.state.savedSearches[0]}
            onChange={(e) => this.setSelectedSavedSearch(e.target.value, index)}
          >
            {savedSearchOptions}
          </select>
          {this.errorIfSearchNotFound[index] &&
            (
              <div className='error-text'>
                This saved search seems to have some issues. Please fix this saved search or select another one.
              </div>
            )
          }
        </div>
      )
    }
  }

  // This function will be used to add anew metric
  addConfigureMetricsBlock = (index) => {
    const newModelAfterAddingMetric = _.cloneDeep(this.props.model);
    newModelAfterAddingMetric.metrics.splice(index + 1, 0, vuMetricConstants.METRIC_DEFAULTS);
    this.props.onChange(newModelAfterAddingMetric);
    this.setSelectedIndexPattern(this.state.indexPatterns[0].attributes.title, index + 1)

    // This has been done to add the same for the errroModel
    const newErrorModel = _.cloneDeep(this.props.errorModel)

    newErrorModel.metrics.splice(index + 1, 0, _.cloneDeep(vuMetricConstants.METRIC_ERROR_DEFAULTS));
    this.props.onErrorChange(newErrorModel);
  }

  // This fucntion will be used to clone a metric 
  cloneConfigureMetricsBlock = (index) => {
    // Here we are cloning the index pattern fields for the cloned metric
    this.indexPatternFields.splice(index + 1, 0, this.indexPatternFields[index])

    const newModelAfterCloningMetric = _.cloneDeep(this.props.model);
    let newCloneOfMetric = _.cloneDeep(this.props.model.metrics[index]);
    newCloneOfMetric.label = '';
    newModelAfterCloningMetric.metrics.splice(index + 1, 0, newCloneOfMetric);
    this.props.onChange(newModelAfterCloningMetric);

    const newErrorModelAfterCloningMetric = _.cloneDeep(this.props.errorModel);
    newErrorModelAfterCloningMetric.metrics.splice(index + 1, 0, _.cloneDeep(newErrorModelAfterCloningMetric.metrics[index]));
    this.props.onErrorChange(newErrorModelAfterCloningMetric);
  }

  // This fucntion will be used to delete a metric
  deleteConfigureMetricsBlock = (index) => {
    // Here we are deleting the index pattern fields for the deleted metric
    this.indexPatternFields.splice(index, 1)

    const newModelAfterDeletingMetric = _.cloneDeep(this.props.model);
    newModelAfterDeletingMetric.metrics.splice(index, 1);
    this.props.onChange(newModelAfterDeletingMetric);

    const newErrorModel = _.cloneDeep(this.props.errorModel);
    newErrorModel.metrics.splice(index, 1);
    this.props.onErrorChange(newErrorModel);
  }

  // This function will be used to the move the metric up in priority along with moving the error handler object
  movePriorityUpForMetric = (index) => {
    if (index > 0) {
      // Here we are moving the index pattern fields for the moved metric
      this.indexPatternFields.splice(index - 1, 0, this.indexPatternFields.splice(index, 1)[0])

      const newModelAfterMovingMetric = _.cloneDeep(this.props.model)
      const newErrorModelAfterMovingMetric = _.cloneDeep(this.props.errorModel)
      newModelAfterMovingMetric.metrics.splice(index - 1, 0, newModelAfterMovingMetric.metrics.splice(index, 1)[0]);
      newErrorModelAfterMovingMetric.metrics.splice(index - 1, 0, newErrorModelAfterMovingMetric.metrics.splice(index, 1)[0]);

      // This we are doing to move the priority up for same label exists array accordingly
      let sameLabelExistsAfterPriorityChange = _.clone(this.sameLabelExists);
      sameLabelExistsAfterPriorityChange.splice(index - 1, 0, sameLabelExistsAfterPriorityChange.splice(index, 1)[0]);
      this.sameLabelExists = sameLabelExistsAfterPriorityChange;

      // This we are doing to move the priority up for saved search not found array accordingly
      let errorIfSearchNotFoundAfterPriorityChange = _.clone(this.errorIfSearchNotFound);
      errorIfSearchNotFoundAfterPriorityChange.splice(index - 1, 0, errorIfSearchNotFoundAfterPriorityChange.splice(index, 1)[0]);
      this.errorIfSearchNotFound = errorIfSearchNotFoundAfterPriorityChange;

      this.props.onChange(newModelAfterMovingMetric);
      this.props.onErrorChange(newErrorModelAfterMovingMetric);
    }
  }

  // This function will be used to the move the metric low in priority along with moving the error handler object
  movePriorityDownForMetric = (index) => {
    // Here we are moving the index pattern fields for the moved metric
    this.indexPatternFields.splice(index + 1, 0, this.indexPatternFields.splice(index, 1)[0])

    const newModelAfterMovingMetric = _.cloneDeep(this.props.model)
    const newErrorModelAfterMovingMetric = _.cloneDeep(this.props.errorModel)
    newModelAfterMovingMetric.metrics.splice(index + 1, 0, newModelAfterMovingMetric.metrics.splice(index, 1)[0]);
    newErrorModelAfterMovingMetric.metrics.splice(index + 1, 0, newErrorModelAfterMovingMetric.metrics.splice(index, 1)[0]);

    // This we are doing to move the priority down for same label exists array accordingly
    let sameLabelExistsAfterPriorityChange = _.clone(this.sameLabelExists);
    sameLabelExistsAfterPriorityChange.splice(index + 1, 0, sameLabelExistsAfterPriorityChange.splice(index, 1)[0]);
    this.sameLabelExists = sameLabelExistsAfterPriorityChange;

    // This we are doing to move the priority down for saved search not found array accordingly
    let errorIfSearchNotFoundAfterPriorityChange = _.clone(this.errorIfSearchNotFound);
    errorIfSearchNotFoundAfterPriorityChange.splice(index + 1, 0, errorIfSearchNotFoundAfterPriorityChange.splice(index, 1)[0]);
    this.errorIfSearchNotFound = errorIfSearchNotFoundAfterPriorityChange;

    this.props.onChange(newModelAfterMovingMetric);
    this.props.onErrorChange(newErrorModelAfterMovingMetric);
  }

  // this function will be used to check that the metric label provided by user should not be already present.
  // We create a list of sameLabelExists for all metrics and populate it with a boolean flag. False if metric
  // label is not duplicate, True if its duplicate. We pass this to disable the preview if duplicate label is found
  checkIfMetricLabelAlreadyPresent = (label, model, index) => {
    const customLabel = label.label;
    const metricLabelsList = [];

    // Create a new metricLabelList
    model.metrics.map((metric) => {
      metricLabelsList.push(metric.label);
    })

    // To Check duplicate, We need to remove the current one from this list
    const indexOfLabelBeingEdited = metricLabelsList.indexOf(customLabel)
    metricLabelsList.splice(indexOfLabelBeingEdited, 1);

    // Create the sameLabelExist assuming all metrics don't have duplicate
    this.sameLabelExists = [];
    model.metrics.map((metric) => {
      this.sameLabelExists.push(false)
    });

    // Set the current one to True if it already exist in the list-of-labels
    if (metricLabelsList.includes(customLabel)) {
      this.sameLabelExists[index] = true;
    }

    this.props.disablePreviewButtonIfSameLabelExists(this.sameLabelExists)
  }

  // This function will update the field type 
  updateFieldTypeForSelectedField = (part, index) => {
    const model = _.cloneDeep(this.props.model);
    const metricToChange = _.cloneDeep(this.props.model.metrics[index]);
    this.indexPatternFields[index].map((field) => {
      if (field.name == part.field) {
        metricToChange.field = part.field;
        metricToChange.fieldType = field.type;
        metricToChange.scripted = field.scripted
        model.metrics.splice(index, 1, metricToChange);
        this.props.onChange(model);
      }
    })
    // This will be required when the user selects the 1st option with is empty
    if (part.field === '') {
      metricToChange.field = part.field;
      metricToChange.fieldType = '';
      metricToChange.scripted = false;
      model.metrics.splice(index, 1, metricToChange);
      this.props.onChange(model);
    }
  }

  //  This function will be used to handle the changes related to text and select change for metrics
  handleChangeForMetric = (part, index) => {
    const errorModel = _.cloneDeep(this.props.errorModel);

    const key = Object.keys(part);
    // part will always be a single key value pair object
    // This will be used as we need to update field and fieldType whenevr field is updated
    if (key[0] === 'field' && this.props.model.metrics[index].type != 'expression') {
      this.updateFieldTypeForSelectedField(part, index);
    }
    // Here if we selected type as count we make the field,filetype as empty
    else if (key[0] === 'type' && part.type === 'count') {
      const model = _.cloneDeep(this.props.model);
      const metricToChange = this.props.model.metrics[index];
      metricToChange.field = '';
      metricToChange.fieldType = '';
      const changedMetric = _.assign({}, metricToChange, part);
      model.metrics.splice(index, 1, changedMetric);
      this.props.onChange(model);
    }
    else {
      const model = _.cloneDeep(this.props.model);
      const metricToChange = this.props.model.metrics[index];
      const changedMetric = _.assign({}, metricToChange, part);
      model.metrics.splice(index, 1, changedMetric);
      this.props.onChange(model);
      // we are doing this as we need to check that the metric label provided by user should not be already present
      if (key[0] === 'label') {
        this.checkIfMetricLabelAlreadyPresent(part, model, index);
      }
    }


    if (key.length == 1 && key[0] === 'label') {
      errorModel.metrics[index].label.errorText = validateInput(part.label,
        {
          [validateInputTypes.required]: {
            value: true,
            errorText: 'This field is required.'
          },
          [validateInputTypes.maxLength]: {
            value: 40,
            errorText: 'Custom label cannot exceed 40 characters.'
          }
        }
      )
    }
    else if (key.length == 1 && key[0] === 'groupName') {
      errorModel.metrics[index].groupName.errorText = validateInput(part.groupName,
        {
          [validateInputTypes.maxLength]: {
            value: 40,
            errorText: 'Group name cannot exceed 40 characters.'
          }
        }
      )
    }
    else if (key.length == 1 && key[0] === 'goalLabel') {
      errorModel.metrics[index].goalLabel.errorText = validateInput(part.goalLabel,
        {
          [validateInputTypes.maxLength]: {
            value: 40,
            errorText: 'Goal label cannot exceed 40 characters.'
          }
        }
      )
    }
    else if (key.length == 1 && key[0] === 'description') {
      errorModel.metrics[index].description.errorText = validateInput(part.description,
        {
          [validateInputTypes.maxLength]: {
            value: 220,
            errorText: 'Description cannot exceed 220 characters.'
          }
        }
      )
    }
    else if (key.length == 1 && key[0] === 'format') {
      if (!errorModel.metrics[index].format) {
        errorModel.metrics[index].format = {
          errorText: '',
          required: true
        }
      }
      errorModel.metrics[index].format.errorText = validateInput(part.format,
        {
          [validateInputTypes.required]: {
            value: true,
            errorText: 'This field is required.'
          }
        }
      )
    }


    // If the change is done on metric type and type is count we are removing the field and format from
    // errortext if present 
    if (key.length == 1 && key[0] === 'type' && part.type === 'count') {
      if (errorModel.metrics[index].field || errorModel.metrics[index].format) {
        errorModel.metrics[index] = vuMetricConstants.METRIC_ERROR_DEFAULTS;
      }
    }

    // If the change is done on metric type and type is expression we need to add field and format errors if they are not present
    else if (key.length == 1 && key[0] === 'type' && part.type === 'expression') {
      if (!errorModel.metrics[index].field) {
        errorModel.metrics[index].field = {
          errorText: '',
          required: true
        }
      }
      if (!errorModel.metrics[index].format) {
        errorModel.metrics[index].format = {
          errorText: '',
          required: true
        }
      }
      if (this.props.model.metrics[index].field !== '') {
        errorModel.metrics[index].field.errorText = validateInput(this.props.model.metrics[index].field,
          {
            [validateInputTypes.required]: {
              value: true,
              errorText: 'This field is required.'
            },
            [validateInputTypes.regex]: {
              value: RegExp(/[M0-9\+\-\*\/\%\.\(\)\s]+$/),
              errorText: ' Expression pattern is invalid.'
            }
          }
        )
      }
    }

    // If the change is done on metric type and type is neither count nor expression we need to remove format from error and need
    // to add field to error list
    else if (key.length == 1 && key[0] === 'type' && part.type !== 'expression' && part.type !== 'count') {
      if (!errorModel.metrics[index].field) {
        errorModel.metrics[index].field = {
          errorText: '',
          required: true
        }
      }
      if (errorModel.metrics[index].format) {
        errorModel.metrics[index] = vuMetricConstants.METRIC_ERROR_DEFAULTS_WITH_FIELD;
      }
    }


    if (key.length == 1 && key[0] === 'field') {
      if (this.props.model.metrics[index].type === 'expression') {
        errorModel.metrics[index].field.errorText = validateInput(part.field,
          {
            [validateInputTypes.required]: {
              value: true,
              errorText: 'This field is required.'
            },
            [validateInputTypes.regex]: {
              value: RegExp(/[M0-9\+\-\*\/\%\.\(\)\s]+$/),
              errorText: ' Expression pattern is invalid.'
            }
          }
        )
      }
      else if (this.props.model.metrics[index].type !== 'expression') {
        errorModel.metrics[index].field.errorText = validateInput(part.field,
          {
            [validateInputTypes.required]: {
              value: true,
              errorText: 'This field is required.'
            }
          }
        )
      }
    }

    this.props.onErrorChange(errorModel)
  }

  // this function will be used to handle collapsing and expanding of metric block
  collapseExpandMetricBlock = (metric, index) => {
    const model = _.cloneDeep(this.props.model);
    const metricToChange = metric;
    if (metricToChange.collapsed) {
      metricToChange.collapsed = false;
      model.metrics.splice(index, 1, metricToChange);
      this.props.onChange(model);
    }
    else if (!metricToChange.collapsed) {
      metricToChange.collapsed = true;
      model.metrics.splice(index, 1, metricToChange);
      this.props.onChange(model);
    }
  }

  // This function will be used to hide or show the particular metric
  hideUnhideMetricBlock = (metric, index) => {
    const model = _.cloneDeep(this.props.model);
    const metricToChange = metric;
    if (metricToChange.hideMetric) {
      metricToChange.hideMetric = false;
      model.metrics.splice(index, 1, metricToChange);
      this.props.onChange(model);
    }
    else if (!metricToChange.hideMetric) {
      metricToChange.hideMetric = true;
      model.metrics.splice(index, 1, metricToChange);
      this.props.onChange(model);
    }
  }

  // This function will be called when user switches the advance config toggle button.
  onAdvanceConfigSwitchChange = (index, checked) => {
    const model = _.cloneDeep(this.props.model);
    model.metrics[index].advanceConfigSwitch = checked;
    this.props.onChange(model);
  }

  // THis function will be used to show the help block for the select data sets
  showHelpForDataSets = () => {
    this.setState(
      {
        dataSetsIconHelp: !this.state.dataSetsIconHelp
      }
    )
  }

  render() {

    const handleSelectChange = createSelectHandler(this.handleChangeForMetric);
    const handleTextChange = createTextHandler(this.handleChangeForMetric);
    const errorModel = _.cloneDeep(this.props.errorModel);

    const selectDataSetsVunetHelpMeta = {
      headerText: 'Helping Hand',
      referenceLink: '/vuDoc/user_guide/visualization.html#metrics',
      contentIntroduction: 'Configure the metric value to be displayed. It is mandatory to assign a label for the metric.',
      contentList: [
        {
          title: 'Metric',
          description: 'The metric value is derived using the following workflow:' +
            '\n <b> Data Source Index ⇒ Optional Filters to Select Data ⇒ Metric Type to Derive Value Displayed </b>' +
            '\n Instead of directly specifying the Data Source Index, user can optionally specify the source using a saved ' +
            'search object created using Search Page.'
        },
        {
          title: 'Filter',
          description: 'Filters to be applied on the data before calculating the metric. ' +
            'The Filters are to be specified using the vuSmartMaps Query Language.' +
            '\n </b><u><i> Example: </i></u></b>' +
            '\n  To select documents having value counters in type field, use <b>type:counters</b> ' +
            '\n </b><u><i>More Examples: </i></u></b>' +
            '\n type:counters AND service:http' +
            '\n type:counters OR type:errors AND NOT event:”Interface Down' +
            '\n Speed:[0 TO 1000] AND error:[10 TO *]'
        },
        {
          title: 'Advanced Configuration  <i class="icon-no-results-found" title="This configuration is for advanced settings"></i>',
          description: 'Use the Advanced Configuration box to provide additional controls in YAML format. ' +
            'Refer to User Manual to view the full listing directives available.'
        }
      ]
    }

    const generateConfigureMetricBlock = (metric, index) => {
      return (
        <div className="configure-metric-block-container" key={index}>
          <div className="configure-metrics-header-functions-row">
            <div className="left-side-functions">
              <div className="metric-expander-icon">
                <i className={(metric.collapsed ? 'icon-arrow-down' : 'icon-arrow-up')}
                  onClick={() => this.collapseExpandMetricBlock(metric, index)}></i>
              </div>
              {metric.label ?
                <div className="metric-name">
                  {metric.label}
                </div>
                :
                <div className='dummy-metric-name'>
                  Metric Name
                </div>
              }

              <div className="vu-metric-icons-container">
                {(metric.hideMetric && this.props.model.metrics.length > 1) ?
                  (
                    <div className="show-hide-metric-icon">
                      <i className="icon-eye-slash" onClick={() => this.hideUnhideMetricBlock(metric, index)}></i>
                    </div>
                  )
                  :
                  null
                }
                {(!metric.hideMetric && this.props.model.metrics.length > 1) ?
                  (
                    <div className="show-hide-metric-icon">
                      <i className="icon-eye" onClick={() => this.hideUnhideMetricBlock(metric, index)}></i>
                    </div>
                  )
                  :
                  null
                }
                {this.props.model.metrics.length > 1 &&
                  (
                    <div className="change-metric-priority">
                      <i
                        className={'icon-arrow-up ' +
                          (index === 0 ? 'disabled-icon' : null)
                        }
                        onClick={() => this.movePriorityUpForMetric(index)}
                      >
                      </i>
                      <i
                        className={'icon-arrow-down ' +
                          (index === this.props.model.metrics.length - 1 ? 'disabled-icon' : null)
                        }
                        onClick={() => this.movePriorityDownForMetric(index)}></i>
                    </div>
                  )
                }

                {this.props.model.metrics.length > 1 &&
                  (
                    <div className="delete-metric">
                      <i className="icon-delete" onClick={() => this.deleteConfigureMetricsBlock(index)} ></i>
                    </div>
                  )
                }
                {this.props.model.metrics.length <= 7 &&
                  (
                    <div className="add-new-metric">
                      <i className="icon-add-plus" onClick={() => this.addConfigureMetricsBlock(index)}></i>
                      <span>Add Metric</span>
                    </div>

                  )
                }
                {this.props.model.metrics.length <= 7 &&
                  (
                    <div className="clone-new-metric">
                      <i className="icon-clone" onClick={() => this.cloneConfigureMetricsBlock(index)}></i>
                      <span>Clone</span>
                    </div>
                  )
                }
              </div>
            </div>
            <div className="vu-metric-advance-config-switch">
              <VunetSwitch
                onChange={this.onAdvanceConfigSwitchChange.bind(this, index)}
                checked={metric.advanceConfigSwitch}
              />
              <span className="advanced-configuration-switch-text"> Advanced Configurations </span>
            </div>
          </div>
          {!metric.collapsed &&
            (
              <div className="configure-metric-configuration-block">
                <div className="select-data-sets">
                  <div className="select-data-sets-heading-row">
                    <div className="select-data-set-heading">
                      <div className="select-data-header-number">
                        01.
                      </div>
                      <div className="select-data-header-title-container">
                        <span className="select-data-header-title"> Select Data Set For The Metric </span>
                        <i className="select-data-sets-help-icon icon-help-blue"
                          onClick={this.showHelpForDataSets}
                          data-tip="Click the help icon to open the help section block" />
                        <ReactTooltip />
                      </div>
                    </div>
                    <div className="build-metric-from-search">
                      <VunetSwitch
                        onChange={this.onBuildMetricFromSearchChange.bind(this, index)}
                        checked={metric.showSavedSearch}
                      />
                      <span className="build-metric-from-search-title"> Build Vu Metric Based On Saved Search</span>
                    </div>
                  </div>

                  {
                    this.state.dataSetsIconHelp &&
                    (
                      <VunetHelp
                        metaData={selectDataSetsVunetHelpMeta}
                        onClose={this.showHelpForDataSets.bind(this)}
                      />
                    )
                  }

                  <div className="select-data-sets-content">
                    <div className="row border-bottom-row">
                      {this.metricBasedOnIndexOrSearch(metric, index)}

                      <div className="col-sm-4 form-group">
                        <label htmlFor="metricFilter"> Filter</label>
                        <input
                          className="metric-filter form-control"
                          id={'metricFilter' + index}
                          placeholder="Type the filter."
                          value={metric.filter}
                          onChange={handleTextChange('filter', index)}
                        />
                      </div>
                    </div>

                    <div className="row border-bottom-row">
                      <div className="col-sm-4 form-group">
                        <label htmlFor="type"> Metric Type
                          <sup> *</sup>
                        </label>
                        <select
                          className="metric-type form-control"
                          id={'type' + index}
                          value={metric.type}
                          onChange={handleSelectChange('type', index)}
                        >
                          <option value="count">Count</option>
                          <option value="sum">Sum</option>
                          <option value="avg">Average</option>
                          <option value="min">Min</option>
                          <option value="max">Max</option>
                          <option value="cardinality">Unique Count</option>
                          <option value="latest">Latest value</option>
                          {this.props.model.metrics.length > 1 &&
                            (
                              <option value="expression">Expression</option>
                            )
                          }

                        </select>
                      </div>

                      {this.showFieldDropdownWhenMetricTypeNotCount(metric, index, handleSelectChange, handleTextChange, errorModel)}

                      <div className="col-sm-4 form-group">
                        <label htmlFor="metricLabel"> Custom Label
                          <sup> *</sup>
                        </label>
                        <input
                          className="metric-label form-control"
                          placeholder='Type the metric label.'
                          id={'metricLabel' + index}
                          value={metric.label}
                          onChange={handleTextChange('label', index)}
                        >
                        </input>
                        {errorModel.metrics[index].label.errorText &&
                          (
                            <div className='error-text'>{errorModel.metrics[index].label.errorText}</div>
                          )
                        }
                        {this.sameLabelExists[index] &&
                          (
                            <div className='error-text'>Label name already exists.</div>
                          )
                        }
                      </div>
                    </div>
                    {metric.advanceConfigSwitch &&
                      (
                        <div className="row">
                          <div className="col-sm-8 form-group">
                            <label htmlFor="advancedConfig"> Advanced Configuration</label>
                            <textarea
                              id={'advancedConfig' + index}
                              placeholder='Type the advanced configurations.'
                              value={metric.advancedConfig}
                              onChange={handleTextChange('advancedConfig', index)}
                              className="node-configuration-textarea-normal form-control"></textarea>
                          </div>
                        </div>
                      )
                    }

                  </div>
                </div>
                <ConfigureLabelAndContents
                  metric={metric}
                  index={index}
                  handleChange={this.handleChangeForMetric}
                  onChange={this.props.onChange}
                  model={this.props.model}
                  savedObjectsProvider={this.props.vis.API.savedObjectsClient}
                  errorModel={this.props.errorModel}
                  vis={this.props.vis}
                  additionalFields={this.indexPatternFields[index]}
                />

                <ConfigureThresholds
                  metric={metric}
                  index={index}
                  onChange={this.props.onChange}
                  model={this.props.model}
                />
              </div>
            )
          }

        </div>
      )
    }


    return (
      <div className="configure-metrics-tab-container">
        <div className="configure-metrics-description">
          Configure the list of metrics to be visualized. For each metric, use threshold configuration to control the displayed color.
          Additional controls can be used to configure description, icons and many more.
          Use the Advanced Configuration switch on the top left corner to view the advanced configuration options.
        </div>
        {
          this.props.model.metrics.map((metric, index) => {
            return (
              generateConfigureMetricBlock(metric, index)
            );
          })
        }

      </div >
    );
  }
}

ConfigureMetricsTab.propTypes = {
  model: PropTypes.object, //  This is the parameters object 
  errorModel: PropTypes.object, // This is the errro handler object
  onChange: PropTypes.func, // This is the callback function for form changes to update the latest model to state
  onErrorChange: PropTypes.func, // This is the callback function to update the error handler object
  vis: PropTypes.object, // This will be used for API's like savedObjectsClient to get dashboards,search,index etc.
  disablePreviewButtonIfSameLabelExists: PropTypes.func, // This will be used to check if same label exists and disable preview button
  disablePreviewButtonIfErrorInSavedSearchFound: PropTypes.func, // This will be used to check if there is an error is search found 
  filterInjectorForSavedSearch: PropTypes.func // This is angular $filter injectable which will be used in saved search
};

export default ConfigureMetricsTab;
