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

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import VuMetricVisualizationAndApply from './vu_metric_visualization_and_apply';
import { getFormValidity, getFormErrorField } from 'ui/utils/vunet_form_validator_utils';
import { vuMetricConstants } from './lib/vu_metric_constants';
import VuMetricVisualization from './vu_metric_visualization';
import VuMetricPanelConfig from './vu_metric_panel_config';
import { get } from 'lodash';

class VisEditor extends Component {
  constructor(props) {
    super(props);
    const { appState } = props;
    // The reversed and this.state.reversed will be used to detect the dark theme mode in dashboard and make any changes to
    // visualization if changes are needed in the dark theme mode. That is why reversed may be seen in the file which is not
    // used as of now but can be used later for dark theme mode
    const reversed = get(appState, 'options.darkTheme', false);
    this.state = {
      model: props.vis.params,
      dirty: true,
      reversed
    };
    this.errorModel = {};
    this.isFormValid = true;
    this.sameLabelExists = false;
    this.errorInSavedSearchFound = false;
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
    this.initBackwardCompatibilty();
  }

  // This function will be used to in populate errorHandlerObject and to provide backward compatibilty to support
  // all the prevoisly configured objects to support the new Vu-Metric
  initBackwardCompatibilty = () => {


    // Here we are handling the backward compatibilty, we try to see if there is a value for each key in deafults if the value
    // is there we dont do anything but if that key is not present  i.e (if the key is undefiend) we intialize the key with
    // the default value needed
    const savedConfigurationModel = _.cloneDeep(this.props.vis.params);

    // threshold: [],

    // Here we are iterating over the metrics object and putting the deafult values if keys are not present
    savedConfigurationModel.metrics.map((metric) => {

      if (metric.threshold === undefined) {
        metric.threshold = [];
      }
      else if (metric.threshold.length) {
        // Adjust the threshold parameters so that they are converted into new
        // format. old format had match, max and min fields.
        metric.threshold.forEach((threshold, index) => {
          if (threshold.label === undefined) {
            threshold.label = 'Threshold ' + index;
          }
          if (threshold.match !== '' && threshold.match !== undefined && threshold.match !== null) {
            // This is the old match case. We convert this to new equal case
            threshold.comparison = '==';
            threshold.value = threshold.match;
            threshold.match = '';
            delete threshold.valueStr;
            delete threshold.valueMax;
            delete threshold.valueMin;
          }
          if (threshold.max !== undefined && threshold.max !== '' && threshold.max !== null) {
            // This is the old range case. We convert this to new range case
            threshold.comparison = 'Range';
            threshold.valueMax = threshold.max;
            threshold.valueMin = threshold.min;
            threshold.max = null;
            threshold.min = null;
            delete threshold.valueStr;
            delete threshold.max;
            delete threshold.valueStr;
          }
          if (threshold.valueStr && threshold.valueStr !== '') {
            threshold.value = threshold.valueStr;
            delete threshold.valueStr;
          }
          if (threshold.valueStr === '' || threshold.valueStr === undefined || threshold.valueStr === null) {
            delete threshold.valueStr;
          }
          if (threshold.valueMin === '' || threshold.valueMin === undefined || threshold.valueMin === null) {
            delete threshold.valueMin;
          }
          if (threshold.valueMax === '' || threshold.valueMax === undefined || threshold.valueMax === null) {
            delete threshold.valueMax;
          }
        });
      }

      if (metric.collapsed === undefined) {
        metric.collapsed = false;
      }
      if (metric.showSavedSearch === undefined) {
        metric.showSavedSearch = false;
      }
      if (metric.advancedConfig === undefined) {
        metric.advancedConfig = '';
      }
      if (metric.advanceConfigSwitch === undefined) {
        metric.advanceConfigSwitch = false;
        // This has been done because if any of the fields have values the advance config switch will be true
        if (metric.advancedConfig !== '' || metric.description !== '' || metric.additionalFields !== '' || metric.intervalMetric !== '') {
          metric.advanceConfigSwitch = true;
        }
      }
      if (metric.additionalFields === undefined) {
        metric.additionalFields = '';
      }
      if (metric.field === undefined) {
        metric.field = '';
      }
      if (metric.fieldType === undefined) {
        metric.fieldType = '';
      }
      if (metric.filter === undefined) {
        metric.filter = '*';
      }
      if (metric.format === undefined) {
        metric.format = '';
      }
      if (metric.hideMetric === undefined) {
        metric.hideMetric = false;
      }
      if (metric.label === undefined) {
        metric.label = '';
      }
      if (metric.goalLabel === undefined) {
        metric.goalLabel = '';
      }
      if (metric.groupName === undefined) {
        metric.groupName = '';
      }
      if (metric.description === undefined) {
        metric.description = '';
      }
      if (metric.intervalMetric === undefined) {
        metric.intervalMetric = '';
      }
      if (metric.metricListIndex === undefined) {
        metric.metricListIndex = '';
      }
      if (metric.type === undefined) {
        metric.type = 'count';
      }
      if (metric.savedSearchFilter === undefined) {
        metric.savedSearchFilter = '*';
      }
      if (metric.scripted === undefined) {
        metric.scripted = false;
      }
      if (metric.enableAutoBaseLining === undefined) {
        metric.enableAutoBaseLining = false;
      }
      if (metric.bgColorEnabled === undefined) {
        metric.bgColorEnabled = false;
      }
      if (metric.upTrendColor === undefined) {
        metric.upTrendColor = 'green';
      }
      if (metric.referenceLink === undefined) {
        metric.referenceLink = {
          enabled: false,
          type: 'dashboard',
          dashboard: {
            id: '',
            title: ''
          },
          searchString: '',
          retainFilters: false,
          useMetricFilter: false
        };
      }
      else if (metric.referenceLink) {
        if (metric.referenceLink.dashboard === undefined) {
          metric.referenceLink.dashboard = {
            id: '',
            title: ''
          };
        }
        if (metric.referenceLink.searchString === undefined) {
          metric.referenceLink.searchString = '';
        }
        if (metric.referenceLink.retainFilters === undefined) {
          metric.referenceLink.retainFilters = false;
        }
        if (metric.referenceLink.useMetricFilter === undefined) {
          metric.referenceLink.useMetricFilter = false;
        }
      }


    });

    // This we are doing for the aggreagation as we need to push a collapsed key to aggregation if not present
    if (savedConfigurationModel.aggregations.length > 0) {
      savedConfigurationModel.aggregations.map((aggregation) => {
        if (aggregation.collapsed === undefined) {
          aggregation.collapsed = false;
        }
      });
    }

    // This has been done to provide backward to backward compatibilty for thresolds are the keys for thresolds have been changed
    // for OLD BMV also so we need to handle these cases also

    if (savedConfigurationModel.enableHistDataPercentage === undefined) {
      savedConfigurationModel.enableHistDataPercentage = false;
    }
    if (savedConfigurationModel.enableHistDataValueWithPercentage === undefined) {
      savedConfigurationModel.enableHistDataValueWithPercentage = false;
    }
    if (savedConfigurationModel.actionButtonsData === undefined) {
      savedConfigurationModel.actionButtonsData = [];
    }
    if (savedConfigurationModel.enableTableFormat === undefined) {
      savedConfigurationModel.enableTableFormat = false;
    }
    if (savedConfigurationModel.enableHistDataPercentage === undefined) {
      savedConfigurationModel.tabularFormat = 'horizontal';
    }
    if (savedConfigurationModel.linkInfoValues === undefined) {
      savedConfigurationModel.linkInfoValues = false;
    }
    if (savedConfigurationModel.linkInfo === undefined) {
      savedConfigurationModel.linkInfo = [];
    }
    if (savedConfigurationModel.fontSize === undefined) {
      savedConfigurationModel.fontSize = 40;
    }
    if (savedConfigurationModel.textFontSize === undefined) {
      savedConfigurationModel.textFontSize = 18;
    }

    // We are setting the state in this way because we can setState here as the component has not been mounted yet
    // hence setState wont work
    this.state.model = savedConfigurationModel;
  }

