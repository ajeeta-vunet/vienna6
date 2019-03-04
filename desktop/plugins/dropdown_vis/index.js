export default function (kibana) {
  return new kibana.Plugin({
    uiExports: {
      visTypes: [
        'plugins/dropdown_vis/dropdown_vis'
      ]
    }
  });
}
