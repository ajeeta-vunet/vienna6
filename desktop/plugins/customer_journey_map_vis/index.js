export default function (kibana) {

  return new kibana.Plugin({
    require: ['elasticsearch'],
    name: 'customer_journey_map_vis',
    uiExports: {
      visTypes: [
        'plugins/customer_journey_map_vis/customer_journey_map_vis'
      ]
    }
  });

}