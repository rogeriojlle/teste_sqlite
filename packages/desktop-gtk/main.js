import { Meteor } from 'meteor/meteor';
import { Fork } from 'meteor/fork-process';

const env = {
  application_id:
    Meteor['settings']['private']['packages']['desktop-gtk']['application_id'],
  ...process.env,
};
const execArgv = [];

if (Meteor.isDevelopment) {
  //env['GTK_DEBUG'] = 'interactive';
  execArgv.push('--inspect=9222');
}

export default new Fork({
  entryPoint: Assets.absoluteFilePath('gtk-init.js'),
  forkOpts: { env, execArgv },
});
