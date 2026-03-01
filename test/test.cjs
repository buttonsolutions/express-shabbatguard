const assert = require('node:assert/strict');
const { describe } = require('node:test');
const { isHebrewDateForbidden, initTree } = require('..');

initTree(['San Fransisco']);

describe('definitely shabbat', () => {
    const dateToTest = new Date('2026-01-04T01:45:00.000Z');
    assert.equal(true, isHebrewDateForbidden(dateToTest))
})

describe('definitely not shabbat', () => {
    const dateToTest = new Date('2026-01-04T01:47:00.000Z');
    assert.equal(false, isHebrewDateForbidden(dateToTest))
})

describe('definitely shabbat: havdalah timezone defaults', () => {
    // jerusalem
    const dateToTest = new Date("2026-08-02T04:02:00.000Z");
    assert.equal(true, isHebrewDateForbidden(dateToTest))

    const dateToTestSan = new Date("2026-08-01T17:15:00.000Z");
    assert.equal(true, isHebrewDateForbidden(dateToTestSan))
})

describe('definitely shabbat: candle-lighting timezone defaults', () => {
    // jerusalem
    const dateToTest = new Date("2026-07-31T15:56:00.000Z");
    assert.equal(true, isHebrewDateForbidden(dateToTest))

    const dateToTestSan = new Date("2026-08-01T03:01:00.000Z");
    assert.equal(true, isHebrewDateForbidden(dateToTestSan))
})

describe('definitely not shabbat: candle-lighting timezone defaults', () => {
    // jerusalem
    const dateToTest = new Date("2026-07-31T15:55:00.000Z");
    assert.equal(false, isHebrewDateForbidden(dateToTest))

    const dateToTestSan = new Date("2026-08-01T03:00:00.000Z");
    assert.equal(true, isHebrewDateForbidden(dateToTestSan))
})