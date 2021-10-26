const { fork } = require('child_process');
const Prepare = require('./prepare.js');

export const Fork = class extends Prepare {
  constructor({ entryPoint, forkOpts = {} }) {
    forkOpts = Object.assign(
      {
        silent: false,
        detached: false,
        stdio: 'ignore',
      },
      forkOpts
    );
    const _process = fork(
      Assets.absoluteFilePath('prefork.js'),
      [entryPoint],
      forkOpts
    );
    super(_process);
    this._process = _process;
  }
};

export meteor from './meteor.js';
