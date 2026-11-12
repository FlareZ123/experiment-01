'use strict';

const VERSION = 'agent27-owner-turn-tracker-v1';

/** @param {any} snapshot */
function validSnapshot(snapshot) {
  return Number.isSafeInteger(snapshot?.turn) && snapshot.turn >= 0 &&
    (snapshot.activePlayer === 0 || snapshot.activePlayer === 1);
}

/**
 * Derive completed turns and the starting seat from consecutive native Store
 * snapshots. Call start() once after the initial active player is established,
 * then observe() after every Store.dispatch. A turn-number increment credits
 * the previously active physical seat; this deliberately handles a same-seat
 * extra turn as a completed turn for that seat. Any discontinuity fails
 * closed and makes all derived facts unavailable.
 *
 * This helper validates only the snapshot sequence. The assumption that a
 * Store turn increment marks completion of the previous active seat must be
 * checked against the pinned engine before production integration.
 */
function createOwnerTurnTracker() {
  let started = false;
  let valid = false;
  let invalidReason = 'not-started';
  let firstPlayerSeat = null;
  let lastTurn = null;
  let lastSeat = null;
  let transitions = 0;
  const completed = [0, 0];

  function snapshot() {
    return Object.freeze({
      version: VERSION,
      started,
      valid,
      invalidReason,
      firstPlayerSeat,
      lastTurn,
      lastSeat,
      transitions,
      completedTurnsBySeat: Object.freeze([...completed])
    });
  }

  function invalidate(reason) {
    valid = false;
    invalidReason = reason;
    return snapshot();
  }

  function start(initial) {
    if (started) return invalidate('already-started');
    started = true;
    if (!validSnapshot(initial)) return invalidate('invalid-start-snapshot');
    valid = true;
    invalidReason = null;
    firstPlayerSeat = initial.activePlayer;
    lastTurn = initial.turn;
    lastSeat = initial.activePlayer;
    return snapshot();
  }

  function observe(current) {
    if (!started) return invalidate('not-started');
    if (!valid) return snapshot();
    if (!validSnapshot(current)) return invalidate('invalid-observation');

    const delta = current.turn - lastTurn;
    if (delta === 0) {
      if (current.activePlayer !== lastSeat)
        return invalidate('seat-changed-without-turn-increment');
      return snapshot();
    }
    if (delta !== 1)
      return invalidate(delta < 0 ? 'turn-decreased' : 'non-unit-turn-increment');

    completed[lastSeat] += 1;
    transitions += 1;
    lastTurn = current.turn;
    lastSeat = current.activePlayer;
    return snapshot();
  }

  function validSeat(seat) {
    return seat === 0 || seat === 1;
  }

  function countFor(seat) {
    return valid && validSeat(seat) ? completed[seat] : null;
  }

  function wentSecond(seat) {
    return valid && validSeat(seat) ? seat !== firstPlayerSeat : null;
  }

  function isFirstTurn(seat) {
    const count = countFor(seat);
    return count === null ? null : count === 0;
  }

  function isSecondPlayerFirstTurn(seat) {
    const second = wentSecond(seat);
    const first = isFirstTurn(seat);
    return second === null || first === null ? null : second && first;
  }

  return Object.freeze({
    start,
    observe,
    snapshot,
    countFor,
    wentSecond,
    isFirstTurn,
    isSecondPlayerFirstTurn
  });
}

module.exports = { VERSION, validSnapshot, createOwnerTurnTracker };
