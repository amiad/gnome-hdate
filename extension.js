// based on amiads hdate@hatul.info Hdate extension
// see:
//    https://github.com/amiad/gnome-hdate

const PanelMenu = imports.ui.panelMenu;
const St = imports.gi.St;
const Main = imports.ui.main;
const Shell = imports.gi.Shell;
const Mainloop = imports.mainloop;
const Lang = imports.lang;
const PopupMenu = imports.ui.popupMenu;
const ExtensionUtils = imports.misc.extensionUtils;
const Config = imports.misc.config;
const Gettext = imports.gettext;
const Clutter = imports.gi.Clutter;

const Hdate = imports.gi.LibHdateGlib.Hdate;

/* start of translation functionality 

    to translate:
    1. xgettext -k_ -kN_ -o messages.pot extension.js
    2. create the he.po file
    3. msgfmt he.po -o locale/he/LC_MESSAGES/hdate_button.mo
    
    to update:
    1. msgmerge -U he.po messages.pot
 */
let domain = "gnome-hdate"
let extension = ExtensionUtils.getCurrentExtension();
let locale_dir = extension.dir.get_child('locale');

Gettext.textdomain(domain);
if (locale_dir.query_exists(null))
    Gettext.bindtextdomain(domain, locale_dir.get_path());
else
    Gettext.bindtextdomain(domain, Config.LOCALEDIR);

const _ = Gettext.gettext;

/* end of translation functionality */

let _hdateButton = null;

const HdateButton = new Lang.Class({
    Name: 'HdateButton',
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(0.0, "Hdate Button", false);
        
        // make label 
        this.buttonText = new St.Label({y_expand: true, y_align: Clutter.ActorAlign.CENTER});
        this.actor.add_actor(this.buttonText);
        
        // init the hebrew date object
        this.h = Hdate.new();
        this.h.set_longitude(34.77);
        this.h.set_latitude(32.07);
        this.h.set_tz(2);
        this.h.set_dst(0);
        this.jd = 0;

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
        
        // check label and menu evry 60 secs
        this._refresh_rate = 60;
        this._timeout = Mainloop.timeout_add_seconds(this._refresh_rate, Lang.bind(this, this._refresh));
        
        // refresh view
        this._refresh();
    },
    
    _refresh_button_label: function() {
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
        
        // set the button label
        this.buttonText.set_text(label_string);
    },
    
    _refresh_button_menu: function() {
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

		portion_nbr = this.h.get_parasha();
		str_portion = this.h.get_parasha_string(portion_nbr);
	}
	
	// else bruteforce calculate the next shabbat
	// new to language so don't know if this is faster
	// than Date(); getDay, getMonth() getYear() functions.

	else {	
		let a_day = this.h.get_gday();
		let a_month = this.h.get_gmonth();
		let a_year = this.h.get_gyear();

		do {	

			this.temp = Hdate.new();		
			this.temp.set_use_hebrew(false);
			this.temp.set_gdate(a_day,a_month,a_year);
			portion_nbr = this.temp.get_parasha();
			str_portion = this.temp.get_parasha_string(portion_nbr);
			//this.temp.destroy(); breaks it
			//Don't know if this.temp = Hdate.new() being created
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
    },
    
    _refresh: function() {
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
    },

    destroy: function() {
        if(this._timeout) {
            Mainloop.source_remove(this._timeout);
            this._timeout = null;
        }
        this.parent();
    }
});

// init function
function init(metadata) {
}

// enable function
function enable() {
    try {
        _hdateButton = new HdateButton;
        Main.panel.addToStatusArea('hdate-button', _hdateButton, 0, "center");
        //Main.panel._rightBox.insert_child_at_index(_hdateButton, 0);
    }
    catch(err) {
        global.log("Error: Hdate button extension: " + err.message);
        _hdateButton.destroy();
        _hdateButton = null;
    }
}

// disable function
function disable() {
    if(_hdateButton) {
        _hdateButton.destroy();
        _hdateButton = null;
    }
}
