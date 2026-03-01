import { CandleLightingEvent, HavdalahEvent, HebrewCalendar, Location } from '@hebcal/core';
import { IntervalTree } from 'node-interval-tree';

const events = HebrewCalendar.calendar({
    year: new Date().getFullYear(),
    isHebrewYear: false,
    candlelighting: true,
    location: Location.lookup('San Francisco'),
    sedrot: true,
    omer: true,
});




class CandleLighting {
    constructor() {
        this.lighting = null;
        this.havdalah = null;
    }
}

class TimeIntervalTree {
    constructor() {
        this.tree = new IntervalTree();
    }

    add({ lighting, havdalah }) {
        console.log(lighting, havdalah);
        this.tree.insert({ low: lighting.getTime(), high: havdalah.getTime() });
    }

    search(time) {
        return this.tree.search({
            low: time,
            high: time,
        });
    }
}

const timeTree = new TimeIntervalTree();

let lastCandleLighting = new CandleLighting();


for (const ev of events) {
    const gregDate = new Date(new Date(ev.eventTime).toUTCString());
    if (ev instanceof CandleLightingEvent) {
        lastCandleLighting.lighting = gregDate;
    } else if (ev instanceof HavdalahEvent) {
        lastCandleLighting.havdalah = gregDate;
        timeTree.add(lastCandleLighting);
        lastCandleLighting = new CandleLighting();
    }
}

export function isHebrewDateForbidden(date) {
    const currentTime = new Date(new Date().toUTCString());
    if (timeTree.search(currentTime)) {
        return true;
    }

    return false;
}

export function shabbatGuard() {
    return (function (req, res, next) {
        if (isDateForbidden(new Date())) {
            res.status(500).send('shabbat hayom!')
        }
    });
}

