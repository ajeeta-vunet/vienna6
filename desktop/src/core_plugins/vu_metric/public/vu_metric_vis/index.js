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

import { MetricsRequestGeneratorProviderForVuMetric } from './api_handler';
import { ReactEditorControllerProviderForVuMetric } from './editor_controller';
import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { CATEGORY } from 'ui/vis/vis_category';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';
import { vuMetricConstants } from '../components/lib/vu_metric_constants';
import '../less/main.less';

// register the provider with the visTypes registry so that other know it exists
VisTypesRegistryProvider.register(VuMetricsVisProvider);

export default function VuMetricsVisProvider(Private) {

  const VisFactory = Private(VisFactoryProvider);
  const ReactEditorControllerForVuMetric = Private(ReactEditorControllerProviderForVuMetric).handler;
  const metricsRequestHandler = Private(MetricsRequestGeneratorProviderForVuMetric).handler;

  return VisFactory.createReactVisualization({
    name: 'business_metric',
    title: 'Vu Metric',
    icon: 'fa-briefcase',
    description: 'Create this visualization to display any metric value' +
      ' for a given time period. Configure custom background themes and font colors' +
      ' with upto three time shift values.',
    category: CATEGORY.DATA,
    // stage: 'experimental',
    visConfig: {
      defaults: {
        metrics: [vuMetricConstants.METRIC_DEFAULTS],
        aggregations: [],
        historicalData: [],
        enableHistDataPercentage: false,
        enableHistDataValueWithPercentage: false,
        actionButtonsData: [],
        enableTableFormat: false,
        tabularFormat: 'horizontal',
        linkInfoValues: false,
        linkInfo: [],
        fontSize: 40,
        textFontSize: 18,
      },
      component: require('../components/vu_metric_bmv')
    },
    editor: ReactEditorControllerForVuMetric,
    editorConfig: {
      component: require('../components/vu_metric_bmv')
    },
    options: {
      showQueryBar: false,
      showFilterBar: false,
      showIndexSelection: false
    },
    requestHandler: metricsRequestHandler,
    responseHandler: 'none'
  });
}


