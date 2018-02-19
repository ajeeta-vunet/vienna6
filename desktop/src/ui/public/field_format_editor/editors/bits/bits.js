import numeralTemplate from './bits.html';

export function bitsEditor() {
  return {
    formatId: 'bits',
    template: numeralTemplate,
    controllerAs: 'cntrl',
    controller: function () {
      this.transformOpts = [
        { id: false, name: '- none -' },
        { id: 'bit', name: 'Bit' },
        { id: 'kilobit', name: 'Kilobit' },
        { id: 'megabit', name: 'Megabit' },
        { id: 'gigabit', name: 'Gigabit' },
        { id: 'byte', name: 'Byte' },
        { id: 'kilobyte', name: 'Kilobyte' },
        { id: 'megabyte', name: 'Megabyte' },
        { id: 'gigabyte', name: 'Gigabyte' },
      ];
      this.sampleInputs = [
        2500, 60000, 10000000, 120000, 15,
        10000000000000, 35000, 1000,
      ];
    }
  };
}
