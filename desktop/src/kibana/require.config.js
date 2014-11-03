require.config({
  baseUrl: './',
  paths: {
    kibana: 'index',
    // special utils
    routes: 'utils/routes/index',
    errors: 'components/errors',
    modules: 'utils/modules',
    lodash: 'utils/_mixins',

    // bower_components
    'angular-bindonce': 'bower_components/angular-bindonce/bindonce',
    'angular-bootstrap': 'bower_components/angular-bootstrap/ui-bootstrap-tpls',
    'angular-elastic': 'bower_components/angular-elastic/elastic',
    'angular-route': 'bower_components/angular-route/angular-route',
    'angular-ui-ace': 'bower_components/angular-ui-ace/ui-ace',
    'angular-chosen': 'bower_components/angular-chosen-localytics/chosen',
    ace: 'bower_components/ace-builds/src-noconflict/ace',
    angular: 'bower_components/angular/angular',
    async: 'bower_components/async/lib/async',
    bower_components: 'bower_components',
    chosen: 'bower_components/chosen/chosen.jquery.min',
    css: 'bower_components/require-css/css',
    d3: 'bower_components/d3/d3',
    elasticsearch: 'bower_components/elasticsearch/elasticsearch.angular',
    faker: 'bower_components/Faker/faker',
    file_saver: 'bower_components/FileSaver/FileSaver',
    gridster: 'bower_components/gridster/dist/jquery.gridster',
    heat: 'https://api.tiles.mapbox.com/mapbox.js/plugins/leaflet-heat/v0.1.0/leaflet-heat',
    inflection: 'bower_components/inflection/lib/inflection',
    jquery: 'bower_components/jquery/dist/jquery',
    jsonpath: 'bower_components/jsonpath/lib/jsonpath',
    lodash_src: 'bower_components/lodash/dist/lodash',
    mapbox: 'bower_components/mapbox.js/mapbox',
    markercluster: 'bower_components/leaflet.markercluster/dist/leaflet.markercluster',
    moment: 'bower_components/moment/moment',
    'ng-clip': 'bower_components/ng-clip/src/ngClip',
    text: 'bower_components/requirejs-text/text',
    zeroclipboard: 'bower_components/zeroclipboard/dist/ZeroClipboard'
  },
  shim: {
    angular: {
      deps: ['jquery'],
      exports: 'angular'
    },
    jsonpath: {
      exports: 'jsonPath'
    },
    gridster: ['jquery', 'css!bower_components/gridster/dist/jquery.gridster.css'],
    'angular-chosen': ['jquery', 'chosen'],
    'angular-route': ['angular'],
    'elasticsearch': ['angular'],
    'angular-bootstrap': ['angular'],
    'angular-bindonce': ['angular'],
    'angular-ui-ace': ['angular', 'ace'],
    'ng-clip': ['angular', 'zeroclipboard'],
    heat: {
      deps: ['mapbox']
    },
    inflection: {
      exports: 'inflection'
    },
    file_saver: {
      exports: 'saveAs'
    },
    mapbox: {
      deps: ['css!bower_components/mapbox.js/mapbox.css'],
      exports: 'L'
    },
    markercluster: {
      deps: ['mapbox',
      'css!bower_components/leaflet.markercluster/dist/MarkerCluster.css',
      'css!bower_components/leaflet.markercluster/dist/MarkerCluster.Default.css'
      ]
    }
    
  },
  waitSeconds: 60
});
