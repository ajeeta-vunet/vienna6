// This file is automatically generated using pluto meta-file framework
// Please do not make any change in this file directly.
'use strict';
import _ from 'lodash';
class cliAddDataSourceCtrl {
  constructor ($scope, StateService, $uibModalInstance) {

    $scope.editDataSource = false;
    $scope.data_obj = {};
    $scope.first_step = $uibModalInstance.first_step;
    $scope.second_step = $uibModalInstance.second_step;
    $scope.third_step = $uibModalInstance.third_step;
    $scope.index = $uibModalInstance.index;
    $scope.data = $uibModalInstance.data;
    

    
       
    
    
    
    $scope.credential_list = [];
             StateService.getSshCredentialNames().then(function(credential_list) {
                 $scope.credential_list = credential_list;
                 if (!$scope.editDataSource && credential_list.length > 0) {
                     $scope.credential = credential_list[0];
                 }
             });
          
       
    
    

    $scope.vendorList = [];
    $scope.deviceList = [];  
    // get the device and vendor information
    StateService.getVendorAndDeviceList().then(function (data) {
      $scope.vendorList = data.vendor_list;
      $scope.deviceList = data.device_list;
    });


    // if row is present then, edit modal function is called.
    if ($uibModalInstance.row) {
      $scope.editDataSource = true;
      
         $scope.name = $uibModalInstance.row.name;
       
      
         $scope.cli_target = $uibModalInstance.row.cli_target;
       
      
         $scope.cli_vendor = $uibModalInstance.row.cli_vendor;
       
      
         $scope.cli_device = $uibModalInstance.row.cli_device;
       
      
         $scope.credential = $uibModalInstance.row.credential;
       
      
         $scope.standalone_shipper = $uibModalInstance.row.standalone_shipper;
       
      
      $scope.interval = 'minutes_15';
      $scope.data_received = $uibModalInstance.data_received;
    } else {
      
            
              
                $scope.name = '';
              
            
         
       
            
              
                $scope.cli_target = '0.0.0.0';
              
            
         
       
            
              
                $scope.cli_vendor = 'Others';
              
            
         
       
            
              
                $scope.cli_device = 'Others';
              
            
         
       
            
              
                $scope.credential = 'DUMMY';
              
            
         
       
            
              
                $scope.standalone_shipper = '127.0.0.1';
              
            
         
       

      $scope.data_received = false;
      $scope.interval = 'minutes_15';
    }
 
    
   
   
   
   
   
   


    

    // Function called when Save&Continue button is clicked
    $scope.saveDataSource = (isValid) => {
      if( isValid ) {
        // Create an object from current values..
        
        $scope.data_obj.name = $scope.name;
        
        
        $scope.data_obj.cli_target = $scope.cli_target;
        
        
        $scope.data_obj.cli_vendor = $scope.cli_vendor;
        
        
        $scope.data_obj.cli_device = $scope.cli_device;
        
        
        $scope.data_obj.credential = $scope.credential;
        
        
        $scope.data_obj.standalone_shipper = $scope.standalone_shipper;
        
        

        

        // If row already exist, we need to figure out if something has really
        // changed
        if ($uibModalInstance.row) {
            StateService.updateDataSources('cli', $scope.name, $scope.data_obj).then(function() {
                $uibModalInstance.row.name = $scope.name;
                $uibModalInstance.row.cli_target = $scope.cli_target;
                $uibModalInstance.row.cli_vendor = $scope.cli_vendor;
                $uibModalInstance.row.cli_device = $scope.cli_device;
                $uibModalInstance.row.credential = $scope.credential;
                $uibModalInstance.row.standalone_shipper = $scope.standalone_shipper;
                
                $uibModalInstance.data_receive_list.splice($uibModalInstance.data.indexOf($uibModalInstance.row), 1);
                $uibModalInstance.data = _.without($uibModalInstance.data, $uibModalInstance.row);
                $uibModalInstance.data.push($scope.data_obj);
                $uibModalInstance.data_receive_list.push(false);
                $scope.data_saved = true;
                
                   $scope.first_step = false;
                   $scope.second_step = true;
                
            });
        } else {
            // Normal add
            StateService.addDataSources('cli', $scope.name, $scope.data_obj).then(function() {
                $uibModalInstance.row = {};
                $uibModalInstance.row.name = $scope.name;
                $uibModalInstance.row.cli_target = $scope.cli_target;
                $uibModalInstance.row.cli_vendor = $scope.cli_vendor;
                $uibModalInstance.row.cli_device = $scope.cli_device;
                $uibModalInstance.row.credential = $scope.credential;
                $uibModalInstance.row.standalone_shipper = $scope.standalone_shipper;
                
                $uibModalInstance.data.push($scope.data_obj);
                $uibModalInstance.data_receive_list.push(false);
                $scope.data_saved = true;
                
                   $scope.first_step = false;
                   $scope.second_step = true;
                
            });
        }
      }
    };

    // function called when clicked on 'cancel' button
    $scope.cancel = () => {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.refreshDataSource = () => {
        // Make a query and get the data from backend based on interval
        
        StateService.refreshDataSouce('cli', $scope.name, $scope.cli_target, $scope.interval).then(function(data) {
        
            $scope.data_received = data.data_received;
        });
    };

    

    $scope.closeDataSource = () => {
        $uibModalInstance.close($scope.data_obj);
    };
  }
}

cliAddDataSourceCtrl.$inject = ['$scope', 'StateService', '$uibModalInstance'];

export default cliAddDataSourceCtrl;