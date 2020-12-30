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
import '../set_theme/set_theme_tab.less';
import ReactTooltip from 'react-tooltip';
import { VunetSwitch } from 'ui_framework/src/vunet_components/vunet_switch/vunet_switch';
import { VunetDataTable } from 'ui_framework/src/vunet_components/vunet_table/vunet_table';

class SetThemeTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showSetTheme: true,
      horizontalFormat: this.props.model.tabularFormat == 'horizontal' ? true : false,
      verticalFormat: this.props.model.tabularFormat == 'vertical' ? true : false,
      dashboardsList: [],
      intersectionList: []
    };
  }

  componentDidMount() {
    this.getDashboards().then(dashboards =>
      this.setState(
        {
          dashboardsList: dashboards
        }
      )
    );
    this.getIntersectionList();
  }

  // This will fetch a list of the dahboards
  getDashboards = async () => {
    const resp = await this.props.savedObjectsProvider.find({
      type: 'dashboard',
      perPage: 1000
    });
    return resp.savedObjects;
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
  // This function will be used to show set theme
  showHideSetTheme = () => {
    if (this.state.showSetTheme) {
      this.setState(
        {
          showSetTheme: false
        }
      );
    }
    else if (!this.state.showSetTheme) {
      this.setState(
        {
          showSetTheme: true
        }
      );
    }
  }

  // This function will be called when user switches the enable tabular format switch
  onShowTabularFormatSwitchChange = checked => {
    const model = this.props.model;
    model.enableTableFormat = checked;
    this.props.onChange(model);
  }

  // This function will be called when user switches the enable horizontal format switch
  onShowHorizontalTableSwitchChange = checked => {
    const model = this.props.model;
    if (checked) {
      this.setState(
        {
          horizontalFormat: checked,
          verticalFormat: false
        }
      );
      model.tabularFormat = 'horizontal';
      this.props.onChange(model);
    }
    else if (!checked) {
      this.setState(
        {
          horizontalFormat: checked,
          verticalFormat: true
        }
      )
      model.tabularFormat = 'vertical';
      this.props.onChange(model);
    }
  }

  // This function will be called when user switches the enable vertical format switch
  onShowVerticalTableSwitchChange = checked => {
    const model = this.props.model;
    if (checked) {
      this.setState(
        {
          horizontalFormat: false,
          verticalFormat: checked
        }
      );
      model.tabularFormat = 'vertical';
      this.props.onChange(model);
    }
    else if (!checked) {
      this.setState(
        {
          horizontalFormat: true,
          verticalFormat: checked
        }
      );
      model.tabularFormat = 'horizontal';
      this.props.onChange(model);
    }
  }

  // This function will open the vunet table to enter the reference link configurations
  onShowEnableReferanceLinksSwitchChange = checked => {
    const model = this.props.model;
    model.linkInfoValues = checked;
    this.props.onChange(model);
  }

  // This function will be used to set the metric font size
  setMetricFontSize = (value) => {
    const model = this.props.model;
    model.fontSize = value;
    this.props.onChange(model);
  }

  // This function will be used to set the text font size
  setTextFontSize = (value) => {
    const model = this.props.model;
    model.textFontSize = value;
    this.props.onChange(model);
  }

  // This function will be used to enable the custom no-data-message
  enableCustomErrorMessageChange = checked => {
    const model = this.props.model;
    model.enableCustomErrorMessage = checked;
    this.props.onChange(model);
  }

  enableCustomErrorTooltipChange = checked => {
    const model = this.props.model;
    model.enableCustomErrorTooltip = checked;
    this.props.onChange(model);
  }

  // This function will be used to update the custom error message
  updateCustomErrorMessage = (value) => {
    const model = this.props.model;
    model.customErrorMessage = value;
    this.props.onChange(model);
  }

  updateCustomErrorTooltip = (value) => {
    const model = this.props.model;
    model.customErrorTooltip = value;
    this.props.onChange(model);
  }

  // this function will be used to the fetch the values for link info
  fetchItemsLinkInfo = () => {
    const linkInfoModel = _.cloneDeep(this.props.model.linkInfo);
    const linkInfoForMeta = [];
    linkInfoModel.map((linkInfo) => {
      const linkInfoToPush = {};
      linkInfoToPush.field = linkInfo.field;
      linkInfoToPush.dashboard = linkInfo.dashboard.title;
      linkInfoToPush.searchString = linkInfo.searchString;
      linkInfoToPush.retainFilters = linkInfo.retainFilters;
      linkInfoToPush.useFieldAsFilter = linkInfo.useFieldAsFilter;
      linkInfoForMeta.push(linkInfoToPush);
    });
    return new Promise((resolve) => resolve(linkInfoForMeta));
  }

  // This will be used to delete the selected entries from the table
  deleteSelectedItemsForLinkInfo = (rows) => {
    const model = _.cloneDeep(this.props.model);
    rows.map((row) => {
      const indexToFind = model.linkInfo.indexOf(row);
      model.linkInfo.splice(indexToFind, 1);
    });
    this.props.onChange(model);
    return Promise.resolve('');
  }

  // This will be used on submit of link info values table
  onSubmitForLinkInfo = (event, linkInfoId, linkInfoData) => {
    const model = _.cloneDeep(this.props.model);
    const dashboardObject = {};
    this.state.dashboardsList.map((dashboard) => {
      if (linkInfoData.dashboard == dashboard.attributes.title) {
        dashboardObject.id = dashboard.id;
        dashboardObject.title = dashboard.attributes.title;
        dashboardObject.allowedRolesJSON = dashboard.attributes.allowedRolesJSON;
      }
    });
    if (event === 'add') {
      const newLinkInfo = {
        field: linkInfoData.field,
        searchString: linkInfoData.searchString ? linkInfoData.searchString : '',
        dashboard: dashboardObject,
        retainFilters: linkInfoData.retainFilters === 'Yes' ? true : false,
        useFieldAsFilter: linkInfoData.useFieldAsFilter === 'Yes' ? true : false,
        field: linkInfoData.field,
      };
      model.linkInfo.push(newLinkInfo);
      this.props.onChange(model);
      return Promise.resolve(true);
    }
    else if (event == 'edit') {
      let linkInfoDataToFindIndexOf = {};
      model.linkInfo.map((linkInfoValue) => {
        if (linkInfoValue.field == linkInfoId) {
          linkInfoDataToFindIndexOf = linkInfoValue;
        }
      });
      const indexOfData = model.linkInfo.indexOf(linkInfoDataToFindIndexOf);

      const changedLinkInfo = {
        field: linkInfoData.field,
        searchString: linkInfoData.searchString ? linkInfoData.searchString : '',
        dashboard: dashboardObject,
        retainFilters: linkInfoData.retainFilters === 'Yes' ? true : false,
        useFieldAsFilter: linkInfoData.useFieldAsFilter === 'Yes' ? true : false,
        field: linkInfoData.field,
      };

      model.linkInfo.splice(indexOfData, 1, changedLinkInfo);

      this.props.onChange(model);
      return Promise.resolve(true);
    }
  }

  // This function will be used to check if the field name is unique or not
  validateFieldName = (key, value) => {
    return this.props.model.linkInfo.find(linkInfo => linkInfo[key] === value) ? true : false;
  }

  render() {

    console.log(' this.state.intersectionList', this.state.intersectionList)
    const linkInfoMeta = {
      headers: ['Field', 'Dashboard', 'Search String', 'Reatin Filters', 'Use Field As Filter'],
      rows: ['field', 'dashboard', 'searchString', 'retainFilters', 'useFieldAsFilter'],
      id: 'field',
      add: true,
      edit: true,
      title: 'Enable Reference Link for Fields',
      selection: true,
      search: false,
      default: { retainFilters: 'No', useFieldAsFilter: 'Yes' },
      table:
        [
          {
            key: 'field',
            label: 'Field Name',
            type: 'select',
            name: 'field',
            validationCallback: this.validateFieldName,
            options: [{ key: '', label: '', name: 'field', value: '' }],
            props: {
              required: true,
            },
            errorText: 'Field Name should be unique.'
          },
          {
            key: 'dashboard',
            label: 'Dashboard Name',
            type: 'select',
            name: 'dashboard',
            options: [{ key: '', label: '', name: 'dashboard', value: '' }],
            props: {
              required: true
            }
          },
          {
            key: 'searchString',
            label: 'Search String',
            type: 'text',
            name: 'searchString',
            props: {
              pattern: '^(.{0,999})$'
            },
            errorText: 'Search String should not exceed 1000 characters'
          },
          {
            key: 'retainFilters',
            label: 'Reatin Filters',
            type: 'radio',
            name: 'retainFilters',
            checked: true,
            options: [
              { key: 'true', label: 'Yes', name: 'retainFilters', value: 'Yes' },
              { key: 'false', label: 'No', name: 'retainFilters', value: 'No' },
            ],
          },
          {
            key: 'useFieldAsFilter',
            label: 'Use Field As Filter',
            type: 'radio',
            name: 'useFieldAsFilter',
            checked: true,
            options: [
              { key: 'true', label: 'Yes', name: 'useFieldAsFilter', value: 'Yes' },
              { key: 'false', label: 'No', name: 'useFieldAsFilter', value: 'No' },
            ],
          }
        ]
    };

    // This has been done to update the options of fields
    this.state.intersectionList.map((field) => {
      linkInfoMeta.table[0].options.push({
        key: field.name, label: field.name, name: 'field', value: field.name
      });
    });

    // This has been done to update the option of dashboards
    this.state.dashboardsList.map((dashboard) => {
      linkInfoMeta.table[1].options.push({
        key: dashboard.attributes.title, label: dashboard.attributes.title, name: 'dashboard', value: dashboard.attributes.title
      });
    });

    return (
      <div className="set-theme-tab-container">
        <div className="set-theme-description">
          Configure display formats and sizes.
        </div>

        <div className="set-theme-container">
          <div className="row set-theme-header-row">
            <div
              className="set-theme-expander-icon"
              onClick={() => this.showHideSetTheme()}
            >
              <i className={(this.state.showSetTheme ? 'icon-arrow-up' : 'icon-arrow-down')} />
            </div>
            <div className="set-theme-heading">
              Theme
            </div>
          </div>

          {this.state.showSetTheme &&
            (
              <div className="display-format-container">
                <div
                  className={'row tabular-format-switch ' +
                    (this.props.model.aggregations.length >= 1 ? 'disabled-icon' : null)
                  }
                >
                  <VunetSwitch
                    onChange={this.onShowTabularFormatSwitchChange.bind(this)}
                    checked={this.props.model.enableTableFormat}
                  />
                  <span className="display-metrics-in-table"> Display Metrics in Tabular Format </span>
                </div>
                {this.props.model.enableTableFormat &&
                  (
                    <div className="enable-table-format-container">
                      <div className="row tablur-formats-and-fucntions-row">
                        <div className="horizontal-format-switch">
                          <VunetSwitch
                            onChange={this.onShowHorizontalTableSwitchChange.bind(this)}
                            checked={this.state.horizontalFormat}
                          />
                          <span className="horizontal-format"> Horizontal </span>
                        </div>
                        <div className="vertical-format-switch">
                          <VunetSwitch
                            onChange={this.onShowVerticalTableSwitchChange.bind(this)}
                            checked={this.state.verticalFormat}
                          />
                          <span className="vertical-format"> Vertical </span>
                        </div>
                      </div>
                      {
                        this.state.verticalFormat &&
                        (
                          <div className="row enable-link-for-fields">
                            <VunetSwitch
                              onChange={this.onShowEnableReferanceLinksSwitchChange.bind(this)}
                              checked={this.props.model.linkInfoValues}
                            />
                            <span className="reference-links-text"> Enable Reference Link for Fields </span>
                            <i className="vertical-format-ref-links-help-icon icon-help-blue" data-tip="qwertyui-awsertyuiop-awertyuiop" />
                            <ReactTooltip />
                          </div>
                        )
                      }

                    </div>
                  )
                }
                {this.props.model.linkInfoValues &&
                  (
                    <div className="reference-links-table row">
                      <VunetDataTable
                        fetchItems={this.fetchItemsLinkInfo}
                        deleteSelectedItems={this.deleteSelectedItemsForLinkInfo}
                        metaItem={linkInfoMeta}
                        onSubmit={this.onSubmitForLinkInfo}
                      />
                    </div>
                  )
                }
              </div>
            )
          }
          <div className="font-size-settings-row row">
            <div className="col-sm-4 form-group">
              <label htmlFor="metricFontSize"> Metric Font Size = {this.props.model.fontSize}</label>
              <i className="icon-help-blue" data-tip="Control the font size of metric displayed." />
              <ReactTooltip />
              <input
                className="metric-font-size vunet-slider form-control"
                id="metricFontSize"
                type="range"
                min="0"
                max="120"
                value={this.props.model.fontSize}
                onChange={(e) => this.setMetricFontSize(e.target.value)}
              />
            </div>
            <div className="col-sm-4 col-sm-offset-1 form-group">
              <label htmlFor="textFontSize"> Text Font Size = {this.props.model.textFontSize}</label>
              <i className="icon-help-blue" data-tip="Control the font size of text displayed." />
              <ReactTooltip />
              <input
                className="text-font-size vunet-slider form-control"
                id="textFontSize"
                placeholder=""
                type="range"
                min="0"
                max="100"
                value={this.props.model.textFontSize}
                onChange={(e) => this.setTextFontSize(e.target.value)}
              />
            </div>
          </div>


          <div className="no-data-message-options-row row">
            <div className="col-sm-4">
              <div className="enabe-custom-no-data-message">
                <VunetSwitch
                  onChange={this.enableCustomErrorMessageChange.bind(this)}
                  checked={this.props.model.enableCustomErrorMessage}
                />
                <span className="enable-custom-no-data-message-text"> Enable custom message for no data scenarios</span>
                <i
                  className="help-icon icon-help-blue"
                  data-tip="Enable for custom message when there is no data."
                />
                <ReactTooltip />
              </div>
              {this.props.model.enableCustomErrorMessage &&
                (
                  <div className="custom-no-data-message form-group">
                    <label htmlFor="customErrorMessage"> Enter error message </label>
                    <input

                      maxLength="41"
                      className="custom-message form-control"
                      id={'customErrorMessage'}
                      placeholder="No data to show."
                      value={this.props.model.customErrorMessage}
                      onChange={(e) => this.updateCustomErrorMessage(e.target.value)}
                    />
                  </div>
                )
              }
            </div>

            <div className="col-sm-4 col-sm-offset-1">
              {this.props.model.enableCustomErrorMessage &&
                (
                  <div className="enabe-custom-no-data-message-tooltip">
                    <VunetSwitch
                      onChange={this.enableCustomErrorTooltipChange.bind(this)}
                      checked={this.props.model.enableCustomErrorTooltip}
                    />
                    <span className="enable-custom-no-data-tooltip"> Enable custom tooltip message</span>
                    <i
                      className="help-icon icon-help-blue"
                      data-tip="Enable for custom tooltip."
                    />
                    <ReactTooltip />
                  </div>
                )
              }
              {(this.props.model.enableCustomErrorMessage && this.props.model.enableCustomErrorTooltip) &&
                (
                  <div className="custom-no-data-message-tolltip form-group">
                    <label htmlFor="customErrorTooltip"> Enter error message </label>
                    <input

                      maxLength="81"
                      className="custom-message-tooltip form-control"
                      id={'customErrorTooltip'}
                      placeholder="There is no matching data for the selected time and filter criteria."
                      value={this.props.model.customErrorTooltip}
                      onChange={(e) => this.updateCustomErrorTooltip(e.target.value)}
                    />
                  </div>
                )

              }
            </div>

          </div>
        </div>
      </div>

    );
  }
}


SetThemeTab.propTypes = {
  model: PropTypes.object, //  This is the parameters object
  onChange: PropTypes.func, // This is the callback function for form changes to update the latest model to state
  savedObjectsProvider: PropTypes.object, // This will be used for the API like get saved dashboards
  vis: PropTypes.object,
};

export default SetThemeTab;