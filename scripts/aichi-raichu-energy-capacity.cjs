'use strict';

const fs = require('node:fs');
const path = require('node:path');

const EFFECTIVE = Object.freeze({
  'Reversal Energy': 3,
  'Counter Energy': 2,
  'Unit Energy LPM': 1,
  'Lightning Energy': 1
});
const SPECIAL = new Set(['Reversal Energy', 'Counter Energy', 'Unit Energy LPM']);

/**
 * Upper bound for Lightning Energy units available for Electro Rain from one
 * attached card, assuming the attacker is non-Rule-Box Stage 1 Alolan Raichu.
 * This is an energy/attack-opportunity calculation, not an engine ruling.
 * @param {string} name Source card name.
 * @param {{ownPrizes:number, opponentPrizes:number, temple:boolean}} state
 * @returns {number}
 */
function lightningUnits(name, state) {
  if (!(name in EFFECTIVE)) throw new RangeError('Unrecognized Energy: ' + name);
  if (state.temple && SPECIAL.has(name)) return 0;
  if ((name === 'Reversal Energy' || name === 'Counter Energy') &&
      state.ownPrizes <= state.opponentPrizes) return 0;
  return EFFECTIVE[name];
}

/**
 * Sum the largest effective energy bundles. Assumes all source copies are
 * eventually accessible and attachable; does not model setup or Prize access.
 * @param {{name:string,count:number}[]} cards
 * @param {{ownPrizes:number,opponentPrizes:number,temple:boolean}} state
 * @param {number} [cardLimit]
 * @returns {number}
 */
function packetUpperBound(cards, state, cardLimit = Infinity) {
  const units = [];
  for (const card of cards) {
    if (!Number.isInteger(card.count) || card.count < 0) throw new RangeError('Invalid count');
    const amount = lightningUnits(card.name, state);
    for (let i = 0; i < card.count; i++) units.push(amount);
  }
  units.sort((a, b) => b - a);
  return units.slice(0, cardLimit).reduce((sum, n) => sum + n, 0);
}

/**
 * Damage-prize *upper bound* for an already-announced Electro Rain. Each
 * target's additive damage modifier is applied once to its aggregate damage.
 * Disregards immunities, prevention, attack sequencing, and Prize effects.
 * @param {number} packets Available 30-damage selections.
 * @param {{id:string,hp:number,damage:number,prizes:number,bonusDamage?:number}[]} targets
 * @returns {{prizes:number,packetsUsed:number,targetIds:string[]}}
 */
function prizeUpperBound(packets, targets) {
  if (!Number.isInteger(packets) || packets < 0 || targets.length > 12) {
    throw new RangeError('Invalid attack budget or target count');
  }
  let best = {prizes: 0, packetsUsed: 0, targetIds: []};
  for (let mask = 1; mask < (1 << targets.length); mask++) {
    let used = 0;
    let prizeCount = 0;
    const targetIds = [];
    for (let i = 0; i < targets.length; i++) {
      if (!(mask & (1 << i))) continue;
      const target = targets[i];
      const bonus = target.bonusDamage || 0;
      if (!Number.isInteger(target.hp) || !Number.isInteger(target.damage) ||
          !Number.isInteger(target.prizes) || target.hp <= target.damage ||
          target.prizes < 1) throw new RangeError('Invalid live target');
      used += Math.max(1, Math.ceil((target.hp - target.damage - bonus) / 30));
      prizeCount += target.prizes;
      targetIds.push(target.id);
    }
    if (used <= packets && (prizeCount > best.prizes ||
        (prizeCount === best.prizes && used < best.packetsUsed))) {
      best = {prizes: prizeCount, packetsUsed: used, targetIds};
    }
  }
  return best;
}

/** @param {object} deck Manifest deck with source cards. */
function inspectDeck(deck) {
  const expected = ['Reversal Energy', 'Counter Energy', 'Unit Energy LPM'];
  const cards = deck.cards.filter(card => card.category === 'Energy');
  if (cards.length !== 3 || expected.some(name =>
      !cards.some(card => card.name === name && card.count === 4))) {
    throw new Error('Raichu source Energy inventory changed for rank ' + deck.rank);
  }
  const behind = {ownPrizes: 6, opponentPrizes: 4, temple: false};
  const tied = {ownPrizes: 6, opponentPrizes: 6, temple: false};
  const temple = {ownPrizes: 6, opponentPrizes: 4, temple: true};
  return {
    rank: deck.rank, player: deck.player,
    singleBombFive: packetUpperBound(cards, behind, 5),
    doubleBombTen: packetUpperBound(cards, behind, 10),
    allTwelveBehind: packetUpperBound(cards, behind),
    allTwelveTied: packetUpperBound(cards, tied),
    allTwelveTemple: packetUpperBound(cards, temple)
  };
}

function report() {
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname,
    '../results/aichi-2026/full-decklists.json'), 'utf8'));
  return [4, 17].map(rank => {
    const deck = manifest.decks.find(item => item.rank === rank);
    if (!deck || deck.archetype !== 'Raichu Electrode Combo') {
      throw new Error('Missing published source rank ' + rank);
    }
    return inspectDeck(deck);
  });
}

if (require.main === module) process.stdout.write(JSON.stringify(report(), null, 2) + '\n');
module.exports = {lightningUnits, packetUpperBound, prizeUpperBound, inspectDeck, report};
