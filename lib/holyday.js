/* libhdate - Hebrew calendar library
 * Copyright (C) 2015 Yaacov Zamir <kobi.zamir@gmail.com>
 * GJS/ESM Version
 */

import { Hdate } from './julian.js';

/**
 Return number of hebrew holyday.
 @param {Object} h - The hdate instance.
 @param {boolean} isDiaspora - if True give Diaspora holydays.
 @returns {number} the number of holyday.
*/
export function hdate_get_holyday(h, isDiaspora = false) {
    let holyday = 0;
    
    /* holydays table */
    const holydays_table = [
        [1, 2, 3, 3, 0, 0, 0, 0, 37, 4, 0, 0, 0, 0, 5, 31, 6, 6, 6, 6, 7, 27, 8, 0, 0, 0, 0, 0, 0, 0], // Tishre
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 35, 35, 35, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Cheshvan
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 9, 9, 9, 9, 9],     // Kislev
        [9, 9, 9, 0, 0, 0, 0, 0, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],    // Tevet
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 33],   // Shevat
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 12, 13, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Adar
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 32, 16, 16, 16, 16, 28, 29, 0, 0, 0, 24, 24, 24, 0, 0], // Nisan
        [0, 17, 17, 17, 17, 17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 0, 0, 0, 0, 0, 0, 0, 0, 0, 26, 0, 0], // Iyar
        [0, 0, 0, 0, 19, 20, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Sivan
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 21, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 36, 36], // Tamuz
        [0, 0, 0, 0, 0, 0, 0, 0, 22, 22, 0, 0, 0, 0, 23, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Av
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Elul
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Adar I
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 12, 13, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]  // Adar II
    ];

    if (h.hd_mon < 1 || h.hd_mon > 14 || h.hd_day < 1 || h.hd_day > 30) return 0;
    
    holyday = holydays_table[h.hd_mon - 1][h.hd_day - 1];

    /* Logic for moving fasts and holidays */
    if ((holyday === 3) && (h.hd_dw === 7 || (h.hd_day === 4 && h.hd_dw !== 1))) holyday = 0; // Tzom Gedalia
    if ((holyday === 21) && (h.hd_dw === 7 || (h.hd_day === 18 && h.hd_dw !== 1))) holyday = 0; // 17 Tamuz
    if ((holyday === 22) && (h.hd_dw === 7 || (h.hd_day === 10 && h.hd_dw !== 1))) holyday = 0; // 9 Av
    if ((holyday === 9) && (h.hd_size_of_year % 10 !== 3) && (h.hd_day === 3)) holyday = 0; // Hanukah
    if ((holyday === 12) && (h.hd_dw === 7 || (h.hd_day === 11 && h.hd_dw !== 5))) holyday = 0; // Tanit Ester

    if (holyday === 26 && h.gd_year < 1968) holyday = 0; // Yom Yerushalayim

    if (holyday === 17) { // Independence Day & Memorial Day logic
        if (h.gd_year < 1948) holyday = 0;
        else if (h.gd_year < 2004) {
            if ((h.hd_day === 3) && (h.hd_dw === 5)) holyday = 17;
            else if ((h.hd_day === 4) && (h.hd_dw === 5)) holyday = 17;
            else if ((h.hd_day === 5) && (h.hd_dw !== 6 && h.hd_dw !== 7)) holyday = 17;
            else if ((h.hd_day === 2) && (h.hd_dw === 4)) holyday = 25;
            else if ((h.hd_day === 3) && (h.hd_dw === 4)) holyday = 25;
            else if ((h.hd_day === 4) && (h.hd_dw !== 5 && h.hd_dw !== 6)) holyday = 25;
            else holyday = 0;
        } else {
            if ((h.hd_day === 3) && (h.hd_dw === 5)) holyday = 17;
            else if ((h.hd_day === 4) && (h.hd_dw === 5)) holyday = 17;
            else if ((h.hd_day === 6) && (h.hd_dw === 3)) holyday = 17;
            else if ((h.hd_day === 5) && (h.hd_dw !== 6 && h.hd_dw !== 7 && h.hd_dw !== 2)) holyday = 17;
            else if ((h.hd_day === 2) && (h.hd_dw === 4)) holyday = 25;
            else if ((h.hd_day === 3) && (h.hd_dw === 4)) holyday = 25;
            else if ((h.hd_day === 5) && (h.hd_dw === 2)) holyday = 25;
            else if ((h.hd_day === 4) && (h.hd_dw !== 5 && h.hd_dw !== 6 && h.hd_dw !== 1)) holyday = 25;
            else holyday = 0;
        }
    }

    if (holyday === 24) { // Holocaust Remembrance Day
        if (h.gd_year < 1958) holyday = 0;
        else {
            if ((h.hd_day === 26) && (h.hd_dw !== 5)) holyday = 0;
            if ((h.hd_day === 28) && (h.hd_dw !== 2)) holyday = 0;
            if ((h.hd_day === 27) && (h.hd_dw === 6 || h.hd_dw === 1)) holyday = 0;
        }
    }

    if (holyday === 35) { // Rabin Day
        if (h.gd_year < 1997) holyday = 0;
        else {
            if ((h.hd_day === 10 || h.hd_day === 11) && (h.hd_dw !== 5)) holyday = 0;
            if ((h.hd_day === 12) && (h.hd_dw === 6 || h.hd_dw === 7)) holyday = 0;
        }
    }

    if (holyday === 36 && (h.gd_year < 2005 || (h.hd_day === 30 && h.hd_dw !== 1) || (h.hd_day === 29 && h.hd_dw === 7))) holyday = 0;

    /* Diaspora adjustment */
    if (holyday === 8 && !isDiaspora) holyday = 0;
    if (holyday === 31 && !isDiaspora) holyday = 6;
    if (holyday === 32 && !isDiaspora) holyday = 16;
    if (holyday === 30 && !isDiaspora) holyday = 0;
    if (holyday === 29 && !isDiaspora) holyday = 0;

    return holyday;
}

/**
 Return the day in the omer of the given date.
 @param {Object} h - The hdate instance.
 @returns {number} The day in the omer (1-49, or 0 if none).
*/
export function hdate_get_omer_day(h) {
    const sixteen_nissan = new Hdate();
    sixteen_nissan.set_hdate(16, 7, h.hd_year);
    let omer_day = h.hd_jd - sixteen_nissan.hd_jd + 1;
    return (omer_day > 49 || omer_day < 0) ? 0 : omer_day;
}
