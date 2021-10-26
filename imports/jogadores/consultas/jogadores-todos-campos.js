import { participantes } from '/imports/jogadores/placar/index.js';

export default () =>
  [...participantes].map(([nome, j]) => ({
    nome,
    pontos: j.pontos(),
    saldo: j.saldo(),
    ativo: j.ativo(),
  }));
