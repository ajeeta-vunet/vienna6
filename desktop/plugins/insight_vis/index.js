export default function (kibana) {
  return new kibana.Plugin({
    require: ['elasticsearch'],
    name: 'insight_vis',
    uiExports: {
      visTypes: [
        'plugins/insight_vis/insight_vis'
      ]
    }
  });
}
