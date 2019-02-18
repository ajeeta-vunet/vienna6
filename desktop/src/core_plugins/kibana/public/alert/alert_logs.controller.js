/* eslint-disable guard-for-in */
import _ from 'lodash';


/*
Compares the consecutive subrule results represented by lastRowObj
& currentRowObj and determines what elements in the groupList has changed.

Used to calculate rowspan of the group elements

Eg :  If group is host, pid, cpu

      1. lastRowObj = {'host' : '127.0.0.1', 'pid' : 1234, 'cpu' : 0.4}
         currentRowObj = {'host' : '127.0.0.1', 'pid' : 4356, 'cpu' : 0.3}

         retObj = {'host' : true, 'pid' : false, 'cpu' : false}

      2. lastRowObj = {'host' : '127.0.0.1', 'pid' : 1234, 'cpu' : 0.4}
         currentRowObj = {'host' : '192.168.8.9', 'pid' : 1234, 'cpu' : 0.4}

         retObj = {'host' : false, 'pid' : false, 'cpu' : false}

*/
function columnsChanged(lastRowObj, currentRowObj, groupList) {
  let flag = true;
  const retObj = {};
  for (let group = 0; group < groupList.length; group++) {

    if (lastRowObj[groupList[group]] !== currentRowObj[groupList[group]]) {
      flag = false;
    }
    if (flag) {
      retObj[groupList[group]] = true;
    }
    else {
      retObj[groupList[group]] = false;
    }
  }
  return retObj;

}


