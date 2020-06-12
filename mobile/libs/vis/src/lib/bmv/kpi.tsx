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
import { BaseVisualization } from '../base-component';
import { BMVSingleMetric } from './single-metric';
import { BMVTable } from './bmv-table';
import { KpiMetric } from '@vu/types';

export class KPIVisualization extends BaseVisualization {
  /**
   * Constructor
   * @param props Props
   */
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    if (this.state.error) {
      return this.errorVis();
    }
    if (this.props.data.type !== 'kpi') {
      return null;
    }
    const metricsArray = Object.keys(this.props.data.metrics).map((key) => ({
      _displayName: key,
      ...(this.props.data as KpiMetric).metrics[key],
    }));
    return metricsArray.length === 1 ? <BMVSingleMetric {...this.props} /> : <BMVTable {...this.props} />;
  }
}
