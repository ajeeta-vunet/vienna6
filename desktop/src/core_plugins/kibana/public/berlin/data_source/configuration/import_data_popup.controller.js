import { getSavedObject } from 'ui/utils/kibana_object.js';
const XLSX = require('xlsx');
class importPopupCtrl {
  constructor($scope, $injector, $uibModalInstance, StateService, Upload, HTTP_SUCCESS_CODE, chrome) {
    const Private = $injector.get('Private');
    // This is used to show another popup after upload
    $scope.successfulUpload = false;
    const tentantInfo = chrome.getTenantBu();
    $scope.indexStringInfo = tentantInfo[0] + '-' + tentantInfo[1];

    $scope.exportExcel = function (event) {

      if (event) {

        //All validation declaration or variables has been set to false or empty
        $scope.uniqueHeaders = [];
        $scope.indexPatternList = [];
        $scope.indexPattern = {};
        $scope.indexPattern.name = ''
        $scope.doc_type = '';
        $scope.custom_field = '';
        $scope.isEmptyHeaderPresent = false;
        $scope.isFileTypeWrong = false;
        $scope.isFileSizeMore = false;
        $scope.moreThanOneSheetsInFile = false;
        $scope.customDateFormats = [
          '%Y-%m-%d',
          '%Y-%m-%d %H:%M:%S',
          '%Y-%m-%d %H:%M:%S.%f',
          '%Y-%m-%d %H:%M:%S.%fZ',
          '%Y/%m/%d',
          '%Y/%m/%d %H:%M:%S',
          '%Y/%m/%d %H:%M:%S.%f',
          '%Y/%m/%d %H:%M:%S.%Z',
          '%d/%m/%Y',
          '%d/%m/%Y %H:%M:%S',
          '%d/%m/%Y %H:%M:%S.%f',
          '%d/%m/%Y %H:%M:%S.%fZ',
          '%d-%m-%Y',
          '%d-%m-%Y %H:%M:%S',
          '%d-%m-%Y %H:%M:%S.%f',
          '%d-%m-%Y %H:%M:%S.%fZ',
          '%d %B %Y',
          '%d %B %Y %H:%M:%S',
          '%d %B %Y %H:%M:%S.%f',
          '%d %B %Y %H:%M:%S.%fZ',
          '%B %d, %Y',
          '%B %d, %Y %H:%M:%S',
          '%B %d, %Y %H:%M:%S.%f',
          '%B %d, %Y %H:%M:%S.%fZ'
        ];

        Promise.resolve(getSavedObject('index-pattern', ['title', 'userVisibleName'], 10000, Private))
          .then(function (response) {
            angular.forEach(response, function(indexPattern){
              let index_name = indexPattern.userVisibleName
              // if name is not specified for the index pattern and pattern not started with dot (.)
              // then remove the prefix (vunet-1-1-) and suffix (-*) from the title and show
              // For ex; there is no name defined for vunet-1-1-server-health-* index pattern.

              // So we need to remove the prefix (vunet-1-1-) and suffix (-*) from the title and show to the user.
              if (index_name === undefined && indexPattern.title.charAt(0) !== '.')
              {
                // Remove vunet-1-1- from the index pattern first
                const index_arg = indexPattern.title.replace('vunet-' + $scope.indexStringInfo + '-','').split('-')
                // Remove the prefix from the index. I mean "-*".
                if (index_arg.length > 1)
                  index_arg.pop();

                // Now build the index name again by concatenating all the arguments from the array.
                if (index_arg[0] != 'vunet') {
                  angular.forEach(index_arg, function(item){
                    if (index_name === undefined)
                      index_name = item
                    else
                      index_name = index_name + '-' + item;
                  })
                }
              }
              $scope.indexPatternList.push(index_name)
            })
          });

        // If data needs to be loaded into a new index other than the existing from the list
        // this will do the job.
        $scope.addUserIndex = function ($select) {
          var search = $select.search;
          var Indiceslist = angular.copy($select.items);

          if (!search) {
            //use the predefined list
            $select.items = Indiceslist;
          }
          else {
            //manually add new index and set selection
            var userInputIndex = search;
            $select.items = [userInputIndex].concat(Indiceslist);
            $select.selected = userInputIndex;
          }
        };

        //Extracting the filename
        const fileName = event.target.files[0].name;

        // Declaring regex to test type of file uploaded
        const regexToCheckFileType = /.*\.(xlsx|xls)/;

        // Checking the file type and throwing user an error accordingly
        if (!regexToCheckFileType.test(fileName)) {
          $scope.isFileTypeWrong = true;
          return;
        }

        //Extracting the file size
        const fileSizeInMB = event.target.files[0].size / 1000000;

        // Checking the file size
        if (fileSizeInMB > 5) {
          $scope.isFileSizeMore = true;
          return;
        }

        const reader = new FileReader();

        reader.onload = function (e) {
          // read uploaded file
          const inputExcelFile = e.target.result;
          const workbook = XLSX.read(inputExcelFile, { type: 'binary', sheetRows: 2 });

          // Check number of sheets
          if (workbook.SheetNames.length === 1) {

            //Accessing first sheet name
            const firstSheetName = workbook.SheetNames[0];

            //Accessing first sheet content in its original form
            const firstSheetContent = workbook.Sheets[firstSheetName];

            //Function to get the header row of the file
            const getHeaderRow = function (firstSheetContent) {
              const headers = [];
              // Extracting the range of the first sheet
              const range = XLSX.utils.decode_range(firstSheetContent['!ref']);
              let column = range.s.r; // start in the first row
              const row = range.s.r;

              // walk every column in the defined range
              for (column = range.s.c; column <= range.e.c; ++column) {
                const cell = firstSheetContent[XLSX.utils.encode_cell({ c: column, r: row })]; // find the cell in the first row

                let header = 'Unknown' + column;

                // Format the cell value of the particular range and pushing to to headers array
                if (cell && cell.t) {
                  header = XLSX.utils.format_cell(cell);
                }

                // Mark isEmptyHeaderPresent true if there is 'Unknown' header
                if (header.includes('Unknown')) {
                  $scope.isEmptyHeaderPresent = true;
                  break;
                }
                else if (!header.includes('Unknown')) {
                  headers.push(header);
                }
              }
              return headers;
            };

            const headersArray = getHeaderRow(firstSheetContent);

            // Only processing further action if empty header is not present
            if (!$scope.isEmptyHeaderPresent) {

              $scope.uniqueHeaders = headersArray;

              // Adding the two default rows
              $scope.uniqueHeaders.push('Current Time', 'Not a time series data');
            }

          } else {

            // Showing error for more than one sheets and setting form to invalid
            $scope.moreThanOneSheetsInFile = true;

            // Emptying the form in the case when 1st upload has been made with one worksheet
            $scope.doc_type = '';
            $scope.custom_field = '';
            $scope.indexPattern.name = '';
            $scope.indexPatternList = [];
            $scope.customDateFormats = [];
            $scope.uniqueHeaders = [];
          }

          // If the file size is about 5 MB the digest cycle is taking time to complete and return $scope.uniqueHeaders so we force
          // $apply() to get $scope.uniqueHeaders immediately
          $scope.$apply(function () { });
        };


        reader.readAsBinaryString(event.target.files[0]);
      }
    };



    //Submit function of the form
    $scope.importExcelData = function () {
      // Checking if it a timeseries data or not
      let isTimeSeriesData = 'True';
      if ($scope.time_field === 'Not a time series data') {
        isTimeSeriesData = 'False';
      }

      if ($scope.advancedFields === false) {
        $scope.time_format = ''
        $scope.custom_field = ''
        $scope.doc_type = ''
      }

      StateService.importData($scope.File, $scope.indexPattern.name, $scope.doc_type, isTimeSeriesData, $scope.time_field, $scope.time_format, $scope.custom_field, Upload).then((response) => {
        if (response.status === HTTP_SUCCESS_CODE) {
          $scope.successfulUpload = true;
          // // We remove the succes message after 4 sec
          setTimeout(function () {
            $scope.cancel();
          }, 3000);
        }
      });

      $scope.cancel();
    };

    $scope.cancel = () => {
      $uibModalInstance.dismiss('cancel');
    };
  }
}

importPopupCtrl.$inject = ['$scope', '$injector', '$uibModalInstance', 'StateService', 'Upload', 'HTTP_SUCCESS_CODE', 'chrome'];
/*eslint-disable*/
export default importPopupCtrl;
/*eslint-enable*/