class AlertLogsCtrl {
  constructor($scope, $modalInstance, alertLogData) {
    if (_.isEmpty(alertLogData)) {
      $scope.displayDebug = 'No logs found';
      alertLogData = { 'diagnostics_json_buffer': { 'subrules': [], 'evaluation_result': [], 'all_alert_channels': [] } };
    }

    else {
      $scope.displayDebug = alertLogData.log_buffer.length ? alertLogData.log_buffer : 'No logs found!';
    }

    $scope.alertLogs = alertLogData.diagnostics_json_buffer;


    // All available alert channels
    $scope.alertChannels = $scope.alertLogs.all_alert_channels;

    // Contains all the groups for which alert was generated
    $scope.alertGeneratedFor = {};
    $scope.atleastOneAlertWasGenerated = false;
    $scope.alertLogs.evaluation_result.forEach(function (evalObj) {
      for (const key in evalObj) {
        const resultIndex = _.findIndex(evalObj[key], function (o) { return o.name === 'Evaluation Result'; });

        // Evaluation result for a group is true
        if (evalObj[key][resultIndex].value) {
          // Used to show / hide the 'No alerts were generated' error msg
          $scope.atleastOneAlertWasGenerated = true;
        }

        $scope.alertGeneratedFor[key] = {};
        $scope.alertGeneratedFor[key].evaluationResult = evalObj[key][resultIndex].value;

        // Status of alert delivery for each alert channel
        // will be stored here with 'key' being a group
        $scope.alertGeneratedFor[key].alertChannels = {};

        // For each channel determine if alert was throttled, sent or not configured
        for (let channelIndex = 0; channelIndex < $scope.alertChannels.length; channelIndex++) {
          // Alert Channel (eg : alertByEmail) not in configured alertChannels
          // Not configured case
          if (!_.includes($scope.alertLogs.configuredAlertChannels, $scope.alertChannels[channelIndex].channel_key)) {
            $scope.alertGeneratedFor[key].alertChannels[$scope.alertChannels[channelIndex].channel_key] = 'Not Configured';
          }
          else {
            // Evaluation result for a group is true
            if (evalObj[key][resultIndex].value) {
              // Throttled case
              if ($scope.alertLogs.alertThrottled) {
                $scope.alertGeneratedFor[key].alertChannels[$scope.alertChannels[channelIndex].channel_key] = 'Throttled';
              }
              // Not Throttled, so the alert delivery status is taken from backend info
              else {
                $scope.alertGeneratedFor[key].alertChannels[$scope.alertChannels[channelIndex].channel_key] =
                  $scope.alertLogs.alert_channels[key][$scope.alertChannels[channelIndex].channel_key];
              }
            }

            // Evaluation result for a group is false
            // So irrespective of throttling or not alert generation for given channel must be false
            else {
              $scope.alertGeneratedFor[key].alertChannels[$scope.alertChannels[channelIndex].channel_key] =
                evalObj[key][resultIndex].value;
            }
          }
        }
      }
    });

    // All the attributes of the subrules to be shown
    // in the subrule information table
    $scope.dataAttributes = [
      'Name', 'Metric', 'Target Field',
      'Filter', 'Start Time', 'End Time',
      'Grouping', 'Additional Fields', 'Subrule Type'
    ];

    // function called when clicked on 'Done' button
    $scope.close_alert_modal = function () {
      $modalInstance.close();
    };


    // This function takes the subrule results as input,
    // adds addtional fields and grouping into a single json
    // and adds rowspan to each value depending upon its repetition
    // The modified result from this function is then used to
    // create results table for each subrule.
    $scope.initFn = function (subrule) {

      // Subrule result object to be compared to current subrule object
      // to add rowspan value
      let lastObj = {};

      // Grouping is caps since it has come from the backend like this
      const groups = subrule.data.Grouping;
      const additionalFields = subrule.data['Additional Fields'];
      const additionalFieldsList = additionalFields === '' ? [] : additionalFields.split(',');

      // Field whose result is being calculated
      // eg avg of cpu then target field is cpu
      // Target Field is result if no target field is selected
      // (eg: In count alert)
      const targetField = subrule.data['Target Field'];

      const groupList = groups === '' ?
        [targetField].concat(additionalFieldsList) :
        groups.split(',').concat([targetField], additionalFieldsList);

      /*
      lastRowKeys --

      Represents the index of each group element where it is present in resultsJson
      This is done for rowspan functionality.
      Suppose we have a groupList as host, pid, cpu then,
      initially lastRowKeys = [0, 0, 0]. Now as we iterate over the
      result, we find host : 127.0.0.1 occurs for all the processes, hence
      common. Therefore, we add this entry only once to resultsJson and
      increase its rowspan by the number of times it repeats. The lastRowKeys[0]
      entry will determine the index where the host entry is in resultsJson and update
      the rowspan there.

      resultsJson = {
        "1" : {
          'host' : { 'value' : '127.0.0.1', rowspan : 3},
          'pid' : { 'value' : 7899, rowspan : 1 },
          'cpu' : { 'value' : 0.2, rowspan : 1 }
        },
        "2" : {
          'pid' : { 'value' : 1234, rowspan : 1},
          'cpu' : { 'value' : 0.7, rowspan : 1 }
        },
        "3" : {
          'pid' : { 'value' : 4567, rowspan : 1},
          'cpu' : { 'value' : 0.4, rowspan : 1 }
        },
        "groups" : ['host', 'pid', 'cpu']
      }
       */
      const lastRowKeys = _.fill(Array(groupList.length), 0);

      // Contains the results for every row, with row number as the key
      const resultsJson = {};

      resultsJson.groups = groupList;

      subrule.result.forEach(function (item, index) {
        resultsJson[index + 1] = {};

        // Initial case, current obj and last obj will be same
        if (_.isEmpty(lastObj)) {
          lastObj = _.cloneDeep(item);
        }

        // Determines what values have changed in comparison to last object
        const retVal = columnsChanged(lastObj, item, groupList);

        // Max of overall rows in the groups that have been traversed,
        // so new row to be added at index maxVal + 1
        const maxVal = Math.max.apply(null, lastRowKeys);

        for (let groupIndex = 0; groupIndex < groupList.length; groupIndex++) {

          // add a new row, if last value of a group has changed
          if (retVal[groupList[groupIndex]] === false || lastRowKeys[groupIndex] === 0) {
            lastRowKeys[groupIndex] = maxVal + 1;

            resultsJson[index + 1][groupList[groupIndex]] = {};
            resultsJson[index + 1][groupList[groupIndex]].value = item[groupList[groupIndex]];
            resultsJson[index + 1][groupList[groupIndex]].rowspan = 1;
          }

          // increase rowspan by finding last index of the current group
          // inside resultsJson
          else {
            resultsJson[lastRowKeys[groupIndex]][groupList[groupIndex]].rowspan += 1;
          }
        }

        // Make current obj as last object after it's rowspan manipulation is done
        lastObj = _.cloneDeep(item);
      });

      // add the resultsJson to the subrule
      subrule.modifiedResult = resultsJson;
    };
  }
}

AlertLogsCtrl.$inject = ['$scope', '$modalInstance', 'alertLogData'];

// eslint-disable-next-line @elastic/kibana-custom/no-default-export
export default AlertLogsCtrl;


