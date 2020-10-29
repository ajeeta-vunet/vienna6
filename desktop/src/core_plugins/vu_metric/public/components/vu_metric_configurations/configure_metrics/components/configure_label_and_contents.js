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
import createSelectHandler from '../../../lib/create_select_handler';
import createTextHandler from '../../../lib/create_text_handler';
import { VunetSwitch } from 'ui_framework/src/vunet_components/vunet_switch/vunet_switch';
import { VunetHelp } from 'ui_framework/src/vunet_components/vunet_help/vunet_help'
import { VunetSelect } from 'ui_framework/src/vunet_components/vunet_select/vunet_select';
import { getImagesForReactComponents } from 'ui/utils/vunet_image_utils.js';

class ConfigureLabelAndContents extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dashboardsList: [],
      configureLabelAndContentsHelp: false,
      referenceLinkHelp: false,
      metricIcons: []
    }
    this.intervalOptions = [
      '',
      'Previous Window',
      'This Day',
      'This Week',
      'This Month',
      'This Year',
      'Previous Day',
      'Day Before Previous Day',
      'Previous Week',
      'Previous Month',
      'Previous Year',
      'Last 15 Minutes',
      'Last 30 Minutes',
      'Last 1 Hours',
      'Last 4 Hours',
      'Last 12 Hours',
      'Last 24 Hours',
      'Last 7 days',
      'Last 30 days',
      'Last 60 days',
      'Last 90 days',
      'Last 6 Months',
      'Last 1 Years',
      'Last 2 Years',
      'Last 5 Years',
      'Last 10 Years',
      'DTD',
      'WTD',
      'MTD',
      'YTD',
      'Next Window',
      'Next Day',
      'Day After Next Day',
      'Next Week',
      'Next Month',
      'Next Year',
      'Next 24 Hours',
      'Next 12 Hours',
      'Next 4 Hours',
      'Next 1 Hours',
      'Next 15 Minutes',
      'Next 30 Minutes',
      'Next 7 days',
      'Next 30 days',
      'Next 60 days',
      'Next 90 days',
      'Next 6 Months',
      'Next 1 Years',
      'Next 2 Years',
      'Next 5 Years',
      'Next 10 Years',
      'Same Time Previous Day',
      'Same Time Day Before Previous Day',
      'Same Time Previous Week',
      'Same Time Previous Month',
      'Same Time Previous Year'
    ];
  }

  componentDidMount() {
    this.getDashboards().then(dashboards =>
      this.setState(
        {
          dashboardsList: dashboards
        }
      )
    )

    this.getStaticAndUploadedIcons().then(iconsArray => {
      this.setState(
        {
          metricIcons: iconsArray
        }
      )
    })
  };

  // This will fetch the icons from utils file
  getStaticAndUploadedIcons = async () => {
    let iconsArray = []
    await getImagesForReactComponents().then(function (icons) {
      let iconsObject = icons
      iconsArray = Object.keys(iconsObject);
    })

    // Here we are performing case insenstive comparison for sorting
    let sortedIconsArray = iconsArray.sort(function (a, b) {
      a = a.toLowerCase();
      b = b.toLowerCase();
      if (a == b) return 0;
      if (a > b) return 1;
      return -1;
    });

    return sortedIconsArray;

  }
  // This will fetch a list of the dahboards
  getDashboards = async () => {
    const resp = await this.props.savedObjectsProvider.find({
      type: 'dashboard',
      perPage: 1000
    });

    // Here we are performing case insenstive comparison for sorting
    let sortedDashoards = resp.savedObjects.sort(function (a, b) {
      a = a.attributes.title.toLowerCase();
      b = b.attributes.title.toLowerCase();
      if (a == b) return 0;
      if (a > b) return 1;
      return -1;
    });

    return sortedDashoards;
  }

  // This will be change where refrence link switch is toggled
  onReferenceLinkSwitchChange = checked => {
    const referenceLink = _.cloneDeep(this.props.metric.referenceLink);

    // If the swicth has been enabled we populate the first dashoard from the state in the dropdown and the model
    if (checked) {
      referenceLink.enabled = checked;

      // Here we are setting the dashboard title and dashboard id of the refrence link in the model as the
      // 1st value from the dashboards list
      referenceLink.dashboard.title = this.state.dashboardsList[0].attributes.title;
      referenceLink.dashboard.id = this.state.dashboardsList[0].id;
      const referenceLinkData = { referenceLink: referenceLink }
      this.props.handleChange(referenceLinkData, this.props.index)
    }

    // This will be called when the reference link is switched off we are setting referenceLink.enabled as false
    else if (!checked) {
      referenceLink.enabled = checked;

      // If the switch is switched off we are setting the dashboard id and title to '' (empty)
      referenceLink.dashboard.title = '';
      referenceLink.dashboard.id = '';
      const referenceLinkData = { referenceLink: referenceLink }
      this.props.handleChange(referenceLinkData, this.props.index)
    }

  }

  // This function will update the referenceLink enabled
  updateReferencePageDetails = (metric, value, index) => {
    const referenceLink = metric.referenceLink;
    referenceLink.type = value;
    const referenceLinkData = { referenceLink: referenceLink };
    this.props.handleChange(referenceLinkData, index);
  }

  // This function is used to update the dashboard details if dahboard is selected
  updateReferenceDashboardDetails = (metric, value, index) => {
    const referenceLink = metric.referenceLink;
    this.state.dashboardsList.map((dashboard) => {
      if (dashboard.attributes.title == value) {
        referenceLink.dashboard.id = dashboard.id;
        referenceLink.dashboard.title = dashboard.attributes.title;
      }
    })
    const referenceLinkData = { referenceLink: referenceLink };
    this.props.handleChange(referenceLinkData, index);
  }

  // This function will show refrence link setting based on switch on or off
  showReferenceLinkSettings = (metric, index) => {
    // this has been done to refreclt the change of pre selected dashboard

    const dashboardOptions = this.state.dashboardsList.map((dashboard) =>
      <option
        key={dashboard.id}
        id={dashboard.id}
        value={dashboard.attributes.title}
        className="dashboard-options"
      >
        {dashboard.attributes.title}
      </option>
    );
    if (metric.referenceLink.enabled) {
      return (
        <div className="row">
          <div className="col-sm-4 form-group">
            <label htmlFor="referencePage"> Select The Page Type
              <sup> *</sup>
            </label>
            <select
              className="reference-page form-control"
              id={'referencePage' + index}
              placeholder=""
              value={metric.referenceLink.type}
              onChange={(e) => this.updateReferencePageDetails(metric, e.target.value, index)}
            >
              <option value='dashboard'> Dashboard </option>
              <option value='event'> Event </option>
            </select>
          </div>
          {
            metric.referenceLink.type == 'dashboard' ?
              <div className="col-sm-4 form-group">
                <label htmlFor="selectDashboard"> Select Dashboard
                  <sup> *</sup>
                </label>
                <select
                  className="select-dashboard form-control"
                  id={'selectDashboard' + index}
                  placeholder=""
                  value={metric.referenceLink.dashboard.title != '' ? metric.referenceLink.dashboard.title : this.state.dashboardsList[0].attributes.title}
                  onChange={(e) => this.updateReferenceDashboardDetails(metric, e.target.value, index)}
                >
                  {dashboardOptions}
                </select>
              </div>
              : null
          }

        </div>
      )
    }
  }

  // This function will be called when used toggles retain current filters switch
  onRetainCurrentFiltersSwitchChange = checked => {
    const referenceLink = _.cloneDeep(this.props.metric.referenceLink);
    referenceLink.retainFilters = checked;
    const referenceLinkData = { referenceLink: referenceLink };
    this.props.handleChange(referenceLinkData, this.props.index);
  }

  // This function will be called when used toggles apply filters used in section 1 switch
  onApplyMetricFiltersSwitchChange = checked => {
    const referenceLink = _.cloneDeep(this.props.metric.referenceLink);
    referenceLink.useMetricFilter = checked;
    const referenceLinkData = { referenceLink: referenceLink };
    this.props.handleChange(referenceLinkData, this.props.index);
  }

  // This function is used to updated the search string
  updateSearchString = (value, metric, index) => {
    const referenceLink = metric.referenceLink;
    referenceLink.searchString = value;
    const referenceLinkData = { referenceLink: referenceLink };
    this.props.handleChange(referenceLinkData, index);
  }

  // This will be used to update the add additional fields
  updateAdditionalFields = (values, index) => {
    const addtionalFieldsInString = values.toString();
    let additionalFields = _.cloneDeep(this.props.metric.additionalFields);
    additionalFields = addtionalFieldsInString;
    const additionalFieldData = { additionalFields: additionalFields };
    this.props.handleChange(additionalFieldData, index);
  }

  // THis function will be used to show the help block for configure label and contents
  showConfigureLabelAndContentsHelp = () => {
    this.setState(
      {
        configureLabelAndContentsHelp: !this.state.configureLabelAndContentsHelp
      }
    )
  }

  // THis function will be used to show the help block for reference link and its contents
  showReferenceLinkHelp = () => {
    this.setState(
      {
        referenceLinkHelp: !this.state.referenceLinkHelp
      }
    )
  }


  render() {

    const handleSelectChange = createSelectHandler(this.props.handleChange);
    const handleTextChange = createTextHandler(this.props.handleChange);
    const metric = _.cloneDeep(this.props.metric);
    const index = _.cloneDeep(this.props.index);
    const errorModel = this.props.errorModel;
    let selectedAdditionalFields = [];
    if (metric.additionalFields !== '' && !metric.additionalFields.includes(',')) {
      selectedAdditionalFields.push(metric.additionalFields)
    }
    else if (metric.additionalFields !== '' && metric.additionalFields.includes(',')) {
      selectedAdditionalFields = metric.additionalFields.split(',')
    }

    let rawAdditionalFields = [];
    if (this.props.additionalFields) {
      rawAdditionalFields = this.props.additionalFields
    }

    const allAdditionalFields = rawAdditionalFields.map((field) => {
      field.key = field.name;
      field.value = field.name;
      return field;
    })

    const metricIconOptions = this.state.metricIcons.map((icon) =>
      <option
        key={icon}
        value={icon}
        className="vu-metric-icon-option"
      >
        {icon}
      </option>
    );

    const intervalOptionsForSelect = this.intervalOptions.map((interval) =>
      <option
        key={interval}
        value={interval}
        className="interval-options"
      >
        {interval}
      </option>
    );

    const configureLabelAndContentsHelpMeta = {
      headerText: 'Helping Hand',
      referenceLink: '/vuDoc/user_guide/visualization.html#options',
      contentIntroduction: 'Configure additional contents and controls to be displayed.',
      contentList: [
        {
          description: 'The following additional contents can be enabled for the metric:',
          nestedContent: [
            {
              title: 'Goal',
              description: 'Value configured here will be displayed as expected value for this metric. ' +
                'Provides a useful way to show the expected value for a metric to users for comparison.'
            },
            {
              title: 'Icon',
              description: 'Icon to be displayed for this metric. Currently, this icon is displayed only in KPI and CJM visualisations created using this Vu Metric.'
            },
            {
              title: 'Description  <i class="icon-no-results-found" title="This configuration is for advanced settings">',
              description: 'Detailed description configured here will be displayed as a tool tip for the metric.'
            },
            {
              title: 'Include These Fields  <i class="icon-no-results-found" title="This configuration is for advanced settings">',
              description: 'Additional fields to be added along with metric value. Currently, used only in alert rules using this Vu Metric.'
            }
          ]
        },
        {
          description: 'The following controls can be used to manage the displayed contents:',
          nestedContent: [
            {
              title: 'Group Name',
              description: 'Facility to group metrics in this visualization into logical groups.' +
                ' Metrics with the same Group Name will be placed together when displayed in UTM Map.' +
                ' The grouping of metrics is done across all Vu Metric visualizations.' +
                ' This way, related metrics from different visualizations can be grouped together in UTM.'
            },
            {
              title: 'Trend Indication  <i class="icon-no-results-found" title="This configuration is for advanced settings">',
              description: 'Use this to control the color of the arrow icon showing the trend of metric value relative to past data.' +
                ' By default, an increase in value compared to past data is shown in green.'
            },
            {
              title: 'Interval  <i class="icon-no-results-found" title="This configuration is for advanced settings">',
              description: 'This configuration provides a way to override the global time selector. The interval configured here will be used ' +
                'to calculate and show the metric. Interval is calculated relative to the end time specified in the global time selector.' +
                'The Filters are to be specified using the vuSmartMaps Query Language.' +
                '\n </b><u><i> Examples: </i></u></b>' +
                '\n  Global Time selector: Last 4 Hours and Interval: Previous Day results in metric being calculated for Yesterday.' +
                '\n  Global Time selector: Yesterday and Interval: Previous Day results in metric being calculated for Day Before Yesterday.'
            }
          ]
        }
      ]
    }

    const referenceLinkHelpMeta = {
      headerText: 'Helping Hand',
      referenceLink: '/vuDoc/user_guide/visualization.html#options',
      contentIntroduction: 'The following controls can be used to provide link to another page and the settings for the link.',
      contentList: [
        {
          title: 'Add Link to Another Page',
          description: 'Provide a clickable link to another page on the metric value displayed. Useful to provide a drill down workflow that ' +
            'takes the user to a detailed dashboard or events page.'
        },
        {
          title: 'Use This Filter',
          description: 'Use the filter configured here when moving to linked Page. Filters are specified in standard vuSmartMaps Query Language.'
        },
        {
          title: 'Retain Currently Applied Filters',
          description: 'Retain all filters and searches currently applied to the page when moving to the linked page.'
        },
        {
          title: 'Apply Filters Configured For Metric',
          description: 'When moving to the linked page, apply filters configured for this metric.' +
            '\n </b><u><i> Examples: </i></u></b>' +
            '\n  Consider a metric that displays Error Counters based on a filter type:error. If Apply Filters Option is used,' +
            ' clicking and moving to a linked Dashboard will result in filter type:error getting applied in the new page.' +
            ' This enables users to view information relevant to the metric in the linked page.'
        }
      ]
    }

    return (
      <div className="configure-label-and-contents" >
        <div className="configure-label-and-contents-row">
          <div className="configure-label-and-contents-heading">
            <div className="configure-label-and-contents-header-number">
              02.
            </div>
            <div className="configure-label-and-contents-title-container">
              <span className="configure-label-and-contents-header-title"> Configure Label And Contents </span>
              <i className="configure-label-and-contents-help-icon icon-help-blue"
                onClick={this.showConfigureLabelAndContentsHelp}
                data-tip="Click the help icon to open the help section block" />
              <ReactTooltip />
            </div>
          </div>
        </div>

        {
          this.state.configureLabelAndContentsHelp &&
          (
            <VunetHelp
              backgroundColor={'white'}
              metaData={configureLabelAndContentsHelpMeta}
              onClose={this.showConfigureLabelAndContentsHelp.bind(this)}
            />
          )
        }

        <div className="configure-label-and-contents-body">
          <div className="row border-bottom-row">
            <div className="col-sm-4 form-group">
              <label htmlFor="groupName"> Group Name</label>
              <input
                className="group-name form-control"
                id={'groupName' + index}
                placeholder="Type the group name."
                value={metric.groupName}
                onChange={handleTextChange('groupName', index)}
              />
              {errorModel.metrics[index].groupName.errorText &&
                (
                  <div className='error-text'>{errorModel.metrics[index].groupName.errorText}</div>
                )
              }
            </div>

            <div className="col-sm-4 form-group">
              <label htmlFor="goal"> Goal</label>
              <input
                className="goal form-control"
                id={'goal' + index}
                placeholder="Type the goal."
                value={metric.goalLabel}
                onChange={handleTextChange('goalLabel', index)} />
              {errorModel.metrics[index].goalLabel.errorText &&
                (
                  <div className='error-text'>{errorModel.metrics[index].goalLabel.errorText}</div>
                )
              }
            </div>

            <div className="col-sm-4 form-group">
              <label htmlFor="icons"> Icon</label>
              <select
                className="icons form-control"
                id={'icons' + index}
                required
                placeholder="Select the icon to be used."
                value={metric.metricIcon}
                onChange={handleSelectChange('metricIcon', index)}
              >
                <option
                  key='empty-icon'
                  className='empty-select-icon'
                  value=''
                >
               
                </option>
                {metricIconOptions}
              </select>
            </div>
          </div>
          {metric.advanceConfigSwitch &&
            (
              <div className="row row-without-bottom-margin">
                <div className="col-sm-4 form-group">
                  <label htmlFor="description"> Description </label>
                  <input
                    className="description form-control"
                    id={'description' + index}
                    placeholder="Type the description."
                    value={metric.description}
                    onChange={handleTextChange('description', index)}
                  />
                  {errorModel.metrics[index].description.errorText &&
                    (
                      <div className='error-text'>{errorModel.metrics[index].description.errorText}</div>
                    )
                  }
                </div>

                <div className="col-sm-4 form-group additional-fields-multiselect">
                  <label htmlFor="additionalFields"> Include These Fields</label>
                  <VunetSelect
                    id={'additionalFields' + index}
                    placeholder="Select additonal fields."
                    values={selectedAdditionalFields}
                    options={allAdditionalFields}
                    callback={(e) => { this.updateAdditionalFields(e.values, index) }}
                    multiple
                  />
                </div>

                <div className="col-sm-4 form-group">
                  <label htmlFor="upwardTrend"> Indicate Upward Trend With</label>
                  <select
                    className="upward-trend form-control"
                    id={'upwardTrend' + index}
                    placeholder="Select the color for  indication of the updawrad trend."
                    value={metric.upTrendColor}
                    onChange={handleSelectChange('upTrendColor', index)}>
                    <option value="red">Red</option>
                    <option value="green">Green</option>
                  </select>
                </div>
              </div>
            )
          }

          {metric.advanceConfigSwitch &&
            (
              <div className="row border-bottom-row">
                <div className="col-sm-4 form-group">
                  <label htmlFor="intervalOptions"> Interval Options</label>
                  <select
                    className="interval-options form-control"
                    id={'intervalOptions' + index}
                    placeholder="Select the interval options."
                    value={metric.intervalMetric}
                    onChange={handleSelectChange('intervalMetric', index)}>
                    {intervalOptionsForSelect}
                  </select>
                </div>
              </div>
            )
          }


          <div className={((!metric.referenceLink.enabled && this.state.referenceLinkHelp) || (!metric.referenceLink.enabled && !this.state.referenceLinkHelp)) ? 'row' : ''}>
            <div className="reference-link-container">
              <VunetSwitch
                onChange={this.onReferenceLinkSwitchChange.bind(this)}
                checked={metric.referenceLink.enabled}
              />
              <span className="reference-link-text"> Add Link to another page </span>
              <i className="reference-link-help-icon icon-help-blue"
                onClick={this.showReferenceLinkHelp}
                data-tip="Click the help icon to open the help section block" />
              <ReactTooltip />
            </div>

            {
              this.state.referenceLinkHelp &&
              (
                <VunetHelp
                  backgroundColor={'white'}
                  metaData={referenceLinkHelpMeta}
                  onClose={this.showReferenceLinkHelp.bind(this)}
                />
              )
            }

          </div>

          {this.showReferenceLinkSettings(metric, index)}
          {metric.referenceLink.enabled &&
            (
              <div className="filters-while-moving-to-new-page-container">
                <div className="row">
                  <div className="filters-while-moving-to-new-page-title">
                    Filters To Be Used While Moving To New Page.
                  </div>
                </div>

                <div className="row">
                  <div className="col-sm-4 form-group">
                    <label htmlFor="useSearchString"> Use This Filter </label>
                    <input
                      className="use-search-string form-control"
                      id={'useSearchString' + index}
                      placeholder="Type the filter."
                      value={metric.referenceLink.searchString}
                      onChange={(e) => this.updateSearchString(e.target.value, metric, index)}
                    />
                  </div>

                  <div className="retain-currently-applied-filters-container col-sm-3">
                    <div className="retain-curerent-filters-switch">
                      <VunetSwitch
                        onChange={this.onRetainCurrentFiltersSwitchChange.bind(this)}
                        checked={metric.referenceLink.retainFilters} />
                    </div>
                    <span className="retain-currently-applied-filters-text"> Retain Currently Applied Filters </span>
                  </div>

                  <div className="apply-filters-from-section1-container col-sm-5">
                    <div className="apply-metric-filters-switch">
                      <VunetSwitch
                        onChange={this.onApplyMetricFiltersSwitchChange.bind(this)}
                        checked={metric.referenceLink.useMetricFilter} />
                    </div>
                    <span className="apply-filters-from-section1-text"> Apply Filters Configured For Metric
                    </span>
                  </div>
                </div>
              </div>
            )
          }

        </div>

      </div >
    );
  }
}

ConfigureLabelAndContents.propTypes = {
  index: PropTypes.number,
  metric: PropTypes.object,
  model: PropTypes.object,
  onChange: PropTypes.func,
  handleChange: PropTypes.func,
  savedObjectsProvider: PropTypes.object,
  errorModel: PropTypes.object,
  onErrorChange: PropTypes.func,
  additionalFields: PropTypes.array
};

export default ConfigureLabelAndContents;