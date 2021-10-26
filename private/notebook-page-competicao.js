const Base = require("./notebook-page-class");

module.exports = class extends Base {
  #desafiante;
  #desafiado;
  #participantes = [];
  #containerTodos;
  #containerDesafio;
  #containerInfoBar;
  #flowBoxTodos;
  #infoBar;
  #parent;
  #notebook;
  #scroll;

  async #possiveisDesafios(lista) {
    const { runModule } = this;
    return await runModule({
      modulePath: "/imports/jogadores/consultas/o-jogador.js",
      args: [
        {
          nome: this.#desafiante,
          method: "possiveisDesafios",
          args: [lista],
        },
      ],
    });
  }

  async #perdeuPara() {
    const { runModule, atualizarTudo } = this;
    const self = this;
    const res = await runModule({
      modulePath: "/imports/jogadores/consultas/o-jogador.js",
      args: [
        {
          nome: this.#desafiante,
          method: "registrarPartida",
          args: [{ adversario: self.#desafiado, resultado: "d" }],
        },
      ],
    });

    this.#desafiante = null;
    this.#desafiado = null;

    return await this.#atualizarTudo();
  }

  async #empatouCom() {
    const { runModule, atualizarTudo } = this;
    const self = this;
    const res = await runModule({
      modulePath: "/imports/jogadores/consultas/o-jogador.js",
      args: [
        {
          nome: self.#desafiante,
          method: "registrarPartida",
          args: [{ adversario: self.#desafiado, resultado: "e" }],
        },
      ],
    });

    this.#desafiante = null;
    this.#desafiado = null;

    return await this.#atualizarTudo();
  }

  async #ganhouDe() {
    const self = this;
    const { runModule, atualizarTudo } = this;

    const res = await runModule({
      modulePath: "/imports/jogadores/consultas/o-jogador.js",
      args: [
        {
          nome: self.#desafiante,
          method: "registrarPartida",
          args: [{ adversario: self.#desafiado, resultado: "v" }],
        },
      ],
    });

    this.#desafiante = null;
    this.#desafiado = null;

    return await this.#atualizarTudo();
  }

  async #mostrarDesafiantes(nome) {
    const {
      limpar,
      FlowBox,
      Gtk,
      possiveisDesafios,
      mostrarGridDesafio,
    } = this;
    this.#desafiante = nome;
    this.#desafiado = null;
    limpar(this.#containerDesafio);
    this.#infoBar.setRevealed(false);
    this.#infoBar.getContentArea().getCenterWidget().setLabel("");

    let lista = this.#participantes
      .filter((p) => p.nome !== nome)
      .map((p) => p.nome);
    let possiveis = await this.#possiveisDesafios(lista);

    if (!possiveis.length) {
      this.#infoBar
        .getContentArea()
        .getCenterWidget()
        .setLabel(`${nome} está isolado`);
      this.#infoBar.setRevealed(true);
      return;
    }

    let dialog = new Gtk.Dialog({ title: nome });

    let flowBox = new FlowBox();
    let contentArea = dialog.getContentArea();

    flowBox.minChildrenPerLine = 2;

    flowBox.on("child-activated", (child) => {
      dialog.response(child.getIndex());
    });

    contentArea.add(flowBox);

    for (let [i, possivel] of possiveis.entries()) {
      flowBox.insert(new Gtk.Label({ label: possivel }), -1);
    }

    dialog.on("response", (response) => {
      if (response >= 0) {
        this.#desafiado = possiveis[response];
        this.#mostrarGridDesafio();
      }
      dialog.destroy();
    });

    dialog.on("close", () => {
      dialog.destroy();
    });

    dialog.showAll();
  }

  #mostrarGridDesafio() {
    const { limpar, Grid, Gtk, ganhouDe, empatouCom, perdeuPara } = this;

    if (!this.#desafiante || !this.#desafiado) return null;

    limpar(this.#containerDesafio);

    const gridDesafio = new Grid();
    gridDesafio.setHexpand(true);
    gridDesafio.setColumnHomogeneous(true);

    const gridDesafioBtns = new Grid();
    gridDesafioBtns.halign = Gtk.Align.CENTER;

    const btnVitoria = new Gtk.Button({
      label: `👍 ganhou de:`,
    });
    btnVitoria.on("clicked", () => {
      this.#ganhouDe();
    });

    const btnEmpate = new Gtk.Button({
      label: `👐 empatou com:`,
    });
    btnEmpate.on("clicked", () => {
      this.#empatouCom();
    });

    const btnPerdeuPara = new Gtk.Button({
      label: `👎 perdeu para:`,
    });
    btnPerdeuPara.on("clicked", () => {
      this.#perdeuPara();
    });

    gridDesafioBtns.attach(btnVitoria, 0, 0, 1, 1);
    gridDesafioBtns.attach(btnEmpate, 0, 1, 1, 1);
    gridDesafioBtns.attach(btnPerdeuPara, 0, 2, 1, 1);
    gridDesafio.attach(gridDesafioBtns, 1, 0, 1, 1);
    gridDesafio.attach(
      new Gtk.Label({
        label: this.#desafiante,
        name: "page-participante-lbl-desafiante",
      }),
      0,
      0,
      1,
      1
    );
    gridDesafio.attach(
      new Gtk.Label({
        label: this.#desafiado,
        name: "page-participante-lbl-desafiado",
      }),
      2,
      0,
      1,
      1
    );
    this.#containerDesafio.attach(gridDesafio, 0, 1, 1, 1);
    this.#containerDesafio.showAll();
  }

  #criarBotaoAcao({ nome, saldo }) {
    const { Gtk } = this;
    let btn;
    let [, pode] = saldo;
    if (pode) {
      btn = new Gtk.Button({ label: ` 💪 ` });
      btn.on("clicked", async () => {
        await this.#mostrarDesafiantes(nome);
      });
    } else {
      btn = new Gtk.Button({ label: ` 💳 ` });
      btn.on("clicked", async () => {
        this.#desafiante = nome;
        this.#notebook?.irPara("participante");
      });
    }
    return btn;
  }

  constructor() {
    super(arguments[0]);

    this.on("entrar", ({ origem = null, notebook = null }) => {
      this.#notebook = notebook;
      if (origem) this.#atualizarTudo();
    });
  }

  async init() {
    await super.init();

    const { Gtk, FlowBox, Grid } = this;

    this.tab = new Gtk.Label({ label: "🏁" });
    this.page = new Grid();
    this.page.self = this;

    this.#containerInfoBar = new Grid();
    this.#containerTodos = new Grid();
    this.#containerDesafio = new Grid();
    this.#infoBar = new Gtk.InfoBar();
    this.#flowBoxTodos = new FlowBox();
    this.#scroll = new Gtk.ScrolledWindow();

    this.#infoBar
      .getContentArea()
      .setCenterWidget(new Gtk.Label({ label: "" }));

    this.#infoBar.setShowCloseButton(true);
    this.#infoBar.setRevealed(false);
    this.#infoBar.on("response", (response) => {
      this.#infoBar.setRevealed(false);
      this.#infoBar.getContentArea().getCenterWidget().setLabel("");
    });

    this.#flowBoxTodos.setSelectionMode(Gtk.SelectionMode.NONE);
    this.#flowBoxTodos.maxChildrenPerLine = this.#participantes.length;
    this.#flowBoxTodos.setHalign(Gtk.Align.FILL);
    this.#flowBoxTodos.setValign(Gtk.Align.START);

    this.#scroll.setVexpand(true);
    this.#scroll.setHexpand(true);

    this.#containerInfoBar.attach(this.#infoBar, 0, 0, 1, 1);
    this.#containerTodos.attach(this.#scroll, 0, 0, 1, 1);
    this.#scroll.add(this.#flowBoxTodos);

    this.page.attach(this.#containerInfoBar, 0, 0, 1, 1);
    this.page.attach(this.#containerTodos, 0, 1, 1, 1);
    this.page.attach(this.#containerDesafio, 0, 2, 1, 1);

    this.page.showAll();

    return this;
  }

  async #atualizarTudo() {
    const { limpar } = this;
    limpar(this.#containerDesafio);
    await this.#atualizarGridTodos();

    this.page.showAll();
  }

  async #atualizarGridTodos() {
    const { runModule, Gtk, Grid, limpar } = this;
    limpar(this.#flowBoxTodos);

    this.#participantes = await runModule({
      modulePath:
        "/imports/jogadores/consultas/jogadores-ativos-todos-campos.js",
      args: [undefined],
    });

    this.#flowBoxTodos.maxChildrenPerLine = this.#participantes.length;
    this.#participantes.sort((a, b) => b.saldo[1] - a.saldo[1]);
    this.#participantes.sort((a, b) => b.pontos - a.pontos);

    for (let { nome, pontos, saldo } of this.#participantes) {
      let bc = new Gtk.FlowBoxChild({ "can-focus": false });
      let frame = new Gtk.Frame({ halign: Gtk.Align.CENTER });
      let framegrid = new Grid();
      let lblResumo = new Gtk.Label({ label: `${pontos}  |  ${saldo[0]}` });
      let lblNome = new Gtk.Label({ label: nome });
      let acao = this.#criarBotaoAcao({ nome, saldo });

      bc.add(frame);
      frame.add(framegrid);
      framegrid.attach(lblNome, 0, 0, 1, 1);
      framegrid.attach(lblResumo, 0, 1, 1, 1);
      framegrid.attach(acao, 0, 2, 1, 1);

      this.#flowBoxTodos.insert(bc, -1);
    }
    return this;
  }

  desafiante() {
    return this.#desafiante;
  }
};
