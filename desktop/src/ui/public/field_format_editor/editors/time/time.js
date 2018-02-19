import numeralTemplate from './time.html';

export function timeEditor() {
  return {
    formatId: 'time',
    template: numeralTemplate,
    controllerAs: 'cntrl',
    controller: function () {
      this.transformOpts = [
        { id: false, name: '- none -' },
        { id: 'millisecond', name: 'Millisecond' },
        { id: 'second', name: 'Second' },
        { id: 'minute', name: 'Minute' },
        { id: 'hour', name: 'Hour' },
        { id: 'day', name: 'Day' },
      ];

      this.sampleInputs = [
        1.344445, 220.4564, 999.126000, 59.66640411, 0.009, 0.019,
        0.09999999, 0.9999999, 1000, 4600, 10000, 160000,
      ];
    }
  };
}
