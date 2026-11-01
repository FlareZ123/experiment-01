'use strict';

/** Strictly passive first-player second-own-turn hand-access envelope. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {choose, classify} = require('./agent15-rank31-roxie-firstdraw.cjs');
const KEYS = ['koffing', 'eligibleBasic', 'otherBasic', 'eligibleEvolution', 'roxie', 'other'];

/**
 * @param {number[]} inventory Source 60 partition in KEYS order.
 * @param {(opening:number[], multiplicity:bigint)=>void} fn Callback per valid opening.
 */
function openings(inventory, fn) {
  const selected = new Array(KEYS.length).fill(0);
  /** @param {number} i @param {number} missing @param {bigint} count */
  function visit(i, missing, count) {
    if (i === KEYS.length) {
      if (missing === 0 && selected[0] + selected[1] + selected[2] > 0) fn([...selected], count);
      return;
    }
    for (let n = 0; n <= Math.min(inventory[i], missing); n++) {
      selected[i] = n;
      visit(i + 1, missing - n, count * choose(inventory[i], n));
    }
  }
  visit(0, 7, 1n);
}

/** @param {Record<string,number>} source */
function twoDraws(source) {
  const counts = KEYS.map(k => source[k]);
  assert.equal(counts.reduce((sum, n) => sum + n, 0), 60);
  let validSeven = 0n;
  const totals = {roxieHeld:0n, paidOne:0n, paidTwo:0n, koffingRoxie:0n, koffingPlusSecond:0n};
  openings(counts, (x, openingCount) => {
    validSeven += openingCount;
    const heldK = x[0] - Number(x[1] + x[2] === 0);
    const eligible = x[0] + x[1] + x[3] - Number(x[2] === 0);
    for (let first = 0; first < KEYS.length; first++) {
      const firstRemaining = counts[first] - x[first];
      if (firstRemaining === 0) continue;
      for (let second = 0; second < KEYS.length; second++) {
        const secondRemaining = counts[second] - x[second] - Number(first === second);
        if (secondRemaining === 0) continue;
        const weight = openingCount * BigInt(firstRemaining) * BigInt(secondRemaining);
        const r = x[4] + Number(first === 4) + Number(second === 4);
        if (r === 0) continue;
        const k = heldK + Number(first === 0) + Number(second === 0);
        const eligibleCards = eligible + Number([0,1,3].includes(first)) + Number([0,1,3].includes(second));
        totals.roxieHeld += weight;
        if (eligibleCards > 0) totals.paidOne += weight;
        if (eligibleCards >= 2) totals.paidTwo += weight;
        if (k > 0) totals.koffingRoxie += weight;
        if (k > 0 && eligibleCards >= 2) totals.koffingPlusSecond += weight;
      }
    }
  });
  const denominator = validSeven * 53n * 52n;
  return Object.fromEntries(Object.entries(totals).map(([name, num]) =>
    [name, {numerator:num.toString(), denominator:denominator.toString(),
      percent:Number(num)/Number(denominator)*100}]));
}

function main() {
  const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'..','results','aichi-2026','full-decklists.json'),'utf8'));
  const deck=manifest.decks.find(d=>d.rank===31);
  assert(deck,'Missing authenticated original rank31');
  console.log(JSON.stringify({rank:31,scenario:'two natural draws, no voluntary plays',
    conservative:twoDraws(classify(deck)), modernExEligible:twoDraws(classify(deck,{includeModernEx:true}))},null,2));
}

if(require.main===module)main();
module.exports={twoDraws};
