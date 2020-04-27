import _ from 'lodash';

export const AlertConstants = {
  LANDING_PAGE_PATH: '/alerts',
  CREATE_PATH: '/alert',
};

export function createAlertEditUrl(id) {
  return `/alert/${id}`;
}

// Alert listing constants
// Alert condition duration type list
export const DURATION_TYPES = [
  {
    label: 'Minute',
    value: 'minute'
  },
  {
    label: 'Hour',
    value: 'hour'
  },
  {
    label: 'Day',
    value: 'day'
  },
  {
    label: 'Week',
    value: 'week'
  },
  {
    label: 'Month',
    value: 'month'
  }
];

// severity types
export const SEVERITY_TYPES = [
  {
    label: 'Critical',
    value: 'critical'
  },
  {
    label: 'Error',
    value: 'error'
  },
  {
    label: 'Warning',
    value: 'warning'
  },
  {
    label: 'Information',
    value: 'information'
  }
];

// source types
export const SOURCE_TYPES = [
  {
    label: 'Severity',
    value: 'severity'
  },
  {
    label: 'Metric',
    value: 'metric'
  },
  {
    label: 'Duration',
    value: 'duration'
  }
];

// action types
export const ACTION_TYPES = [
  {
    label: 'Set',
    value: 'set'
  },
  {
    label: 'Add',
    value: 'add'
  },
  {
    label: 'Remove',
    value: 'remove'
  }
];

// action types for channelList
export const CHANNEL_LIST_ACTION_TYPES = [
  {
    label: 'Update',
    value: 'update'
  },
  {
    label: 'Add',
    value: 'add'
  },
  {
    label: 'Mute',
    value: 'mute'
  }
];

// comparison types
export const COMPARISON_TYPES = [
  {
    label: 'Equal to',
    value: '=='
  },
  {
    label: 'Not equal to',
    value: '!='
  },
  {
    label: 'Less than',
    value: '<'
  },
  {
    label: 'Less than or equal to',
    value: '<='
  },
  {
    label: 'Greater than',
    value: '>'
  },
  {
    label: 'Greater than or equal to',
    value: '>='
  },
];

// destination types for action type 'add'
export const ACTION_LIST_ADD_DESTINATION_TYPES = [
  {
    label: 'Tags',
    value: 'tags'
  },
  {
    label: 'Dynamic Fields',
    value: 'dynamicFields'
  }
];

// destination types for action type 'set'
export const ACTION_LIST_SET_DESTINATION_TYPES = [
  {
    label: 'Subject',
    value: 'emailSubject'
  },
  {
    label: 'Summary',
    value: 'summary'
  },
  {
    label: 'Description',
    value: 'description'
  },
  {
    label: 'Severity',
    value: 'severity'
  },
];

// destination types for action type 'remove'
export const ACTION_LIST_REMOVE_DESTINATION_TYPES = [
  {
    label: 'Tags',
    value: 'tags'
  },
  {
    label: 'Dynamic Fields',
    value: 'dynamicFields'
  }
];

// channel types for action type 'add'
export const CHANNEL_LIST_ADD_CHANNEL_TYPES = [
  {
    label: 'Email Group',
    value: 'emailGroup'
  },
  {
    label: 'Email Id',
    value: 'emailId'
  },
  {
    label: 'Report',
    value: 'report'
  },
  {
    label: 'Run Book Automation',
    value: 'rba'
  },
  {
    label: 'Ticketing System',
    value: 'ticketingSystem'
  },
  {
    label: 'WhatsApp',
    value: 'whatsApp'
  }
];

// channel types for action type 'update'
export const CHANNEL_LIST_UPDATE_CHANNEL_TYPES = [
  {
    label: 'Email Group',
    value: 'emailGroup'
  },
  {
    label: 'Email Id',
    value: 'emailId'
  },
  {
    label: 'Report',
    value: 'report'
  },
  {
    label: 'Run Book Automation',
    value: 'rba'
  },
  {
    label: 'WhatsApp',
    value: 'whatsApp'
  }
];

// channel types for action type 'mute'
export const CHANNEL_LIST_MUTE_CHANNEL_TYPES = [
  {
    label: 'Email',
    value: 'email'
  },
  {
    label: 'Report',
    value: 'report'
  },
  {
    label: 'Run Book Automation',
    value: 'rba'
  },
  {
    label: 'Ticketing System',
    value: 'ticketingSystem'
  },
  {
    label: 'WhatsApp',
    value: 'whatsApp'
  }
];

