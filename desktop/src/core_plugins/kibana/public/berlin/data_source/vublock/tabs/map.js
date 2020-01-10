// Will be used as part of vuBlock Phase 2

// import { uiModules } from 'ui/modules';
// const app = uiModules.get('app/berlin');
// import '../styles/vublock.less';

// app.directive('map', function () {
//   return {
//     restrict: 'E',
//     controllerAs: 'map',
//     controller: map,
//     bindToController: true,
//   };
// });

// function map($scope,
//   $http,
//   $window,
//   savedVisualizations,
// ) {

//   // map meta data
//   $scope.mapMeta = {
//     headers: [],
//     rows: [],
//     id: '',
//     add: false,
//     edit: false,
//     selection: false,
//     search: true,
//     tableAction: [],
//     default: {},
//     forceUpdate: false,
//     inverted: false
//   };

//   if ($scope.vuBlock.map && $scope.vuBlock.map.length) {
//     const firstObj = $scope.vuBlock.map[0];
//     for (const key in firstObj) {
//       if (firstObj.hasOwnProperty(key)) {
//         $scope.mapMeta.rows.push(key);
//         $scope.mapMeta.headers.push(key);
//       }
//     }
//   }

//   $scope.fetchItems = function () {
//     return Promise.resolve($scope.vuBlock.map);
//   };

//   function init() {
//     savedVisualizations.get(
//       'area-aug').then(function (savedVisualization) {
//       $scope.visObj = savedVisualization;
//     });
//   }

//   init();
// }
