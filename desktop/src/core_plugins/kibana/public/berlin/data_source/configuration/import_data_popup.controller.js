

const XLSX = require('xlsx');

class importPopupCtrl {
  constructor($scope, $uibModalInstance, StateService, Upload, HTTP_SUCCESS_CODE, chrome) {

    // This is used to show another popup after upload
    $scope.successfulUpload = false;
    const tentantInfo = chrome.getTenantBu();
    $scope.indexStringInfo = tentantInfo[0] + '-' + tentantInfo[1];

    $scope.exportExcel = function (event) {

      if (event) {
        //All validation declaration or variables has been set to false or empty
        $scope.uniqueHeaders = [];
        $scope.time_field = '';
        $scope.index_name = '';
        $scope.isEmptyHeaderPresent = false;
        $scope.isFileTypeWrong = false;
        $scope.isFileSizeMore = false;
        $scope.moreThanOneSheetsInFile = false;

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
            $scope.time_field = '';
            $scope.index_name = '';
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

      StateService.importData($scope.File, $scope.index_name, isTimeSeriesData, $scope.time_field, Upload).then((response) => {
        if (response.status === HTTP_SUCCESS_CODE) {
          $scope.successfulUpload = true;
          // // We remove the succes message after 4 sec
          setTimeout(function () {
            $scope.cancel();
          }, 3000);
        }
      });
    };

    $scope.cancel = () => {
      $uibModalInstance.dismiss('cancel');
    };
  }
}

importPopupCtrl.$inject = ['$scope', '$uibModalInstance', 'StateService', 'Upload', 'HTTP_SUCCESS_CODE', 'chrome'];
/*eslint-disable*/
export default importPopupCtrl;
/*eslint-enable*/

