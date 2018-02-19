import numeralTemplate from './percent.html';

export function percentEditor() {
  return {
    formatId: 'percentage',
    template: numeralTemplate,
    controllerAs: 'cntrl',
    controller: function () {
      this.transformOpts = [
        { id: false, name: '- none -' },
        { id: '0-1_range', name: 'Fraction (0-1)' },
        { id: '0-100_range', name: 'Percentage (0-100)' }
      ];

      this.sampleInputs = [
        77, 66.677, 99.126000, 59.66640411, 0.009,
        0.9, 0.09, 9, 90, 3.567888, 1.56, 1, 100,
      ];
    }
  };
}
