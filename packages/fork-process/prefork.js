const { join } = require('path');
const Prepare = require('./prepare.js');

const Prefork = class extends Prepare {
  constructor(process) {
    super(process);
    setTimeout(() => {
      this.entryPointExports = require(process.argv[2]);
    });
  }
};

module.exports = new Prefork(process);
