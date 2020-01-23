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
import { Metrics, Metric } from '@vu/types';
import _ from 'lodash';
import { BaseVisualization, ViewDashboardProp } from '../base-component';
import { VisShell } from '../shell/shell';
import { BMV_MAX_ROWS } from './config';
import { Link } from 'react-router-dom';
import { ExpandedVisualizationUrl } from '@vu/colombo-lib';
type MetricWithKey = {
  key: string;
} & Metrics;

export type BucketTableProps = { data: MetricWithKey[] };
type TableCell = { value: string; color: string } | string;
type FlatMetrics = { header: string[]; bucketLevel: number; rows: FlatMetric[] };
type FlatMetric = { columns: TableCell[]; data: { [key: string]: Metric } };

/**
 * Displays A bucketed Table
 *
 * @export
 * @class BucketTable
 * @extends {(BaseVisualization<BucketTableProps & ViewDashboardProp>)}
 */
export class BucketTable extends BaseVisualization<ViewDashboardProp> {
  render() {
    const d = Object.entries(this.props.data)
      .filter((a) => (typeof a[1] !== 'string' && typeof a[1] !== 'number'))
      .map((key) => Object.assign(key[1], { key: key[0] }));
    const flattenedData: FlatMetrics = flattenData(d);
    const sliceTo =
      flattenedData.rows.length > BMV_MAX_ROWS && !this.props.full ? BMV_MAX_ROWS - 1 : flattenedData.rows.length;
    return (
      <VisShell {...this.props}>
        <div className="table-responsive">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>
                  <b>Metric</b>
                </th>
                {flattenedData.header.map((a) => (
                  <th key={a}>
                    <b>{a}</b>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {flattenedData.rows.slice(0, sliceTo).map((a, i) => (
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
                  {flattenedData.header
                    .slice(flattenedData.bucketLevel, flattenedData.header.length - flattenedData.bucketLevel)
                    .map((v, i) => {
                      const val: Metric = a.data[v] ? (a.data[v] as Metric) : null;
                      return (
                        <td key={i} style={{ color: val ? val.color : '' }}>
                          {val ? val.formattedValue : '-'}
                        </td>
                      );
                    })}
                </tr>
              ))}
            </tbody>
            {d.length > BMV_MAX_ROWS && !this.props.full ? (
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
const flattenData = (data: MetricWithKey[], path: string[] = [], bucketLevel: number = 0): FlatMetrics => {
  let header: string[] = [];
  // let Bucketlevel = -1;
  const rows = _.flatten<FlatMetric>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.map((datum: any, indexValue) => {
      if (indexValue === 0) {
        if (datum.level === 'metric') {
          header = [...path, ...header, ...Object.keys(datum.metrics)];
        } else if (datum.level === 'bucket') {
          const metricData = Object.entries(datum)
            .filter((a) => (typeof a[1] !== 'string' && typeof a[1] !== 'number'))
            .map(
              (key) =>
                Object.assign(key[1], { key: key[0] }) as Metrics & {
                  key: string;
                },
            );
          const retval = flattenData(metricData, [...path, datum.fieldName], bucketLevel + 1);
          // Bucketlevel = Bucketlevel + retval.bucketLevel + 1;
          header = retval.header;
        }
      }
      if (datum.level === 'metric') {
        return { columns: [...path, datum.key], data: datum.metrics } as FlatMetric;
      } else if (datum.level === 'bucket') {
        const metricData = Object.entries(datum)
          .filter((a) => (typeof a[1] !== 'string' && typeof a[1] !== 'number'))
          .map(
            (key) =>
              Object.assign(key[1], { key: key[0] }) as Metrics & {
                key: string;
              },
          );
        const retVal = flattenData(metricData, [...path, datum.key]);
        return retVal.rows;
      } else {
        return {} as FlatMetric;
      }
    }),
  );
  return {
    header: header,
    rows: rows,
    bucketLevel: 0, //Bucketlevel
  };
};
