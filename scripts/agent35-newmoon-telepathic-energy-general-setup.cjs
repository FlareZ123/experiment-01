#!/usr/bin/env node
"use strict";

// Exact first-turn access to the frozen New Moon Lockbreaker v1 Telepathic Psychic Energy line.
// Reads the canonical English-proxy 60 and the repository card database; no simulator or RNG.

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const deckPath = path.join(root, "results/als/new-moon-lockbreak-english-proxy-60.json");
const cardsDir = path.join(root, "resources/cards/en");
const deck = JSON.parse(fs.readFileSync(deckPath, "utf8"));
const rows = deck.cards || deck.card_list || deck.cards_list;
if (!Array.isArray(rows)) throw new Error("Expected the frozen candidate JSON to contain a cards array.");

const cardById = new Map();
for (const filename of fs.readdirSync(cardsDir).filter((name) => name.endsWith(".json"))) {
  const parsed = JSON.parse(fs.readFileSync(path.join(cardsDir, filename), "utf8"));
  const cards = Array.isArray(parsed) ? parsed : (parsed.cards || parsed.data || []);
  for (const card of cards) {
    if (card && card.id) cardById.set(card.id, card);
  }
}

const counts = new Map();
for (const row of rows) {
  const id = row.english_proxy_card_id || row.id;
  const count = Number(row.count);
  if (!id || !Number.isInteger(count) || count <= 0) throw new Error("Invalid candidate row: " + JSON.stringify(row));
  if (!cardById.has(id)) throw new Error("Card ID absent from repository card pool: " + id);
  counts.set(id, (counts.get(id) || 0) + count);
}

let total = 0;
let basicPokemon = 0;
let psychicBasic = 0;
let telepathicEnergy = 0;
let basicPsychicEnergy = 0;
const psychicTargets = [];

for (const [id, count] of counts.entries()) {
  const card = cardById.get(id);
  total += count;
  const subtypes = Array.isArray(card.subtypes) ? card.subtypes : [];
  const types = Array.isArray(card.types) ? card.types : [];
  const isPokemon = String(card.supertype || "").toLowerCase().startsWith("pok");
  if (isPokemon && subtypes.includes("Basic")) {
    basicPokemon += count;
    if (types.includes("Psychic")) {
      psychicBasic += count;
      psychicTargets.push({ id, name: card.name, count });
    }
  }
  if (id === "me3-88") telepathicEnergy += count;
  if (id === "swsh12pt5-156") basicPsychicEnergy += count;
}
if (total !== 60) throw new Error("Candidate count is " + total + ", expected 60.");
if (basicPokemon !== 17 || psychicBasic !== 15 || telepathicEnergy !== 3 || basicPsychicEnergy !== 3) {
  throw new Error("Unexpected frozen-list counts: " + JSON.stringify({
    basicPokemon, psychicBasic, telepathicEnergy, basicPsychicEnergy
  }));
}

function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let value = 1n;
  for (let i = 1; i <= k; i++) value = (value * BigInt(n - i + 1)) / BigInt(i);
  return value;
}

function gcd(a, b) {
  while (b !== 0n) {
    const r = a % b;
    a = b;
    b = r;
  }
  return a < 0n ? -a : a;
}

function fraction(numerator, denominator) {
  const d = gcd(numerator, denominator);
  return { numerator: (numerator / d).toString(), denominator: (denominator / d).toString() };
}

function percent(numerator, denominator, decimals = 8) {
  const scale = 10n ** BigInt(decimals);
  const rounded = (numerator * 100n * scale + denominator / 2n) / denominator;
  const whole = rounded / scale;
  const fractional = (rounded % scale).toString().padStart(decimals, "0");
  return whole.toString() + "." + fractional + "%";
}

const N = 60;
const B = basicPokemon;
const P = psychicBasic;
const validHandDenominator = choose(N, 7);
const validHandNumerator = validHandDenominator - choose(N - B, 7);

function scenario(tpeCopies) {
  // Going first: the opening seven must contain at least one TPE and one Psychic Basic.
  // That event itself guarantees a legal Basic-Pokémon opening.
  const firstNumerator =
    choose(N, 7) -
    choose(N - tpeCopies, 7) -
    choose(N - P, 7) +
    choose(N - tpeCopies - P, 7);

  // Going second: inspect the opening seven plus the mandatory first-turn draw.
  // The eight seen positions form a uniform 8-card subset, but the opening seven
  // must independently be legal. Subtract the cases where the first seven have
  // no Basic, contain TPE, and the eighth card is the only Psychic Basic.
  const bothInEightNumerator =
    choose(N, 8) -
    choose(N - tpeCopies, 8) -
    choose(N - P, 8) +
    choose(N - tpeCopies - P, 8);
  const invalidOpeningWithTpe =
    choose(N - B, 7) - choose(N - B - tpeCopies, 7);
  const secondNumerator = 8n * bothInEightNumerator - invalidOpeningWithTpe * BigInt(P);
  const secondDenominator = 8n * choose(N, 8);

  return {
    telepathicCopies: tpeCopies,
    goingFirst: {
      unconditional: percent(firstNumerator, validHandDenominator),
      conditionalOnLegalOpening: percent(firstNumerator, validHandNumerator),
      exactConditional: fraction(firstNumerator, validHandNumerator)
    },
    goingSecond: {
      unconditional: percent(secondNumerator, secondDenominator),
      conditionalOnLegalOpening: percent(
        secondNumerator * validHandDenominator,
        secondDenominator * validHandNumerator
      ),
      exactConditional: fraction(
        secondNumerator * validHandDenominator,
        secondDenominator * validHandNumerator
      )
    }
  };
}

const output = {
  candidate: "New Moon Lockbreaker v1",
  candidatePath: "results/als/new-moon-lockbreak-english-proxy-60.json",
  counts: {
    totalCards: total,
    basicPokemon: basicPokemon,
    basicPsychicPokemon: psychicBasic,
    telepathicPsychicEnergy: telepathicEnergy,
    basicPsychicEnergy: basicPsychicEnergy,
    psychicBasicTargets: psychicTargets.sort((a, b) => a.id.localeCompare(b.id))
  },
  validOpening: {
    unconditional: percent(validHandNumerator, validHandDenominator),
    exact: fraction(validHandNumerator, validHandDenominator)
  },
  accessSensitivity: [2, 3, 4].map(scenario),
  twoTargetGuarantee: {
    goingFirstMinimumBasicPsychicRemaining: P - (7 + 6 - 1),
    goingSecondMinimumBasicPsychicRemaining: P - (7 + 6 + 1 - 1),
    explanation: "With at least one TPE among the 13 or 14 cards seen/prized, at most 12 or 13 of the 15 Psychic Basics can be outside the deck."
  },
  assumptions: [
    "The first seven are a legal opening hand with at least one Basic Pokémon.",
    "Going first sees seven cards before the first attachment; going second sees the opening seven plus one mandatory draw.",
    "A Psychic Basic in hand can be benched or selected Active, allowing the TPE to be attached to a Psychic Pokémon.",
    "Prize cards are six cards removed from the deck after the opening hand; the two-target guarantee is a deterministic pigeonhole bound.",
    "The 2-copy and 4-copy rows are access sensitivities only; no specific card cut or replacement deck is asserted."
  ],
  notModeled: [
    "Opponent mulligan bonus draws.",
    "Bench occupancy created by other effects or the order in which the player fills the Bench.",
    "Which two Psychic Basics are strategically best to search in a particular state.",
    "Search effects, optional draw, disruption, attack access, lock removal, or match outcomes."
  ]
};

console.log(JSON.stringify(output, null, 2));
