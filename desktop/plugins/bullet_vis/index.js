export default function (kibana) {

  return new kibana.Plugin({
    require: ['elasticsearch'],
    name: 'bullet_vis',
    uiExports: {
      visTypes: [
        'plugins/bullet_vis/bullet_vis'
      ]
    }
  });

}
