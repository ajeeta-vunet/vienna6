// ------------------------- NOTICE ------------------------------- //
//                                                                  //
//                   CONFIDENTIAL INFORMATION                       //
//                   ------------------------                       //
//     This Document contains Confidential Information or           //
//     Trade Secrets, or both, which are the property of VuNet      //
//     Systems Ltd.  This document may not be copied, reproduced,   //
//     reduced to any electronic medium or machine readable form    //
//     or otherwise duplicated and the information herein may not   //
//     be used, disseminated or otherwise disclosed, except with    //
//     the prior written consent of VuNet Systems Ltd.              //
//                                                                  //
// ------------------------- NOTICE ------------------------------- //

// Copyright 2020 VuNet Systems Ltd.
// All rights reserved.
// Use of copyright notice does not imply publication.

// This file consists of all the constants used in vu-metric

export const vuMetricConstants = {

  // here we are defining the color constants
  COLOR_CONSTANTS: {
    RED: '#dd171d',
    GREEN: '#05a608',
    YELLOW: '#fecc2f',
    ORANGE: '#f46f0c',
    WHITE: '#fff',
    GREY: '#656565',
    GREY_DARK: '#353535'
  },

  // This is the bucketing size constant
  BUCKETING_SIZE: 10000,

  // This is the default value for bucket
  BUCKET_DEFAULTS: {
    collapsed: false,
    customLabel: '',
    size: 3,
    field: '',
    fieldType: '',
  },

  // These are the default values for the error handler of the buckets
  BUCKET_ERROR_DEFAULTS: {
    field: {
      errorText: '',
      required: true
    },
    size: {
      errorText: '',
      required: true
    },
    customLabel: {
      errorText: '',
      required: false
    }
  },

  // These are the default values for the error handler of the buckets including customInterval
  BUCKET_ERROR_DEFAULTS_WITH_CUSTOMINTERVAL: {
    field: {
      errorText: '',
      required: true
    },
    size: {
      errorText: '',
      required: true
    },
    customLabel: {
      errorText: '',
      required: false
    },
    customInterval: {
      errorText: '',
      required: true
    }
  },


  // This is the default values for metric
  METRIC_DEFAULTS: {
    collapsed: false,
    index: {
      title: ''
    },
    showSavedSearch: false,
    savedSearch: {
      id: '',
      title: ''
    },
    advancedConfig: '',
    advanceConfigSwitch: false,
    additionalFields: '',
    field: '',
    fieldType: '',
    metricArg: '',
    filter: '*',
    format: '',
    hideMetric: false,
    label: '',
    goalLabel: '',
    groupName: '',
    description: '',
    metricListIndex: '',
    type: 'count',
    savedSearchFilter: '*',
    scripted: false,
    enableAutoBaseLining: false,
    bgColorEnabled: false,
    threshold: [],
    upTrendColor: 'green',
    intervalMetric: '',
    referenceLink: {
      enabled: false,
      type: 'dashboard',
      dashboard: {
        id: '',
        title: ''
      },
      searchString: '',
      retainFilters: false,
      useMetricFilter: false
    },
    enableCustomErrorMessage: false,
    customErrorMessage: 'No data to show.',
    enableCustomErrorTooltip: false,
    customErrorTooltip: 'There is no matching data for the selected time and filter criteria.'
  },

  // These are the default values for the error handler of the metrics
  METRIC_ERROR_DEFAULTS: {
    label: {
      errorText: '',
      required: true
    },
    goalLabel: {
      errorText: '',
      required: false
    },
    groupName: {
      errorText: '',
      required: false
    },
    description: {
      errorText: '',
      required: false
    }
  },

  // These are the default values for the error handler of the metrics with field
  METRIC_ERROR_DEFAULTS_WITH_FIELD: {
    label: {
      errorText: '',
      required: true
    },
    goalLabel: {
      errorText: '',
      required: false
    },
    groupName: {
      errorText: '',
      required: false
    },
    description: {
      errorText: '',
      required: false
    },
    field: {
      errorText: '',
      required: true
    }
  },

  // These are the default values for the error handler of the metrics with field and format
  METRIC_ERROR_DEFAULTS_WITH_FIELD_AND_FORMAT: {
    label: {
      errorText: '',
      required: true
    },
    goalLabel: {
      errorText: '',
      required: false
    },
    groupName: {
      errorText: '',
      required: false
    },
    description: {
      errorText: '',
      required: false
    },
    field: {
      errorText: '',
      required: true
    },
    format: {
      errorText: '',
      required: true
    }
  },

  // These are the default values for the error handler of the metrics with metricArg and field
  METRIC_ERROR_DEFAULTS_WITH_FIELD_AND_METRICARG: {
    label: {
      errorText: '',
      required: true
    },
    goalLabel: {
      errorText: '',
      required: false
    },
    groupName: {
      errorText: '',
      required: false
    },
    description: {
      errorText: '',
      required: false
    },
    field: {
      errorText: '',
      required: true
    },
    metricArg: {
      errorText: '',
      required: true
    }
  },



  // MetaData for action confirmation modal
  ACTION_CONFIRMATION_MODAL_DATA: {
    class: 'action-confirmation-modal',
    isForm: false,
    title: 'Initiate Action',
    message: '<h4>Are you sure you want to initiate this action ?</h4>'
  },

  // MetaData for confirmation message modal of action buttons
  ACTION_CONFIRMATION_MESSAGE_MODAL_DATA: {
    class: 'action-confirmation-message-modal',
    isForm: false,
    title: 'Action Initiated',
    message: '<h4>The action has been initiated. Please check notifications for any updates.</h4>'
  }

};