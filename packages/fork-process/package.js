Package.describe({
  name: 'fork-process',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md',
});

Npm.depends({ recast: '0.20.5' });

Package.onUse(function (api) {
  api.use(['ecmascript'], 'server');
  api.addAssets(['prefork.js', 'prepare.js'], 'server');
  api.addFiles(['meteor.js'], 'server', { bare: false });
  api.mainModule('main.js', 'server');
});
