const defaults = { spacing: 5, margin: 5 };

module.exports = async () => {
  const { Gtk, Gio } = await require('./wait-for-gtk.js')();

  return {
    Css(arquivo, w) {
      const provider = Gtk.CssProvider.getDefault();
      provider.loadFromFile(Gio.fileNewForPath(arquivo));
      Gtk.StyleContext.addProviderForScreen(
        w.screen,
        provider,
        Gtk.STYLE_PROVIDER_PRIORITY_USER
      );
      return provider;
    },
    MainWindow: class extends Gtk.Window {
      constructor({
        width = 800,
        height = 480,
        title = '',
        type = Gtk.WindowType.TOPLEVEL,
        window_position = Gtk.WindowPosition.CENTER,
      }) {
        let _super = Object.assign(
          {
            title,
            type,
            window_position,
          },
          arguments[0]
        );

        super(_super);

        this.setDefaultSize(width, height);

        this.setResizable(true);

        this.on('show', () => {
          setTimeout(() => {
            Gtk.main();
          });
          return false;
        });

        this.on('destroy', () => {
          Gtk.mainQuit();
          const inspector = require('inspector');
          if (inspector.url()) inspector.close();
          process.exit(0);
        });

        this.on('delete-event', () => {
          console.log('delete-event');
          return false;
        });
      }
    },

    Grid: class extends Gtk.Grid {
      constructor() {
        super();
        this.setColumnSpacing(defaults.spacing);
        this.setRowSpacing(defaults.spacing);
        this.margin = defaults.margin;
      }
    },

    Notebook: class extends Gtk.Notebook {
      #pages = new Map();
      constructor() {
        super();

        this.on('switch-page', (destino, num) => {
          let origem = null;
          let origemNum = this.getCurrentPage();
          if (origemNum > -1) {
            origem = this.getNthPage(origemNum);
            typeof origem?.self?.emit === 'function'
              ? origem.self.emit('sair', {
                  destino: destino?.self || destino,
                  parent: this?.parent,
                  notebook: this,
                })
              : console.log('falhou ao sair', origem);
          }

          typeof destino?.self?.emit === 'function'
            ? destino.self.emit('entrar', {
                origem: origem?.self || origem,
                parent: this?.parent,
                notebook: this,
              })
            : console.log('falhou ao entrar', destino);
        });

        this.on('page-added', (page, num) => {
          page?.self?.nome
            ? this.#pages.set(page.self.nome, page.self)
            : () => {};
        });
      }

      irPara(para) {
        let destino = this.#pages.get(para);
        let pageNum = this.pageNum(destino.page);
        let origem = this.getNthPage(this.getCurrentPage()).self;
        destino.emit('vindoDe', { origem });
        this.setCurrentPage(pageNum);
      }
    },

    FlowBox: class extends Gtk.FlowBox {
      constructor() {
        super();
        this.setColumnSpacing(defaults.spacing);
        this.setRowSpacing(defaults.spacing);
        this.margin = defaults.margin;
        this.setHalign(Gtk.Align.FILL);
        this.setValign(Gtk.Align.START);
      }
    },
    Settings: Gtk.Settings,
  };
};
