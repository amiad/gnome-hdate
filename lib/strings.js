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
    const holyday = typeof h === 'object' ? h.getHolyday(isDiaspora) : h;
    const strings = [
        "", "א ר\"ה", "ב' ר\"ה", "צום גדליה", "יוה\"כ", "סוכות", "חוה\"מ סוכות",
        "הוש\"ר", "שמח\"ת", "חנוכה", "י' בטבת", "ט\"ו בשבט", "תענית אסתר",
        "פורים", "שושן פורים", "פסח", "חוה\"מ פסח", "יום העצמאות", "ל\"ג בעומר",
        "ערב שבועות", "שבועות", "צום תמוז", "ט' באב", "ט\"ו באב", "יום השואה",
        "יום הזכרון", "יום י-ם", "שמיני עצרת", "ז' פסח", "אחרון של פסח",
        "ב' שבועות", "ב' סוכות", "ב' פסח", "יום המשפחה", "יום זכרון...",
        "יום הזכרון ליצחק רבין", "יום ז\'בוטינסקי", "עיוה\"כ"
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
        "אדר א",    // 13 (Leap year)
        "אדר ב"     // 14 (Leap year)
    ];
    return months[mon] || "";
}
