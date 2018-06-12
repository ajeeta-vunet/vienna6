import _ from 'lodash';
import $ from 'jquery';
import rison from 'rison-node';
import 'ui/doc_viewer';
import 'ui/filters/trust_as_html';
import 'ui/filters/short_dots';
import './table_row.less';
import { noWhiteSpace } from '../../../../core_plugins/kibana/common/utils/no_white_space';
import openRowHtml from 'ui/doc_table/components/table_row/open.html';
import detailsHtml from 'ui/doc_table/components/table_row/details.html';
import { uiModules } from 'ui/modules';
import { disableFilter } from 'ui/filter_bar';
import { updateIndexDataOperation } from 'ui/utils/vunet_index_data_operation';

const module = uiModules.get('app/discover');



// guesstimate at the minimum number of chars wide cells in the table should be
const MIN_LINE_LENGTH = 20;

/**
 * kbnTableRow directive
 *
 * Display a row in the table
 * ```
 * <tr ng-repeat="row in rows" kbn-table-row="row"></tr>
 * ```
 */
module.directive('kbnTableRow', function ($compile, $httpParamSerializer, kbnUrl, esUrl, $http) {
  const cellTemplate = _.template(noWhiteSpace(require('ui/doc_table/components/table_row/cell.html')));
  const userDetailsHtml = require('ui/doc_table/components/table_row/user_comments.html');
  const truncateByHeightTemplate = _.template(noWhiteSpace(require('ui/partials/truncate_by_height.html')));

  return {
    restrict: 'A',
    scope: {
      columns: '=',
      filter: '=',
      filters: '=?',
      indexPattern: '=',
      row: '=kbnTableRow',
      onAddColumn: '=?',
      onRemoveColumn: '=?',
    },
    link: function ($scope, $el) {
      $el.after('<tr data-test-subj="docTableDetailsRow">');
      $el.empty();

      // when we compile the details, we use this $scope
      let $detailsScope;


      // when we compile the user comments, we use this $scope
      let $userDetailsScope;

      // when we compile the toggle button in the summary, we use this $scope
      let $toggleScope;

      // toggle display of the rows details, a full list of the fields from each row
      $scope.toggleRow = function () {
        const $detailsTr = $el.next();

        $scope.open = !$scope.open;

        ///
        // add/remove $details children
        ///

        $detailsTr.toggle($scope.open);

        if (!$scope.open) {
          // close the child scope if it exists
          $detailsScope.$destroy();
          // no need to go any further
          return;
        } else {
          $detailsScope = $scope.$new();
        }

        // empty the details and rebuild it
        $detailsTr.html(detailsHtml);

        $detailsScope.row = $scope.row;

        $compile($detailsTr)($detailsScope);
      };

      $scope.$watchMulti([
        'indexPattern.timeFieldName',
        'row.highlight',
        '[]columns'
      ], function () {
        createSummaryRow($scope.row, $scope.row._id);
      });

      $scope.inlineFilter = function inlineFilter($event, type) {
        const column = $($event.target).data().column;
        const field = $scope.indexPattern.fields.byName[column];
        $scope.filter(field, $scope.flattenedRow[column], type);
      };

      $scope.getContextAppHref = () => {
        const path = kbnUrl.eval('#/context/{{ indexPattern }}/{{ anchorType }}/{{ anchorId }}', {
          anchorId: $scope.row._id,
          anchorType: $scope.row._type,
          indexPattern: $scope.indexPattern.id,
        });
        const hash = $httpParamSerializer({
          _a: rison.encode({
            columns: $scope.columns,
            filters: ($scope.filters || []).map(disableFilter),
          }),
        });
        return `${path}?${hash}`;
      };

      // create a tr element that lists the value for each *column*
      function createSummaryRow(row) {
        const indexPattern = $scope.indexPattern;
        $scope.flattenedRow = indexPattern.flattenHit(row);

        // We just create a string here because its faster.
        const newHtmls = [
          openRowHtml
        ];

        const mapping = indexPattern.fields.byName;

        $scope.columns.forEach(function (column) {
          const isFilterable = $scope.flattenedRow[column] !== undefined
            && mapping[column]
            && mapping[column].filterable
            && _.isFunction($scope.filter);

          if (column === 'user_comments_') {
            newHtmls.push(cellTemplate({
              timefield: (column === indexPattern.timeFieldName),
              sourcefield: (column === '_source'),
              formatted: row._source.user_comments_,
              filterable: isFilterable,
              column
            }));
          } else {
            newHtmls.push(cellTemplate({
              timefield: (column === indexPattern.timeFieldName),
              sourcefield: (column === '_source'),
              formatted: _displayField(row, column, true),
              filterable: isFilterable,
              column
            }));
          }
        });

        let $cells = $el.children();
        newHtmls.forEach(function (html, i) {
          const $cell = $cells.eq(i);
          if ($cell.data('discover:html') === html) return;

          const reuse = _.find($cells.slice(i + 1), function (cell) {
            return $.data(cell, 'discover:html') === html;
          });

          const $target = reuse ? $(reuse).detach() : $(html);
          $target.data('discover:html', html);
          const $before = $cells.eq(i - 1);
          if ($before.size()) {
            $before.after($target);
          } else {
            $el.append($target);
          }

          // rebuild cells since we modified the children
          $cells = $el.children();

          if (!reuse) {
            $toggleScope = $scope.$new();
            $compile($target)($toggleScope);
          }
        });

        if ($scope.open) {
          $detailsScope.row = row;
        }

        // trim off cells that were not used rest of the cells
        $cells.filter(':gt(' + (newHtmls.length - 1) + ')').remove();
        $el.trigger('renderComplete');
      }

      /**
       * Fill an element with the value of a field
       */
      function _displayField(row, fieldName, truncate) {
        const indexPattern = $scope.indexPattern;
        const text = indexPattern.formatField(row, fieldName);

        if (truncate && text.length > MIN_LINE_LENGTH) {
          return truncateByHeightTemplate({
            body: text
          });
        }

        return text;
      }

      // This function is called when a row (document) needs to be updated
      // with a new field or content of an existing field.
      function _updateRow(row, body) {
        const index = row._index;
        const id = row._id;
        //const data = Object.assign({}, row._source, body);
        const data = { ...row._source, ...body };
        updateIndexDataOperation($http, esUrl, index, id, data);
      }

      // This function is called when someone clicks the edit button for a
      // document
      $scope.editRow = function () {

        // Handle closing other sections
        $scope.open = false;

        // Prepare the row which will contain the user comment
        // section. This will be shown next to the row for which
        // user comments are to be added.
        const $userDetailsTr = $el.next();

        // Toggle the user comment section on clicking the edit
        // button
        $scope.addUserComment = !$scope.addUserComment;

        // Show the user comments section when $scope.addUserComment
        // is 'true'.
        $userDetailsTr.toggle($scope.addUserComment);

        if (!$scope.addUserComment) {
          // close the child scope if it exists
          $userDetailsScope.$destroy();
          // no need to go any further
          return;
        } else {

          // create a new scope for user comments section.
          $userDetailsScope = $scope.$new();
        }

        // Initialising the commentsList which will store the
        // user comments fetched from the json file.
        $userDetailsScope.commentsList = [];

        // Make a get call to get the user comments from the
        // user_comments.json file.
        const operationObject = $http({
          method: 'GET',
          url: '/ui/vienna_data/user_comments.json',
          data: {},
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
          .then(resp => resp.data)
          .catch(resp => {throw resp.data;});

        operationObject.then(function (data) {
          $userDetailsScope.commentsList = data.comments;
        });

        // empty the details and rebuild it
        $userDetailsTr.html(userDetailsHtml);

        // Get the current row into the user comments section scope.
        $userDetailsScope.row = $scope.row;

        // we have put comments inside $userDetailsScope.opts
        // instead of $userDetailsScope.comments. This is done to
        // take care of two way binding which works only in the
        // former case.
        $userDetailsScope.opts = {
          comments: ''
        };

        // populating the text field with existing comment
        if (_.has($scope.row._source, 'user_comments_')) {
          $userDetailsScope.opts.comments = $scope.row._source.user_comments_;
        } else {
          $userDetailsScope.opts.comments = '';
        }

        $compile($userDetailsTr)($userDetailsScope);

        // This function will be called when save button in the
        // add user section is clicked. This function is defined
        // inside the editRow function as the $userDetailsScope
        // is not valid outside the editRow function.
        $userDetailsScope.saveUserComments = function () {

          let oldComments = '';

          if (_.has($userDetailsScope.row._source, 'user_comments_')) {
            oldComments = $userDetailsScope.row._source.user_comments_;
          }

          // If there is no change in comment, we do not invoke the update..
          if ($userDetailsScope.opts.comments !== '' && $userDetailsScope.opts.comments !== oldComments) {

            const body =  { 'user_comments_': $userDetailsScope.opts.comments };

            // updating the row with user_comments_
            _updateRow($userDetailsScope.row, body);

            // we update _source as well with user_comments_
            // because in some places, it might be used.
            $userDetailsScope.row._source.user_comments_ = $userDetailsScope.opts.comments;
            $userDetailsScope.row.user_comments_ = $userDetailsScope.opts.comments;

            // We call createSummaryRow to update this row
            // with user_comments_ added.
            createSummaryRow($userDetailsScope.row, $userDetailsScope.row._id);
          }

          // This will close the add user comment section
          // when the save button is clicked
          $userDetailsTr.toggle(false);
        };

        $userDetailsScope.cancelUserComments = function () {

          // This will close the add user comment section
          // when the save button is clicked
          $userDetailsTr.toggle(false);
        };

      };

      // This function is called when someone clicks the delete button for
      // a document, this adds a flag which can be used to mark it as delete
      $scope.deleteRow = function () {
        // Just create a source that we need to add a tag 'deleted_by_user'
        const body =  { 'user_action_': 'User marked this as deleted' };
        _updateRow($scope.row, body);
      };
    }
  };
});
