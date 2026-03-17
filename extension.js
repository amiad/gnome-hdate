//    https://github.com/amiad/gnome-hdate

import * as PanelMenu from  'resource:///org/gnome/shell/ui/panelMenu.js';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import Shell from 'gi://Shell';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Config from  'resource:///org/gnome/shell/misc/config.js';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

import LibHDateGLib from 'gi://LibHdateGlib';

let _hdateButton = null;

// Settings management
const SETTINGS_DIR = GLib.get_user_config_dir() + '/gnome-shell/extensions/hdate@hatul.info';
const SETTINGS_FILE = SETTINGS_DIR + '/settings.json';

function ensureSettingsDir() {
    let dir = Gio.File.new_for_path(SETTINGS_DIR);
    if (!dir.query_exists(null)) {
        try {
            dir.make_directory_with_parents(null);
        } catch (e) {
            logError(e);
        }
    }
}

function loadSettings() {
    ensureSettingsDir();
    let file = Gio.File.new_for_path(SETTINGS_FILE);

    let defaults = { longitude: 34.77, latitude: 32.07, tz: 2 };

    if (!file.query_exists(null)) {
        return defaults;
    }

    try {
        let [success, contents] = file.load_contents(null);
        if (success) {
            let data = JSON.parse(contents);
            return Object.assign({}, defaults, data);
        }
    } catch (e) {
        logError(e);
    }

    return defaults;
}

function saveSettings(settings) {
    ensureSettingsDir();
    let file = Gio.File.new_for_path(SETTINGS_FILE);
    
    try {
        let data = JSON.stringify(settings);
        file.replace_contents(data, null, false, Gio.FileCreateFlags.NONE, null);
    } catch (e) {
        logError(e);
    }
}