  initErrorHandler = () => {
    // Here we are intializing the error handler object in case the object is saved
    const errorHandler = { metrics: [], aggregations: [] };
    this.state.model.metrics.map((metric) => {

      // If the metric type is count or empty we populate the error handler without the field and format errors
      if (metric.type === 'count' || metric.type === '') {
        errorHandler.metrics.push(vuMetricConstants.METRIC_ERROR_DEFAULTS);
      }

      // If the metric type is not count nor expression we populate the error handler with field error
      else if (metric.type !== 'count' && metric.type !== 'expression') {
        errorHandler.metrics.push(vuMetricConstants.METRIC_ERROR_DEFAULTS_WITH_FIELD);
      }

      // If the metric type is expression we populate the error handler with field and format error
      else if (metric.type === 'expression') {
        errorHandler.metrics.push(vuMetricConstants.METRIC_ERROR_DEFAULTS_WITH_FIELD_AND_FORMAT);
      }
    });

    this.state.model.aggregations.map((bucket) => {
      // If the bucket is configured with fieldtype as date and interval field as custom we insert the
      // customINterval error field also for that bucket
      if (bucket.interval && bucket.interval === 'custom') {
        errorHandler.aggregations.push(vuMetricConstants.BUCKET_ERROR_DEFAULTS_WITH_CUSTOMINTERVAL);
      }
      else {
        errorHandler.aggregations.push(vuMetricConstants.BUCKET_ERROR_DEFAULTS);
      }
    });
    this.errorModel = _.cloneDeep(errorHandler);
  }


  componentWillMount() {
    this.initErrorHandler();
    const { appState } = this.props;
    if (appState) {
      this.appState = appState;
      this.appState.on('save_with_changes', this.handleAppStateChange);
    }
  }

