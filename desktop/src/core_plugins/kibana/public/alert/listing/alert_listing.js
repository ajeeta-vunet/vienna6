import { SavedObjectRegistryProvider } from 'ui/saved_objects/saved_object_registry';
import 'ui/pager_control';
import 'ui/pager';
import chrome from 'ui/chrome';
import { AlertConstants, createAlertEditUrl } from '../alert_constants';
import { SortableProperties } from 'ui_framework/services';
import { ConfirmationButtonTypes } from 'ui/modals';
import { logUserOperationForDeleteMultipleObjects } from 'plugins/kibana/log_user_operation';
import { updateVunetObjectOperation } from 'ui/utils/vunet_object_operation';
import { deHighlightRow, highlightSelectedRow } from 'ui/utils/vunet_row_highlight';
import { DocTitleProvider } from 'ui/doc_title';
import { VunetSidebarConstants } from 'ui/chrome/directives/vunet_sidebar_constants';
import { SavedObjectsClientProvider } from 'ui/saved_objects';

export function AlertListingController($injector, $scope, $location, $http) {
  const $filter = $injector.get('$filter');
  const confirmModal = $injector.get('confirmModal');
  const Notifier = $injector.get('Notifier');
  const pagerFactory = $injector.get('pagerFactory');
  const Private = $injector.get('Private');
  const timefilter = $injector.get('timefilter');
  const config = $injector.get('config');
  const docTitle = Private(DocTitleProvider);
  docTitle.change(VunetSidebarConstants.ALERT_RULES);
  timefilter.enabled = false;

  const limitTo = $filter('limitTo');
  // TODO: Extract this into an external service.
  const services = Private(SavedObjectRegistryProvider).byLoaderPropertiesName;
  const alertService = services.alerts;
  const notify = new Notifier({ location: 'Alert' });

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
    },
    {
      name: 'enableAlert',
      getValue: item => item.enableAlert ? 'enabled'.toLowerCase() : 'disabled'.toLowerCase(),
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

    alertService.find(this.filter, config.get('savedObjects:listingLimit'))
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

  // Check with chrome if modify permission is allowed for this user or not
  this.hideWriteControls = true;
  if (chrome.canManageObject()) {
    this.hideWriteControls = false;
  }

  $scope.$watch(() => this.filter, () => {
    deselectAll();
    fetchItems();
    $location.search('filter', this.filter);
  });
  this.isAscending = (name) => sortableProperties.isAscendingByName(name);
  this.getSortedProperty = () => sortableProperties.getSortedProperty();

  this.sortOn = function sortOn(propertyName) {
    sortableProperties.sortOn(propertyName);
    deselectAll();
    calculateItemsOnPage();
  };

  this.toggleAll = function toggleAll() {
    if (this.areAllItemsChecked()) {
      deHighlightRow();
      deselectAll();
    } else {
      highlightSelectedRow();
      selectAll();
    }
  };

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

  this.isItemChecked = function isItemChecked(item) {
    return selectedItems.indexOf(item) !== -1;
  };

  this.areAllItemsChecked = function areAllItemsChecked() {
    return this.getSelectedItemsCount() === this.pageOfItems.length;
  };

  this.getSelectedItemsCount = function getSelectedItemsCount() {
    return selectedItems.length;
  };

  // This will return whether enable button should be enabled or not
  this.enableEnableButton = function () {
    // When no items are selected disbale it
    // If items are selected with status 'disable' then enable it
    if (selectedItems.length === 0) {
      return false;
    } else {
      return selectedItems.some(function (selectedItem) {
        return selectedItem.enableAlert === false;
      });
    }
  };

  // This will return whether disable button should be enabled or not
  this.enableDisableButton = function () {
    // When no items are selected disable it
    // If items are selected with status 'enable' then enable it
    if (selectedItems.length === 0) {
      return false;
    } else {
      return selectedItems.some(function (selectedItem) {
        return selectedItem.enableAlert === true;
      });
    }
  };

  this.deleteSelectedItems = function deleteSelectedItems() {
    const doDelete = () => {
      const selectedIds = selectedItems.map(item => item.id);
      alertService.delete(selectedIds)
        .then(fetchItems)
        .then(() => {
          // Update backend with operation
          updateVunetObjectOperation(selectedItems, 'alert', $http, 'delete', chrome);
          deselectAll();
          logUserOperationForDeleteMultipleObjects($http, selectedIds, 'alert');
        })
        .catch(error => notify.error(error));
    };

    confirmModal(
      'Are you sure you want to delete the selected alerts? This action is irreversible!',
      {
        title: 'Warning',
        confirmButtonText: 'Delete',
        onConfirm: doDelete,
        defaultFocusedButton: ConfirmationButtonTypes.CANCEL
      });
  };


  // This method will change the selected items status to enable/disable
  this.changeStatusOfSelectedItems = function (changeStatusTo) {
    const changeStatus = () => {
      const savedObjectsClient = Private(SavedObjectsClientProvider);

      selectedItems.map((item) => {
        item.enableAlert = (changeStatusTo === 'enable') ? true : false;
        //Updating each selected item status to the respective selected status
        savedObjectsClient.update('alert', item.id, item);
      });
      //DeSelecting the selected items after changing the status
      deselectAll();
      //DeHighlighting the selected items after changing the status
      deHighlightRow();
    };

    // This will decide which text need to be displayed in the status change model based on changeStatusTo value
    const modelTitle = (changeStatusTo === 'enable') ?
      'Are you sure to enable the selected alerts. This will enable the alerts in disabled status!' :
      'Are you sure to disable the selected alerts. This will disable the alerts in enabled status!';

    confirmModal(
      modelTitle,
      {
        title: 'Warning',
        confirmButtonText: (changeStatusTo === 'enable') ? 'Enable' : 'Disable',
        onConfirm: changeStatus,
        defaultFocusedButton: ConfirmationButtonTypes.CANCEL,
      }
    );
  };

  this.onPageNext = () => {
    deselectAll();
    this.pager.nextPage();
    calculateItemsOnPage();
  };

  this.onPagePrevious = () => {
    deselectAll();
    this.pager.previousPage();
    calculateItemsOnPage();
  };

  this.getUrlForItem = function getUrlForItem(item) {
    return `#${createAlertEditUrl(item.id)}`;
  };

  this.getCreateAlertHref = function getCreateAlertHref() {
    return `#${AlertConstants.CREATE_PATH}`;
  };
}
