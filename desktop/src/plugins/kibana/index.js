module.exports = function (kibana) {

  return new kibana.Plugin({

    exports: {
      app: {
        title: 'Kibana',
        description: 'the kibana you know and love',
        icon: 'images/logo.png',
        main: 'plugins/kibana/index',
        uses: [
          'visTypes',
          'spyModes'
        ]
      }
    }

  });

};
