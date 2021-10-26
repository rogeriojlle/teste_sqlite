let _resolved = {};

module.exports = () =>
  new Promise((resolve, reject) => {
    if (_resolved.Gtk) {
      resolve(_resolved);
    } else {
      let intr = setInterval(() => {
        const { runModule, runEval, entryPointExports } = require.main.exports;
        if (entryPointExports.Gtk) {
          _resolved = { ...entryPointExports, runModule, runEval };
          clearInterval(intr);
          resolve(_resolved);
        }
      });
    }
  });
