const St = imports.gi.St;
const Main = imports.ui.main;
const Hdate = imports.gi.LibHdateGlib.Hdate;
const Mainloop = imports.mainloop;

var date;
var h;
var gday;

var updateTimeout = 60000;
var isRunning = false;
var forceHebrew = true;

function init() {
    date = new St.Bin({ style_class: 'panel-date',
                          reactive: false,
                          can_focus: false,
                          x_fill: true,
                          y_fill: false,
                          track_hover: true });
    
    // init the hebrew date object
    h = Hdate.new();
}

function update() {
    // check extension state
    if ( !isRunning ) {
        return;
    }
    
    // force long format hebrew output
    h.set_use_hebrew( forceHebrew );
    h.set_use_short_format( false );
    
    // set the h object date to today 
    // and repaint if we did not paint this day
    h.set_today();
    if ( h.get_gday() != gday ) {
        // create the hebrew date label. we can use the standart h.to_string()
        // function or create the string.
        let label_string = h.get_int_string( h.get_hday() );
        label_string += " \u05D1" + h.get_hebrew_month_string( h.get_hmonth() );
        label_string += " " + h.get_int_string( h.get_hyear() );
        
        // check for holiday
        let holyday = h.get_holyday();
        if (holyday != 0) {
          label_string += ", " + h.get_holyday_string( holyday );
        }
        
        let label = new St.Label({ text: label_string });
        
        date.set_child( label );
        Main.panel._centerBox.remove_child( date );
        Main.panel._centerBox.insert_child_at_index( date, 0 );
    }
    
    // remember the last day painted
    gday = h.get_gday();
    
    // reset the timeout to 1 min from now
    Mainloop.timeout_add( updateTimeout, function() { update(); } );
}

function enable() {
    gday = 0;
    isRunning = true; 
    update();
}

function disable() {
    isRunning = false; 
    Main.panel._centerBox.remove_child( date );
}
