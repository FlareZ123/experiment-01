"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let r = 1n;
  for (let i = 1; i <= Math.min(k, n - k); i++) {
    r = r * BigInt(n - Math.min(k, n - k) + i) / BigInt(i);
  }
  return r;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}

/**
 * Exact direct-card opportunity for second-own-turn Apex Dragon copying a
 * singleton Noivern ex. Physical order: seven opening cards, six Prizes,
 * first normal draw, second normal draw. Prizes are marginalized exactly.
 *
 * Four simultaneous conditions, with no tutoring or extra draw:
 * 1. A valid Basic starter in seven, Regidrago V plus at least one usable
 *    Energy (Double Dragon or Basic Grass/Fire) seen by draw eight;
 * 2. Regidrago VSTAR and two usable Energy with at least one Double Dragon
 *    seen by draw nine, allowing the two manual attachments to fund GGF;
 * 3. Either Noivern + a one-discard Quick Ball/Mysterious Treasure in nine,
 *    or no Noivern seen, an observed Battle Compressor, and Noivern unprized;
 * 4. The first two turns do not suffer any opposing interference.
 *
 * The third line counts distinct physical opportunities. Searcher play,
 * discard payment, avoiding connector contention, ability/attack permission,
 * a live target, and any subsequent winning action are NOT certified.
 *
 * @param {{size?:number,opening?:number,prizes?:number,v:number,
 *  otherBasics:number,vstar:number,doubleDragon:number,basicGF:number,
 *  noivern:number,oneDiscard:number,compressor:number}} input
 * @returns {{funded:object,handDiscard:object,deckCompressor:object,
 *  fundedAndPayload:object,conditionalPayloadGivenFunded:number}}
 */
function fundedNoivernOpportunity(input) {
  const {size = 60, opening = 7, prizes = 6, v, otherBasics, vstar,
    doubleDragon, basicGF, noivern, oneDiscard, compressor} = input;
  const groups = [v, otherBasics, vstar, doubleDragon, basicGF,
    noivern, oneDiscard, compressor];
  if (![size, opening, prizes, ...groups].every(Number.isSafeInteger) ||
      opening < 1 || prizes < 0 || size <= opening + prizes + 2 ||
      groups.some(n => n < 0) || v < 1 || noivern > 1 ||
      groups.reduce((a, b) => a + b, 0) > size) {
    throw new RangeError("Invalid disjoint source-card categories or chronology");
  }
  const counts = [...groups, size - groups.reduce((a, b) => a + b, 0)];
  const basicCount = v + otherBasics;
  const validSevens = choose(size, opening) -
    choose(size - basicCount, opening);
  const unseenAfterNine = size - opening - 2;
  const unprizedAfterNine = unseenAfterNine - prizes;
  const denominator = validSevens * BigInt(size - opening) *
    BigInt(size - opening - 1) * BigInt(unseenAfterNine);
  const selected = Array(counts.length).fill(0);
  let normalization = 0n;
  let funded = 0n;
  let hand = 0n;
  let compressed = 0n;

  /** @param {number} idx @param {number} left @param {bigint} ways */
  function enumerate(idx, left, ways) {
    if (idx === counts.length) {
      if (left || selected[0] + selected[1] === 0) return;
      for (let eighth = 0; eighth < counts.length; eighth++) {
        const remainingEighth = counts[eighth] - selected[eighth];
        if (remainingEighth <= 0) continue;
        const firstV = selected[0] + Number(eighth === 0);
        const firstEnergy = selected[3] + selected[4] +
          Number(eighth === 3 || eighth === 4);
        for (let ninth = 0; ninth < counts.length; ninth++) {
          const remainingNinth = counts[ninth] - selected[ninth] -
            Number(ninth === eighth);
          if (remainingNinth <= 0) continue;
          const physicalWeight = ways * BigInt(remainingEighth) *
            BigInt(remainingNinth);
          normalization += physicalWeight * BigInt(unseenAfterNine);
          const totalVstar = selected[2] + Number(eighth === 2) +
            Number(ninth === 2);
          const totalDDE = selected[3] + Number(eighth === 3) +
            Number(ninth === 3);
          const totalGF = selected[4] + Number(eighth === 4) +
            Number(ninth === 4);
          if (!firstV || !firstEnergy || !totalVstar || !totalDDE ||
              totalDDE + totalGF < 2) continue;
          funded += physicalWeight * BigInt(unseenAfterNine);
          if (!noivern) continue;
          const observedDonor = selected[5] + Number(eighth === 5) +
            Number(ninth === 5);
          const observedSearcher = selected[6] + Number(eighth === 6) +
            Number(ninth === 6);
          const observedCompressor = selected[7] + Number(eighth === 7) +
            Number(ninth === 7);
          if (observedDonor && observedSearcher) {
            hand += physicalWeight * BigInt(unseenAfterNine);
          } else if (!observedDonor && observedCompressor) {
            compressed += physicalWeight * BigInt(unprizedAfterNine);
          }
        }
      }
      return;
    }
    for (let amount = 0; amount <= Math.min(left, counts[idx]); amount++) {
      selected[idx] = amount;
      enumerate(idx + 1, left - amount,
        ways * choose(counts[idx], amount));
    }
    selected[idx] = 0;
  }
  enumerate(0, opening, 1n);
  assert.equal(normalization, denominator,
    "Opening, draw, and Prize partition failed normalization");
  /** @param {bigint} numerator */
  const fraction = numerator => {
    const d = gcd(numerator, denominator);
    return {numerator: String(numerator / d),
      denominator: String(denominator / d),
      probability: Number(numerator) / Number(denominator),
      percent: 100 * Number(numerator) / Number(denominator)};
  };
  return {funded: fraction(funded), handDiscard: fraction(hand),
    deckCompressor: fraction(compressed),
    fundedAndPayload: fraction(hand + compressed),
    conditionalPayloadGivenFunded: funded ?
      Number(hand + compressed) / Number(funded) : 0};
}

