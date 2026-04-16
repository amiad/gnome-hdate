/* libhdate - Hebrew calendar library
 * Copyright (C) 2015 Yaacov Zamir <kobi.zamir@gmail.com>
 * GJS/ESM Version
 */

export class Hdate {
    constructor() {
        /** The number of day in the hebrew month (1..31). */
        this.hd_day = 0;
        /** The number of the hebrew month 1..14 (1 - tishre, 13 - adar 1, 14 - adar 2). */
        this.hd_mon = 0;
        /** The number of the hebrew year. */
        this.hd_year = 0;
        /** The number of the day in the month. (1..31) */
        this.gd_day = 0;
        /** The number of the month 1..12 (1 - jan). */
        this.gd_mon = 0;
        /** The number of the year. */
        this.gd_year = 0;
        /** The day of the week 1..7 (1 - sunday). */
        this.hd_dw = 0;
        /** The length of the year in days. */
        this.hd_size_of_year = 0;
        /** The week day of Hebrew new year. */
        this.hd_new_year_dw = 0;
        /** The number type of year. */
        this.hd_year_type = 0;
        /** The Julian day number */
        this.hd_jd = 0;
        /** The number of days passed since 1 tishrey */
        this.hd_days = 0;
        /** The number of weeks passed since 1 tishrey */
        this.hd_weeks = 0;
    }

    hdate_days_from_3744(hebrew_year) {
        const HOUR = 1080;
        const DAY = 24 * HOUR;
        const WEEK = 7 * DAY;
        const MONTH = DAY + HOUR * 12 + 793;

        let years_from_3744 = hebrew_year - 3744;
        let molad_3744 = (1 + 6) * HOUR + 779;
        let leap_months = Math.floor((years_from_3744 * 7 + 1) / 19);
        let leap_left = (years_from_3744 * 7 + 1) % 19;
        let months = years_from_3744 * 12 + leap_months;
        let parts = months * MONTH + molad_3744;
        let days = months * 28 + Math.floor(parts / DAY) - 2;
        let parts_left_in_week = parts % WEEK;
        let parts_left_in_day = parts % DAY;
        let week_day = Math.floor(parts_left_in_week / DAY);

        if ((leap_left < 12 && week_day == 3 && parts_left_in_day >= (9 + 6) * HOUR + 204) ||
            (leap_left < 7 && week_day == 2 && parts_left_in_day >= (15 + 6) * HOUR + 589)) {
            days++;
            week_day++;
        }

        if (week_day == 1 || week_day == 4 || week_day == 6) {
            days++;
        }
        return days;
    }

    hdate_get_size_of_hebrew_year(hebrew_year) {
        return this.hdate_days_from_3744(hebrew_year + 1) - this.hdate_days_from_3744(hebrew_year);
    }

    hdate_get_year_type(size_of_year, new_year_dw) {
        const year_types = [1, 0, 0, 2, 0, 3, 4, 0, 5, 0, 6, 7, 8, 0, 9, 10, 0, 11, 0, 0, 12, 0, 13, 14];
        let offset = Math.floor((new_year_dw + 1) / 2);
        offset = offset + 4 * ((size_of_year % 10 - 3) + Math.floor(size_of_year / 10 - 35));
        return year_types[offset - 1];
    }

    hdate_gdate_to_jd(day, month, year) {
        let a = Math.floor((14 - month) / 12);
        let y = year + 4800 - a;
        let m = month + 12 * a - 3;
        return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    }

    hdate_hdate_to_jd(day, month, year) {
        let m = month;
        let d = day;
        if (m == 13) m = 6;
        if (m == 14) { m = 6; d += 30; }

        let days_from_3744 = this.hdate_days_from_3744(year);
        d = days_from_3744 + Math.floor((59 * (m - 1) + 1) / 2) + d;
        let length_of_year = this.hdate_days_from_3744(year + 1) - days_from_3744;

        if (length_of_year % 10 > 4 && m > 2) d++;
        if (length_of_year % 10 < 4 && m > 3) d--;
        if (length_of_year > 365 && m > 6) d += 30;

        return d + 1715118;
    }

