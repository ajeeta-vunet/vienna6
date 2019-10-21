export default function (kibana) {

  return new kibana.Plugin({
    require: ['elasticsearch'],
    name: 'status_indicator_and_kpi_vis',
    uiExports: {
      visTypes: [
        'plugins/status_indicator_and_kpi_vis/status_indicator_and_kpi_vis'
      ]
    }
  });

}