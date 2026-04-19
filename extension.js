import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import GLib from 'gi://GLib';

import { LibHdate } from './lib/index.js';

function getSystemTzOffset() {
    return GLib.DateTime.new_now_local().get_utc_offset() / 3600000000;
}

function minToString(totalMinutes) {
    if (totalMinutes < 0) return "--:--";
    let h = Math.floor(totalMinutes / 60);
    let m = totalMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

const HdateButton = new GObject.registerClass({
    GTypeName: 'HdateButton'
}, class HdateButton extends PanelMenu.Button {
    constructor(extension) {
        super(0.0, "Hdate Button", false);
        this._extension = extension;
        this._settings = extension.getSettings('org.gnome.shell.extensions.hdate');

        this.buttonText = new St.Label({
            y_expand: true,
            y_align: Clutter.ActorAlign.CENTER
        });
        this.add_child(this.buttonText);

        this.h = new LibHdate();
        this.jd = 0;

        this._settingsChangedId = this._settings.connect('changed', () => this._applySettings());
        this._applySettings();

        this._timeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 2, () => {
            this._refresh();
            return GLib.SOURCE_CONTINUE;
        });

        this._refresh(true);
    }

    _applySettings() {
        this.latitude = this._settings.get_double('latitude');
        this.longitude = this._settings.get_double('longitude');
        this.isDiaspora = this._settings.get_boolean('is-diaspora');
        this._refresh(true);
    }

    _refresh_button_label() {
        let label = this.h.getFullHebrewDate();

        let holyday = this.h.get_holyday(this.isDiaspora);
        if (holyday !== 0) {
            label += `, ${this.h.get_holyday_string(holyday)}`;
        }

        let omer = this.h.get_omer_day();
        if (omer !== 0) {
            label += `, ${this.h.numToHebrew(omer)} בעומר`;
        }
        this.buttonText.set_text(label);
    }

    _refresh_button_menu() {
        this.menu.removeAll();
        let tzMin = getSystemTzOffset() * 60;

        this.menu.addMenuItem(new PopupMenu.PopupMenuItem(
            _("Sunrise: ") + minToString(this.h.get_sunrise(this.latitude, this.longitude) + tzMin)));
        this.menu.addMenuItem(new PopupMenu.PopupMenuItem(
            _("Sunset: ") + minToString(this.h.get_sunset(this.latitude, this.longitude) + tzMin)));

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        let tempH = new LibHdate();
        tempH.set_jd(this.h.hd_jd);

        let daysToShabbat = (7 - tempH.hd_dw + 7) % 7;
        if (daysToShabbat > 0) {
            tempH.set_jd(tempH.hd_jd + daysToShabbat);
        }

        let readingLabel = "";
        let parashaIdx = tempH.get_parasha(this.isDiaspora);

        if (parashaIdx !== 0) {
            readingLabel = tempH.get_parasha_string(parashaIdx);
        } else {
            let holydayIdx = tempH.get_holyday(this.isDiaspora);
            if (holydayIdx !== 0) {
                readingLabel = tempH.get_holyday_string(holydayIdx);
            }
        }

        if (readingLabel) {
            this.menu.addMenuItem(new PopupMenu.PopupMenuItem( _("Week's Torah: ") + readingLabel));
        }

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        let settingsItem = new PopupMenu.PopupMenuItem(_('Settings ⚙'));
        settingsItem.connect('activate', () => this._extension.openPreferences());
        this.menu.addMenuItem(settingsItem);
    }

    _refresh(force = false) {
        let oldGDay = this.h.get_gday();
        this.h.set_today();

        let newGDay = this.h.get_gday();
        let currentJd = this.h.get_julian();

        if (force || currentJd !== this.jd || newGDay !== oldGDay) {
            this._refresh_button_label();
            this._refresh_button_menu();
            this.jd = currentJd;
        }
        return true;
    }

    destroy() {
        if (this._timeoutId) {
            GLib.source_remove(this._timeoutId);
            this._timeoutId = null;
        }
        if (this._settingsChangedId) {
            this._settings.disconnect(this._settingsChangedId);
        }
        super.destroy();
    }
});

export default class HDate extends Extension {
    enable() {
        this._hdateButton = new HdateButton(this);
        Main.panel.addToStatusArea('hdate-button', this._hdateButton, 0, "center");
    }
    disable() {
        if (this._hdateButton) {
            this._hdateButton.destroy();
            this._hdateButton = null;
        }
    }
}