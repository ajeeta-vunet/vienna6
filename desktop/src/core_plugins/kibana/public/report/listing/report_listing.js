import { SavedObjectRegistryProvider } from 'ui/saved_objects/saved_object_registry';
import 'ui/pager_control';
import 'ui/pager';
import chrome from 'ui/chrome';
import { ReportConstants, createReportEditUrl } from '../report_constants';
import { SortableProperties } from 'ui_framework/services';
import { ConfirmationButtonTypes } from 'ui/modals';
import { logUserOperationForDeleteMultipleObjects } from 'plugins/kibana/log_user_operation';
import { updateVunetObjectOperation } from 'ui/utils/vunet_object_operation';
import { deHighlightRow, highlightSelectedRow } from 'ui/utils/vunet_row_highlight';

export function ReportListingController($injector, $scope, $location, $http) {
  const $filter = $injector.get('$filter');
  const confirmModal = $injector.get('confirmModal');
  const Notifier = $injector.get('Notifier');
  const pagerFactory = $injector.get('pagerFactory');
  const Private = $injector.get('Private');
  const timefilter = $injector.get('timefilter');
  const config = $injector.get('config');
  //const reportConfig = $injector.get('reportConfig');

  timefilter.enabled = false;

  // Check with chrome if the creation is allowed for this user or not
  // Set whether the current logged in user be allowed to create a new
  // object or not
  $scope.creationAllowed = false;
  if (chrome.canCurrentUserCreateObject()) {
    $scope.creationAllowed = true;
  }

  const limitTo = $filter('limitTo');
  // TODO: Extract this into an external service.
  const services = Private(SavedObjectRegistryProvider).byLoaderPropertiesName;
  const reportService = services.reports;
  const notify = new Notifier({ location: 'Report' });

  let selectedItems = [];
  const sortableProperties = new SortableProperties([
    {
      name: 'title',
      getValue: item => item.title.toLowerCase(),
      isAscending: true,
    },
    {
      name: 'description',
      getValue: item => item.description.toLowerCase(),
      isAscending: true
    }
  ],
  'title');

  const calculateItemsOnPage = () => {
    this.items = sortableProperties.sortItems(this.items);
    this.pager.setTotalItems(this.items.length);
    this.pageOfItems = limitTo(this.items, this.pager.pageSize, this.pager.startIndex);
  };

  const fetchItems = () => {
    this.isFetchingItems = true;

    reportService.find(this.filter, config.get('savedObjects:listingLimit'))
      .then(result => {
        this.isFetchingItems = false;
        this.items = result.hits;
        this.totalItems = result.total;
        this.showLimitError = result.total > config.get('savedObjects:listingLimit');
        this.listingLimit = config.get('savedObjects:listingLimit');
        calculateItemsOnPage();
      });
  };

  const deselectAll = () => {
    selectedItems = [];
  };

  const selectAll = () => {
    selectedItems = this.pageOfItems.slice(0);
  };

  this.isFetchingItems = false;
  this.items = [];
  this.pageOfItems = [];
  this.filter = ($location.search()).filter || '';

  this.pager = pagerFactory.create(this.items.length, 10, 1);

  //this.hideWriteControls = reportConfig.getHideWriteControls();
  this.hideWriteControls = false;

  $scope.$watch(() => this.filter, () => {
    deselectAll();
    fetchItems();
    $location.search('filter', this.filter);
  });
  this.isAscending = (name) => sortableProperties.isAscendingByName(name);
  this.getSortedProperty = () => sortableProperties.getSortedProperty();

  // Sort the page based on the passed property..
  this.sortOn = function sortOn(propertyName) {
    sortableProperties.sortOn(propertyName);
    deselectAll();
    calculateItemsOnPage();
  };

  // Toggle the selection.. if all are selected, deselect them otherwise
  // select all of them
  this.toggleAll = function toggleAll() {
    if (this.areAllItemsChecked()) {
      deHighlightRow();
      deselectAll();
    } else {
      highlightSelectedRow();
      selectAll();
    }
  };

  // Select or deselect an item
  this.toggleItem = function toggleItem(item) {
    if (this.isItemChecked(item)) {
      const index = selectedItems.indexOf(item);
      selectedItems.splice(index, 1);
    } else {
      selectedItems.push(item);
    }
    deHighlightRow();
    highlightSelectedRow();
  };

  // Function to check if the passed item is checked (selected)
  this.isItemChecked = function isItemChecked(item) {
    return selectedItems.indexOf(item) !== -1;
  };

  // Function to check if the all items are checked (selected)
  this.areAllItemsChecked = function areAllItemsChecked() {
    return this.getSelectedItemsCount() === this.pageOfItems.length;
  };

  // Get the number of items selected
  this.getSelectedItemsCount = function getSelectedItemsCount() {
    return selectedItems.length;
  };

  // Delete the selected items
  this.deleteSelectedItems = function deleteSelectedItems() {
    const doDelete = () => {
      const selectedIds = selectedItems.map(item => item.id);

      reportService.delete(selectedIds)
        .then(fetchItems)
        .then(() => {
          // Update backend with operation
          updateVunetObjectOperation(selectedItems, 'report', $http, 'delete', chrome);
          deselectAll();
          logUserOperationForDeleteMultipleObjects($http, selectedIds, 'report');
        })
        .catch(error => notify.error(error));
    };

    confirmModal(
      'Are you sure you want to delete the selected reports? This action is irreversible!',
      {
        title: 'Warning',
        confirmButtonText: 'Delete',
        onConfirm: doDelete,
        defaultFocusedButton: ConfirmationButtonTypes.CANCEL
      });
  };

  // Go to next page
  this.onPageNext = () => {
    deselectAll();
    this.pager.nextPage();
    calculateItemsOnPage();
  };

  // Go to previous page
  this.onPagePrevious = () => {
    deselectAll();
    this.pager.previousPage();
    calculateItemsOnPage();
  };

  // Get URL for an item
  this.getUrlForItem = function getUrlForItem(item) {
    return `#${createReportEditUrl(item.id)}`;
  };

  // Get the href for creating a new report
  this.getCreateReportHref = function getCreateReportHref() {
    return `#${ReportConstants.CREATE_PATH}`;
  };
}
