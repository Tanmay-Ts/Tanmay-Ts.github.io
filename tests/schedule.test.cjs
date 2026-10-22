const test = require('node:test');
const assert = require('node:assert/strict');
const life = require('../dollhouse-life.js');

test('routine changes at every IST boundary, including the midnight wrap', () => {
  const boundaries = [
    [0, 'work'], [390, 'sleep'], [780, 'wake'], [840, 'read'], [870, 'work'],
    [900, 'read'], [930, 'work'], [960, 'read'], [990, 'work'],
    [1020, 'chill'], [1140, 'prep'], [1200, 'train'], [1320, 'chillnight']
  ];
  boundaries.forEach(([minute, activity], index) => {
    const previous = boundaries[(index - 1 + boundaries.length) % boundaries.length][1];
    assert.equal(life.getRoutineState(minute - 1).activity, previous, `minute before ${minute}`);
    assert.equal(life.getRoutineState(minute).activity, activity, `at ${minute}`);
    assert.equal(life.getRoutineState(minute + 1).activity, activity, `minute after ${minute}`);
  });
  assert.equal(life.getRoutineState(1440).activity, 'work');
  assert.equal(life.getRoutineState(1439).nextMinute, 0);
  assert.equal(life.getRoutineState(1439).nextDay, true);
});

test('every minute has one contiguous segment and an accurate next transition', () => {
  for (let minute = 0; minute < 1440; minute++) {
    const state = life.getRoutineState(minute);
    assert(state.start <= minute && state.end > minute);
    assert.equal(state.nextMinute, state.end % 1440);
    assert.equal(life.getRoutineState(state.nextMinute).activity, state.nextActivity);
    assert.equal(state.scene, minute >= 1200 && minute < 1320 ? 'gym' : 'home');
    assert.equal(life.getRoutineState(minute).activity, state.activity);
  }
});

test('IST conversion is independent of the machine timezone and handles date rollover', () => {
  const midnight = life.getISTTime('2026-10-21T18:30:00.000Z');
  assert.equal(midnight.minuteOfDay, 0);
  assert.equal(midnight.timeLabel, '00:00:00 IST');
  assert.match(midnight.dateLabel, /22 Oct 2026/);
  assert.equal(life.getISTTime('2026-10-22T00:59:59.000Z').minuteOfDay, 389);
  assert.equal(life.getISTTime('2026-10-22T01:00:00.000Z').minuteOfDay, 390);
  assert.equal(life.getRoutineState(life.getISTTime('2026-10-22T14:30:00.000Z').minuteOfDay).activity, 'train');
  assert.throws(() => life.getISTTime('invalid'), TypeError);
});

test('time formatting wraps safely and rejects non-finite values', () => {
  assert.equal(life.formatMinute(0), '00:00');
  assert.equal(life.formatMinute(390), '06:30');
  assert.equal(life.formatMinute(1439), '23:59');
  assert.equal(life.formatMinute(1440), '00:00');
  assert.equal(life.formatMinute(-1), '23:59');
  assert.throws(() => life.normalizeMinute(NaN), TypeError);
  assert.throws(() => life.normalizeMinute(Infinity), TypeError);
});

test('lighting follows the illustrated routine, including daytime sleep', () => {
  assert.equal(life.lightAt(389), 'night');
  assert.equal(life.lightAt(390), 'morning');
  assert.equal(life.lightAt(779), 'morning');
  assert.equal(life.lightAt(780), 'day');
  assert.equal(life.lightAt(1020), 'sunset');
  assert.equal(life.lightAt(1200), 'night');
});

test('all twelve poses map inside the four-column, three-row sprite atlas', () => {
  const positions = new Set();
  for (let frame = 0; frame < 12; frame++) {
    const position = life.spriteCoordinates(frame);
    assert(position.x >= 0 && position.x <= 100 && position.y >= 0 && position.y <= 100);
    positions.add(`${position.x},${position.y}`);
  }
  assert.equal(positions.size, 12);
  assert.deepEqual(life.spriteCoordinates(0), { x: 0, y: 0 });
  assert.deepEqual(life.spriteCoordinates(11), { x: 100, y: 100 });
  assert.throws(() => life.spriteCoordinates(12), RangeError);
});
