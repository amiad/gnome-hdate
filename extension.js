
const St = imports.gi.St;
const Main = imports.ui.main;
const Hdate = imports.gi.LibHdateGlib.Hdate;
const Mainloop = imports.mainloop;

let date;
var currentDate;

function init() {
    date = new St.Bin({ style_class: 'panel-date',
                          reactive: true,
                          can_focus: true,
                          x_fill: true,
                          y_fill: false,
                          track_hover: true });
}

function update(){
    var d = new Date();
    if( !currentDate || d.getDate()!=currentDate.getDate() || d.getMonth()!=currentDate.getMonth() || d.getFullYear()!=currentDate.getFullYear()){
      var h = Hdate.new();
      h.set_gdate(d.getDate(),d.getMonth()+1,d.getFullYear());
      let label = new St.Label({ text: h.get_format_date(0,0)});
      date.set_child(label);
      Main.panel._centerBox.remove_child(date);
      Main.panel._centerBox.insert_child_at_index(date, 0);    
    }
    Mainloop.timeout_add(60000, function () { update(); });
    currentDate=d;
}

function enable() {
    update();
}

function disable() {
    Main.panel._centerBox.remove_child(date);
}
