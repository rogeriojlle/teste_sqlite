const { join } = require('path');
const basepath = end => join(__dirname, '../packages/desktop-gtk', end);
const Events = require('events');

module.exports = class extends Events {
  #pronto = false;

  constructor({ nome = null }) {
    super();
    this.nome = nome;
    this.init();
  }

  async init() {
    if (this.#pronto) return this;
    const { Gtk, gi, runModule, GdkPixbuf } = await require(basepath(
      'wait-for-gtk.js'
    ))();
    const { Grid, FlowBox } = await require(basepath('widgets.js'))();
    Object.assign(this, { Gtk, gi, runModule, GdkPixbuf }, { Grid, FlowBox });
    this.#pronto = true;
    return this;
  }

  limpar(componente = this.page) {
    const itens = [];
    componente.foreach(item => {
      itens.push(
        () =>
          new Promise((resolve, reject) => {
            item.on('destroy', () => {
              resolve(item);
            });
            item.destroy();
          })
      );
    });
    return itens.reduce(async (a, d) => {
      await a;
      return await d();
    }, Promise.resolve());
  }
};
