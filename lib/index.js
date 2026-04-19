/* libhdate - Hebrew calendar library
 * Copyright (C) 2015 Yaacov Zamir <kobi.zamir@gmail.com>
 * GJS/ESM Version
 */

import { Hdate } from './julian.js';
import { hdate_get_holyday, hdate_get_omer_day } from './holyday.js';
import { hdate_get_parasha, hdate_get_shabbats_parasha } from './parasha.js';
import { hdate_get_utc_sun_time_deg } from './sun_time.js';
import { hdate_get_holyday_name, hdate_get_parasha_name, hdate_get_hebrew_month_name } from './strings.js';

export class LibHdate extends Hdate {
    constructor() {
        super();

        this.get_hday = () => this.hd_day;
        this.get_hmonth = () => this.hd_mon;
        this.get_hyear = () => this.hd_year;
        this.get_julian = () => this.hd_jd;
        this.get_gday = () => this.gd_day;
        this.get_gmonth = () => this.gd_mon;
        this.get_gyear = () => this.gd_year;

        this.get_hebrew_month_string = (mon) => hdate_get_hebrew_month_name(mon);
        this.get_holyday_string = (h_idx) => hdate_get_holyday_name(h_idx);
        this.get_parasha_string = (p_idx) => hdate_get_parasha_name(p_idx);
        this.get_int_string = (num) => num.toString();

        this.get_holyday = (isDiaspora = false) => hdate_get_holyday(this, isDiaspora);
        this.get_omer_day = () => hdate_get_omer_day(this);
        this.get_parasha = (isDiaspora = false) => hdate_get_parasha(this, isDiaspora);

        this.get_sunrise = (lat, lon) => hdate_get_utc_sun_time_deg(this, lat, lon, 90.833)[0];
        this.get_sunset = (lat, lon) => hdate_get_utc_sun_time_deg(this, lat, lon, 90.833)[1];
    }

    set_today() {
        const now = new Date();
        this.set_gdate(now.getDate(), now.getMonth() + 1, now.getFullYear());
    }

getFullHebrewDate() {
        const day = this.numToHebrew(this.hd_day);
        const monthName = this.get_hebrew_month_string(this.hd_mon);
        const year = this.numToHebrew(this.hd_year, true);

        return `${day} ב${monthName} ${year}`;
    }
}
