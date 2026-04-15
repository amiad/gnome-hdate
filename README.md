# gnome-hdate
Gnome-shell extension for show Hebrew date in the panel.

![Hebrew date in gnome-shell](https://raw.githubusercontent.com/amiad/gnome-hdate/master/screenshot.png)

## Dependencies
* **vala**
* **[libhdate](http://libhdate.sourceforge.net/)>=1.6** - Existing in repositories of most distributions.
* **[libhdate-glib](http://libhdate-glib.googlecode.com/)>=0.5** * Arch: [AUR](https://aur.archlinux.org/packages/libhdate-glib/)
    * Debian/Ubuntu: [64 bit](http://code.google.com/p/libhdate-glib/downloads/detail?name=libhdate-glib_0.5.0-1_amd64.deb&can=2&q=)

[How install the dependencies on Ubuntu from whatsup forum](https://whatsup.org.il/index.php?name=PNphpBB2&file=viewtopic&p=430129#430129) (thanks to Nachum).

## Installation

### From GNOME Shell extensions site
Install from [GNOME Shell extensions site](https://extensions.gnome.org/extension/554/gnome-hdate/).

### Manual Installation
Download [master.zip](https://github.com/amiad/gnome-hdate/archive/master.zip), unzip it, rename the directory to `hdate@hatul.info` and move it to `~/.local/share/gnome-shell/extensions`.

**Note:** For the settings window to function, you must compile the schemas:
```bash
glib-compile-schemas ~/.local/share/gnome-shell/extensions/hdate@hatul.info/schemas/
```

### Archlinux Users
Install [gnome-shell-extension-gnome-hdate-git](https://aur.archlinux.org/packages/gnome-shell-extension-gnome-hdate-git/) from AUR.

Run:
```bash
glib-compile-schemas ~/.local/share/gnome-shell/extensions/hdate@hatul.info/schemas/
```

## Troubleshooting
* **Settings:** If the preferences window does not open, ensure you have compiled the schemas as shown in the installation section.
* **Libraries:** Arch users may need to rebuild `libhdate-glib` every new version of GNOME.

## Thanks
* **Kobi Zamir** for libhdate.
* **Nachum** for the Ubuntu dependency guide.
* **ElanGoldman** for fixes and comments.
