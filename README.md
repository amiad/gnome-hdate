# gnome-hdate
Gnome-shell extension for showing the Hebrew date in the panel.

![Hebrew date in gnome-shell](https://github.com/amiad/gnome-hdate/blob/master/screenshot.png?raw=true)

## Note on Compatibility
**Standalone Extension:** This version is now completely self-contained and does not require external libraries such as `libhdate`, `libhdate-glib`, or `vala`. If you have these installed solely for this extension, you can safely remove them.

## Installation

### From GNOME Shell extensions site
Install from [GNOME Shell extensions site](https://extensions.gnome.org/extension/554/gnome-hdate/).

### Manual Installation
1. Download the source code.
2. Rename the directory to `hdate@hatul.info`.
3. Move it to `~/.local/share/gnome-shell/extensions`.
4. **Compile schemas:**
```bash
glib-compile-schemas ~/.local/share/gnome-shell/extensions/hdate@hatul.info/schemas/
```

### Archlinux Users
Install [gnome-shell-extension-gnome-hdate-git](https://aur.archlinux.org/packages/gnome-shell-extension-gnome-hdate-git/) from AUR.

## Troubleshooting
* **Settings:** If the preferences window does not open, ensure you have compiled the schemas as shown in the installation section.

## Thanks
* **Kobi Zamir** Huge thanks for the original libhdate and [libhdate-js](https://github.com/yaacov/libhdate-js). This extension's core logic is based on a modified and optimized version of his work.
* **ElanGoldman** for fixes and comments.
