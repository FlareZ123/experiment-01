'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { choose, mulliganProbability } = require('./aichi_opening_audit.cjs');

/**
 * Exact direct-search opening probability for Iron Thorns's DCE + Thunder Mountain line.
 * Disjoint groups: Iron Thorns ex, Thunder Mountain Prism Star, Double Colorless
 * Energy, Guzma & Hala, Tag Call and all other cards.
 * Opening 7 must contain Iron Thorns. Hand card 8 is the first-turn draw.
 * Six Prize cards are drawn from the remaining 52 cards.
 * @param {{thorns:number, stadium:number, dce:number, guzmaHala:number, tagCall:number}} counts
 * @returns {{conditional:number, directInHand:number, supporterLine:number}}
 */
function directLineChance(counts) {
  const { thorns, stadium, dce, guzmaHala, tagCall } = counts;
  const other = 60 - thorns - stadium - dce - guzmaHala - tagCall;
  if (thorns < 1 || stadium < 1 || dce < 1 || guzmaHala < 1 || tagCall < 0 || other < 0) {
    throw new Error('Invalid direct-line groups');
  }
  const groups = [thorns, stadium, dce, guzmaHala, tagCall, other];
  const firstSevenValid = 1 - mulliganProbability(thorns);
  const denominatorEight = choose(60, 8);
  const denominatorPrizes = choose(52, 6);
  const totals = { directInHand: 0, supporterLine: 0 };

  /** @param {number[]} hand */
  function visitHand(hand) {
    const [hT, hM, hD, hG, hC] = hand;
    if (hT === 0) return;
    // When exactly one Thorns is among eight cards, it was in the first
    // seven with probability 7/8. Two or more guarantees a valid first seven.
    let handWeight = hT === 1 ? 7 / 8 : 1;
    for (let i = 0; i < groups.length; i++) handWeight *= choose(groups[i], hand[i]);
    const handProbability = handWeight / denominatorEight;
    const remM = stadium - hM;
    const remD = dce - hD;
    const remG = guzmaHala - hG;
    const unrelated = 52 - remM - remD - remG;
    for (let pM = 0; pM <= remM; pM++) {
      for (let pD = 0; pD <= remD; pD++) {
        for (let pG = 0; pG <= remG; pG++) {
          const prizeProbability = choose(remM, pM) * choose(remD, pD) * choose(remG, pG)
            * choose(unrelated, 6 - pM - pD - pG) / denominatorPrizes;
          const supporter = hG > 0 || (hC > 0 && remG - pG > 0);
          const mountain = hM > 0 || (supporter && remM - pM > 0);
          const doubleColorless = hD > 0 || (supporter && remD - pD > 0);
          if (mountain && doubleColorless) {
            const key = hM > 0 && hD > 0 ? 'directInHand' : 'supporterLine';
            totals[key] += handProbability * prizeProbability / firstSevenValid;
          }
        }
      }
    }
  }

  const hand = Array(groups.length).fill(0);
  function walk(index, left) {
    if (index === groups.length - 1) {
      if (left >= 0 && left <= groups[index]) {
        hand[index] = left;
        visitHand(hand);
      }
      return;
    }
    for (let count = 0; count <= Math.min(left, groups[index]); count++) {
      hand[index] = count;
      walk(index + 1, left - count);
    }
  }
  walk(0, 8);
  return { ...totals, conditional: totals.directInHand + totals.supporterLine };
}

if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  const lists = JSON.parse(fs.readFileSync(path.join(root, 'results/aichi-2026/full-decklists.json'), 'utf8'));
  const output = lists.decks.filter((deck) => deck.archetype === 'Iron Thorns').map((deck) => {
    const copies = (name) => deck.cards.filter((card) => card.name === name)
      .reduce((sum, card) => sum + card.count, 0);
    const counts = {
      thorns: copies('Iron Thorns ex'), stadium: copies('Thunder Mountain ♢'),
      dce: copies('Double Colorless Energy'), guzmaHala: copies('Guzma & Hala'),
      tagCall: copies('Tag Call'),
    };
    return { rank: deck.rank, counts, result: directLineChance(counts) };
  });
  process.stdout.write(JSON.stringify(output, null, 2) + '\n');
}

module.exports = { directLineChance };
