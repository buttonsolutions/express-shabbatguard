import { CandleLightingEvent, HavdalahEvent, HDate, HebrewCalendar, Location } from '@hebcal/core';
import createIntervalTree from "interval-tree-1d";

// supported locations: https://github.com/hebcal/hebcal-es6/blob/main/src/location.ts
export const supportedLocations = {
    Ashdod: 'Ashdod',
    Atlanta: 'Atlanta',
    Austin: 'Austin',
    Baghdad: 'Baghdad',
    Beer_Sheva: 'Beer Sheva',
    Berlin: 'Berlin',
    Baltimore: 'Baltimore',
    Bogota: 'Bogota',
    Boston: 'Boston',
    Budapest: 'Budapest',
    Buenos_Aires: 'Buenos Aires',
    Buffalo: 'Buffalo',
    Chicago: 'Chicago',
    Cincinnati: 'Cincinnati',
    Cleveland: 'Cleveland',
    Dallas: 'Dallas',
    Denver: 'Denver',
    Detroit: 'Detroit',
    Eilat: 'Eilat',
    Gibraltar: 'Gibraltar',
    Haifa: 'Haifa',
    Hawaii: 'Hawaii',
    Helsinki: 'Helsinki',
    Houston: 'Houston',
    Jerusalem: 'Jerusalem',
    Johannesburg: 'Johannesburg',
    Kiev: 'Kiev',
    La_Paz: 'La Paz',
    Livingston: 'Livingston',
    Las_Vegas: 'Las Vegas',
    London: 'London',
    Los_Angeles: 'Los Angeles',
    Marseilles: 'Marseilles',
    Miami: 'Miami',
    Minneapolis: 'Minneapolis',
    Melbourne: 'Melbourne',
    Mexico_City: 'Mexico City',
    Montreal: 'Montreal',
    Moscow: 'Moscow',
    New_York: 'New York',
    Omaha: 'Omaha',
    Ottawa: 'Ottawa',
    Panama_City: 'Panama City',
    Paris: 'Paris',
    Pawtucket: 'Pawtucket',
    Petach_Tikvah: 'Petach Tikvah',
    Philadelphia: 'Philadelphia',
    Phoenix: 'Phoenix',
    Pittsburgh: 'Pittsburgh',
    Providence: 'Providence',
    Portland: 'Portland',
    Saint_Louis: 'Saint Louis',
    Saint_Petersburg: 'Saint Petersburg',
    San_Diego: 'San Diego',
    San_Francisco: 'San Francisco',
    Sao_Paulo: 'Sao Paulo',
    Seattle: 'Seattle',
    Sydney: 'Sydney',
    Tel_Aviv: 'Tel Aviv',
    Tiberias: 'Tiberias',
    Toronto: 'Toronto',
    Vancouver: 'Vancouver',
    White_Plains: 'White Plains',
    Washington_DC: 'Washington DC',
    Worcester: 'Worcester',
};

const manualLookupGeo = {
    Jerusalem: 281184,
    'Tel Aviv': 293397,
}

class CandleLighting {
    constructor() {
        this.lighting = null;
        this.havdalah = null;
    }
}

class TimeIntervalTree {
    constructor() {
        this.intervals = [];
        this.tree = null;
    }

    add({ lighting, havdalah }) {
        this.intervals.push([lighting.getTime(), havdalah.getTime()]);
    }

    build() {
        this.tree = createIntervalTree(this.intervals);
    }

    search(time) {
        if (!this.tree) {
            return []; // safely fail
        }

        let convertedTime = time.getTime();
        let values = [];
        this.tree.queryPoint(convertedTime, function (interval) {
            values.push(interval);
        });

        return values;
    }
}

const timeTree = new TimeIntervalTree();

export function isHebrewDateForbidden(date) {
    const currentTime = new Date(date.toUTCString());
    const result = timeTree.search(currentTime);
    if (result && result.length > 0) {
        return true;
    }

    return false;
}

/**
 * Adds time to a date. Modelled after MySQL DATE_ADD function.
 * Example: dateAdd(new Date(), 'minute', 30)  //returns 30 minutes from now.
 * https://stackoverflow.com/a/1214753/18511
 * 
 * @param date  Date to start with
 * @param interval  One of: year, quarter, month, week, day, hour, minute, second
 * @param units  Number of units of the given interval to add.
 */
function dateAdd(date, interval, units) {
    if (!(date instanceof Date))
        return undefined;
    var ret = new Date(date); //don't change original date
    var checkRollover = function () { if (ret.getDate() != date.getDate()) ret.setDate(0); };
    switch (String(interval).toLowerCase()) {
        case 'year': ret.setFullYear(ret.getFullYear() + units); checkRollover(); break;
        case 'quarter': ret.setMonth(ret.getMonth() + 3 * units); checkRollover(); break;
        case 'month': ret.setMonth(ret.getMonth() + units); checkRollover(); break;
        case 'week': ret.setDate(ret.getDate() + 7 * units); break;
        case 'day': ret.setDate(ret.getDate() + units); break;
        case 'hour': ret.setTime(ret.getTime() + units * 3600000); break;
        case 'minute': ret.setTime(ret.getTime() + units * 60000); break;
        case 'second': ret.setTime(ret.getTime() + units * 1000); break;
        default: ret = undefined; break;
    }
    return ret;
}

export async function initTree(locations) {
    locations = locations || [];

    locations.push(supportedLocations.Jerusalem);
    locations.push(supportedLocations.Tel_Aviv);

    for (const location of new Set(locations)) {
        const geonameId = manualLookupGeo[location];
        if (!geonameId) {
            continue;
        }

        const url = `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=on&nx=on&year=now&month=x&ss=on&mf=on&c=on&geo=geoname&geonameid=${geonameId}&M=on&s=on`;
        const result = await fetch(url).then(resp => resp.json());

        let lastCandleLighting = new CandleLighting();
        for (const item of result.items) {
            let gregDate = new Date(item.date);
            if (item.category == "havdalah") {
                // we need to add 10 minutes or so to this for safety
                lastCandleLighting.havdalah = dateAdd(gregDate, 'minute', 10);
                console.log(`adding: ${JSON.stringify(lastCandleLighting)}`);
                timeTree.add(lastCandleLighting);
                lastCandleLighting = new CandleLighting();
            } else if (item.category == "candles") {
                lastCandleLighting.lighting = gregDate;
            }
        }
    }

    timeTree.build();
}

export function shabbatGuard(locations) {
    initTree(locations); // should not take long
    console.log('|shabbatGuard| enabled');
    return (function (req, res, next) {
        const currentDate = new Date();
        if (isHebrewDateForbidden(currentDate)) {
            console.log(`|shabbatGuard| forbidden: ${currentDate}`);
            res.status(500).send('shabbat hayom!')
        }
        next();
    });
}

