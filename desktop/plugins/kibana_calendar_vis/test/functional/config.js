/* eslint-disable */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { resolve } from 'path';
import {
  CommonPageProvider,
  ShieldPageProvider,
  DiscoverPageProvider,
  HeaderPageProvider,
  HomePageProvider,
  DashboardPageProvider,
  VisualizePageProvider,
  SettingsPageProvider,
  PointSeriesPageProvider,
} from '../../../../kibana/test/functional/page_objects';

import {
  RemoteProvider,
  FilterBarProvider,
  QueryBarProvider,
  FindProvider,
  TestSubjectsProvider,
  ScreenshotsProvider,
  DashboardVisualizationProvider,
  DashboardExpectProvider,
  FailureDebuggingProvider,
  VisualizeListingTableProvider,
  DashboardAddPanelProvider,
  DashboardPanelActionsProvider,
  FlyoutProvider,
} from '../../../../kibana/test/functional/services';

export default async function ({ readConfigFile }) {
  const commonConfig = await readConfigFile(require.resolve('../../../../kibana/test/common/config'));

  return {
    testFiles: [
      require.resolve('./apps')
    ],
    pageObjects: {
      common: CommonPageProvider,
      shield: ShieldPageProvider,
      discover: DiscoverPageProvider,
      header: HeaderPageProvider,
      home: HomePageProvider,
      dashboard: DashboardPageProvider,
      visualize: VisualizePageProvider,
      settings: SettingsPageProvider,
      pointSeries: PointSeriesPageProvider,
    },
    services: {
      es: commonConfig.get('services.es'),
      esArchiver: commonConfig.get('services.esArchiver'),
      kibanaServer: commonConfig.get('services.kibanaServer'),
      retry: commonConfig.get('services.retry'),
      remote: RemoteProvider,
      filterBar: FilterBarProvider,
      queryBar: QueryBarProvider,
      find: FindProvider,
      testSubjects: TestSubjectsProvider,
      screenshots: ScreenshotsProvider,
      dashboardVisualizations: DashboardVisualizationProvider,
      dashboardExpect: DashboardExpectProvider,
      failureDebugging: FailureDebuggingProvider,
      visualizeListingTable: VisualizeListingTableProvider,
      dashboardAddPanel: DashboardAddPanelProvider,
      dashboardPanelActions: DashboardPanelActionsProvider,
      flyout: FlyoutProvider,
    },
    servers: commonConfig.get('servers'),

    env: commonConfig.get('env'),

    esTestCluster: commonConfig.get('esTestCluster'),

    kbnTestServer: {
      ...commonConfig.get('kbnTestServer'),
      serverArgs: [
        ...commonConfig.get('kbnTestServer.serverArgs'),
        '--oss',
        `--plugin-path=${resolve(__dirname, '../../')}`
      ],
    },

    apps: {
      visualize: {
        pathname: '/app/kibana',
        hash: '/visualize',
      },
      dashboard: {
        pathname: '/app/kibana',
        hash: '/dashboards',
      },
      settings: {
        pathname: '/app/kibana',
        hash: '/management',
      },
    },
    junit: {
      reportName: 'UI Functional Tests'
    }
  };
}