const HdateButton = new GObject.registerClass({
    GTypeName: 'HdateButton'
    }, class HdateButton
    extends PanelMenu.Button {

    constructor() {
        super(0.0, "Hdate Button", false);
        
        // make label 
        this.buttonText = new St.Label({y_expand: true, y_align: Clutter.ActorAlign.CENTER});
        this.add_child(this.buttonText);
        
        // load settings
        let settings = loadSettings();
        this.settings = settings;
        
        // init the hebrew date object
        this.h = LibHDateGLib.Hdate.new();
        this.h.set_dst(0);
        this.jd = 0;
        this._applySettings();

        // force long format hebrew output
        this.h.set_use_hebrew(true);
        this.h.set_use_short_format(false);
       
        // init empty menu items
        this._sunrise = null;
        this._sunset = null;
        this._sep = null;
        this._first_light = null;
        this._first_stars = null;
        this._three_stars = null;
        this._portion = null;
        this._location = null;
        this._settings_button = null;
        
        // check label and menu evry 60 secs
        this._refresh_rate = 60;
        this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, this._refresh_rate, this._refresh.bind(this));
        
        // refresh view
        this._refresh();
    }
    
    _applySettings() {
        // Ensure the internal libhdate object uses the configured location/timezone
        this.h.set_longitude(this.settings.longitude);
        this.h.set_latitude(this.settings.latitude);
        this.h.set_tz(this.settings.tz);

        this._refresh_button_menu(); // Force menu refresh with new location
        this._refresh();
    }

    _refresh_button_label() {
        // create the hebrew date label. we can use the standart this.h.to_string()
        // function or create the string.
        let label_string = this.h.get_int_string( this.h.get_hday() );
        label_string += " \u05D1" + this.h.get_hebrew_month_string( this.h.get_hmonth() );
        label_string += " " + this.h.get_int_string( this.h.get_hyear() );
        
        // check for holiday
        let holyday = this.h.get_holyday();
        if (holyday != 0) {
          label_string += ", " + this.h.get_holyday_string( holyday );
        }

        // check for omer
        let omer = this.h.get_omer_day();
        if (omer != 0) {
          label_string += ", " + this.h.get_int_string( omer ) + ' לעומר';
        }

        // set the button label
        this.buttonText.set_text(label_string);
    }
    
    _openSettingsDialog() {
        let dialog = new St.BoxLayout({
            vertical: true,
            style_class: 'hddate-settings-dialog'
        });
        
        let titleLabel = new St.Label({
            text: _('Edit Location Settings'),
            style_class: 'hddate-settings-title'
        });
        dialog.add_child(titleLabel);

        // Longitude input
        let longtitudeBox = new St.BoxLayout({
            vertical: false,
            style: 'spacing: 10px; margin: 10px;'
        });
        let lonLabel = new St.Label({ text: _('Longitude:') });
        let lonInput = new St.Entry({
            text: this.settings.longitude.toString(),
            style: 'width: 150px;'
        });
        longtitudeBox.add_child(lonLabel);
        longtitudeBox.add_child(lonInput);
        dialog.add_child(longtitudeBox);

        // Latitude input
        let latitudeBox = new St.BoxLayout({
            vertical: false,
            style: 'spacing: 10px; margin: 10px;'
        });
        let latLabel = new St.Label({ text: _('Latitude:') });
        let latInput = new St.Entry({
            text: this.settings.latitude.toString(),
            style: 'width: 150px;'
        });
        latitudeBox.add_child(latLabel);
        latitudeBox.add_child(latInput);
        dialog.add_child(latitudeBox);

        // Time zone entry (free-form)
        function formatTz(val) {
            let sign = val >= 0 ? '+' : '';
            return `UTC${sign}${val}`;
        }

        function parseTz(text) {
            if (!text) return NaN;
            let cleaned = text.toUpperCase().trim();
            if (cleaned.startsWith('UTC'))
                cleaned = cleaned.slice(3).trim();
            // allow values like +2, -4, 2, 0
            let num = parseFloat(cleaned);
            return isNaN(num) ? NaN : num;
        }

        let tzEntry = new St.Entry({
            text: formatTz(this.settings.tz),
            style: 'width: 320px; margin: 10px;'
        });
        let tzEntryLabel = new St.Label({ text: _('Timezone (UTC offset):') });
        let tzEntryBox = new St.BoxLayout({
            vertical: false,
            style: 'spacing: 10px; margin: 10px;'
        });
        tzEntryBox.add_child(tzEntryLabel);
        tzEntryBox.add_child(tzEntry);
        dialog.add_child(tzEntryBox);

        // Time zone dropdown (common locations)
        let tzOptions = [
            { label: _('Jerusalem (UTC+2)'), value: 2 },
            { label: _('New York (UTC-4)'), value: -4 },
            { label: _('London (UTC+0)'), value: 0 },
            { label: _('Paris (UTC+1)'), value: 1 },
            { label: _('Moscow (UTC+3)'), value: 3 },
            { label: _('Johannesburg (UTC+2)'), value: 2 },
            { label: _('Buenos Aires (UTC-3)'), value: -3 },
            { label: _('Los Angeles (UTC-7)'), value: -7 },
            { label: _('Toronto (UTC-4)'), value: -4 },
            { label: _('Melbourne (UTC+11)'), value: 11 }
        ];

        let selectedTz = this.settings.tz;

        function tzLabel(val) {
            let sign = val >= 0 ? '+' : '';
            return _('Time zone:') + ` UTC${sign}${val}`;
        }

        let tzButton = new St.Button({
            label: tzLabel(selectedTz),
            style: 'width: 320px; margin: 10px; text-align: left;'
        });

        let tzListBox = new St.BoxLayout({
            vertical: true,
            style: 'spacing: 4px; padding: 5px;'
        });

        for (let option of tzOptions) {
            let item = new St.Button({
                label: option.label,
                style: 'justify-content: flex-start; text-align: left;'
            });
            item.connect('clicked', () => {
                selectedTz = option.value;
                tzButton.set_label(tzLabel(selectedTz));
                tzEntry.text = formatTz(selectedTz);
                tzList.visible = false;
            });
            tzListBox.add_child(item);
        }

        let tzList = new St.ScrollView({
            style: 'background: rgba(255,255,255,0.95); border: 1px solid rgba(0,0,0,0.2); max-height: 180px; width: 340px; margin-left: 10px; margin-right: 10px;',
            x_expand: true,
            y_expand: false
        });
        tzList.add_child(tzListBox);
        tzList.visible = true;

        tzButton.connect('clicked', () => {
            // Dropdown is now always visible, no toggle needed
        });

        dialog.add_child(tzButton);
        dialog.add_child(tzList);

        // Button container
        let buttonBox = new St.BoxLayout({
            vertical: false,
            style: 'spacing: 10px; margin: 10px;'
        });

        let okButton = new St.Button({
            label: _('OK'),
            style_class: 'button'
        });

        let cancelButton = new St.Button({
            label: _('Cancel'),
            style_class: 'button'
        });

        buttonBox.add_child(okButton);
        buttonBox.add_child(cancelButton);
        dialog.add_child(buttonBox);

        // Create modal
        let actor = new Clutter.Actor();
        let background = new St.Widget({
            reactive: true,
            x_expand: true,
            y_expand: true,
            style: 'background-color: rgba(0, 0, 0, 0.7);'
        });

        let dialogContainer = new St.BoxLayout({
            vertical: true,
            reactive: true,
            style: 'background-color: #f0f0f0; border-radius: 10px; padding: 20px; width: 360px; margin-top: 50px;'
        });
        dialogContainer.set_x_align(Clutter.ActorAlign.CENTER);
        dialogContainer.set_y_align(Clutter.ActorAlign.START);
        dialogContainer.add_child(dialog);

        background.add_child(dialogContainer);

        okButton.connect('clicked', () => {
            let lon = parseFloat(lonInput.text);
            let lat = parseFloat(latInput.text);
            let tzFromEntry = parseTz(tzEntry.text);
            let tz = !isNaN(tzFromEntry) ? tzFromEntry : selectedTz;

            if (!isNaN(lon) && !isNaN(lat)) {
                this.settings.longitude = lon;
                this.settings.latitude = lat;
                this.settings.tz = tz;
                saveSettings(this.settings);

                this._applySettings();

                Main.uiGroup.remove_child(background);
                background.destroy();
            }
        });

        cancelButton.connect('clicked', () => {
            Main.uiGroup.remove_child(background);
            background.destroy();
        });

        Main.uiGroup.add_child(background);
    }
    
    
    _refresh_button_menu() {
        // remove the old menu items
        if (this._sunrise)
            this._sunrise.destroy();
        if (this._sunset)
            this._sunset.destroy();
        if (this._sep)
            this._sep.destroy();
        if (this._first_light)
            this._first_light.destroy();
        if (this._first_stars)
            this._first_stars.destroy();
        if (this._three_stars)
            this._three_stars.destroy();
        if (this._portion)
            this._portion.destroy();
        if (this._location)
            this._location.destroy();
        if (this._settings_button)
            this._settings_button.destroy();

        // get the time-of-day times
        var sunrise = this.h.get_sunrise()
        var sunset = this.h.get_sunset()
        var first_light = this.h.get_first_light()
        var talit = this.h.get_talit()
        var first_stars = this.h.get_first_stars()
        var three_stars = this.h.get_three_stars()
        
    //calculate to print this week's parasha --hdate only prints iemei shabbat(!)
	//and no shabbat values are present in VALA GLIB functions
	
	var portion_nbr = null;
	var str_portion = null;
	let portion = this.h.get_parasha();
	
	// if shabbat then its printing so fill variables and leave.
	if (portion != 0) {

		this.temp = LibHDateGLib.Hdate.new();		
		this.temp.set_use_hebrew(false);
		portion_nbr = this.temp.get_parasha();
		str_portion = this.temp.get_parasha_string(portion_nbr);
	}
	
	// else bruteforce calculate the next shabbat
	// new to language so don't know if this is faster
	// than Date(); getDay, getMonth() getYear() functions.

	else {	
		let a_day = this.h.get_gday();
		let a_month = this.h.get_gmonth();
		let a_year = this.h.get_gyear();

		do {	

			this.temp = LibHDateGLib.Hdate.new();		
			this.temp.set_use_hebrew(false);
			this.temp.set_gdate(a_day,a_month,a_year);
			portion_nbr = this.temp.get_parasha();
			str_portion = this.temp.get_parasha_string(portion_nbr);
			//this.temp.destroy(); breaks it
			//Don't know if this.temp = LibHDateGLib.Hdate.new() being created
			//all the time overwrites the previous aka destroyed
			//or if it gets stored somewhere (=bad practice)
			a_day++;
		}
		while (portion_nbr == 0);
	}
	// end result = parsha string in str_portion variable which prints below

        // create new menu items
        this._sunrise = new PopupMenu.PopupMenuItem(
            _("Sunrise: ") + this.h.min_to_string(sunrise));
        this._sunset = new PopupMenu.PopupMenuItem(
            _("Sunset: ") + this.h.min_to_string(sunset));
        this._sep = new PopupMenu.PopupSeparatorMenuItem();
        this._first_light = new PopupMenu.PopupMenuItem(
            _("First light: ") + this.h.min_to_string(first_light));
        this._first_stars = new PopupMenu.PopupMenuItem(
            _("First stars: ") + this.h.min_to_string(first_stars));
        this._three_stars = new PopupMenu.PopupMenuItem(
            _("Three stars: ") + this.h.min_to_string(three_stars));
        this._sep2 = new PopupMenu.PopupSeparatorMenuItem();
        this._portion = new PopupMenu.PopupMenuItem(
		_("Week's Torah: ") + str_portion);
        
        this.menu.addMenuItem(this._sunrise);
        this.menu.addMenuItem(this._sunset);
        this.menu.addMenuItem(this._sep);
        this.menu.addMenuItem(this._first_light);
        this.menu.addMenuItem(this._first_stars);
        this.menu.addMenuItem(this._three_stars);
        this.menu.addMenuItem(this._sep2);
        this.menu.addMenuItem(this._portion);

        // Current location info
        this._location = new PopupMenu.PopupMenuItem(
            _('Location: ') + `${this.settings.longitude.toFixed(2)}, ${this.settings.latitude.toFixed(2)} (UTC${this.settings.tz >= 0 ? '+' : ''}${this.settings.tz})`);
        this._location.setSensitive(false);
        this.menu.addMenuItem(this._location);

        // Add settings separator and button
        let sep3 = new PopupMenu.PopupSeparatorMenuItem();
        this.menu.addMenuItem(sep3);

        this._settings_button = new PopupMenu.PopupMenuItem(
            _('Location Settings ⚙'));
        this._settings_button.connect('activate', () => {
            this._openSettingsDialog();
        });
        this.menu.addMenuItem(this._settings_button);
    }
    
    _refresh() {
        // set the h object date to today 
        this.h.set_today();
        
        // repaint if we did not paint this day
        if ( this.h.get_julian() != this.jd ) {
            // set the hebrew date label.
            this._refresh_button_label();
            
            // set the menu
            this._refresh_button_menu();
        }
        
        // remember the last day painted
        this.jd = this.h.get_julian();
        
        return true;
    }

    destroy() {
        if(this._timeout) {
            GLib.source_remove(this._timeout);
            this._timeout = null;
        }
       super.destroy();
    }
});

export default class HDate extends Extension {
	enable() {
		this._hdateButton = new HdateButton;
		Main.panel.addToStatusArea('hdate-button', this._hdateButton, 0, "center");
	}
	disable() {
	    if(this._hdateButton) {
		this._hdateButton.destroy();
		delete this._hdateButton;
		this._hdateButton = null;
	    }
	}
}

