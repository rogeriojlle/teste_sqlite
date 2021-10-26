import { participantes } from '/imports/jogadores/placar/index.js';

export default async ({ nome = null }) => {
  let jogador = participantes.get(nome);
  if (!jogador) return null;
  jogador.ativo.call(jogador)
    ? jogador.desativar.call(jogador)
    : jogador.ativar.call(jogador);
  return jogador;
};
