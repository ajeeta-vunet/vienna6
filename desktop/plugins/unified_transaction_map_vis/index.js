export default function (kibana) {

  return new kibana.Plugin({
    require: ['elasticsearch'],
    name: 'unified_transaction_map_vis',
    uiExports: {
      visTypes: [
        'plugins/unified_transaction_map_vis/unified_transaction_map_vis'
      ]
    }
  });

}