// default configuration values
export const ALERT_CONFIG_DEFAULTS = {
  duration: 'minute',
  severity: 'warning',
  source: 'duration',
  comparison: '==',

  // action list
  actionListAdd: 'add',
  actionListAddDestination: 'tags',
  actionListSet: 'set',
  actionListSetDestination: 'summary',
  actionListRemove: 'remove',
  actionListRemoveDestination: 'tags',

  // channel list
  channelListAdd: 'add',
  channelListAddChannel: 'emailId',
  channelListUpdate: 'update',
  channelListUpdateChannel: 'emailId',
  channelListMute: 'mute',
  channelListMuteChannel: 'email',

  // alert controls
  throttleDuration: '4',
  throttleDurationType: 'hour',

  // help reference link
  helpReferenceLink: '/vuDoc/user_guide/alert.html#alert-rules'
};

export const NEW_RULE_LIST_ITEM = {
  ruleNameAlias: '',
  selectedMetric: {},
  ruleTypeDuration: 5,
  ruleTypeDurationType: 'minute',
  informationCollector: false
};

// new actionList item in evalCriteriaConditionList
export const NEW_CONDITION_LIST_ITEM = {
  source: ALERT_CONFIG_DEFAULTS.source,
  comparison: ALERT_CONFIG_DEFAULTS.comparison,
  value: '',
  bmv: '',
  metric: '',
  selectedBmvMetricList: []
};

// new actionList item in evalCriteriaConditionList
export const NEW_ACTION_LIST_ITEM = {
  action: ALERT_CONFIG_DEFAULTS.actionListAdd,
  destination: ALERT_CONFIG_DEFAULTS.actionListAddDestination,
  value: ''
};

// new channelList item in evalCriteriaConditionList
export const NEW_CHANNEL_LIST_ITEM = {
  action: ALERT_CONFIG_DEFAULTS.channelListAdd,
  channel: ALERT_CONFIG_DEFAULTS.channelListAddChannel,
  value: ''
};

export const NEW_EVAL_CRITERIA_CONDITION_LIST_ITEM = {
  matchAll: true,
  generateAlert: true,
  blockLabel: '',
  conditionList: [_.cloneDeep(NEW_CONDITION_LIST_ITEM)],
  actionList: [_.cloneDeep(NEW_ACTION_LIST_ITEM)],
  channelList: [_.cloneDeep(NEW_CHANNEL_LIST_ITEM)]
};

export const ALERT_CONDITION_TAB_HEADER_TEXT = 'The alert object configuration defines the parameters based on which system' +
  ' will evaluate alert conditions and generate notifications. A typical configuration will include the list of rules to ' +
  ' be evaluated, contents of notifications to be generated and channels through which notifications should be deliered to users.';

