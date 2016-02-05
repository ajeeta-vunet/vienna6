import _ from 'lodash';
define(function (require) {
  return function TemplateVisTypeFactory(Private) {
    var VisType = Private(require('ui/Vis/VisType'));
    var TemplateRenderbot = Private(require('ui/template_vis_type/template_renderbot'));

    _.class(TemplateVisType).inherits(VisType);
    function TemplateVisType(opts) {
      TemplateVisType.Super.call(this, opts);

      this.template = opts.template;
      if (!this.template) {
        throw new Error('Missing template for TemplateVisType');
      }
    }

    TemplateVisType.prototype.createRenderbot = function (vis, $el, uiState) {
      return new TemplateRenderbot(vis, $el, uiState);
    };

    return TemplateVisType;
  };
});
