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
 *
 * Copyright 2020 VuNet Systems Ltd.
 * All rights reserved.
 * Use of copyright notice does not imply publication.
 */

import React from 'react';
import { BaseVisualization, ViewDashboardProp } from '../base-component';
import { VisShell } from '../shell/shell';
import { Line, ChartData as ChartData2 } from 'react-chartjs-2';
import { ChartOptions, ChartData } from 'chart.js';
import { Metrics, KpiMetric, Metric } from '@vu/types';
import { sortBy, first } from 'lodash';

/**
 * Display the Trend Visualization
 *
 * @export
 * @class TrendVisualization
 * @extends {(BaseVisualization<{ data: any } & ViewDashboardProp>)}
 */
export class TrendVisualization extends BaseVisualization<{ data: Metrics } & ViewDashboardProp> {
  render() {
    if (this.props.data.type !== 'trend') {
      return null;
    }

    const filter = Object.entries(this.props.data).filter((a) => typeof a && a[1] !== 'string');
    const description = filter.length > 0 ? (filter[0][1] as any).description : '';
    const data: ChartData2<ChartData> = (canvas: HTMLCanvasElement) => {
      const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
      const gradient: CanvasGradient = ctx.createLinearGradient(0, 0, canvas.clientWidth, 0);
      gradient.addColorStop(0, '#cc435b33');
      gradient.addColorStop(1, '#52469933');

      const gradient2: CanvasGradient = ctx.createLinearGradient(0, 0, canvas.clientWidth, 0);
      gradient2.addColorStop(0, '#cc435b');
      gradient2.addColorStop(1, '#524699');

      const dataWithKeys = sortBy(
        Object.entries(this.props.data)
          .filter((a) => (typeof a[1] !== 'string' && typeof a[1] !== 'number'))
          .map((key) => Object.assign(key[1] as KpiMetric, { key: key[0] })),
        (a) => a.key,
      );
      const metricKey = dataWithKeys.length > 0 ? Object.keys(dataWithKeys[0].metrics)[0] : '';
      const key = dataWithKeys.map((a) => a.key);
      const value = dataWithKeys.map((a) => a.metrics[metricKey].value);
      return {
        labels: key,
        datasets: [
          {
            label: metricKey,
            lineTension: 0.4,
            cubicInterpolationMode: 'monotone',
            backgroundColor: gradient,
            borderColor: gradient2,
            pointBorderWidth: 4,
            fill: true,
            borderWidth: 2,
            pointRadius: 1,
            data: value,
          },
        ],
      } as ChartData;
    };

    return (
      <VisShell {...this.props}>
        <Line data={data} width={100} height={this.props.full ? 100 : 50} options={this.Options} />
        {description ? <div className="text-center p my-3">{description}</div> : undefined}
      </VisShell>
    );
  }

  get Title() {
    return 'vu-canvas-' + this.props.VisTitle;
  }
  get Options(): ChartOptions {
    return {
      scales: {
        xAxes: [
          {
            type: 'time',
            ticks: {
              autoSkip: true,
              maxTicksLimit: 20,
            },
            display: true,
            gridLines: {
              color: 'rgba(0, 0, 0, 0)',
              zeroLineColor: 'rgba(0, 0, 0, 0.0)',
            },
            scaleLabel: {
              display: true,
              labelString: '@ Timestamp per 30 Seconds',
            },
          },
        ],
        yAxes: [
          {
            type: 'linear',
            display: true,
            position: 'left',
            gridLines: {
              color: 'rgba(0, 0, 0, 0.1)',
              borderDash: [4, 4],
              zeroLineColor: 'rgba(0, 0, 0, 0.0)',

              drawBorder: false,
            },

            scaleLabel: {
              display: true,
              labelString: 'Count',
            },
          },
        ],
      },
      legend: {
        display: false,
      },
      responsive: true,
    };
  }
}
