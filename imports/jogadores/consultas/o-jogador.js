import { participantes } from "/imports/jogadores/placar/index.js";

export default async ({ nome = null, method = null, args = [] }) => {
  let jogador = participantes.get(nome);
  if (!jogador) return null;
  if (method) return await jogador[method].call(jogador, ...args);
  return jogador;
};
