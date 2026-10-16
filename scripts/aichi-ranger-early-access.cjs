'use strict';

const fs = require('node:fs');
const path = require('node:path');

/** @param {number} n @param {number} k @returns {number} */
function choose(n, k) {
  if (!Number.isInteger(n) || !Number.isInteger(k) || k < 0 || k > n) return 0;
  let value = 1;
  for (let i = 1; i <= Math.min(k, n - k); i += 1) {
    value *= (n - i + 1) / i;
  }
  return Math.round(value);
}

/**
 * Exact finite-population opportunity to draw Ranger or search it using
 * Lele from the hand, accounting for the starting Active and six Prizes.
 * @param {{size:number,basics:number,lele:number,ranger:number,
 *   opening?:number,draws?:number,prizes?:number}} input
 */
function rangerEarlyAccess(input) {
  const {size, basics, lele, ranger, opening = 7, draws = 2, prizes = 6} = input;
  if (![size, basics, lele, ranger, opening, draws, prizes].every(Number.isInteger) ||
      size < 1 || basics < 1 || lele < 0 || ranger < 0 || lele > basics ||
      basics + ranger > size || opening < 1 || draws < 0 || prizes < 0 ||
      opening + draws + prizes > size) {
    throw new Error('Invalid finite deck composition or sampling window.');
  }
  const counts = [lele, ranger, basics - lele, size - basics - ranger];
  const totalOpening = choose(size, opening);
  const validOpening = 1 - choose(size - basics, opening) / totalOpening;
  const drawDenom = choose(size - opening, draws);
  let direct = 0;
  let wonderTag = 0;
