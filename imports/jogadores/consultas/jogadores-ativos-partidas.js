import {
  participantes,
  pontosPorEmpate,
  pontosPorVitoria,
  pontosporDerrota,
} from '/imports/jogadores/placar/index.js';

// calcular os pontos a cada partida, pois o metodo pontos() retorna de todas
const passos = function* (arr) {
  const obj = {
    v: pontosPorVitoria,
    d: pontosporDerrota,
    e: pontosPorEmpate,
  };

  let pontosReal = 0;

  for (let [, resultado] of arr) {
    pontosReal += obj[resultado];
    let mostrar = Math.ceil(pontosReal);
    mostrar < 1 ? yield [0, pontosReal] : yield [mostrar, pontosReal];
  }
};

export default () =>
  [...participantes]
    .filter(([nome, j]) => j.ativo() && j.partidas().length)
    .map(([nome, j]) => {
      let retorno = { nome };

      const passo = passos(j.partidas());

      retorno.partidas = j.partidas().map((p) => {
        //retornar a string com o nome do adversario, evitando o loop infinito
        return [p[0].nome(), p[1], p[2], passo.next().value];
      });

      return retorno;
    });
