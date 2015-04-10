define(function (require) {
  return function FieldObjectProvider(Private, shortDotsFilter, $rootScope, Notifier) {
    var _ = require('lodash');
    var notify = new Notifier({ location: 'IndexPattern Field' });

    var fieldTypes = Private(require('components/index_patterns/_field_types'));
    var fieldFormats = Private(require('registry/field_formats'));
    var ObjDefine = require('utils/obj_define');

    function Field(indexPattern, spec) {
      // unwrap old instances of Field
      if (spec instanceof Field) spec = spec.source;

      // constuct this object using ObjDefine class, which
      // extends the Field.prototype but gets it's properties
      // defined using the logic below
      var obj = new ObjDefine(spec, Field.prototype);

      // find the type for this field, fallback to conflict type of type is unknown
      var type = fieldTypes.byName[spec.type];
      if (!type) {
        type = fieldTypes.byName.conflict;
        notify.error(
          'Unkown field type "' + spec.type + '"' +
          ' for field "' + spec.name + '"' +
          ' in indexPattern "' + indexPattern.id + '"'
        );
      }

      var formatName = indexPattern.fieldFormatMap[spec.name];
      var format = fieldFormats.byName[formatName] || fieldFormats.for(spec.type);
      var indexed = !!spec.indexed;
      var scripted = !!spec.scripted;
      var sortable = indexed && type.sortable;
      var bucketable = indexed || scripted;
      var filterable = spec.name === '_id' || scripted || (indexed && type.filterable);

      obj.fact('name');
      obj.fact('type');
      obj.writ('count', spec.count || 0);

      // scripted objs
      obj.fact('scripted', scripted);
      obj.writ('script', scripted ? spec.script : null);
      obj.writ('lang', scripted ? (spec.lang || 'expression') : null);

      // mapping info
      obj.fact('indexed', indexed);
      obj.fact('analyzed', !!spec.analyzed);
      obj.fact('doc_values', !!spec.doc_values);

      // usage flags, read-only and won't be saved
      obj.flag('formatName', formatName);
      obj.flag('format', format);
      obj.flag('sortable', sortable);
      obj.flag('bucketable', bucketable);
      obj.flag('filterable', filterable);
      obj.flag('indexPattern', indexPattern);
      obj.flag('displayName', shortDotsFilter(spec.name));

      return obj.create();
    }

    return Field;
  };
});
