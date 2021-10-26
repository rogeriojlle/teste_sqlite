import { sequelize } from 'meteor/sqlite';
import './jogador.js';

let pronto = false;

export default async () => {
  if (pronto) return sequelize.models;
  await sequelize.sync({
    //force: true,
    alter: true,
    logging: false,
  });
  pronto = true;
  return sequelize.models;
};