// alert about section help data meta
export const ABOUT_SECTION_HELP_OBJ = {
  headerText: 'Alert About Section',
  referenceLink: ALERT_CONFIG_DEFAULTS.helpReferenceLink,
  contentIntroduction: 'Use this section to configure the descriptive contents of the notifications' +
    ' generated based on this alert object. The following controls are possible:',
  contentList: [{
    title: 'Summary:',
    description: 'Contents filled in here will be used as subject field in the notification email ' +
      'generated and summary field in the notification document generated. Example: "Link Status Down", "CPU Usage High"'
  },
  {
    title: 'Description:',
    description: 'Contents filled here will be present in the description field of notification generated.' +
      ' It is recommended to use this field to give detailed explanation of the alert and recommended ' +
      'corrective steps and best practices. Example: "This server is experiencing heavy load for extended period.' +
      ' Please check the services/processes in the system. You might want to terminate any unwanted services running.' +
      ' If the condition persist, you might want to consider increasing the CPU/Memory resources allocated to the server".'
  },
  {
    title: 'Severity:',
    description: 'Static severity assigned to notifications generated using this alert object. Severity value configured in vuMetric ' +
      'visualization for individual rules can override the severity configured here, if the individual rules report higher severity.'
  }],
  additionalContent:
    'Portions of Summary and Description fields can be dynamically formed using contents from the actual alert ' +
    'document. Use the format specifiers for this purpose. <br>' +
    'For example, configuring Summary as "Server CPU usage is now %m for %G" will result in alert notification to ' +
    'contain summary as "Server CPU usage is now 76% for host:1.1.1.1". <br><br>' +

    '<ul>' +
    '<b>Supported format specifiers are:</b> <br>' +
    '<li>' +
    '%G -> Add Group by parameters and their values. <br>' +
    'Example: "Alert observed for %G" will result in "Alert observed for process:apache of host:micmac" <br><br>' +
    '</li>' +

    '<li>' +
    '%g -> Add only Group by parameter values. <br>' +
    'Example: "Alert observed for %g" will result in "Alert observed for apache of micmac" <br><br>' +
    '</li>' +

    '<li>' +
    '%M -> Monitoring parameters along with its values. <br>' +
    'Example: "Monitoring parameter %M" will result in "Monitoring parameter cpu_usage:18.2" <br><br>' +
    '</li>' +

    '<li>' +
    '%m -> Only monitoring parameter values. <br>' +
    'Example: "Monitoring parameter value observed=%m" will result in "Monitoring parameter value observed=18.2" <br><br>' +
    '</li>' +

    '<li>' +
    '%S -> Add severity information <br>' +
    'Example: "%S: CPU Usage High" will result in "Critical: CPU Usage High" <br>' +
    '</li>' +
    '</ul>'
};

// alert condition section help data meta
export const CONDITION_SECTION_HELP_OBJ = {
  headerText: 'Set Alert Condition Section',
  referenceLink: ALERT_CONFIG_DEFAULTS.helpReferenceLink,
  contentIntroduction: 'Rules corresponding to the conditions, for which alert notification is required are configured here. ' +
    'The metrics and threshold comparisons are configured inside vuMetric visualization. System will evaluate the metric for ' +
    'the duration configured here and will apply threshold comparisons <br><br>' +
    'Alert condition is considered to be active if all the rules evaluates to true. If the vuMetric within a rule has multiple ' +
    'metrics, the rule is considered to be evaluating to true, if atleast one of the metric thresholds matches alert ' +
    'threshold. This behavior can be overridden using evaluation script section.',
  contentList: [{
    title: 'Rule Name:',
    description: 'Optional name for the rule. This can be configured to represent the purpose of the rule.'
  },
  {
    title: 'Information Collection:',
    description: 'When a rule is marked as Information Collection Rule, the results of the rule is not used to decide whether ' +
      'notification should be generated. Instead, if notification is generated base don"t other rule conditions, data from ' +
      'this rule is included in the notification. For example, this can be used to include Top processes consuming CPU when ' +
      ' notification is generated for system CPU usage above threshold rule.'
  },
  {
    title: 'Select VuMetric:',
    description: 'Select the vuMetric visualization to be used for evaluating this rule. The list of metrics and corresponding ' +
      'thresholds present in the vuMetric configuration is used to evaluate this rule.'
  },
  {
    title: 'View VuMetric:',
    description: 'View current values of metrics configured in this vuMetric'
  },
  {
    title: 'Get metric (duration):',
    description: 'The duration for which metrics in vuMetric should be evaluated.'
  },
  {
    title: 'Get metric (durationType):',
    description: 'Unit corresponding to the duration.'
  }],
};

