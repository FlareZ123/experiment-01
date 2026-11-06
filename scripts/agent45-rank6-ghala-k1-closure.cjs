'use strict';

const assert = require('node:assert/strict');

/** @param {{name:string, printing:{set:string}}} card */
function printingName(card) {
  return card.name.replace(/ ♢$/, ' Prism Star') + ' ' + card.printing.set;
}

/**
 * A conditional proof about names retrieved by the already-observed native
 * Guzma & Hala search. This deliberately does not replay a Store game.
 * @param {{count:number,name:string,printing:{set:string}}[]} originalCards
 * @param {{STADIUMS:string[],SPECIAL_ENERGY:string[],TOOLS:string[]}} policy
 * @param {{postSearchHand:string[],absentImmediatelyBeforeSearch:string[],
 *   physicalOwnerDeckCardsMoved:number,noOtherHandAcquisition:boolean}} witness
 */
function inferThreeNames(originalCards, policy, witness) {
  const names = originalCards.flatMap(row => Array(row.count).fill(printingName(row)));
  assert.equal(names.length, 60, 'source deck must be the original complete 60');
  assert.equal(witness.physicalOwnerDeckCardsMoved, 3,
    'three physical owner-deck card moves are necessary');
  assert.equal(witness.noOtherHandAcquisition, true,
    'must establish no alternate hand acquisition between search and observation');
  const held = new Set(witness.postSearchHand);
  const absent = new Set(witness.absentImmediatelyBeforeSearch);
  const candidate = options => options.filter(n => names.includes(n));
  const tool = candidate(policy.TOOLS);
  assert.equal(tool.length, 1, 'must prove unique policy-eligible source Tool');
  assert.ok(held.has(tool[0]), 'retrieved Tool must be visible after search');
  const uniqueNew = options => {
    const choices = candidate(options).filter(name => absent.has(name) && held.has(name));
    assert.equal(choices.length, 1,
      'must identify one unique newly present, previously absent category card');
    return choices[0];
  };
  const stadium = uniqueNew(policy.STADIUMS);
  const specialEnergy = uniqueNew(policy.SPECIAL_ENERGY);
  assert.equal(new Set([stadium,specialEnergy,tool[0]]).size,3);
  return {stadium,specialEnergy,tool:tool[0],
    provenance:'conditional cross-report inference; direct K1 printed-name receipt unavailable'};
}

module.exports = {printingName,inferThreeNames};

if (require.main === module) {
  const rank6 = require('../results/aichi-2026/full-decklists.json').decks.find(d => d.rank === 6);
  assert.ok(rank6);
  const policy = require('../simulation/twinleaf/agent45-owner-ghala-after-tagcall.cjs');
  const witness = {
    postSearchHand:[
      'Cynthia & Caitlin CEC','Sidney FST 241','Captivating Poké Puff STS',
      'Thunder Mountain Prism Star LOT','Double Colorless Energy SUM',
      'Handheld Fan TWM'
    ],
    absentImmediatelyBeforeSearch:[
      'Thunder Mountain Prism Star LOT','Double Colorless Energy SUM'
    ],
    physicalOwnerDeckCardsMoved:3,
    noOtherHandAcquisition:true
  };
  const solution=inferThreeNames(rank6.cards,policy,witness);
  process.stdout.write(JSON.stringify({sourceRank:6,trialIds:[
    '6:101:B:champion-reference','6:101:B:new-moon-lockbreaker-v1'
  ],...solution},null,2)+'\n');
}
