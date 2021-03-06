// This file is automatically generated using pluto meta-file framework
// Please do not make any change in this file directly.
'use strict';
import _ from 'lodash';
class logcollectorAddDataSourceCtrl {
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
       
      
         $scope.credential = $uibModalInstance.row.credential;
       
      
         $scope.user = $uibModalInstance.row.user;
       
      
         $scope.ip_address = $uibModalInstance.row.ip_address;
       
      
         $scope.path = $uibModalInstance.row.path;
       
      
         $scope.localpath = $uibModalInstance.row.localpath;
       
      
         $scope.type = $uibModalInstance.row.type;
       
      
         $scope.additionalconfiguration = $uibModalInstance.row.additionalconfiguration;
       
      
      $scope.interval = 'minutes_15';
      $scope.data_received = $uibModalInstance.data_received;
    } else {
      
            
              
                $scope.name = '';
              
            
         
       
            
              
                $scope.credential = 'DUMMY';
              
            
         
       
            
              
                $scope.user = '';
              
            
         
       
            
              
                $scope.ip_address = '0.0.0.0';
              
            
         
       
            
              
                $scope.path = '';
              
            
         
       
            
              
                $scope.localpath = '';
              
            
         
       
            
              
                $scope.type = '';
              
            
         
       
            
              
                $scope.additionalconfiguration = '';
              
            
         
       

      $scope.data_received = false;
      $scope.interval = 'minutes_15';
    }
 
    
   
   
   
   
   
   
   
   


    

    // Function called when Save&Continue button is clicked
    $scope.saveDataSource = (isValid) => {
      if( isValid ) {
        // Create an object from current values..
        
        $scope.data_obj.name = $scope.name;
        
        
        $scope.data_obj.credential = $scope.credential;
        
        
        $scope.data_obj.user = $scope.user;
        
        
        $scope.data_obj.ip_address = $scope.ip_address;
        
        
        $scope.data_obj.path = $scope.path;
        
        
        $scope.data_obj.localpath = $scope.localpath;
        
        
        $scope.data_obj.type = $scope.type;
        
        
        $scope.data_obj.additionalconfiguration = $scope.additionalconfiguration;
        
        

        

        // If row already exist, we need to figure out if something has really
        // changed
        if ($uibModalInstance.row) {
            StateService.updateDataSources('logcollector', $scope.name, $scope.data_obj).then(function() {
                $uibModalInstance.row.name = $scope.name;
                $uibModalInstance.row.credential = $scope.credential;
                $uibModalInstance.row.user = $scope.user;
                $uibModalInstance.row.ip_address = $scope.ip_address;
                $uibModalInstance.row.path = $scope.path;
                $uibModalInstance.row.localpath = $scope.localpath;
                $uibModalInstance.row.type = $scope.type;
                $uibModalInstance.row.additionalconfiguration = $scope.additionalconfiguration;
                
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
            StateService.addDataSources('logcollector', $scope.name, $scope.data_obj).then(function() {
                $uibModalInstance.row = {};
                $uibModalInstance.row.name = $scope.name;
                $uibModalInstance.row.credential = $scope.credential;
                $uibModalInstance.row.user = $scope.user;
                $uibModalInstance.row.ip_address = $scope.ip_address;
                $uibModalInstance.row.path = $scope.path;
                $uibModalInstance.row.localpath = $scope.localpath;
                $uibModalInstance.row.type = $scope.type;
                $uibModalInstance.row.additionalconfiguration = $scope.additionalconfiguration;
                
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
        StateService.refreshDataSouce('logcollector', $scope.name, '', $scope.interval).then(function(data) {
        
            $scope.data_received = data.data_received;
        });
    };

    

    $scope.closeDataSource = () => {
        $uibModalInstance.close($scope.data_obj);
    };
  }
}

logcollectorAddDataSourceCtrl.$inject = ['$scope', 'StateService', '$uibModalInstance'];

export default logcollectorAddDataSourceCtrl;