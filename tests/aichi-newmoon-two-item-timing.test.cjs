"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {exactTwoItemTiming, frozenNewMoonOpportunity} =
  require("../scripts/aichi-newmoon-two-item-timing.cjs");

/**
 * Exhaust ordered physically distinguishable opening, face-down Prize, and
 * draw positions. Independent of the exact category-combination algorithm.
 * @param {string[]} physical All physical card slots represented by tags.
 * @param {number} opening @param {number} prizes
 * @param {number} firstDeadline @param {number} secondDeadline
 */
function physicalBrute(physical, opening, prizes, firstDeadline, secondDeadline) {
  const depth = opening + prizes + secondDeadline;
  assert.ok(depth <= physical.length);
  let valid = 0, first = 0, second = 0, joint = 0;
  /** @param {number[]} selected @param {number[]} remaining */
  function recurse(selected, remaining) {
    if (selected.length < depth) {
      for (let i = 0; i < remaining.length; i++) {
        recurse(selected.concat(remaining[i]),
          remaining.slice(0, i).concat(remaining.slice(i + 1)));
      }
      return;
    }
    const observedOpen = selected.slice(0, opening).map(i => physical[i]);
    if (!observedOpen.includes("B")) return;
    valid++;
    const observedDraws = selected.slice(opening + prizes)
      .map(i => physical[i]);
    const firstVisible = observedOpen.concat(observedDraws.slice(0, firstDeadline))
      .includes("F");
    const secondVisible = observedOpen.concat(observedDraws.slice(0, secondDeadline))
      .includes("R");
    if (firstVisible) first++;
    if (secondVisible) second++;
    if (firstVisible && secondVisible) joint++;
  }
  recurse([], physical.map((_, i) => i));
  return {valid, first, second, joint};
}

/** @param {{numerator:string,denominator:string}} ratio
 *  @param {number} num @param {number} den */
function assertRationalEquals(ratio, num, den) {
  assert.equal(BigInt(ratio.numerator) * BigInt(den),
    BigInt(ratio.denominator) * BigInt(num));
}

test("independent physical deal permutations include inaccessible Prize cards", () => {
  const cases = [
    ["B", "B", "F", "R", "X", "X", "X", "X"],
    ["B", "B", "F", "F", "R", "X", "X", "X"],
    ["B", "B", "B", "F", "R", "X", "X", "X"],
    ["B", "B", "F", "X", "X", "X", "X", "X"]
  ];
  for (const physical of cases) {
    const categoryCount = mark => physical.filter(c => c === mark).length;
    if (categoryCount("R") === 0) continue;
    const actual = physicalBrute(physical, 3, 1, 1, 2);
    const model = exactTwoItemTiming({size: physical.length,
      basics: categoryCount("B"), firstItem: categoryCount("F"),
      secondItem: categoryCount("R"), opening: 3, prizes: 1,
      firstDeadline: 1, secondDeadline: 2});
    for (const [ratio, count] of [
      [model.first, actual.first], [model.second, actual.second],
      [model.joint, actual.joint]
    ]) assertRationalEquals(ratio, count, actual.valid);
    console.log("physical test", physical.join(""),
      "valid", actual.valid, "joint", actual.joint);
  }
});

test("frozen New Moon exact first-two-item deadlines", () => {
  const model = exactTwoItemTiming({size:60, basics:17, firstItem:2,
    secondItem:1, opening:7, prizes:6,
    firstDeadline:1, secondDeadline:3});
  assert.equal(model.denominator, "49754407280136");
  assert.deepEqual([model.first.numerator,model.first.denominator],
    ["416435","1708349"]);
  assert.deepEqual([model.second.numerator,model.second.denominator],
    ["4725283","29041933"]);
  assert.deepEqual([model.joint.numerator,model.joint.denominator],
    ["1051495","29041933"]);
  console.log("source-parameter exact rational", model);
});

test("exact frozen 60 print/count manifest agrees with categories", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname,
    "../results/als/new-moon-lockbreak-english-proxy-60.json"), "utf8"));
  const result = frozenNewMoonOpportunity(manifest);
  assert.equal(result.candidateHash,
    "a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4");
  assert.deepEqual(result.cardCounts,
    {basics:17,fieldBlower:2,escapeRope:1});
  assert.equal(result.model.joint.numerator,"1051495");
  console.log("frozen candidate",result.candidateHash,
    "early Blower and later Rope visibility",result.model.joint.percent);
});
