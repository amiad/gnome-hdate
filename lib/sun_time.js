/* libhdate - Hebrew calendar library
 * Copyright (C) 2015 Yaacov Zamir <kobi.zamir@gmail.com>
 * GJS/ESM Version
 */

/**
 * Calculate days from 1 January.
 * @param {Object} h - The Hdate object.
 * @returns {number} Days from Jan 1.
 */
function hdate_get_day_of_year(h) {
    const { gd_day: day, gd_mon: month, gd_year: year } = h;
    
    // Get today's Julian day number
    let jd = Math.floor((1461 * (year + 4800 + Math.floor((month - 14) / 12))) / 4) +
             Math.floor((367 * (month - 2 - 12 * Math.floor((month - 14) / 12))) / 12) -
             Math.floor((3 * (Math.floor((year + 4900 + Math.floor((month - 14) / 12)) / 100))) / 4) + day;
    
    // Subtract the Julian day of 1/1/year and add one
    jd -= (Math.floor((1461 * (year + 4799)) / 4) +
           Math.floor(367 * 11 / 12) -
           Math.floor(Math.floor((3 * ((year + 4899) / 100))) / 4));
    
    return jd;
}

/**
 * UTC sun times for specific altitude.
 * Returns [sunrise, sunset] in minutes from 00:00 UTC.
 * @param {Object} h - The Hdate object.
 * @param {number} latitude - Latitude.
 * @param {number} longitude - Longitude.
 * @param {number} deg - Sun's altitude (90.833 is official sunrise/set).
 */
export function hdate_get_utc_sun_time_deg(h, latitude, longitude, deg) {
    const M_PI = Math.PI;
    const sunrise_angle = M_PI * deg / 180.0;
    const day_of_year = hdate_get_day_of_year(h);

    // Gama: location of sun in yearly cycle in radians
    const gama = 2.0 * M_PI * ((day_of_year - 1) / 365.0);

    // Equation of time (diff between solar noon and clock noon)
    const eqtime = 229.18 * (0.000075 + 0.001868 * Math.cos(gama)
        - 0.032077 * Math.sin(gama) - 0.014615 * Math.cos(2.0 * gama)
        - 0.040849 * Math.sin(2.0 * gama));

    // Sun declination
    const decl = 0.006918 - 0.399912 * Math.cos(gama) + 0.070257 * Math.sin(gama)
        - 0.006758 * Math.cos(2.0 * gama) + 0.000907 * Math.sin(2.0 * gama)
        - 0.002697 * Math.cos(3.0 * gama) + 0.0148 * Math.sin(3.0 * gama);

    const radLat = M_PI * latitude / 180.0;

    // Solar hour angle (ha)
    const cosHA = Math.cos(sunrise_angle) / (Math.cos(radLat) * Math.cos(decl)) - Math.tan(radLat) * Math.tan(decl);
    
    // Check if sun never reaches this altitude
    if (cosHA > 1 || cosHA < -1) return [-1, -1];

    let ha = Math.acos(cosHA);
    ha = 720.0 * ha / M_PI; // Convert to minutes

    const sunrise = Math.floor(720.0 - 4.0 * longitude - ha - eqtime);
    const sunset = Math.floor(720.0 - 4.0 * longitude + ha - eqtime);

    return [sunrise, sunset];
}

/**
 * Full UTC sun times (Alot HaShachar, Sunrise, Zmanit, etc.)
 * @returns {Array} [sun_hour, first_light, talit, sunrise, midday, sunset, first_stars, three_stars]
 */
export function hdate_get_utc_sun_time_full(h, latitude, longitude) {
    // Official sunrise and sunset (90.833 degrees)
    const [sunrise, sunset] = hdate_get_utc_sun_time_deg(h, latitude, longitude, 90.833);
    
    // Sha'a Zmanit (Gara) - 1/12 of light time
    const sun_hour = Math.floor((sunset - sunrise) / 12);
    const midday = Math.floor((sunset + sunrise) / 2);

    // Special sun angles for halachic times
    const [first_light] = hdate_get_utc_sun_time_deg(h, latitude, longitude, 106.01);
    const [talit] = hdate_get_utc_sun_time_deg(h, latitude, longitude, 101.0);
    const [, first_stars] = hdate_get_utc_sun_time_deg(h, latitude, longitude, 96.0);
    const [, three_stars] = hdate_get_utc_sun_time_deg(h, latitude, longitude, 98.5);

    return [sun_hour, first_light, talit, sunrise, midday, sunset, first_stars, three_stars];
}
