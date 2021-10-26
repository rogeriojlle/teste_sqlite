import Jogador from './jogador.js';
import { participantes } from '/imports/jogadores/placar/index.js';

const novoJogador = async ({
  nome = null,
  ativo = false,
  aportes = [],
  partidas = [],
}) => {
  let jogador = participantes.get(nome) || new Jogador({ nome });
  partidas = partidas.map(([adversario, resultado, idPartida]) => [
    participantes.get(adversario) || new Jogador({ nome: adversario }),
    resultado,
    idPartida,
  ]);
  await jogador.init({ ativo, aportes, partidas });
  return jogador;
};

export default novoJogador;