  // This function will be used to detect the dark theme mode and then set reversed state.
  handleAppStateChange() {
    const reversed = get(this.appState, 'options.darkTheme', false);
    this.setState({ reversed });
  }

  componentWillUnmount() {
    if (this.appState) {
      this.appState.off('save_with_changes', this.handleAppStateChange);
    }
  }

  render() {

    // This function will be used to handle all the changes made in the configuration form and
    // will update the same in the state so that the changes are reflected in the configuration form.
    const handleChange = (part) => {
      const nextModel = { ...this.state.model, ...part };
      this.props.vis.params = nextModel;

      this.setState({ model: nextModel, dirty: true });
      this.props.vis.dirty = true;
    };

    // This function will be used to handle all the errors if present in the configuration form and
    // will update the same in the errorModel so that the error are displayed in the form if needed
    const handleChangeForErrorHandler = (errorPart) => {
      this.errorModel = errorPart;
      this.isFormValid = getFormValidity(this.errorModel);
      this.forceUpdate();
    };

    // This function will be called when the user clicks on the preview button and an api call will
    // be made and the latest data will be fetched and showed in the visualization.
    const handleCommit = () => {
      const { valid, errorObject } = getFormErrorField(_.cloneDeep(this.errorModel), this.state.model);
      handleChangeForErrorHandler(errorObject);
      if (valid) {
        this.props.vis.updateState();
        this.setState(
          {
            dirty: false
          }
        );
        this.props.vis.dirty = false;
      }
    };

    // This function will be used to set sameLabelExists if two metrics has same name and if this is true
    // we are disabling the preview button
    const disablePreviewButtonIfSameLabelExists = (sameLabelArray) => {

      // Here we are checking if any entry in the array is true then we set this.sameLabelExists to true
      // otherwise to false to enable/disabled the preview button
      this.sameLabelExists = sameLabelArray.includes(true);
      this.props.vis.dirty = true;
    };

    // This function will be used to set errorInSavedSearchFound if there is an error in search while finding the
    // saved search object or the index for saved search is not found
    const disablePreviewButtonIfErrorInSavedSearchFound = (errorInSavedSearchArray) => {

      // Here we are checking if any entry in the array is true then we set this.errorInSavedSearchFound to true
      // otherwise to false to enable/disabled the preview button
      this.errorInSavedSearchFound = errorInSavedSearchArray.includes(true);
      this.props.vis.dirty = true;
    };

    const { model } = this.state;
    // This variable will be used decide whether we need to render only visualization or visualization + editable config.
    const isEditorMode = this.props.vis.isEditorMode();

    if (!isEditorMode) {
      if (!this.props.vis.params || !this.props.visData) return null;
      // const reversed = this.state.reversed;
      return (
        <VuMetricVisualization
          title={this.props.vis.title}
          model={model}
          visData={this.props.visData}
          isEditorMode={isEditorMode}
          Private={this.props.vis.angularInjectables.Private}
          getAppState={this.props.vis.angularInjectables.getAppState}
          timefilter={this.props.vis.angularInjectables.timefilter}
          config={this.props.config}
        />
      );
    }

    if (model && this.props.visData) {
      return (
        <div className="vu-metirc-vis">
          <VuMetricVisualizationAndApply
            dirty={this.state.dirty}
            isFormValid={this.isFormValid}
            title={this.props.vis.title}
            model={model}
            visData={this.props.visData}
            onCommit={handleCommit}
            onChange={handleChange}
            isEditorMode={isEditorMode}
            sameLabelExists={this.sameLabelExists}
            errorInSavedSearchFound={this.errorInSavedSearchFound}
            Private={this.props.vis.angularInjectables.Private}
            getAppState={this.props.vis.angularInjectables.getAppState}
            timefilter={this.props.vis.angularInjectables.timefilter}
            config={this.props.config}
            filterInjectorForVerticalTable={this.props.vis.angularInjectables.filter}
          />

          <div className="vu-metric-configuration-container">
            <div className="vu-metric-vis-name"> Vu Metric </div>
            <div className="vu-metric-configuration-tabs">
              <VuMetricPanelConfig
                model={model}
                errorModel={this.errorModel}
                onChange={handleChange}
                onErrorChange={handleChangeForErrorHandler}
                vis={this.props.vis}
                disablePreviewButtonIfSameLabelExists={disablePreviewButtonIfSameLabelExists}
                disablePreviewButtonIfErrorInSavedSearchFound={disablePreviewButtonIfErrorInSavedSearchFound}
                filterInjectorForSavedSearch={this.props.vis.angularInjectables.filter}
              />

            </div>
          </div>
        </div>
      );
    }

    return null;
  }

  componentDidMount() {
    this.props.renderComplete();
  }
}

VisEditor.defaultProps = {
  visData: {}
};

VisEditor.propTypes = {
  vis: PropTypes.object,
  visData: PropTypes.array,
  appState: PropTypes.object,
  renderComplete: PropTypes.func,
  config: PropTypes.object,
};

export default VisEditor;
