'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { choose, mulliganProbability } = require('./aichi_opening_audit.cjs');

const CORE = new Set([
  'Iron Thorns ex', 'Thunder Mountain ♢', 'Double Colorless Energy',
  'Guzma & Hala', 'Tag Call',
]);

// Audited against the card printings in the three published Iron Thorns lists.
const SUPPORTERS = new Set([
  'Plumeria', 'Guzma', 'Guzma & Hala', 'Team Flare Grunt',
  'Lusamine', 'Cynthia & Caitlin', 'Team Skull Grunt', 'Faba',
  'Eri', 'Sidney', 'Gladion', "Lillie's Determination",
  "Team Rocket's Handiwork", 'Bellelba & Brycen-Man', 'N',
  "Xerosic's Machinations", 'Peonia',
]);

/** @param {number[]} values @returns {string} */
function key(values) { return values.join(','); }

/**
 * Count exact eight-card multisets of non-core names by four dimensions:
 * total cards, surplus copies of non-Supporters, surplus copies of Supporters,
 * and total other Supporters. Multiplicities use combinations of physical copies.
 * @param {{cards:Array<{name:string,count:number}>}} deck
 * @returns {Array<{n:number,duplicateOther:number,duplicateSupporters:number,supporters:number,ways:number}>}
 */
function otherHandProfiles(deck) {
  const names = new Map();
  for (const card of deck.cards) {
    if (!CORE.has(card.name)) names.set(card.name, (names.get(card.name) || 0) + card.count);
  }
  let states = new Map([[key([0, 0, 0, 0]), 1]]);
  for (const [name, copies] of names) {
    const isSupporter = SUPPORTERS.has(name);
    const next = new Map();
    for (const [k, ways] of states) {
      const [n, duplicateOther, duplicateSupporters, supporters] = k.split(',').map(Number);
      for (let drawn = 0; drawn <= Math.min(copies, 8 - n); drawn++) {
        const duplicate = Math.max(0, drawn - 1);
        const nextKey = key([
          n + drawn,
          duplicateOther + (isSupporter ? 0 : duplicate),
          duplicateSupporters + (isSupporter ? duplicate : 0),
          supporters + (isSupporter ? drawn : 0),
        ]);
        next.set(nextKey, (next.get(nextKey) || 0) + ways * choose(copies, drawn));
      }
    }
    states = next;
  }
  return [...states].map(([k, ways]) => {
    const [n, duplicateOther, duplicateSupporters, supporters] = k.split(',').map(Number);
    return { n, duplicateOther, duplicateSupporters, supporters, ways };
  });
}

/**
 * Exact probability of obtaining the printed Iron Thorns DCE + Thunder Mountain
 * opening, with three explicitly stated discard-acceptance hypotheses.
 * Seven initial cards must include Iron Thorns; six Prizes and the eighth card
 * (first normal draw going second) are marginalized.
 *
 * \`duplicateOnly\`: preserve at least one physical copy of every *non-core*
 *   name in hand; protect all held Iron Thorns and all held required resources.
 * \`supporterSpent\`: duplicates of non-Supporters plus all other Supporters
 *   remaining after committing Guzma & Hala; do not discard singleton Items.
 * \`unrestricted\`: any non-core hand cards and unplayed connectors are usable,
 *   while all Iron Thorns and held attack resources remain protected.
 *
 * These are deterministic resource-policy assumptions, not card DCI truth or
 * an observed success probability under actual play.
 * @param {{cards:Array<{name:string,count:number}>}} deck
 * @returns {{rank:number, directInHand:number, noDiscardRequired:number, duplicateOnly:number,
 * supporterSpent:number, unrestricted:number, discardRequired:number,
 * duplicateBudgetDistribution:number[],supporterBudgetDistribution:number[]}}
 */
