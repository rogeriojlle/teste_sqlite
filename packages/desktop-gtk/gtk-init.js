const gi = require(require('path').join(
  process.cwd(),
  '/npm/node_modules/meteor/desktop-gtk/node_modules/node-gtk'
));

const Gtk = gi.require('Gtk', '3.0');
//const Gtk = gi.require('Gtk');
const Gio = gi.require('Gio');
//const Gdk = gi.require('Gdk', '3.0');
const Gdk = gi.require('Gdk');
const GdkPixbuf = gi.require('GdkPixbuf');
//const GLib = gi.require('GLib')

gi.startLoop();

Gtk.init([]);
Gdk.init([]);

module.exports = { gi, Gtk, Gio, GdkPixbuf, Gdk };
