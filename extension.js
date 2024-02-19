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

import LibHDateGLib from 'gi://LibHdateGlib';

let _hdateButton = null;

const HdateButton = new GObject.registerClass({
    GTypeName: 'HdateButton'
    }, class HdateButton
    extends PanelMenu.Button {

    constructor() {
        super(0.0, "Hdate Button", false);
        
        // make label 
        this.buttonText = new St.Label({y_expand: true, y_align: Clutter.ActorAlign.CENTER});
        this.add_child(this.buttonText);
        
        // init the hebrew date object
        this.h = LibHDateGLib.Hdate.new();
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
        this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, this._refresh_rate, this._refresh.bind(this));
        
        // refresh view
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

