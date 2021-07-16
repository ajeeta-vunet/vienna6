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

// Copyright 2021 VuNet Systems Ltd.
// All rights reserved.
// Use of copyright notice does not imply publication.

import { FeatureCatalogueRegistryProvider, FeatureCatalogueCategory } from 'ui/registry/feature_catalogue';
import 'plugins/kibana/event/styles/main.less';
import uiRoutes from 'ui/routes';
import { DeviceConfigConstants } from './device_configuration_constants';
import { apiProvider } from '../../../../../ui_framework/src/vunet_components/vunet_service_layer/api/utilities/provider';
import deviceConfigurationTemplate from './device_configuration.html';
import './device_configuration';
import addOrEditDeviceTemplate from './add_or_edit_device.html';
import './add_or_edit_device';

uiRoutes
  .defaults(/deviceConfiguration/, {
    requireDefaultIndex: true
  })
  // for default route i.e. '/deviceConfiguration'
  .when(DeviceConfigConstants.LANDING_PAGE_PATH, {
    template: deviceConfigurationTemplate,
    resolve: {
      deviceDetailsSummary: function () {
        const postBody = {
          fields: ['device_family_name', 'collect_schedule_status', 'device_name', 'device_address' ]
        };
        return apiProvider.post('/dcm/device/unique/', postBody);
      }
    }
  })
  // for 'Edit Device' route i.e. '/deviceConfiguration/devices/device/:id'
  .when(DeviceConfigConstants.ADD_EDIT_DEVICE, {
    template: addOrEditDeviceTemplate
  });
// .when(DeviceConfigConstants.DEVICE_FAMILIES, {
//   template: deviceFamiliesTemplate
// });

FeatureCatalogueRegistryProvider.register(() => {
  return {
    id: 'deviceConfiguration',
    title: 'DeviceConfiguration',
    description: 'Device Configuration Management',
    icon: '',
    path: '/app/vienna#/deviceConfiguration',
    showOnHomePage: true,
    category: FeatureCatalogueCategory.DATA
  };
});