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

import { uiModules } from 'ui/modules';

import ImportEnrichmentGroupsTemplate from './import_enrichment_groups.html';
import ImportEnrichmentGroupsCtrl from './import_enrichment_groups.controller';
import { EnrichmentTablesPage } from './components/EnrichmentTablesPage';
import { DocTitleProvider } from 'ui/doc_title';
import { VunetSidebarConstants } from 'ui/chrome/directives/vunet_sidebar_constants';
import './data_enrichment.less';

const app = uiModules.get('app/berlin');

// Enrichment tables react component
app.directive('enrichmentTablesPage', (reactDirective) => {
  return reactDirective(EnrichmentTablesPage, ['openImportModal', 'exportEnrichment'
  ]);
});

app.directive('enrichmentTables', function () {
  return {
    restrict: 'E',
    controllerAs: 'enrichmentTables',
    controller: enrichmentTables,
  };
});

function enrichmentTables(
  $injector,
  $scope,
  $modal,
  Promise,
  StateService
) {
  // Always display doc title as 'Enrich'
  const Private = $injector.get('Private');
  const docTitle = Private(DocTitleProvider);
  docTitle.change(VunetSidebarConstants.ENRICH);

  //function to import files
  $scope.openImportModal = function () {
    $modal
      .open({
        animation: true,
        template: ImportEnrichmentGroupsTemplate,
        controller: ImportEnrichmentGroupsCtrl,
        windowClass: 'import-enrichment-groups-modal',
      })
      .result.then(
        function () {
          // Nothing to do once the import enrichment groups
          // modal has been submitted.
        },
        function () {
          // This callback is added to avoid the following
          // warning in console:Possibly unhandled rejection: cancel
          // 'Possibly unhandled rejection: cancel'
        }
      );
  };

  $scope.exportEnrichment = (e, selectedrows) => {
    const selectedTablesObj = {};
    selectedTablesObj.selected_tables = [];
    selectedrows.forEach((selectedrow) => {
      const item = {};
      item.tableName = selectedrow.table_name;
      item.tableId = selectedrow.id;
      selectedTablesObj.selected_tables.push(item);
    });

    StateService.exportDataEnrichment(JSON.stringify(selectedTablesObj));
    return Promise.resolve(false);
  };
}
