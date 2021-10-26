const main = () => {
  process.stdin.resume();
  return 'DAEMON';
};

if (!global.main) global.main = main;

module.exports = { main };
