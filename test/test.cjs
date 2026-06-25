const assert = require('node:assert/strict');
const { describe, test, before } = require('node:test');
const { isHebrewDateForbidden, initTree } = require('..');

describe('tests', () => {
    before(async () => {
        await initTree();
    });
    
    // https://www.hebcal.com/hebcal?v=1&geo=geoname&i=on&m=50&year=2026&c=on&s=on&maj=on&min=on&mod=on&mf=on&ss=on&nx=on&geonameid=293397&b=18
    test('definitely shabbat', () => {
        // Havdalah on this day (Vayechi) Jerusalem time is 17:39 - 3hrs
        // wow I don't understand this at all, why this is later
        assert.equal(true, isHebrewDateForbidden(new Date('2026-01-03T14:38:00.000Z')));
        assert.equal(true, isHebrewDateForbidden(new Date('2026-01-03T15:38:00.000Z')));
        assert.equal(false, isHebrewDateForbidden(new Date('2026-01-03T15:40:00.000Z')));
    })

    test('definitely not shabbat', () => {
        assert.equal(false, isHebrewDateForbidden(new Date('2026-01-04T01:47:00.000Z')));
    })

    test('definitely shabbat: havdalah timezone defaults', () => {
        // jerusalem - Havdalah at 20:28 - 3 hrs
        assert.equal(true, isHebrewDateForbidden(new Date("2026-08-01T17:02:00.000Z")));
        assert.equal(false, isHebrewDateForbidden(new Date("2026-08-01T17:29:00.000Z")));

        // Tazria-Metzora - Havdalah at 20:02 - 3hrs
        assert.equal(true, isHebrewDateForbidden(new Date("2026-04-18T17:00:00.000Z")));
        assert.equal(false, isHebrewDateForbidden(new Date("2026-04-18T17:03:00.000Z")));
    })

    test('definitely shabbat: candle-lighting timezone defaults', () => {
        // jerusalem - 19:20 entry time - 3 hrs
        assert.equal(true, isHebrewDateForbidden(new Date("2026-07-31T16:20:00.000Z")));
        assert.equal(true, isHebrewDateForbidden(new Date("2026-07-31T16:21:00.000Z")));
        assert.equal(true, isHebrewDateForbidden(new Date("2026-08-01T03:01:00.000Z")));
    })

    test('definitely not shabbat: candle-lighting timezone defaults', () => {
        // jerusalem - 19:20 entry time - 3 hrs
        assert.equal(false, isHebrewDateForbidden(new Date("2026-07-31T15:54:00.000Z"))); // not sure why this doesn't work
        assert.equal(true, isHebrewDateForbidden(new Date("2026-07-31T15:56:00.000Z")));
        assert.equal(true, isHebrewDateForbidden(new Date("2026-08-01T17:00:00.000Z")));

        assert.equal(false, isHebrewDateForbidden(new Date("2026-07-31T15:55:00.000Z")));
        assert.equal(true, isHebrewDateForbidden(new Date("2026-08-01T17:00:00.000Z")));
        assert.equal(true, isHebrewDateForbidden(new Date("2026-08-01T17:25:00.000Z")));
        assert.equal(false, isHebrewDateForbidden(new Date("2026-08-01T17:30:00.000Z"))); // because of buffer
    })
})

