export class Embeddable {
  constructor(config) {
    this.title = config.title || '';
    this.editUrl = config.editUrl || '';
    this.visState = config.visState || '';
  }
}
