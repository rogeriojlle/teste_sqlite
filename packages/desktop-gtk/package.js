Package.describe({
  name: 'desktop-gtk',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md',
});

Npm.depends({
  'node-gtk': '0.10.0',
});

Package.onUse(function (api) {
  api.use('ecmascript');
  api.use(['fork-process'], 'server');
  api.addAssets(['gtk-init.js', 'widgets.js', 'wait-for-gtk.js'], 'server');
  api.mainModule('main.js', 'server', { lazy: true });
});
