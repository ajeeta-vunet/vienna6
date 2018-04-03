export default function (kibana) {

  return new kibana.Plugin({
    require: ['elasticsearch'],
    name: 'business_metric_vis',
    uiExports: {
      visTypes: [
        'plugins/business_metric_vis/business_metric_vis'
      ]
    }
  });

}
