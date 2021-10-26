const Base = require('./notebook-page-class');

module.exports = class extends Base {
  #notebook;
  #nome;
  #opcaoAcao;
  #aporte = 0;
  #adjustAporte;
  #listBox;
  #btnConfirmar;
  #btnCancelar;
  #radioAcaoTrocarAtivo;
  #radioAcaoNovo;
  #radioAcaoRecarregar;
  #entryNome;
  #todos = [];
  #spinAporte;
  #labelNome;
  #labelAporte;
  #gridEntradas;
  #gridBotoes;
  #gridListBox;
  #listBoxScroll;
  #gridAcoes;
  #infoBar;
  #gridlayoutEsquerdo;
  #gridlayoutDireito;

  #acao() {
    return [
      this.#radioAcaoRecarregar,
      this.#radioAcaoNovo,
      this.#radioAcaoTrocarAtivo,
    ].find((r) => r.getActive()).acao;
  }

  constructor() {
    super(arguments[0]);

    this.on('vindoDe', ({ origem = null }) => {
      this.#nome = origem.desafiante();
      this.#radioAcaoRecarregar.setActive(true);
    });

    this.on('entrar', ({ notebook = null }) => {
      this.#notebook = notebook;
      this.#atualizarTudo();
    });

    this.on('sair', () => {
      this.#limparCampos();
    });
  }

  async init() {
    await super.init();
    const { Gtk, gi, runModule, Grid, limpar } = this;

    this.tab = new Gtk.Image({
      'icon-name': 'x-office-address-book',
    });

    this.page = new Grid();
    this.page.self = this;

    this.#adjustAporte = new Gtk.Adjustment({
      value: this.#aporte,
      lower: 0,
      upper: 100,
      step_increment: 5,
    });

    this.#listBoxScroll = new Gtk.ScrolledWindow();
    this.#listBoxScroll.setVexpand(true);
    this.#listBoxScroll.setHexpand(true);

    this.#listBox = new Gtk.ListBox();
    this.#listBox.on('row-activated', (row) => {
      if (row && row.nome) {
        this.#radioAcaoRecarregar.setActive(true);
        this.#spinAporte.setValue(0);
        this.#entryNome.setText(row.nome);
        this.#listBox.unselectAll();
        this.#entryNome.grabFocus();
      }
    });

    this.#btnConfirmar = new Gtk.Button({ label: 'Confirmar' });
    this.#btnConfirmar.on('clicked', async () => {
      await this.#confirmar();
    });

    this.#btnCancelar = new Gtk.Button({ label: 'Cancelar' });
    this.#btnCancelar.on('clicked', () => {
      this.#limparCampos();
    });

    this.#radioAcaoRecarregar = new Gtk.RadioButton(null);
    this.#radioAcaoRecarregar.setLabel('💳 recarregar créditos');
    this.#radioAcaoRecarregar.acao = 'recarregar';

    this.#radioAcaoNovo = new Gtk.RadioButton(null);
    this.#radioAcaoNovo.joinGroup(this.#radioAcaoRecarregar);
    this.#radioAcaoNovo.setLabel('➕ criar novo');
    this.#radioAcaoNovo.acao = 'novo';

    this.#radioAcaoTrocarAtivo = new Gtk.RadioButton(null);
    this.#radioAcaoTrocarAtivo.joinGroup(this.#radioAcaoRecarregar);
    this.#radioAcaoTrocarAtivo.setLabel('🔀 ativar ou desativar');
    this.#radioAcaoTrocarAtivo.acao = 'trocarAtivo';

    this.#entryNome = new Gtk.SearchEntry({ text: this.#nome || '' });
    this.#entryNome.on('search-changed', (async) => {
      this.#nome = this.#entryNome.getText();
      let filtrado = this.#todos.filter(
        ({ nome }) => nome.search(this.#nome) > -1
      );
      this.#atualizarListBox(filtrado);
    });

    this.#spinAporte = new Gtk.SpinButton({
      adjustment: this.#adjustAporte,
      wrap: true,
      value: this.#aporte,
    });
    this.#spinAporte.on('value-changed', () => {
      this.#aporte = this.#spinAporte.getValue();
    });

    this.#labelNome = new Gtk.Label({ label: 'Nome: ' });
    this.#labelAporte = new Gtk.Label({ label: 'Aporte: ' });

    this.#gridEntradas = new Grid();
    this.#gridBotoes = new Grid();
    this.#gridAcoes = new Grid();

    this.#gridListBox = new Grid();
    this.#gridListBox.setHexpand(true);
    this.#infoBar = new Gtk.InfoBar();
    //importante para a chamada setLabel adiante funcionar corretamente
    this.#infoBar
      .getContentArea()
      .setCenterWidget(new Gtk.Label({ label: '' }));
    this.#infoBar.setShowCloseButton(true);
    this.#infoBar.setRevealed(false);
    this.#infoBar.on('response', (response) => {
      this.#infoBar.setRevealed(false);
      this.#infoBar.getContentArea().getCenterWidget().setLabel('');
    });

    this.#gridEntradas.attach(this.#labelNome, 0, 0, 1, 1);
    this.#gridEntradas.attach(this.#entryNome, 1, 0, 1, 1);
    this.#gridEntradas.attach(this.#labelAporte, 0, 1, 1, 1);
    this.#gridEntradas.attach(this.#spinAporte, 1, 1, 1, 1);

    this.#gridBotoes.attach(this.#btnConfirmar, 0, 0, 1, 1);
    this.#gridBotoes.attach(this.#btnCancelar, 1, 0, 1, 1);

    this.#gridAcoes.attach(this.#radioAcaoRecarregar, 0, 0, 1, 1);
    this.#gridAcoes.attach(this.#radioAcaoNovo, 0, 1, 1, 1);
    this.#gridAcoes.attach(this.#radioAcaoTrocarAtivo, 0, 2, 1, 1);

    this.#listBoxScroll.add(this.#listBox);
    this.#gridListBox.attach(this.#listBoxScroll, 0, 0, 1, 1);

    this.#gridlayoutEsquerdo = new Grid();
    this.#gridlayoutDireito = new Grid();

    this.#gridlayoutEsquerdo.attach(this.#gridEntradas, 0, 0, 1, 1);
    this.#gridlayoutEsquerdo.attach(this.#gridAcoes, 1, 0, 1, 3);
    this.#gridlayoutEsquerdo.attach(this.#gridBotoes, 0, 1, 1, 1);

    this.#gridlayoutDireito.attach(this.#gridListBox, 0, 0, 1, 1);

    this.page.attach(this.#infoBar, 0, 0, 2, 1);

    this.page.attach(this.#gridlayoutEsquerdo, 0, 1, 1, 1);
    this.page.attach(this.#gridlayoutDireito, 1, 1, 1, 1);

    this.page.showAll();

    return this;
  }

  mostrarInfoBar(mensagem) {
    console.log({ mensagem });
    const { Gtk } = this;
    this.#infoBar.setRevealed(false);

    this.#infoBar.getContentArea().getCenterWidget().setLabel(mensagem);
    this.#infoBar.setRevealed(true);
  }

  #atualizarListBox(lista = this.#todos) {
    const { limpar } = this;
    limpar(this.#listBox);
    for (let j of lista) {
      let nome = j.nome;
      let [saldo, podeContinuar] = j.saldo;
      let ativo = j.ativo;
      this.#listBox.insert(
        this.#novaListBoxRow({ nome, saldo, podeContinuar, ativo }),
        -1
      );
    }
    this.#listBox.showAll();
  }

  #limparCampos() {
    this.#entryNome.setText('');
    this.#spinAporte.setValue(0);
  }

  #novaListBoxRow({
    nome = null,
    saldo = null,
    podeContinuar = null,
    ativo = false,
  }) {
    const { Gtk, Grid } = this;
    let row = new Gtk.ListBoxRow();
    let grid = new Grid();
    row.nome = nome;
    podeContinuar = podeContinuar ? ` 💪 ` : ` 💳 `;
    grid.attach(
      new Gtk.Label({
        label: nome,
        hexpand: true,
        halign: Gtk.Align.START,
      }),
      0,
      0,
      1,
      1
    );
    grid.attach(
      new Gtk.Label({
        label: ativo ? ' ✅ ' : ' 🔴 ',
      }),
      1,
      0,
      1,
      1
    );
    grid.attach(
      new Gtk.Label({
        label: saldo.toString(),
      }),
      2,
      0,
      1,
      1
    );
    grid.attach(
      new Gtk.Label({
        label: `${podeContinuar}`,
      }),
      3,
      0,
      1,
      1
    );
    row.add(grid);
    return row;
  }

  async #confirmar() {
    const { runModule } = this;

    this.#opcaoAcao = this.#acao();

    if (!this.#nome) {
      this.mostrarInfoBar(`um nome é necessario!`);
      return;
    }

    let jogadorExiste = await runModule({
      modulePath: '/imports/jogadores/consultas/o-jogador.js',
      args: [{ nome: this.#nome, method: 'nome' }],
    });

    switch (this.#opcaoAcao) {
      case 'recarregar':
        if (jogadorExiste && this.#aporte) {
          console.log(`${this.#nome} executar rotina de aporte`);
          let jogador = await runModule({
            modulePath: '/imports/jogadores/consultas/o-jogador.js',
            args: [
              { nome: this.#nome, method: 'recarregar', args: [this.#aporte] },
            ],
          });
          this.#notebook.irPara('competicao');
        } else {
          this.mostrarInfoBar(
            'para recarregar, um nome existente e um valor válido são necessários'
          );
        }
        break;
      case 'novo':
        if (!jogadorExiste && this.#aporte) {
          let novoJogador = await runModule({
            modulePath: '/imports/jogadores/novojogador.js',
            args: [{ aportes: [this.#aporte], nome: this.#nome, ativo: false }],
          });
          console.log(novoJogador);
          this.#limparCampos();
          this.#atualizarTudo();
        } else {
          this.mostrarInfoBar(
            'conferir se jogador ja existe e se valor aporteInicial é válido'
          );
        }
        break;
      case 'trocarAtivo':
        // rotina de trocar status ativo
        if (jogadorExiste) {
          let trocar = await runModule({
            modulePath: '/imports/jogadores/consultas/trocar-ativo.js',
            args: [{ nome: jogadorExiste }],
          });
          this.#limparCampos();
          this.#atualizarTudo();
        } else {
          this.mostrarInfoBar('selecione um jogador existente');
        }
        break;
      default:
        this.mostrarInfoBar('não sei o que fazer');
    }
  }

  async #atualizarTudo() {
    const { Gtk, Grid, runModule } = this;
    this.#todos = await runModule({
      modulePath: '/imports/jogadores/consultas/jogadores-todos-campos.js',
      args: [undefined],
    });

    if (this.#nome) {
      this.#entryNome.setText(this.#nome);
    } else {
      this.#atualizarListBox(this.#todos);
    }

    this.page.showAll();
  }
};
