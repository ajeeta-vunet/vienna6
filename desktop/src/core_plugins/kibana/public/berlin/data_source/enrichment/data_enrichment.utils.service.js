

class DataEnrichmentUtilService {

  constructor() {
    // Regex patterns for different data types
    this.FIELD_PATTERN = {
      'numeric': {
        'frontend_pattern': '^\\-?\\d{0,18}((\\.|\\,)\\d{0,2})?$',
        'pattern_help': 'This should contain numbers with maximum of 18 digits'
      },
      'ip': {
        'frontend_pattern': '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]).){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$',
        'pattern_help': 'This should be a valid IP Address'
      },
      'string': {
        'frontend_pattern': '.{0,64}',
        'pattern_help': 'This should contain maximum of 64 characters'
      }
    };
  }

  //Based on the given field's type choose the regex pattern and set it to $scope

  // key is the key of the field. In the below eg. key1 is the key for "IP Address"
  // type is the field's data type

  // Eg. #(type,type_2):(key1_field,IP Address,ip):(key2_field,name,numeric):(value2_field,email,ip)

  // Based on the type, regex pattern is set to a variable with format key + "_pattern" to the scope
  // For eg. In the eg. given above, The "IP Address" field's ie key1_fileld's regex pattern is set
  // to a vaiable "key1_pattern". In the html, this pattern is used in ng-pattern.

  // Return the REGEX pattern based on the given type.
  getFrontendPatternByType(type) {
    if (type === 'ip') {
      return this.FIELD_PATTERN.ip;
    } else if (type === 'numeric') {
      return this.FIELD_PATTERN.numeric;
    } else {
      return this.FIELD_PATTERN.string;
    }
  }

  // Get the field details like name, type, frontend pattern and pattern_help
  // from the given field object
  getFieldDetails(field) {

    	// Initialize the fieldDetails object
    const fieldDetails = {
      'name': '',
      'type': 'string',
      'options': [],
      'frontend_pattern': '',
      'pattern_help': ''
    };

    // Get the name
    fieldDetails.name = field.name;

    // Get the type
    if(field.type !== undefined) {
      fieldDetails.type = field.type;
    }

    if (field.type === 'enum') {
      // If it is enum type get the options
      fieldDetails.options = field.options;
    } else {

      // If it is of other types, get frontend pattern and pattern help
      fieldDetails.frontend_pattern = field.frontend_pattern;
      if (field.frontend_pattern === undefined) {
        // If the frontend_pattern is not defined in the yml, get the
        // defaults
        fieldDetails.frontend_pattern = this.getFrontendPatternByType(field.type).frontend_pattern;
      }

      fieldDetails.pattern_help = field.pattern_help;
      if (field.pattern_help === undefined) {
        fieldDetails.pattern_help = this.getFrontendPatternByType(field.type).pattern_help;
      }
    }
    return fieldDetails;
  }
}

DataEnrichmentUtilService.$inject = [];
/*eslint-disable*/
export default DataEnrichmentUtilService;
/*eslint-enable*/
