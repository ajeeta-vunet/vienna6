/** 
 * ------------------------- NOTICE ------------------------------- 
 *
 *                  CONFIDENTIAL INFORMATION                       
 *                  ------------------------                       
 *    This Document contains Confidential Information or           
 *    Trade Secrets, or both, which are the property of VuNet      
 *    Systems Ltd.  This document may not be copied, reproduced,   
 *    reduced to any electronic medium or machine readable form    
 *    or otherwise duplicated and the information herein may not   
 *    be used, disseminated or otherwise disclosed, except with    
 *    the prior written consent of VuNet Systems Ltd.              
 *                                                                 
 *------------------------- NOTICE ------------------------------- 
 
 * Copyright 2020 VuNet Systems Ltd.
 * All rights reserved.
 * Use of copyright notice does not imply publication.
*/

import React from 'react';
import { Metrics, Metric, KpiMetric, TableMetric } from '@vu/types';
import _ from 'lodash';
import { BaseVisualization, ViewDashboardProp, ViewDashboardState } from '../base-component';
import { VisShell } from '../shell/shell';
import { BMV_MAX_ROWS } from './config';
import { Link } from 'react-router-dom';
import { ExpandedVisualizationUrl } from '@vu/vis';
type MetricWithKey = {
  key: string;
} & (TableMetric | KpiMetric);

export type BucketTableProps = { data: MetricWithKey[] };
type TableCell = { value: string; color: string } | string;
type FlatMetrics = { header: string[]; rows: FlatMetric[] };
type FlatMetric = { columns: TableCell[]; data: Metric[] };

const extractKeys = (data: TableMetric): MetricWithKey[] =>
  Object.entries(data)
    .filter((a) => typeof a[1] !== 'string' && typeof a[1] !== 'number')
    .map((key) => ({ key: key[0], ...(key[1] as TableMetric | KpiMetric) }));

/**
 * Displays A bucketed Table
 *
 * @export
 * @class BucketTable
 * @extends {(BaseVisualization<BucketTableProps & ViewDashboardProp>)}
 */
export class BucketTable extends BaseVisualization<ViewDashboardProp, ViewDashboardState> {
  render() {
    if (this.props.data.type !== 'table' && this.props.data.type !== 'trend') {
      return null;
    }

    const flattenedData: FlatMetrics = flattenData(this.props.data);
    const sliceTo =
      flattenedData.rows.length > BMV_MAX_ROWS && !this.props.full ? BMV_MAX_ROWS - 1 : flattenedData.rows.length;

    return (
      <VisShell {...this.props}>
        <div className="table-responsive">
          {flattenedData.rows.length === 0 ? (
            <h1 className="text-center py-5">No data</h1>
          ) : (
            <table className="table mb-0">
              <thead>
                <tr>
                  <th>
                    <b>{this.props.data.fieldName}</b>
                  </th>
                  {flattenedData.header.map((a) => (
                    <th key={a}>
                      <b>{a}</b>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {flattenedData.rows.slice(0, sliceTo).map((a: FlatMetric, i) => (
                  <tr key={i}>
                    {a.columns.map((b, i) =>
                      typeof b === 'string' ? (
                        <td key={i}>{b}</td>
                      ) : (
                        <td key={i} style={{ color: b.color }}>
                          {b.value}
                        </td>
                      ),
                    )}
                    {flattenedData.header.slice(a.columns.length - 1).map((v, i) => {
                      const val: Metric = a.data[i] ? a.data[i] : null;
                      return (
                        <td key={i} style={{ color: val ? val.color : '' }}>
                          {val ? val.formattedValue : 'No Value'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
              {flattenedData.rows.length > BMV_MAX_ROWS && !this.props.full ? (
                <tfoot>
                  <tr>
                    <td className="text-center text-link" colSpan={100}>
                      <Link
                        to={ExpandedVisualizationUrl(this.props.dashboard.dashboardId, this.props.dashboard.key)}
                        className="card-v4 text-link"
                      >
                        Readmore
                      </Link>
                    </td>
                  </tr>
                </tfoot>
              ) : null}
            </table>
          )}
        </div>
      </VisShell>
    );
  }
}
/**
 * this will flatten data/ transpose
 * @param data data
 * @param path columns
 * @param bucketLevel bucket level
 */
const flattenData = (data: TableMetric, path: string[] = []): FlatMetrics => {
  const __data = extractKeys(data);
  let header: string[] = [];
  const rows = _.flatten<FlatMetric>(
    __data.map((datum, indexValue) => {
      if (indexValue === 0) {
        if (datum.level === 'metric') {
          header = [...path, ...header, ...datum.metrics.map((a) => a.label)];
        } else if (datum.level === 'bucket') {
          const retval = flattenData(datum, [...path, datum.fieldName]);
          header = retval.header;
        }
      }
      if (datum.level === 'metric') {
        datum.metrics;
        return { columns: [...path, datum.key], data: datum.metrics } as FlatMetric;
      } else if (datum.level === 'bucket') {
        const retVal = flattenData(datum, [...path, datum.key]);
        return retVal.rows;
      } else {
        return {} as FlatMetric;
      }
    }),
  );
  return {
    header: header,
    rows: rows,
  };
};