/** @param {{decks:object[]}} manifest @param {{decks:object[]}} audit */
function noivernSourceCensus(manifest, audit) {
  assert.ok(Array.isArray(manifest?.decks) && Array.isArray(audit?.decks));
  const ranks = [10, 12, 13, 14, 18, 20, 21, 27, 32];
  const rows = ranks.map(rank => {
    const deck = manifest.decks.find(x => x.rank === rank);
    const audited = audit.decks.find(x => x.rank === rank);
    assert.ok(deck && audited && audited.unresolved_pokemon?.length === 0,
      "Missing source or Basic count for rank " + rank);
    const count = name => deck.cards.filter(c => c.name === name)
      .reduce((a, c) => a + c.count, 0);
    assert.equal(deck.cards.reduce((a, c) => a + c.count, 0), 60);
    const v = count("Regidrago V");
    const noivern = count("Noivern ex");
    const basicCount = audited.basic_count_known;
    const input = {v, otherBasics: basicCount - v,
      vstar: count("Regidrago VSTAR"),
      doubleDragon: count("Double Dragon Energy"),
      basicGF: count("Grass Energy") + count("Fire Energy"),
      noivern, oneDiscard: count("Quick Ball") +
        count("Mysterious Treasure"),
      compressor: count("Battle Compressor")};
    assert.ok(noivern === 0 || noivern === 1,
      "Unexpected Noivern multiplicity at rank " + rank);
    const measured = fundedNoivernOpportunity(input);
    return {rank, basics: basicCount, ...input, ...measured};
  });
  const active = rows.filter(r => r.noivern === 1);
  const mean = key => active.reduce((a, r) =>
    a + r[key].percent, 0) / active.length;
  return {rows, meansSevenDonorRanks:{funded:mean("funded"),
    handDiscard:mean("handDiscard"),
    deckCompressor:mean("deckCompressor"),
    fundedAndPayload:mean("fundedAndPayload")},
    interpretation:"Direct first-nine resource opportunity only; no search, live action, lock, opponent, or win inference"};
}

if (require.main === module) {
  const root = path.resolve(__dirname, "..");
  const manifest = JSON.parse(fs.readFileSync(path.join(root,
    "results/aichi-2026/full-decklists.json"), "utf8"));
  const audit = JSON.parse(fs.readFileSync(path.join(root,
    "results/aichi-2026/opening-hand-audit.json"), "utf8"));
  process.stdout.write(JSON.stringify(noivernSourceCensus(manifest, audit),
    null, 2) + "\n");
}
module.exports = {fundedNoivernOpportunity, noivernSourceCensus};
