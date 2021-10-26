import { Participante } from './placar/index.js';
import sync from '/imports/jogadores/models/index.js';
import { participantes } from './placar/index.js';
import NovoJogador from './novojogador.js';

const popularInstancia = async function (obj) {
  obj.ativo ? this.ativar() : this.desativar();

  for (let valor of obj.aportes) {
    this.recarregar(valor);
  }

  for await (let [adversario, resultado, idPartida] of obj.partidas) {
    this.registrarPartida({ adversario, resultado, idPartida });
  }
};

class Jogador extends Participante {
  #pronto;

  constructor({ nome = null }) {
    super({ nome });
    participantes.set(this.nome(), this);
    this.#pronto = false;
  }

  pronto() {
    return this.#pronto;
  }

  async init({ partidas = [], aportes = [], ativo = false }) {
    if (this.#pronto) return this;

    const self = this;
    const { MJogador } = await sync();

    const [modelo, novo] = await MJogador.findOrCreate({
      where: { nome: self.nome() },
      defaults: {
        nome: self.nome(),
        ativo,
        aportes,
        partidas: partidas.map(([adversario, resultado, idPartida]) => [
          adversario.nome(),
          resultado,
          idPartida,
        ]),
      },
    });

    if (!novo) {
      await popularInstancia.call(this, modelo);
    } else {
      await popularInstancia.call(this, { ativo, aportes, partidas });
    }

    this.on('recarregar', (valor) => {
      const self = this;
      let aportes = self.aportes();
      console.log('recarregar', aportes);
      MJogador.update(
        { aportes },
        {
          where: { nome: self.nome() },
        }
      );
    });

    this.on('registrarPartida', () => {
      const self = this;
      MJogador.update(
        {
          partidas: self
            .partidas()
            .map(([adversario, resultado, idPartida], i) => [
              adversario.nome(),
              resultado,
              idPartida,
            ]),
        },
        {
          where: { nome: self.nome() },
        }
      );
    });

    this.on('condicao', () => {
      const self = this;
      MJogador.update(
        { ativo: self.ativo() },
        {
          where: { nome: self.nome() },
        }
      );
    });
    this.#pronto = true;
    return this;
  }

  registrarPartida({ adversario = null, resultado = null, idPartida = null }) {
    adversario =
      adversario instanceof this.constructor
        ? adversario
        : participantes.get(adversario);
    super.registrarPartida.call(this, { adversario, resultado, idPartida });
  }
}

export default Jogador;
