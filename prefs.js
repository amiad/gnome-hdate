import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';

export default class HDatePreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        this.initTranslations();
        const settings = this.getSettings('org.gnome.shell.extensions.hdate');
        
        const page = new Adw.PreferencesPage();

        // General Settings Group
        const generalGroup = new Adw.PreferencesGroup({
            title: _('General Settings'),
        });
        page.add(generalGroup);

        // Diaspora Mode
        const diasporaRow = new Adw.ActionRow({ 
            title: _('Diaspora Mode'),
            subtitle: _('Use Diaspora tradition for holidays and Torah portions')
        });
        const diasporaSwitch = new Gtk.Switch({
            active: settings.get_boolean('is-diaspora'),
            valign: Gtk.Align.CENTER,
        });
        settings.bind('is-diaspora', diasporaSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);
        diasporaRow.add_suffix(diasporaSwitch);
        generalGroup.add(diasporaRow);

        // Change at Sunset
        const sunsetRow = new Adw.ActionRow({ 
            title: _('Change date at sunset'),
        });
        const sunsetSwitch = new Gtk.Switch({
            active: settings.get_boolean('change-at-sunset'),
            valign: Gtk.Align.CENTER,
        });
        settings.bind('change-at-sunset', sunsetSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);
        sunsetRow.add_suffix(sunsetSwitch);
        generalGroup.add(sunsetRow);

        // Location Settings Group
        const locationGroup = new Adw.PreferencesGroup({
            title: _('Location Settings'),
            description: _('Latitude and longitude are used to calculate times of day (sunrise and sunset)')
        });
        page.add(locationGroup);

        const latRow = new Adw.ActionRow({ title: _('Latitude') });
        const latSpin = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({ 
                lower: -90, upper: 90, step_increment: 0.01, page_increment: 1,
                value: settings.get_double('latitude') 
            }),
            valign: Gtk.Align.CENTER,
            digits: 2
        });
        settings.bind('latitude', latSpin, 'value', Gio.SettingsBindFlags.DEFAULT);
        latRow.add_suffix(latSpin);
        locationGroup.add(latRow);

        const lonRow = new Adw.ActionRow({ title: _('Longitude') });
        const lonSpin = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({ 
                lower: -180, upper: 180, step_increment: 0.01, page_increment: 1,
                value: settings.get_double('longitude') 
            }),
            valign: Gtk.Align.CENTER,
            digits: 2
        });
        settings.bind('longitude', lonSpin, 'value', Gio.SettingsBindFlags.DEFAULT);
        lonRow.add_suffix(lonSpin);
        locationGroup.add(lonRow);

        window.add(page);
    }
}