    hdate_jd_to_gdate(jd) {
        let l = jd + 68569;
        let n = Math.floor((4 * l) / 146097);
        l = l - Math.floor((146097 * n + 3) / 4);
        let i = Math.floor((4000 * (l + 1)) / 1461001);
        l = l - Math.floor((1461 * i) / 4) + 31;
        let j = Math.floor((80 * l) / 2447);
        let d = l - Math.floor((2447 * j) / 80);
        l = Math.floor(j / 11);
        let m = j + 2 - (12 * l);
        let y = 100 * (n - 49) + i + l;
        return [d, m, y];
    }

    hdate_jd_to_hdate(jd) {
        let _g = this.hdate_jd_to_gdate(jd);
        let day = _g[0], month = _g[1], year = _g[2];
        year += 3760;

        let jd_tishrey1 = this.hdate_days_from_3744(year) + 1715119;
        let jd_tishrey1_next_year = this.hdate_days_from_3744(year + 1) + 1715119;

        if (jd_tishrey1_next_year <= jd) {
            year++;
            jd_tishrey1 = jd_tishrey1_next_year;
            jd_tishrey1_next_year = this.hdate_days_from_3744(year + 1) + 1715119;
        }

        let size_of_year = jd_tishrey1_next_year - jd_tishrey1;
        let days = jd - jd_tishrey1;

        if (days >= (size_of_year - 236)) {
            days -= (size_of_year - 236);
            month = Math.floor(days * 2 / 59);
            day = days - Math.floor((month * 59 + 1) / 2) + 1;
            month += 5;
            if (size_of_year > 355 && month <= 6) month += 8;
        } else {
            if (size_of_year % 10 > 4 && days == 59) {
                month = 1; day = 30;
            } else if (size_of_year % 10 > 4 && days > 59) {
                month = Math.floor((days - 1) * 2 / 59);
                day = days - Math.floor((month * 59 + 1) / 2);
            } else if (size_of_year % 10 < 4 && days > 87) {
                month = Math.floor((days + 1) * 2 / 59);
                day = days - Math.floor((month * 59 + 1) / 2) + 2;
            } else {
                month = Math.floor(days * 2 / 59);
                day = days - Math.floor((month * 59 + 1) / 2) + 1;
            }
            month++;
        }
        return [day, month, year, jd_tishrey1, jd_tishrey1_next_year];
    }

    set_jd(jd) {
        let _g = this.hdate_jd_to_gdate(jd);
        this.gd_day = _g[0]; this.gd_mon = _g[1]; this.gd_year = _g[2];

        let _h = this.hdate_jd_to_hdate(jd);
        this.hd_day = _h[0]; this.hd_mon = _h[1]; this.hd_year = _h[2];
        let jd_tishrey1 = _h[3];
        let jd_tishrey1_next_year = _h[4];

        this.hd_dw = (jd + 1) % 7 + 1;
        this.hd_size_of_year = jd_tishrey1_next_year - jd_tishrey1;
        this.hd_new_year_dw = (jd_tishrey1 + 1) % 7 + 1;
        this.hd_year_type = this.hdate_get_year_type(this.hd_size_of_year, this.hd_new_year_dw);
        this.hd_jd = jd;
        this.hd_days = jd - jd_tishrey1 + 1;
        this.hd_weeks = Math.floor(((this.hd_days - 1) + (this.hd_new_year_dw - 1)) / 7) + 1;
    }

    set_gdate(d, m, y) {
        this.set_jd(this.hdate_gdate_to_jd(d, m, y));
    }

    set_hdate(d, m, y) {
        this.set_jd(this.hdate_hdate_to_jd(d, m, y));
    }
}
