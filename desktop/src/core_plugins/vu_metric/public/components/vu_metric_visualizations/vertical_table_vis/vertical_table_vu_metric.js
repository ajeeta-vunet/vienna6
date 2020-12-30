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
import Tooltip from '../../lib/tooltip';
import './vertical_table_vu_metric.less';
import { vuMetricConstants } from '../../lib/vu_metric_constants';
import VuMetricHistoricalDataPercentage from '../components/historical_data_percentage/vu_metric_historical_data_percentage'
import { goToReferenceLink } from '../../lib/vu_metric_utils';
import { idealTextColor, colorLuminance } from 'ui/utils/color_filter';

class VerticalTableVuMetric extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() { }


  // This function is used to set the historical
  // data based on the value of icon coming from back end
  // for multiple metrics inline view.
  setTrendColor = (icon, upTrendColor) => {
    if (icon === 'fa-caret-up') {
      if (upTrendColor === 'green') {
        return 'green';
      } else {
        return 'red';
      }
    } else if (icon === 'fa-caret-down') {
      if (upTrendColor === 'green') {
        return 'red';
      } else {
        return 'green';
      }
    }
  };

  // This function will be called for the 2nd metric and so on...
  updateMetricAndHistoricalData = (metric, metricList, row, columnName, colIndex, model) => {
    let value;
    let formattedValue;
    let color;
    metricList.forEach(function (metricObj) {
      const label = metricObj.label;
      if (metric.label === label) {
        if (metric.value !== undefined) {
          value = metric.value;
          formattedValue = metric.formattedValue;
          color = metric.color;
        }
        else {
          value = 'N.A.';
          formattedValue = 'N.A.';
          color = 'N.A.';
        }
        row[columnName + colIndex] = { value: value, formattedValue: formattedValue, color: color };
        colIndex = colIndex + 1;
        // Add historic Data
        if (metric.hasOwnProperty('historicalData')) {
          metric.historicalData.forEach(function (hist, index) {
            const histColor = this.setTrendColor(hist.icon, metricList[index].upTrendColor);
            row[columnName + colIndex] = {
              value: hist.value,
              formattedValue: hist.formattedValue,
              color: histColor,
              icon: hist.icon,
              percentageChange: hist.percentageChange
            };
            colIndex = colIndex + 1;
          }, this);
        }
        else {
          model.historicalData.forEach(function () {
            row[columnName + colIndex] = { value: 'N.A.', formattedValue: 'N.A.', percentageChange: -1 };
            colIndex = colIndex + 1;
          });
        }
      }
    }, this);
  };

  onFilterClick = (field, value, indexId, negate) => {
    const $state = this.props.getAppState();
    const meta = [];
    const filter = {};
    filter.meta = { 'index': indexId, 'negate': negate };
    filter.query = {};
    filter.query.match = {};
    filter.query.match[field] = { 'query': value, 'type': 'phrase' };
    meta.push(filter);
    if ($state.query.language === 'lucene') {
      $state.$newFilters = meta;
    }
    $state.$newFilters = meta;
  };

  // This function receives each metric from the json response sent by back-end,
  // iterates through metric's buckets (if used) and store the bucket value and
  // metric value in an array object for the vertical view.

  // Sample response for a single metric BMV
  //[{"Total": {"value": 9,"groupName": "Total","label": "Total","severity": null,
  //"color": "#05a608","formattedValue": "9","description": "","insights": "Looks all fine",
  //"visualization_name": "Total","success": true,"metricIcon": ""}}]

  //Sample final output
  //[{"Column0":"Total"},{"Column0":{"value":9,"formattedValue":"9","color":"#05a608"}}]

  // Sample response for a single metric and single bucket BMV
  //[{"Total":
  //{"buckets":
  //[{"fieldName": "channel","key": "Easy Pay","metric": {
  //"value": 3,"visualization_name": "Total","groupName": "Total","metricIcon": "",
  //"success": true,"severity": null,"label": "Total","color": "#05a608",
  //"formattedValue": "3","description": "","insights": "Looks all fine"}}
  //]
  //}
  //}]

  //Sample final output for a single bucket and a single metric would be as following
  //[{"Column0":"channel","Column1":"Total"},
  //{"Column0":"Easy Pay","Column1":{"value":3,"formattedValue":"3","color":"#05a608"}}]

  // In the final arry, the first item would be the header info for the table.
  // The rest of the items are data row.

  iterateResults = (result, destList, stack, metricList, columnName, metricIndex, metricName, model, rowIndex = 1) => {
    Object.entries(result).forEach(([value, key]) => {
      if (metricName === '') metricName = value;
      if (key.hasOwnProperty('buckets')) {
        if (key.hasOwnProperty('key')) {
          stack.push(key.key);
        }
        this.iterateResults(key.buckets, destList, stack, metricList, columnName, metricIndex, metricName, model, rowIndex);
        stack.pop(key.key);
      }
      else {
        let row = {};
        let colIndex = 0;
        stack.forEach(function (key) {
          row[columnName + colIndex] = key;
          colIndex = colIndex + 1;
        });
        let metric = {};
        if (key.hasOwnProperty('metric')) {
          row[columnName + colIndex] = key.key;
          metric = key.metric;
        }
        else {
          metric = key;
        }
        // if no buckets used then there ll be only 2 objects in the array.
        // 1. Header 2. data
        // So get the 2nd object and update it from the 2nd metric
        let rowExists = {};
        if (this.props.model.aggregations.length === 0 && metricIndex > 0) {
          rowExists = destList[1];
        }
        // else if bucket is used then row might be already exists...
        // find the row by the bucket value and update it from the 2nd metric
        else if (Object.keys(row).length > 0) {
          // This is the $filter used to calcute the filter in the saved search
          const filterInjector = this.props.filterInjectorForVerticalTable;
          rowExists = filterInjector('filter')(destList, row);
        }
        // As mentioned in the previous steps, the first item in the
        // deslList would be the header containing the bucket name and
        // metric name. Get the column index for the incoming metric and
        // update it.
        let headerIndex = 0;
        Object.entries(destList[0]).forEach(([key, header]) => {
          if (header === metricName) {
            colIndex = headerIndex;
            return;
          }
          headerIndex = headerIndex + 1;
        })
        // if row exists for the bucket already then update it.
        if (Object.keys(rowExists).length > 0) {
          row = rowExists.length > 0 ? rowExists[0] : rowExists;
          this.updateMetricAndHistoricalData(metric, metricList, row, columnName, colIndex, model);
        }
        else {
          // If not exists add as a new row
          let index = 0;
          Object.entries(destList[0]).forEach(([column, metric]) => {
            const metric1 = {};
            if (Object.keys(row).length > 0 && !row.hasOwnProperty(column)) {
              metric1.value = 0;
              metric1.formattedValue = 0;
              metric1.label = metric;
              this.updateMetricAndHistoricalData(metric1, metricList, row, columnName, index, model);
            }
            index = index + 1;
          });
          this.updateMetricAndHistoricalData(metric, metricList, row, columnName, colIndex, model);
          destList.push(row);
        }
      }
      rowIndex = rowIndex + 1;
    });
  };

  sortColumn = (colIndex, colName, sortDirection = 'asc') => {
    if (self.sort.columnIndex === colIndex) {
      const directions = {
        null: 'asc',
        'asc': 'desc',
        'desc': null
      };
      sortDirection = directions[self.sort.direction];
    }
    self.sort.columnIndex = colIndex;
    self.sort.columnName = colName;
    self.sort.direction = sortDirection;
    if (sort) {
      _.assign(sort, self.sort);
    }
  };

  render() {

    const model = this.props.model;
    const visData = this.props.visData;

    // Check if aggregations, historical data and action buttons are configured and get the length for the same.
    let aggregationsLength = 0;
    let historicalDataLength = 0;
    let displayedMetrics = 0;

    if (model.aggregations.length) {
      aggregationsLength = model.aggregations.length;
    }

    if (model.historicalData.length) {
      historicalDataLength = model.historicalData.length;
    }

    // Check whether, more than one metrics needs to te displayed.
    // If it is only one metric, we would be displaying them
    // with CSS class used for single metric
    _.each(model.metrics, function (metric) {
      if (!metric.hideMetric) {
        displayedMetrics += 1;
      }
    });

    if (aggregationsLength === 0) {
      displayedMetrics = displayedMetrics;
    }

    // calculate the no of columns to set the width of each column  we are adding 2 at the end to
    // include the column headers 'Metric' and 'For selected time'.
    const noOfColumns = aggregationsLength + (displayedMetrics * (historicalDataLength + 1));

    const columnWidth = (100 / (noOfColumns)) + '%';

    let metricRowCount = 0;

    // Here the verticalDatas array will have the actual header and data.
    // The first item in the array would be column header and the rest are row data.
    // The sample output for the verticalDatas is below.
    // [{"Column0":"host","Column1":"type","Column2":"total"},
    // {"Column0":"127.0.0.1","Column1":"process",
    // "Column2":{"value":44458,"formattedValue":"44,458","color":"#05a608"}]
    let verticalTableData = [];
    // Here the columnMeta is the array containing the reference link,
    // show/hide, back ground color and historical data details for each metric.
    // The sample output for the columnmeta is below.
    // [{"Reference Link":{"dashboard":{"allowedRolesJSON":"[{\"name\":\"admin\",\"permission\":\"modify\"},
    // {\"name\":\"modify\",\"permission\":\"\"},{\"name\":\"view\",\"permission\":\"\"},
    // {\"name\":\"ANSRadmin\",\"permission\":\"\"}]","id":"42ff5910-33c7-11e9-873d-0d17f41ef83a",
    // "title":"New Dashboard"},"field":"host","retainFilters":false,"searchString":"",
    // "useFieldAsFilter":true},"historicData":false},{"plain text":"","historicData":false}]

    let columnMeta = [];
    const item = {};
    let colIndex = 0;
    const columnName = 'Column';

    let sort = {
      columnIndex: null,
      columnName: null,
      direction: null
    };

    self.sort = {
      columnIndex: null,
      columnName: null,
      direction: null
    };

    // go through bucket aggreagtions and check whether reference link
    // is created for any bucketing field.
    // If the selected bucketing field is available in the referene link
    // section then add the reference link details to the column meta array.
    for (let index = 0; index < model.aggregations.length; index++) {
      // Add bucket names to header
      let label = model.aggregations[index].customLabel;
      const field = model.aggregations[index].field;
      if (label === '') {
        label = model.aggregations[index].field;
      }
      item[columnName + colIndex] = label;
      colIndex = colIndex + 1;
      const refLink = {};
      let match = false;
      // If reference link is configured
      if (model.linkInfo.length) {
        // go though the reference links and check whether
        // the reference link field is used in bucket aggregations.
        for (const i in model.linkInfo) {
          if (field === model.linkInfo[i].field) {
            refLink['Reference Link'] = model.linkInfo[i];
            match = true;
          }
        }
      }
      // if not found then the corresponding aggregation bucket is just a
      // normal text and not a reference link.
      if (!match) {
        refLink['plain text'] = '';
      }
      refLink.historicData = false;
      // Set it to false as the aggregation header should be always visible
      columnMeta.push(refLink);
    }

    // Go through metrics and get the show/hide metric, background color
    // and reference link details to the column meta array.
    // We need to check the reference link only for the latest value metric type.
    model.metrics.forEach(function (metric, index) {
      const refLink = {};
      const metricIndex = index;
      // Add metric names and historic data names to header
      item[columnName + colIndex] = metric.label;
      colIndex = colIndex + 1;
      const field = metric.field;
      const type = metric.type;
      // Set it to true/false based on the hideMetric.
      refLink.hide = metric.hideMetric;
      refLink.bgColorEnabled = metric.bgColorEnabled;
      refLink.historicData = false;
      if (type === 'latest') {
        if (model.linkInfo.length) {
          for (const i in model.linkInfo) {
            if (field === model.linkInfo[i].field) {
              refLink['Reference Link'] = model.linkInfo[i];
              break;
            }
          }
        }
      }
      columnMeta.push(refLink);

      // Go though historical data and get show/hide, bg color, historical data
      // and add to the column data array
      model.historicalData.forEach(function (hist) {
        const refLink = {};
        item[columnName + colIndex] = hist.label;
        colIndex = colIndex + 1;
        // We need to hide historical data for the hidden metric also.
        // So set it to true/false based on the corresponding metric's hideMetric.
        refLink.hide = model.metrics[metricIndex].hideMetric;
        refLink.bgColorEnabled = model.metrics[metricIndex].bgColorEnabled;
        refLink.historicData = true;
        columnMeta.push(refLink);
      });
    });

    // it's very complex and difficult to achive show hide metrics if we add to
    // the existing verticalDatas list.
    // The existing verticalDatas list will have only the bucket/metric names in the first item.
    // in the rest items, we have metric value for the buckets.
    // Format of the verticalDatas  [["Target","memory","IO disk"],
    //["samson-Vostro-3578","0.92","1930773028.32"],["10.0.2.15",null,null],["127.0.0.1",null,null]]
    verticalTableData.push(item);
    visData.forEach(function (metricData, index) {
      this.iterateResults(metricData, verticalTableData, [], model.metrics, columnName, index, '', model);
    }, this);

    // metricRowCount is needed in the report related code to do some fixing of height issue for table scenarios
    metricRowCount = verticalTableData.length;

    return (
      <table className='vu-metric-vertical-table'>
        {
          verticalTableData.map((singleVerticalData, index) => {
            let outerIndex = index;
            return (
              <tr
                key={outerIndex}
                className="vu-metric-data-rows">
                {
                  Object.entries(verticalTableData[outerIndex]).map(([colName, value], index) => {
                    let columnIndex = index;
                    // We need to make this check on td instead of the div instide td, we are not able to achieve this with return
                    // columnMeta[columnIndex]['hide'] !== true ?
                    if (columnMeta[columnIndex]['hide'] !== true) {
                      return (
                        <td
                          key={columnIndex}
                          width={columnWidth}
                          className="vunet-table-td-metric-names"
                          style={columnMeta[columnIndex]['bgColorEnabled'] ?
                            { backgroundColor: value.color, color: idealTextColor(value.color) }
                            :
                            { color: value.color }}
                        >
                          <div
                            className='td-inner-div'
                            style={columnIndex >= aggregationsLength && (outerIndex !== 0 || outerIndex == 0) ?
                              { textAlign: 'center' }
                              :
                              { textAlign: 'left' }
                            }>
                            {
                              outerIndex !== 0 && columnMeta[columnIndex]['Reference Link'] ?
                                (
                                  <span>
                                    <a
                                      onClick={() => goToReferenceLink(
                                        this.props.Private,
                                        this.props.getAppState,
                                        this.props.timefilter,
                                        columnMeta[columnIndex]['Reference Link'],
                                        undefined,
                                        value.formattedValue !== undefined ? value.formattedValue : value
                                      )
                                      }
                                      style={columnMeta[columnIndex]['bgColorEnabled'] ?
                                        { backgroundColor: value.color, color: vuMetricConstants.COLOR_CONSTANTS.WHITE }
                                        :
                                        { color: value.color }}>
                                      <u> {value.formattedValue !== undefined ? value.formattedValue : value} </u>
                                    </a>
                                  </span>
                                )
                                :
                                null
                            }
                            {
                              outerIndex === 0 || (outerIndex !== 0 && columnMeta[columnIndex]['Reference Link'] === undefined) && columnMeta[columnIndex]['historicData'] !== true ?
                                (
                                  <span>
                                    {value.formattedValue !== undefined ? value.formattedValue : value}
                                  </span>
                                )
                                :
                                null
                            }
                            {
                              (outerIndex !== 0 && columnMeta[columnIndex]['historicData'] === true &&
                                (model.enableHistDataValueWithPercentage === true || model.enableHistDataPercentage !== true)) ?
                                (
                                  <span className='vertical-table-historical-data-value'>
                                    <i
                                      className={"vertical-table-historical-data-value-icon fa " + value.icon}
                                      aria-hidden="true">
                                    </i>
                                    <span>{value.formattedValue}</span>
                                  </span>
                                )
                                :
                                null
                            }
                            {/* Display historical data values in percentage */}
                            {
                              (outerIndex !== 0 && columnMeta[columnIndex]['historicData'] === true && (model.enableHistDataPercentage ||
                                model.enableHistDataValueWithPercentage)) ?
                                (
                                  <VuMetricHistoricalDataPercentage
                                    model={model}
                                    historicalDataObj={value}
                                  />
                                )
                                :
                                null
                            }
                            {/* This is used to show the sorting buttons on the header row */}
                            {
                              outerIndex === 0 ?
                                (
                                  <i className={"vertical-table-sort-icons fa " +
                                    (sort.columnIndex === columnIndex && sort.direction === 'asc' ? 'fa-sort-asc' : '') +
                                    (sort.columnIndex === columnIndex && sort.direction === 'desc' ? 'fa-sort-desc' : '') +
                                    (sort.columnIndex !== columnIndex || sort.direction === null ? 'fa-sort' : '')
                                  }
                                    onClick={() => this.sortColumn(columnIndex, colName)}
                                  >
                                  </i>
                                )
                                :
                                null
                            }

                            {/* This is used for description and reference link */}
                            {
                              model.metrics.map((metric, index) => {
                                if (outerIndex === 0 && value === metric.label) {
                                  return (
                                    <span className='vertical-table-description-and-link'>
                                      {
                                        metric.description !== undefined && metric.description !== '' ?
                                          (
                                            <Tooltip
                                              placement="bottom"
                                              text={metric.description}
                                            >
                                              <i className="fa fa-question-circle vertical-table-description-icon" />
                                            </Tooltip>
                                          )
                                          :
                                          null
                                      }
                                      {
                                        metric.referenceLink.enabled ?
                                          (
                                            <span
                                              className='vertical-table-view-more-link'
                                              onClick={() => goToReferenceLink(
                                                this.props.Private,
                                                this.props.getAppState,
                                                this.props.timefilter,
                                                metric.referenceLink,
                                                metric.filter
                                              )
                                              }
                                            >
                                              <Tooltip
                                                placement="right"
                                                text='View More'
                                              >
                                                <i className="fa fa-arrow-circle-o-right vertical-table-description-icon" />
                                              </Tooltip>
                                            </span>
                                          )
                                          :
                                          null
                                      }
                                    </span>
                                  )
                                }
                              })
                            }
                          </div>
                          {/* This is used to show the goal label for metric */}
                          {
                            model.metrics.map((metric, index) => {
                              if (outerIndex === 0 && value === metric.label) {
                                return (
                                  <div
                                    key={index}
                                    className='vumetric-vertical-table-goal-info'
                                    style={{ textAlign: 'center' }}>
                                    {metric.goalLabel}
                                  </div>
                                )
                              }
                            })
                          }
                          {/* This is ised to show the filter in and out when buckets are present */}
                          {
                            model.aggregations.map((aggregation, index) => {
                              if (outerIndex !== 0 && (verticalTableData[0]['Column' + columnIndex + ''] === aggregation.customLabel
                                || verticalTableData[0]['Column' + columnIndex + ''] === aggregation.field)) {
                                return (
                                  <div data-cell-content>
                                    <span className="vunet-vertical-table-cell-filter">
                                      <span
                                        onClick={() => this.onFilterClick(aggregation.field, value, aggregation.index, false)}
                                        className="fa fa-search-plus"
                                      ></span>
                                      <span
                                        onClick={() => this.onFilterClick(aggregation.field, value, aggregation.index, true)}
                                        className="fa fa-search-minus"
                                      ></span>
                                    </span>
                                  </div>
                                )
                              }
                            })
                          }

                        </td>
                      )
                    }

                  })
                }
              </tr>
            )
          })
        }
      </table>
    )
  }


}

VerticalTableVuMetric.propTypes = {
  model: PropTypes.object, //  This is the parameters object 
  visData: PropTypes.array, // This is array retured by the api
  Private: PropTypes.func, // This will be used for going to reference link to prepare link information
  getAppState: PropTypes.func, // This will be used for going to reference link to prepare link information
  timefilter: PropTypes.object, // This will be used for going to reference link to prepare link information
  config: PropTypes.object, // This will be used to all the configurations from Manage Resources -> Advanced Settings
  filterInjectorForVerticalTable: PropTypes.func // This is angular $filter injectable which will be used in vertical table
};

export default VerticalTableVuMetric;
