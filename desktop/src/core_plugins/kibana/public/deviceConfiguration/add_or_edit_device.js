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

import { uiModules } from 'ui/modules';
import { DocTitleProvider } from 'ui/doc_title';
import { VunetSidebarConstants } from 'ui/chrome/directives/vunet_sidebar_constants';
import { AddOrEditDevice } from './components/AddOrEditDevice/AddOrEditDevice';
import { MenuBar } from './components/MenuBar/MenuBar';

const app = uiModules.get('app/deviceConfiguration', []);

// AddDevice react component
app.directive('addOrEditDevice', (reactDirective) => {
  return reactDirective(AddOrEditDevice, ['deviceId']);
});

app.directive('menuBar', (reactDirective) => {
  return reactDirective(MenuBar, ['currentSection']);
});

app.directive('addOrEditDeviceApp', function () {
  return {
    restrict: 'E',
    controllerAs: 'deviceConfigurationApp',
    controller: function ($route, $scope, Private) {
      function init() {
        const docTitle = Private(DocTitleProvider);
        docTitle.change(VunetSidebarConstants.DEVICE_CONFIGURATION);
        $scope.$emit('application.load');
      }
      $scope.deviceId = $route.current.params.id;
      $scope.currentSection = 'devices';
      init();
    },
  };
});