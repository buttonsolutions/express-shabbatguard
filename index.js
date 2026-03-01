import { CandleLightingEvent, HavdalahEvent, HebrewCalendar, Location } from '@hebcal/core';
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

export function initTree(locations) {
    locations = locations || [];

    locations.push(supportedLocations.Jerusalem);
    locations.push(supportedLocations.San_Francisco);

    for (const location of new Set(locations)) {
        const currentLocation = Location.lookup(location);
        if (!currentLocation) {
            console.error(`your location is not supported! ${location}`);
            continue;
        }
        const startTime = new Date();
        const events = HebrewCalendar.calendar({
            year: startTime.getFullYear(),
            isHebrewYear: false,
            candlelighting: true,
            location: currentLocation,
            sedrot: true,
            omer: true,
        });

        let lastCandleLighting = new CandleLighting();

        for (const ev of events) {
            const gregDate = new Date(new Date(ev.eventTime).toUTCString());
            if (ev instanceof CandleLightingEvent) {
                lastCandleLighting.lighting = gregDate;
            } else if (ev instanceof HavdalahEvent) {
                lastCandleLighting.havdalah = gregDate;
                console.log(`adding: ${JSON.stringify(lastCandleLighting)}`);
                timeTree.add(lastCandleLighting);
                lastCandleLighting = new CandleLighting();
            }
        }
    }

    timeTree.build();
}

export function shabbatGuard(locations) {
    initTree(locations);
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

