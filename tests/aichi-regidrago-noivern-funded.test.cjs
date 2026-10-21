"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {fundedNoivernOpportunity, noivernSourceCensus} =
  require("../scripts/aichi-regidrago-noivern-funded.cjs");

/**
 * An independent ordered physical-deal enumerator. The initial Basic-valid
 * opener is followed by inaccessible Prize identities and two real draws.
 * This never invokes the category-state BigInt implementation.
 * @param {string[]} deck Physical slots, one category letter per card
 * @param {number} opening
 * @param {number} prizes
 */
function brutePhysicalDeal(deck, opening, prizes) {
  let opportunities = 0;
  let direct = 0;
  let compressed = 0;
  let funded = 0;
  let dual = 0;
  let valid = 0;
  const depths = opening + prizes + 2;
  /** @param {string[]} seen @param {number[]} remaining */
  function visit(seen, remaining) {
    if (seen.length < depths) {
      for (let k = 0; k < remaining.length; k++) {
        const n = remaining[k];
        visit([...seen, deck[n]],
          [...remaining.slice(0, k), ...remaining.slice(k + 1)]);
      }
      return;
    }
    const opener = seen.slice(0, opening);
    if (!opener.some(x => x === "V" || x === "B")) return;
    valid++;
    const firstEight = opener.concat(seen[opening + prizes]);
    const observed = firstEight.concat(seen[opening + prizes + 1]);
    const times = (list, tag) => list.filter(x => x === tag).length;
    const powered = times(firstEight, "V") > 0 &&
      times(firstEight, "D") + times(firstEight, "G") > 0 &&
      times(observed, "R") > 0 && times(observed, "D") > 0 &&
      times(observed, "D") + times(observed, "G") >= 2;
    const dualAllowed = times(firstEight, "V") === 0 &&
      times(firstEight, "N") > 0 && times(firstEight, "S") > 0 &&
      times(firstEight, "D") + times(firstEight, "G") > 0 &&
      times(observed, "R") > 0 && times(observed, "D") > 0 &&
      times(observed, "D") + times(observed, "G") >= 2 &&
      (seen[opening + prizes + 1] === "V" ||
        remaining.some(i => deck[i] === "V"));
    if (dualAllowed) dual++;
    if (!powered) return;
    funded++;
    const hand = observed.includes("N") && observed.includes("S");
    const deckDonor = !observed.includes("N") &&
      !seen.slice(opening, opening + prizes).includes("N") &&
      remaining.some(i => deck[i] === "N");
    const comp = deckDonor && observed.includes("C");
    if (hand) direct++;
    else if (comp) compressed++;
    if (hand || comp) opportunities++;
  }
  visit([], deck.map((_, i) => i));
  return {funded: funded / valid, hand: direct / valid,
    comp: compressed / valid, union: opportunities / valid,
    dual: dual / valid, expanded: (opportunities + dual) / valid};
}

/** @param {string[]} cards @param {number} opening @param {number} prizes */
function evaluateToy(cards, opening, prizes) {
  const count = tag => cards.filter(x => x === tag).length;
  return fundedNoivernOpportunity({size: cards.length, opening, prizes,
    v: count("V"), otherBasics: count("B"), vstar: count("R"),
    doubleDragon: count("D"), basicGF: count("G"),
    noivern: count("N"), oneDiscard: count("S"),
    compressor: count("C")});
}

test("physical Prize placements and all funded Noivern routes match enumeration", () => {
  for (const cards of [
    ["V", "B", "R", "D", "G", "N", "S", "X"],
    ["V", "B", "R", "D", "G", "N", "C", "X"],
    ["V", "B", "R", "D", "G", "N", "S", "C", "X"],
    ["V", "B", "R", "D", "G", "S", "C", "X"]
  ]) {
    const model = evaluateToy(cards, 4, 1);
    const actual = brutePhysicalDeal(cards, 4, 1);
    for (const [modelField, actualField] of [
      ["funded", "funded"], ["handDiscard", "hand"],
      ["deckCompressor", "comp"], ["fundedAndPayload", "union"],
      ["dualSearcherFetchV", "dual"], ["expandedJoint", "expanded"]]) {
      assert.ok(Math.abs(model[modelField].probability -
        actual[actualField]) < 1e-12,
      modelField + " failed for " + cards.join(""));
    }
  }
});

test("source-independent exact rank-10 funded envelope and controls", () => {
  const reference = fundedNoivernOpportunity({v:4, otherBasics:11,
    vstar:3, doubleDragon:4, basicGF:6, noivern:0,
    oneDiscard:6, compressor:1});
  assert.equal(reference.funded.numerator, "166373119");
  assert.equal(reference.funded.denominator, "3558030450");
  assert.equal(reference.fundedAndPayload.probability, 0);
  const donor = fundedNoivernOpportunity({v:4, otherBasics:11,
    vstar:3, doubleDragon:4, basicGF:6, noivern:1,
    oneDiscard:8, compressor:0});
  assert.ok(Math.abs(donor.fundedAndPayload.percent -
    0.24314772406194726) < 1e-10);
  assert.equal(donor.deckCompressor.percent, 0);
  assert.ok(donor.fundedAndPayload.percent < donor.funded.percent);
  assert.ok(Math.abs(donor.expandedJoint.percent - 0.5628418) < 1e-6);
  assert.ok(donor.dualSearcherFetchV.percent > 0);
  assert.throws(() => fundedNoivernOpportunity({v:4,
    otherBasics:10, vstar:3, doubleDragon:4, basicGF:6,
    noivern:2, oneDiscard:8, compressor:1}), RangeError);
});

test("published source 60s and Basic audit produce seven donor controls", () => {
  const root = path.resolve(__dirname, "..");
  const manifest = JSON.parse(fs.readFileSync(path.join(root,
    "results/aichi-2026/full-decklists.json"), "utf8"));
  const audit = JSON.parse(fs.readFileSync(path.join(root,
    "results/aichi-2026/opening-hand-audit.json"), "utf8"));
  const census = noivernSourceCensus(manifest, audit);
  assert.deepEqual(census.rows.filter(r => r.noivern).map(r => r.rank),
    [12, 13, 14, 20, 21, 27, 32]);
  assert.deepEqual(census.rows.map(r => r.basics),
    [15, 15, 11, 14, 16, 14, 14, 15, 13]);
  assert.deepEqual(census.rows.map(r => r.doubleDragon),
    [4, 4, 3, 4, 4, 4, 3, 4, 4]);
  assert.ok(Math.abs(census.rows.find(r => r.rank === 13)
    .fundedAndPayload.percent - 0.8553501) < 1e-6);
  assert.ok(census.rows.filter(r => !r.noivern)
    .every(r => r.fundedAndPayload.probability === 0));
  assert.ok(census.meansSevenDonorRanks.fundedAndPayload > 0);
  assert.ok(Math.abs(census.meansSevenDonorRanks.expandedJoint -
    0.8491388897585238) < 1e-9);
});
