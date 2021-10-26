import {
  //Model,
  DataTypes,
  sequelize,
  //Sequelize
} from 'meteor/sqlite';

//class MJogador extends Model {}

export default sequelize.define(
  'MJogador',
  {
    nome: {
      type: DataTypes.STRING,
      unique: true,
      //primaryKey: true
    },
    aportes: {
      type: DataTypes.JSON,
      defaultValue: [],
      allowNull: false,
    },
    partidas: {
      type: DataTypes.JSON,
      defaultValue: [],
      allowNull: false,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  { sequelize, tableName: 'jogadores' }
);
