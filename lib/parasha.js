/* libhdate - Hebrew calendar library
 * Copyright (C) 2015 Yaacov Zamir <kobi.zamir@gmail.com>
 * GJS/ESM Version
 */

import { Hdate } from './julian.js';

/**
 Return number of hebrew parasha on next shabbat.
 @param {Object} h - The hdate instance.
 @param {boolean} isDiaspora - if True give diaspora readings.
 @returns {number} the parasha index.
*/
export function hdate_get_shabbats_parasha(h, isDiaspora = false) {
    const next_shabbat = new Hdate();
    /* set the julian for next shabbat (hd_dw: 1=Sun, 7=Sat) */
    next_shabbat.set_jd(h.hd_jd + 7 - h.hd_dw);
    return hdate_get_parasha(next_shabbat, isDiaspora);
}

/**
 Return number of hebrew parasha.
 Yaacov Zamir 2003-2005, reading tables by Zvi Har'El
 @param {Object} h - The hdate instance.
 @param {boolean} isDiaspora - if True give diaspora readings.
 @returns {number} index (1: Bereshit, 54: Vezot Habracha, 55-61: Joined).
*/
export function hdate_get_parasha(h, isDiaspora = false) {
    const join_flags = [
        [ // Israel
            [1, 1, 1, 1, 0, 1, 1], [1, 1, 1, 1, 0, 1, 0], [1, 1, 1, 1, 0, 1, 1],
            [1, 1, 1, 0, 0, 1, 0], [1, 1, 1, 1, 0, 1, 1], [0, 1, 1, 1, 0, 1, 0],
            [1, 1, 1, 1, 0, 1, 1], [0, 0, 0, 0, 0, 1, 1], [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 1, 1], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 1], [0, 0, 0, 0, 0, 1, 1]
        ],
        [ // Diaspora
            [1, 1, 1, 1, 0, 1, 1], [1, 1, 1, 1, 0, 1, 0], [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 0, 1, 0], [1, 1, 1, 1, 1, 1, 1], [0, 1, 1, 1, 0, 1, 0],
            [1, 1, 1, 1, 0, 1, 1], [0, 0, 0, 0, 1, 1, 1], [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 1, 1], [0, 0, 0, 0, 0, 1, 0], [0, 0, 0, 0, 0, 1, 0],
            [0, 0, 0, 0, 0, 0, 1], [0, 0, 0, 0, 1, 1, 1]
        ]
    ];

    const diasporaIndex = isDiaspora ? 1 : 0;

    // Simhat Tora
    if (h.hd_mon === 1) {
        if (h.hd_day === 22 && !isDiaspora) return 54;
        if (h.hd_day === 23 && isDiaspora) return 54;
    }

    if (h.hd_dw !== 7) return 0;

    let reading = 0;
    switch (h.hd_weeks) {
        case 1:
            if (h.hd_new_year_dw === 7) return 0; // Rosh Hashana
            return (h.hd_new_year_dw === 2 || h.hd_new_year_dw === 3) ? 52 : 53;
        case 2:
            return (h.hd_new_year_dw === 5) ? 0 : 53; // Yom Kippur
        case 3:
            return 0; // Succot
        case 4:
            if (h.hd_new_year_dw === 7) return !isDiaspora ? 54 : 0;
            return 1;
        default:
            reading = h.hd_weeks - 3;
            if (h.hd_new_year_dw === 7) reading--;

            if (reading < 22) return reading;

            // Pesach adjustments
            if (h.hd_mon === 7 && h.hd_day > 14) {
                if (isDiaspora && h.hd_day <= 22) return 0;
                if (!isDiaspora && h.hd_day < 22) return 0;
            }

            if ((h.hd_mon === 7 && h.hd_day > 21) || (h.hd_mon > 7 && h.hd_mon < 13)) {
                reading--;
                if (isDiaspora && ((h.hd_new_year_dw + h.hd_size_of_year) % 7 === 2)) reading--;
            }

            // Shavuot diaspora adjustment
            if (isDiaspora && (h.hd_mon < 13) && 
                (h.hd_mon > 9 || (h.hd_mon === 9 && h.hd_day >= 7)) && 
                ((h.hd_new_year_dw + h.hd_size_of_year) % 7 === 0)) {
                if (h.hd_mon === 9 && h.hd_day === 7) return 0;
                reading--;
            }

            // Joining logic using flags
            const yearType = h.hd_year_type - 1;
            const currentFlags = join_flags[diasporaIndex][yearType];

            const joinRules = [
                { limit: 22, code: 55 }, // Vayakhel-Pekudei
                { limit: 27, code: 56 }, // Tazria-Metzora
                { limit: 29, code: 57 }, // Acharei Mot-Kedoshim
                { limit: 32, code: 58 }, // Behar-Bechukotai
                { limit: 39, code: 59 }, // Chukat-Balak
                { limit: 42, code: 60 }, // Matot-Masei
                { limit: 51, code: 61 }  // Nitzavim-Vayeilech
            ];

            for (let i = 0; i < joinRules.length; i++) {
                if (currentFlags[i] && reading >= joinRules[i].limit) {
                    if (reading === joinRules[i].limit) return joinRules[i].code;
                    reading++;
                }
            }
            break;
    }
    return reading;
}