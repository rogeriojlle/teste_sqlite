import { participantes } from './placar/index.js';
import Jogador from './jogador.js';
import novoJogador from './novojogador.js';
import sync from '/imports/jogadores/models/index.js';
import { types } from 'util';

const { isPromise } = types;

export default async () => {
  const { MJogador } = await sync();

  const listaCompleta = new Map();

  [...participantes].map(([nome]) =>
    listaCompleta.set(nome, {
      nome,
      ativo: true,
      aportes: [20],
      partidas: [],
    })
  );

  let JogadoresDB = await MJogador.findAll();
  JogadoresDB.map(({ nome, ativo, aportes, partidas }) =>
    listaCompleta.set(nome, { nome, ativo, aportes, partidas })
  );

  for await (let [, J] of listaCompleta) {
    await novoJogador(J);
  }
};
