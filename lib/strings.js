/* libhdate - Hebrew calendar library
 * GJS/ESM Version
 */

/**
 * Return string of hebrew parasha.
 * @param {Object|number} h - Hdate object or parasha index
 * @returns {string}
 */
export function hdate_get_parasha_name(h) {
    const reading = typeof h === 'object' ? h.getParasha(false) : h;
    const strings = [
        "", "בראשית", "נח", "לך לך", "וירא", "חיי שרה", "תולדות", "ויצא", "וישלח",
        "וישב", "מקץ", "ויגש", "ויחי", "שמות", "וארא", "בא", "בשלח", "יתרו",
        "משפטים", "תרומה", "תצוה", "כי תשא", "ויקהל", "פקודי", "ויקרא", "צו",
        "שמיני", "תזריע", "מצורע", "אחרי מות", "קדושים", "אמור", "בהר", "בחוקתי",
        "במדבר", "נשא", "בהעלתך", "שלח", "קרח", "חקת", "בלק", "פנחס", "מטות",
        "מסעי", "דברים", "ואתחנן", "עקב", "ראה", "שופטים", "כי תצא", "כי תבוא",
        "נצבים", "וילך", "האזינו", "וזאת הברכה",
        "ויקהל-פקודי", "תזריע-מצורע", "אחרי מות-קדושים", "בהר-בחוקתי", "חוקת-בלק",
        "מטות מסעי", "נצבים-וילך"
    ];
    return strings[reading] || "";
}

/**
 * Return string of hebrew holydays.
 * @param {Object|number} h - Hdate object or holyday index
 * @param {boolean} isDiaspora
 * @returns {string}
 */
export function hdate_get_holyday_name(h, isDiaspora = false) {
    const holyday = typeof h === 'object' ? h.get_holyday(isDiaspora) : h;
    const strings = [
        "",                             // 0
        "א׳ ראש השנה",                  // 1
        "ב׳ ראש השנה",                  // 2
        "צום גדליה",                    // 3
        "יום הכיפורים",                 // 4
        "סוכות",                        // 5
        "חול המועד סוכות",              // 6
        "הושענא רבה",                   // 7
        "שמחת תורה",                    // 8
        "חנוכה",                        // 9
        "עשרה בטבת",                    // 10
        "ט״ו בשבט",                     // 11
        "תענית אסתר",                   // 12
        "פורים",                        // 13
        "שושן פורים",                   // 14
        "פסח",                          // 15
        "חול המועד פסח",                // 16
        "יום העצמאות",                  // 17
        "ל״ג בעומר",                    // 18
        "ערב שבועות",                   // 19
        "שבועות",                       // 20
        "שבעה עשר בתמוז",               // 21
        "תשעה באב",                     // 22
        "ט״ו באב",                      // 23
        "יום השואה",                    // 24
        "יום הזיכרון לחללי מערכות ישראל", // 25
        "יום ירושלים",                  // 26
        "שמיני עצרת",                   // 27
        "שביעי של פסח",                 // 28
        "אחרון של פסח",                 // 29
        "ב׳ שבועות",                    // 30
        "ב׳ סוכות",                     // 31
        "ב׳ פסח",                       // 32
        "יום המשפחה",                   // 33
        "",                             // 34 - Not in use in this version
        "יום הזיכרון ליצחק רבין",       // 35
        "יום ז׳בוטינסקי",               // 36
        "ערב יום הכיפורים"               // 37
    ];
    return strings[holyday] || "";
}

/**
 * Return string of hebrew month.
 * @param {number} mon - month index
 * @returns {string}
 */
export function hdate_get_hebrew_month_name(mon) {
    const months = [
        "",         // 0
        "תשרי",     // 1
        "חשון",     // 2
        "כסלו",     // 3
        "טבת",      // 4
        "שבט",      // 5
        "אדר",      // 6 (Plain year)
        "ניסן",     // 7
        "אייר",     // 8
        "סיון",     // 9
        "תמוז",     // 10
        "אב",       // 11
        "אלול",     // 12
        "אדר א׳",    // 13 (Leap year)
        "אדר ב׳"     // 14 (Leap year)
    ];
    return months[mon] || "";
}
