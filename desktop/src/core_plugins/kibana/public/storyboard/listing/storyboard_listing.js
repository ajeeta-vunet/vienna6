import { StoryBoardConstants, createStoryboardEditUrl } from '../storyboard_constants';
import 'ui/pager_control';
import 'ui/pager';
import chrome from 'ui/chrome';
import { SortableProperties } from 'ui_framework/services';
import { ConfirmationButtonTypes } from 'ui/modals';
import { deHighlightRow, highlightSelectedRow } from 'ui/utils/vunet_row_highlight';
import { DocTitleProvider } from 'ui/doc_title';
import { VunetSidebarConstants } from 'ui/chrome/directives/vunet_sidebar_constants';
import {  logUserOperationForDeleteMultipleObjects } from 'plugins/kibana/log_user_operation';
const Promise = require('bluebird');

export function StoryboardListingController($injector, $scope, $location, savedStoryboards, savedVisualizations, $http) {
  const $filter = $injector.get('$filter');
  const confirmModal = $injector.get('confirmModal');
  const Notifier = $injector.get('Notifier');
  const pagerFactory = $injector.get('pagerFactory');
  const Private = $injector.get('Private');
  const timefilter = $injector.get('timefilter');
  const config = $injector.get('config');
  const storyboardConfig = $injector.get('storyboardConfig');

  timefilter.enabled = false;

  // Display doc title as 'Story Boards' always
  const docTitle = Private(DocTitleProvider);
  docTitle.change(VunetSidebarConstants.STORYBOARDS);

  const limitTo = $filter('limitTo');
  const storyboardService = savedStoryboards;
  const notify = new Notifier({ location: 'Storyboard' });

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

    storyboardService.find(this.filter, config.get('savedObjects:listingLimit'))
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

  // Hide write controls if modify permission is not allowed for this user
  if (!chrome.canManageObject()) {
    storyboardConfig.turnHideWriteControlsOn();
  }
  this.hideWriteControls = storyboardConfig.getHideWriteControls();

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

  this.deleteSelectedItems = function deleteSelectedItems() {
    const doDelete = () => {
      const selectedIds = selectedItems.map(item => item.id);
      Promise.map(selectedIds, function (id) {
        return savedStoryboards.get(id).then(function () {
          return storyboardService.delete(id).then(fetchItems)
            .then(() => {
              deselectAll();
              logUserOperationForDeleteMultipleObjects($http, selectedIds, 'storyboard');
            })
            .catch(error => notify.error(error));
        })
          .catch(function () {
            notify.error('Failed in delete storyboard');
          });
      });
    };

    confirmModal(
      'Are you sure you want to delete the selected storyboards? This action is irreversible!',
      {
        title: 'Warning',
        confirmButtonText: 'Delete',
        onConfirm: doDelete,
        defaultFocusedButton: ConfirmationButtonTypes.CANCEL
      });
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
    return `#${createStoryboardEditUrl(item.id)}`;
  };


  this.getCreateStoryboardHref = function getCreateStoryboardHref() {
    return `#${StoryBoardConstants.CREATE_NEW_STORYBOARD_URL}`;
  };
}
