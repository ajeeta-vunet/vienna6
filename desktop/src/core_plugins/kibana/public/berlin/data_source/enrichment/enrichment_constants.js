export const EnrichmentConstants = {
  ENRICHMENT_TABLES_PATH: '/data_source/enrichment/',
  ENRICHMENT_DATA_PATH: '/data_source/enrichment/:tableId',
  ENRICHMENT_TABLES_API_URL: 'enrichment/metadata/',
  ENRICHMENT_DATA_API_URL: 'enrichment',
};

export const FIELD_TYPES = [
  {
    key: 'enum',
    name: 'enum',
    value: 'enum',
    label: 'Enum',
  },
  {
    key: 'ipAddress',
    name: 'ipAddress',
    value: 'ipAddress',
    label: 'IP Address',
  },
  {
    key: 'numeric',
    name: 'numeric',
    value: 'numeric',
    label: 'Numeric',
  },
  {
    key: 'string',
    name: 'string',
    value: 'string',
    label: 'String',
  },
];

export const KEY_VALUES_RULES_META = {
  name: 'hideIrrelevantFields',
  options: [
    {
      value: 'numeric',
      actions: [
        {
          hide: ['constraint', 'options'],
        },
      ],
    },
    {
      value: 'string',
      actions: [
        {
          hide: ['minimum', 'maximum', 'options'],
        },
      ],
    },
    {
      value: 'ipAddress',
      actions: [
        {
          hide: ['minimum', 'maximum', 'constraint', 'options'],
        },
      ],
    },
    {
      value: 'enum',
      actions: [
        {
          hide: ['minimum', 'maximum', 'constraint'],
        },
      ],
    },
  ],
};