const Base = require('./notebook-page-class');

module.exports = class extends Base {
  #notebook;
  #scrollNomes;
  #scrollPartidas;
  #partidas;
  #flowBox;

  constructor() {
    super(arguments[0]);

    this.on('entrar', async ({ origem = null, notebook = null }) => {
      this.#notebook = notebook;
      if (origem) await this.#atualizarTudo();
    });
  }

  async init() {
    await super.init();
    const { Gtk, FlowBox, Grid } = this;

    this.tab = new Gtk.Label({ label: '🐾' });
    this.page = new Grid();
    this.page.self = this;

    this.#scrollNomes = new Gtk.ScrolledWindow({
      'propagate-natural-height': true,
    });
    this.#scrollPartidas = new Gtk.ScrolledWindow({
      'propagate-natural-height': true,
    });
    this.#flowBox = new Gtk.FlowBox();

    this.#scrollNomes.setVexpand(false);
    this.#scrollNomes.setHexpand(true);

    this.#flowBox.setHalign(Gtk.Align.FILL);
    this.#flowBox.setValign(Gtk.Align.START);

    this.#scrollNomes.add(this.#flowBox);
    this.page.attach(this.#scrollNomes, 0, 0, 1, 1);
    this.page.attach(this.#scrollPartidas, 0, 1, 1, 1);

    this.page.showAll();
    return this;
  }

  #linhaPartidas(partidas) {
    const { Gtk, Grid, limpar, GdkPixbuf } = this;
    limpar(this.#scrollPartidas).then(() => {
      let arrGrafico = [];
      let menorPontuacao = 0;
      let maiorPontuacao = 0;

      let grid = new Grid({
        halign: Gtk.Align.CENTER,
      });

      partidas.map(
        ([adversario, resultado, idpartida, [nivelamento, pontos]], i) => {
          let x10pontos = pontos * -10;
          let comprimento = 10 * (i + 1);
          let lblResultado = new Gtk.Label({ 'use-markup': true });
          let lblNome = new Gtk.Label({ label: adversario });
          let lblNivelamento = new Gtk.Label({ label: `${nivelamento}` });
          let lblPontos = new Gtk.Label({ label: `${pontos}` });
          let flecha = '';
          let background = '#FFFFFF';
          let foreground = '#00FF00';

          if (x10pontos > maiorPontuacao) maiorPontuacao = x10pontos;
          if (x10pontos < menorPontuacao) menorPontuacao = x10pontos;
          arrGrafico.push([comprimento, x10pontos]);

          switch (resultado) {
            case 'v':
              //lblResultado.setText('⬆');
              flecha = '⬆';
              foreground = 'green';
              break;
            case 'd':
              flecha = '⬇';
              foreground = 'red';
              break;
            default:
              flecha = '⬍';
          }

          lblResultado.setMarkup(
            `<span size="xx-large" background="${background}" foreground="${foreground}">${flecha}</span>`
          );
          grid.attach(lblNome, i, 0, 1, 1);
          grid.attach(lblResultado, i, 1, 1, 1);
          grid.attach(lblNivelamento, i, 2, 1, 1);
          grid.attach(lblPontos, i, 3, 1, 1);
        }
      );
      let fim = arrGrafico.pop();
      let viewBoxX = -1;
      let viewboxY = menorPontuacao - 1;
      let viewBoxComprimento = fim[0] + 2;
      let viewBoxAltura = maiorPontuacao - menorPontuacao + 2;
      let curva = 5;

      let miolo = arrGrafico
        .map(([c, p]) => {
          return `${c - curva},${p} ${c},${p} ${c + curva},${p}`;
        })
        .join(' ');

      let svg = `<svg
    viewBox="${viewBoxX} ${viewboxY} ${viewBoxComprimento} ${viewBoxAltura}"
    width="${viewBoxComprimento}" height="${viewBoxAltura}"
  >
    <polyline
      points="0,0 ${fim[0]},0"
      style="fill:none;stroke:#FF0000;stroke-width:1"
    />
    <path style="fill:none;stroke:#000000;stroke-width:1"
      d="M 0,0 C ${curva},0
      ${miolo}
      ${fim[0] - curva},${fim[1]} ${fim[0]},${fim[1]}"
    />
  </svg>`;

      let pixBuf = new GdkPixbuf.PixbufLoader.newWithType('svg');
      pixBuf.setSize(600, 200);
      console.log(pixBuf);

      pixBuf.on('area-prepared', (s) => {
        console.log('area-prepared', s);
        let pixbuf = pixBuf.getPixbuf();
        let img = new Gtk.Image({
          pixbuf,
          halign: Gtk.Align.START,
          xalign: 0,
          hexpand: false,
        });

        let frame = new Gtk.Frame({
          'halign': Gtk.Align.START,
          'width-request': 600,
          'height-request': 200,
          'name': 'graficosvg',
        });

        frame.add(img);

        grid.attach(frame, 0, 4, arrGrafico.length + 1, 1);

        this.#scrollPartidas.add(grid);
        this.#scrollPartidas.showAll();
      });

      pixBuf.on('area-updated', (s) => {
        console.log('area-updated', s);
      });

      pixBuf.on('closed', (s) => {
        console.log('closed', s);
      });

      pixBuf.on('size-prepared', (s) => {
        console.log('size-prepared', s);
      });

      let buf = Buffer.from(svg, 'utf8');
      console.log(pixBuf.write(buf, buf.length));
      console.log(pixBuf.close());
    });
  }

  #blocoNome({ nome, partidas }) {
    const { Gtk } = this;
    let bc = new Gtk.FlowBoxChild({ 'can-focus': true });
    let frame = new Gtk.Frame();
    let lblNome = new Gtk.Label({
      label: `${nome}`,
      margin: 5,
    });

    bc.on('activate', () => {
      this.#linhaPartidas(partidas);
      return false;
    });

    frame.add(lblNome);
    bc.add(frame);

    return bc;
  }

  async #linhaNomes() {
    const { limpar } = this;

    await limpar(this.#flowBox);

    this.#flowBox.setMinChildrenPerLine(this.#partidas.length);
    this.#flowBox.setMaxChildrenPerLine(this.#partidas.length);

    for (let p of [...this.#partidas].sort((a, b) => a.nome - b.nome)) {
      let bloco = this.#blocoNome(p);
      this.#flowBox.insert(bloco, -1);
    }
    this.#flowBox.showAll();
  }

  async #atualizarTudo() {
    const { runModule, limpar } = this;

    await limpar(this.#scrollPartidas);

    this.#partidas = await runModule({
      modulePath: '/imports/jogadores/consultas/jogadores-ativos-partidas.js',
      args: [undefined],
    });

    debugger;

    await this.#linhaNomes();

    this.page.showAll();
  }
};
