const { join } = require('path');

//raspberrypi nao tem crypto.randomUUID
const { randomBytes } = require('crypto');
const randomUUID = () => randomBytes(16).toString('hex');

//se require é do filho, e não o do processo pai
let recast;
if (module.constructor.builtinModules) {
  recast = require(join(
    process.cwd(),
    './npm/node_modules/meteor/fork-process/node_modules/recast'
  ));
} else {
  recast = require('recast');
}

module.exports = class {
  #queue = new Map();

  constructor(processo) {
    this.processo = processo;

    const enviarMensagem = function (
      { fn = null, args = [], uuid = null },
      socket
    ) {
      this.processo.send({ fn, args, uuid }, socket);
    };

    const direcionarMensagem = async ({ fn, args, uuid, socket }) => {
      let response, modulePath, text;
      switch (fn) {
        case 'response':
          await this.#queue.get(uuid)(args[0]);
          this.#queue.delete(uuid);
          break;
        case 'require':
          modulePath = args.shift();
          let _require = require(modulePath);
          let _sym = Object.getOwnPropertySymbols(_require);
          //se eu estou no Meteor
          if (
            _sym.length &&
            _sym.find((s) => s.toString() === 'Symbol(__esModule)')
          ) {
            _require = _require.default;
          }
          //ou no processo filho
          if (args.length && typeof _require === 'function') {
            response = await _require(...args);
          } else {
            response = await _require;
          }
          enviarMensagem.call(this, {
            uuid,
            socket,
            fn: 'response',
            args: [response],
          });
          break;
        case 'eval':
          text = recast.prettyPrint(args[0], { tabWidth: 2 }).code;
          //console.log(text);
          //em varias situacoes eval retorna uma uma Promise
          response = await eval(text);
          enviarMensagem.call(this, {
            uuid,
            socket,
            fn: 'response',
            args: [response],
          });
          break;
        default:
          throw 'falhou em handleMessage';
      }
    };

    const desmontarMensagem = (msg, socket) => {
      const { fn = null, args = [], uuid = null } = msg;
      direcionarMensagem({ fn, args, uuid, socket });
    };

    this.runModule = ({ modulePath = null, args = [], socket = null }) => {
      return new Promise((resolve, reject) => {
        let uuid = randomUUID();
        const obj = { fn: 'require', args: [modulePath, ...args], uuid };
        this.#queue.set(uuid, (response) => resolve(response));
        enviarMensagem.call(this, obj, socket);
      });
    };

    this.runEval = ({ text = '', socket = null }) => {
      return new Promise((resolve, reject) => {
        let uuid = randomUUID();
        const obj = { fn: 'eval', args: [recast.parse(text)], uuid };
        this.#queue.set(uuid, (response) => resolve(response));
        enviarMensagem.call(this, obj);
      });
    };

    processo.on('message', desmontarMensagem);
  }
};
