const Base = require('./notebook-page-class');
const { readFileSync } = require('fs');

module.exports = class extends Base {
  constructor() {
    super(arguments[0]);
  }

  async init() {
    await super.init();

    const { Gtk, gi, runModule, Grid, GdkPixbuf } = this;
    this.tab = new Gtk.Image({
      'icon-name': 'start-here',
    });

    this.page = new Grid();
    this.page.self = this;

    this.page.attach(new Gtk.Label({ label: 'Início' }), 0, 0, 10, 1);

    this.page.showAll();

    return this;
  }
};
