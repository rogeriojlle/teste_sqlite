const { join } = require('path');
const basepath = (end) => join(__dirname, '../packages/desktop-gtk', end);

(async () => {
  const Inicio = require('./notebook-page-inicio.js');
  const Competicao = require('./notebook-page-competicao.js');
  const Participante = require('./notebook-page-participante.js');
  const Historico = require('./notebook-page-historico.js');
  const { MainWindow, Notebook, Settings, Css } = await require(basepath(
    'widgets.js'
  ))();

  const mainWindow = new MainWindow({
    'icon-name': 'applications-internet',
  });

  const settings = Settings.getDefault();
  const css = Css(`${__dirname}/custom.css`, mainWindow);

  settings.gtkTouchscreenMode = true;
  settings.gtkApplicationPreferDarkTheme = true;
  //settings.gtkThemeName = 'win32';

  const notebookPrincipal = new Notebook();

  const notebookInicio = await new Inicio({ nome: 'inicio' }).init();
  const notebookCompeticao = await new Competicao({
    nome: 'competicao',
  }).init();
  const notebookParticipante = await new Participante({
    nome: 'participante',
  }).init();
  const notebookHistorico = await new Historico({
    nome: 'historico',
  }).init();

  notebookPrincipal.appendPage(notebookInicio.page, notebookInicio.tab);
  notebookPrincipal.appendPage(notebookCompeticao.page, notebookCompeticao.tab);
  notebookPrincipal.appendPage(
    notebookParticipante.page,
    notebookParticipante.tab
  );
  notebookPrincipal.appendPage(notebookHistorico.page, notebookHistorico.tab);

  mainWindow.add(notebookPrincipal);
  mainWindow.showAll();
})();
