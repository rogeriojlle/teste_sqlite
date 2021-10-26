import { join } from 'path';
import { Sequelize, Model, DataTypes } from 'sequelize';
import { Meteor } from 'meteor/meteor';
const { storage = '/dev/shm/db.sqlite' } =
  Meteor.settings?.private?.packages?.sqlite || {};

//const sequelize = new Sequelize('sqlite://:memory:');
const sequelize = new Sequelize({ dialect: 'sqlite', storage });

export { sequelize, Model, DataTypes, Sequelize };
