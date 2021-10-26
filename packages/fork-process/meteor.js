import { Meteor } from 'meteor/meteor';

export default ({ metodo = null, args = [] }) => {
  if (!metodo) return null;
  if (typeof Meteor[metodo] === 'function') {
    return Meteor[metodo].call(this, ...args);
  }
  return Meteor[metodo];
};
