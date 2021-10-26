import { participantes } from "/imports/jogadores/placar/index.js";
export default () =>
  [...participantes]
    .filter(([, j]) => j.ativo())
    .map(([nome, j]) => ({
      nome,
      pontos: j.pontos(),
      saldo: j.saldo(),
    }));
