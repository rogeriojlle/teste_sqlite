const EventEmitter = require('events');
const { randomBytes } = require('crypto');

const pontosPorEmpate = -0.5;
const pontosPorVitoria = 1;
const pontosporDerrota = -1;

const creditosPorEmpate = -1;
const creditosPorVitoria = 13;
const creditosPorDerrota = -15;

const margem = 1.2;

const Participante = class extends EventEmitter {
  #nome;
  #ativo;
  #aportes = [];
  #partidas = [];
  constructor({ nome = null }) {
    super();
    this.nome(nome);
    participantes.set(nome, this);
  }

  nome(n) {
    if (n) this.#nome = n.toString();
    return this.#nome;
  }

  ativar() {
    this.#ativo = true;
    this.emit('condicao');
    return this.#ativo;
  }

  desativar() {
    this.#ativo = false;
    this.emit('condicao');
    return this.#ativo;
  }

  ativo() {
    return this.#ativo;
  }
  aportes() {
    return this.#aportes;
  }

  recarregar(valor) {
    this.#aportes.push(valor);
    this.emit('recarregar');
    return this.#aportes.reduce((a, d) => a + d);
  }

  registrarPartida({ adversario = null, resultado = null, idPartida = null }) {
    const self = this;
    let arr = [adversario, resultado];
    if (!idPartida) {
      idPartida = randomBytes(5).hexSlice();
      let obj = { adversario: self };
      switch (resultado) {
        case 'v':
          obj.resultado = 'd';
          break;
        case 'd':
          obj.resultado = 'v';
          break;
        default:
          obj.resultado = 'e';
      }
      obj.idPartida = idPartida;
      adversario.registrarPartida.call(adversario, obj);
    }
    arr.push(idPartida);
    this.#partidas.push(arr);
    this.emit('registrarPartida');
    return this.#partidas;
  }

  partidas() {
    return this.#partidas;
  }

  pontos() {
    const tabela = {
      d: pontosporDerrota,
      v: pontosPorVitoria,
      e: pontosPorEmpate,
    };
    let p = Math.ceil(
      this.#partidas.reduce((a, [, resultado]) => a + tabela[resultado], 0)
    );
    if (p < 1) return 0;
    return p;
  }

  saldo() {
    const tabela = {
      d: creditosPorDerrota,
      v: creditosPorVitoria,
      e: creditosPorEmpate,
    };
    let s = this.#partidas.reduce(
      (a, [, resultado]) => a + tabela[resultado],
      this.#aportes.reduce((a, d) => a + d)
    );
    return [s, s >= Math.abs(creditosPorDerrota) ? true : false];
  }

  possiveisDesafios(lista) {
    const dentroMargem = (adversario) => {
      let [menor, maior] = [this.pontos(), adversario.pontos()].sort(
        (a, b) => a - b
      );
      if (menor === maior) return true;
      if (menor * margem >= maior) return true;
      return false;
    };
    return lista.filter((adversario) =>
      dentroMargem(participantes.get(adversario))
    );
  }
};

const participantes = new Map(['a', 'b', 'c', '🧿'].map((p) => [p, null]));

module.exports = {
  Participante,
  participantes,
  pontosPorEmpate,
  pontosPorVitoria,
  pontosporDerrota,
};