function analyze(deck) {
  const counts = (name) => deck.cards.filter((card) => card.name === name)
    .reduce((total, card) => total + card.count, 0);
  const nT = counts('Iron Thorns ex');
  const nM = counts('Thunder Mountain ♢');
  const nD = counts('Double Colorless Energy');
  const nG = counts('Guzma & Hala');
  const nC = counts('Tag Call');
  const total = deck.cards.reduce((sum, card) => sum + card.count, 0);
  if (total !== 60 || nT !== 4 || nM !== 1 || nG !== 2 || nC !== 2 || nD < 1) {
    throw new Error('Unexpected Iron Thorns source inventory');
  }
  const mainGroups = [nT, nM, nD, nG, nC];
  const profiles = otherHandProfiles(deck);
  const byN = Array.from({ length: 9 }, () => []);
  for (const profile of profiles) byN[profile.n].push(profile);
  const result = {
    rank: deck.rank,
    directInHand: 0,
    noDiscardRequired: 0,
    duplicateOnly: 0,
    supporterSpent: 0,
    unrestricted: 0,
    discardRequired: 0,
    duplicateBudgetDistribution: [0, 0, 0],
    supporterBudgetDistribution: [0, 0, 0],
  };
  const denom = choose(60, 8) * (1 - mulliganProbability(nT));
  const prizeDenom = choose(52, 6);
  const hand = [0, 0, 0, 0, 0];

  /** @param {number[]} h */
  function visit(h) {
    const [hT, hM, hD, hG, hC] = h;
    if (!hT) return;
    const nOther = 8 - h.reduce((sum, x) => sum + x, 0);
    if (nOther < 0) return;
    const possible = byN[nOther];
    if (!possible.length) return;
    const openValidFraction = hT === 1 ? 7 / 8 : 1;
    const coreWays = h.reduce((prod, x, i) => prod * choose(mainGroups[i], x), 1);
    const remM = nM - hM;
    const remD = nD - hD;
    const remG = nG - hG;
    const otherPrizable = 52 - remM - remD - remG;
    const direct = hM > 0 && hD > 0;
    const useTag = hG === 0 && hC > 0;
    const otherG = hG - (hG > 0 ? 1 : 0);
    const otherC = hC - (useTag ? 1 : 0);
    const extraTag = Math.max(0, otherC - 1);

    for (let pM = 0; pM <= remM; pM++) {
      for (let pD = 0; pD <= remD; pD++) {
        for (let pG = 0; pG <= remG; pG++) {
          const prizeWays = choose(remM, pM) * choose(remD, pD)
            * choose(remG, pG) * choose(otherPrizable, 6 - pM - pD - pG);
          if (!prizeWays) continue;
          const supporter = hG > 0 || (hC > 0 && remG - pG > 0);
          const mountain = hM > 0 || (supporter && remM - pM > 0);
          const dce = hD > 0 || (supporter && remD - pD > 0);
          if (!mountain || !dce) continue;
          const noDiscard = hD > 0;
          for (const profile of possible) {
            const weight = openValidFraction * coreWays * profile.ways * prizeWays
              / (denom * prizeDenom);
            const duplicates = profile.duplicateOther + profile.duplicateSupporters + extraTag;
            const spentSupporter = profile.duplicateOther + profile.supporters + otherG + extraTag;
            const unrestricted = profile.n + otherG + otherC;
            if (direct) result.directInHand += weight;
            if (noDiscard) result.noDiscardRequired += weight;
            else {
              result.discardRequired += weight;
              result.duplicateBudgetDistribution[Math.min(2, duplicates)] += weight;
              result.supporterBudgetDistribution[Math.min(2, spentSupporter)] += weight;
            }
            if (noDiscard || duplicates >= 2) result.duplicateOnly += weight;
            if (noDiscard || spentSupporter >= 2) result.supporterSpent += weight;
            if (noDiscard || unrestricted >= 2) result.unrestricted += weight;
          }
        }
      }
    }
  }

  /** @param {number} index @param {number} left */
  function walk(index, left) {
    if (index === hand.length) {
      visit(hand);
      return;
    }
    for (let count = 0; count <= Math.min(left, mainGroups[index]); count++) {
      hand[index] = count;
      walk(index + 1, left - count);
    }
  }
  walk(0, 8);
  return result;
}

if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  const src = path.join(root, 'results/aichi-2026/full-decklists.json');
  const source = JSON.parse(fs.readFileSync(src, 'utf8'));
  process.stdout.write(JSON.stringify(source.decks
    .filter((deck) => [6, 24, 29].includes(deck.rank))
    .map(analyze), null, 2) + '\n');
}

module.exports = { analyze, otherHandProfiles, SUPPORTERS };
