export const VuBlockConstants = {
  VUBLOCK_PATH: '/data_source/vuBlock/',
  VUBLOCK_STORE_PATH: '/data_source/vuBlock_Store/',
  VUBLOCK_MODIFY_PATH: '/data_source/vuBlock_Store/modify/:vuBlockName',
  VUBLOCK_DETAILS_PATH: '/data_source/vuBlock/:vuBlockName',
  HOST_LANDSCAPE_PATH: '/data_source/landscape/',
  LOGICAL_BLOCK_TYPE: 'LogicalBlock',
  COMPONENT_BLOCK_TYPE: 'Component',
  STORYBOARDS_IGNORE_KEY_LIST: ['filter', 'id'], // Do not display these columns in storyboards tab
  FIELDS_IGNORE_KEY_LIST: ['range'], // Do not display these columns in fields tab
  MAP_RULES_IGNORE_KEY_LIST: ['id'], // Do not display these columns in maps tab
  ALERT_RULES_IGNORE_KEY_LIST: ['id'], // Do not display these columns in Alert Rules tab
  GOLDEN_SIGNALS_IGNORE_KEY_LIST: ['id', 'filter'], // Do not display these columns in Golden Signals tab
  DOCS_IGNORE_KEY_LIST: ['id'], // Do not display these columns in Golden Signals tab
  VERIFY_DATA: 'verifyData', // Constant for verify data button in sources tab
  AGENT_CONFIGURATION: 'getAgentConfiguration', // Constant for get agent configuration button
  VUBLOCK_API_BASE_PATH: 'vublock',
  VUBLOCK_SOURCES: 'source',
  VUBLOCK_SOURCES_IMPORT: 'source_bulk/import',
  VUBLOCK_SOURCES_ERROR: '?error_file=True',
  SOURCE_INSTANCE_TEMPLATE: '?template',
  VUBLOCKS_ENABLE_DISABLE: [
    'snmp',
    'device_heartbeat',
    'url_heartbeat',
    'service_heartbeat',
    'tracepath_heartbeat'
  ],
  SEARCH_DEBOUNCE_DELAY: 1000
};