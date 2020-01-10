export const VuBlockConstants = {
  VUBLOCK_PATH: '/data_source/vuBlock/',

  VUBLOCK_DETAILS_PATH: '/data_source/vuBlock/:vuBlockName',

  LOGICAL_BLOCK_TYPE: 'LogicalBlock',

  TOUCHPOINT_BLOCK_TYPE: 'TouchPoint',

  // Do not display these columns in storyboards tab
  STORYBOARDS_IGNORE_KEY_LIST: ['filter', 'id'],

  // Do not display these columns in fields tab
  FIELDS_IGNORE_KEY_LIST: ['range'],

  // Do not display these columns in maps tab
  MAP_RULES_IGNORE_KEY_LIST: ['id'],

  // Do not display these columns in Alert Rules tab
  ALERT_RULES_IGNORE_KEY_LIST: ['id'],

  // Do not display these columns in Golden Signals tab
  GOLDEN_SIGNALS_IGNORE_KEY_LIST: ['id', 'filter'],

  // Do not display these columns in Golden Signals tab
  DOCS_IGNORE_KEY_LIST: ['id'],

  // Constant for verify data button in sources tab
  VERIFY_DATA: 'verifyData',

  // Constant for get agent configuration button
  AGENT_CONFIGURATION: 'getAgentConfiguration'
};