// alert evaluation condition section help data meta
export const EVALUATION_CONDITION_SECTION_HELP_OBJ = {
  headerText: 'Rule Evaluation Condition Section',
  referenceLink: ALERT_CONFIG_DEFAULTS.helpReferenceLink,
  contentIntroduction: 'Alert notification behavior and notification contents can be modified using conditions specified here. <br>' +
    'For example, based on value of a metric, you can decide the email recipients for a notification. <br><br>' +
    'Three types of controls are possible <br>' +
    '<ul>' +
    '<li>Based on the conditions, decide whether notification should be generated or not</li>' +
    '<li>Modify the contents of notification</li>' +
    '<li>Modify the notification channels to be used and individual recipients within the channel</li>' +
    '</ul>' +
    'The evaluation conditions configured here are executed from top to bottom. System stops the ' +
    'execution as soon as a condition matches.',
  contentList: [{
    title: 'Title:',
    description: 'Optional name for the evaluation block. This can be configured to represent the purpose of this block.'
  },
  {
    title: 'Match all the following conditions:',
    description: 'When selected, actions configured in this block are executed by the system, ' +
      'if all conditions specified here is satisfied.'
  },
  {
    title: 'Match any of the following conditions:',
    description: 'When selected, actions configured in this block are executed by the system, ' +
      'if one of the conditions specified here is satisfied.'
  },
  {
    title: 'Condition list:',
    description: 'The list of conditions for this block. Each condition compares the selected source '
      + 'field with the value specified. <br><br>' +
      'If these conditions are satisfied, system will use the configuration in this block to decide ' +
      'whether notification should be generated. In addition, system will use the action list and ' +
      'channel list configured in this block to control the notification generated.'
  },
  {
    title: 'Action list:',
    description: 'Actions listed here are used to modify, remove or add fields in the notification.',
  },
  {
    title: 'Channel list:',
    description: 'Modifications listed here will be applied to the notification channels and recipients.',
  }],
};

// alert evaluation script section help data meta
export const EVALUATION_SCRIPT_SECTION_HELP_OBJ = {
  headerText: 'Rule Evaluation Script Section',
  referenceLink: ALERT_CONFIG_DEFAULTS.helpReferenceLink,
  contentIntroduction: 'Control alert notification behavior and notification contents using python script. ' +
    'Please refer to vuSmartMaps user guide for more information on this'
};

// alert control section help data meta
export const CONTROL_SECTION_HELP_OBJ = {
  // control section help
  controlSection: {
    headerText: 'Alert Control Section',
    referenceLink: ALERT_CONFIG_DEFAULTS.helpReferenceLink,
    contentIntroduction: 'Use this section to control the way alert notifications are generated by the system for this alert object.',
  },
  // sub heading 'Alert Behavior' help
  controlBehaviorSection: {
    headerText: 'Alert Behavior',
    referenceLink: ALERT_CONFIG_DEFAULTS.helpReferenceLink,
    contentIntroduction: 'Decide on the alert notification behavior:',
    contentList: [{
      title: 'Enable Alarm Mode:',
      description: 'When enabled, system tracks the state of an alarm. Notifications are generated when the alert condition turns ' +
        'active or when condition gets cleared. In the intermediate period, when the condition continues to be active, no ' +
        'further notifications are generated. When disabled, notifications are generated at regular intervals as long as ' +
        'the alert condition is active. In this case, the system does not track the state of the alarm and no clear ' +
        'notifications will be generated.'
    },
    {
      title: 'Throttling:',
      description: 'The throttling is applicable only when alarm mode is disabled. When throttling is enabled, system stops ' +
        'sending notification for a particular condition for the configured interval. For example, if throttling interval ' +
        'is configured as 2 hours, a CPU usage high alert for a particular server will be notified second time only after ' +
        '2 hours from the first notification. This configuration would be useful to avoid repeated notifications when ' +
        'alarm mode is disabled.'
    },
    {
      title: 'Alert Active period:',
      description: 'This configuration can be used to avoid getting notifications during lean periods. For example, ' +
        'weekends, non-business hours etc.'
    }]
  },
  // sub heading 'Alert Channel' help
  controlChannelSection: {
    headerText: 'Alert Channel',
    referenceLink: ALERT_CONFIG_DEFAULTS.helpReferenceLink,
    contentIntroduction: 'Control the alert notification channels:',
    contentList: [{
      title: 'Tickets:',
      description: 'System connects to the configured ITSM system and updates a ticket.'
    },
    {
      title: 'WhatsApp:',
      description: 'System notifies users through WhatsApp. Recipient phone numbers are to be configured here.'
    },
    {
      title: 'Email:',
      description: 'System notifies users through email. List of email identifiers of recipients or an email group corresponding ' +
        'to the recipients are to be configured here. System uses a predefined email format for notification. The same can ' +
        'be overridden using "Email Body".'
    },
    {
      title: 'Runbook/Playbook:',
      description: 'Automaction hook scripts. System invokes the configured playbooks when alert condition turns active.'
    },
    {
      title: 'Reports:',
      description: 'Generate a report when alert condition turns active. The report is sent out over email to the ' +
        'email recipients configured in the report.'
    }],
  }
};
