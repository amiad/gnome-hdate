import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import GLib from 'gi://GLib';
import LibHDateGLib from 'gi://LibHdateGlib';

function getSystemTzOffset() {
    return GLib.DateTime.new_now_local().get_utc_offset() / 3600000000;
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
        
        this.h = LibHDateGLib.Hdate.new();
        this.jd = 0;

        this._settingsChangedId = this._settings.connect('changed', () => this._applySettings());
        
        this._applySettings();
        this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 60, this._refresh.bind(this));
        this._refresh();
    }
    
    _applySettings() {
        this.h.set_longitude(this._settings.get_double('longitude'));
        this.h.set_latitude(this._settings.get_double('latitude'));
        this.h.set_tz(getSystemTzOffset());
        this.h.set_dst(0);
        this.h.set_use_hebrew(true);
        this.h.set_use_short_format(false);
        this._refresh(true);
    }

    _refresh_button_label() {
        let label = `${this.h.get_int_string(this.h.get_hday())} \u05D1${this.h.get_hebrew_month_string(this.h.get_hmonth())} ${this.h.get_int_string(this.h.get_hyear())}`;
        
        let holyday = this.h.get_holyday();
        if (holyday !== 0) {
            label += `, ${this.h.get_holyday_string(holyday)}`;
        }

        let omer = this.h.get_omer_day();
        if (omer !== 0) {
            label += `, ${this.h.get_int_string(omer)}${_(" day of Omer")}`;
        }

        this.buttonText.set_text(label);
    }
    
    _refresh_button_menu() {
        this.menu.removeAll();

        this.menu.addMenuItem(new PopupMenu.PopupMenuItem(
            _("Sunrise: ") + this.h.min_to_string(this.h.get_sunrise())));
        this.menu.addMenuItem(new PopupMenu.PopupMenuItem(
            _("Sunset: ") + this.h.min_to_string(this.h.get_sunset())));
        
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        let tempH = LibHDateGLib.Hdate.new();
        tempH.set_gdate(this.h.get_gday(), this.h.get_gmonth(), this.h.get_gyear());
        let tries = 0;
        while (tempH.get_parasha() === 0 && tries < 7) {
            let d = GLib.DateTime.new_local(tempH.get_gyear(), tempH.get_gmonth(), tempH.get_gday(), 12, 0, 0).add_days(1);
            tempH.set_gdate(d.get_day_of_month(), d.get_month(), d.get_year());
            tries++;
        }
        
        this.menu.addMenuItem(new PopupMenu.PopupMenuItem(
            _("Week's Torah: ") + tempH.get_parasha_string(tempH.get_parasha())));
        
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        let settingsItem = new PopupMenu.PopupMenuItem(_('Settings ⚙'));
        settingsItem.connect('activate', () => {
            this._extension.openPreferences();
        });
        this.menu.addMenuItem(settingsItem);
    }
    
    _refresh(force = false) {
        this.h.set_today();
        this.h.set_tz(getSystemTzOffset());

        if (force || this.h.get_julian() !== this.jd) {
            this._refresh_button_label();
            this._refresh_button_menu();
            this.jd = this.h.get_julian();
        }
        return true;
    }

    destroy() {
        if (this._timeout) {
            GLib.source_remove(this._timeout);
            this._timeout = null;
        }
        if (this._settingsChangedId) {
            this._settings.disconnect(this._settingsChangedId);
        }
        super.destroy();
    }
});

export default class HDate extends Extension {
    enable() {
        this.initTranslations();
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
