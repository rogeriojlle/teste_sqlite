import { Meteor } from 'meteor/meteor';
import 'meteor/fakewebapp';
import restaurar from '/imports/jogadores/restaurar.js';
import desktop from 'meteor/desktop-gtk';
//só precisam existir, eles serão consumidos pelo gtk
import('/imports/jogadores/consultas/index.js');

desktop._process.on('exit', () => {
  if (Meteor.isProduction) process.exit();
});

Meteor.startup(async () => {
  await restaurar();

  desktop.runModule({
    modulePath: Assets.absoluteFilePath('main-window.js'),
  });
});
