import 'plugins/kibana/report/report';
import 'plugins/kibana/report/saved_report/saved_reports';
import 'plugins/kibana/report/directives/details';
import { FeatureCatalogueRegistryProvider, FeatureCatalogueCategory } from 'ui/registry/feature_catalogue';
import 'plugins/kibana/report/styles/main.less';
import uiRoutes from 'ui/routes';
import reportListingTemplate from './listing/report_listing.html';
import { ReportListingController } from './listing/report_listing';
import { ReportConstants } from './report_constants';

uiRoutes
  .defaults(/report/, {
    requireDefaultIndex: true
  })
  .when(ReportConstants.LANDING_PAGE_PATH, {
    template: reportListingTemplate,
    controller: ReportListingController,
    controllerAs: 'listingController',
  });

FeatureCatalogueRegistryProvider.register(() => {
  return {
    id: 'report',
    title: 'Report',
    description: 'Create customized reports for your data',
    icon: '/plugins/kibana/assets/app_report.svg',
    path: `/app/kibana#${ReportConstants.LANDING_PAGE_PATH}`,
    showOnHomePage: true,
    category: FeatureCatalogueCategory.DATA
  };
});
