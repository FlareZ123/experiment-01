'use strict';

const assert = require('node:assert/strict');
const candidate = require('../../results/aichi-2026/candidate-abyss-eye-mega-darkrai-v0.json');
const {planAichi,summarisePlan} = require('../evaluation/aichi-pilot.cjs');
const {evaluate,frozenDeckCounts} = require('../../scripts/mega-darkrai-opening-direct.cjs');

/** 
 * Check the actual pinned Twinleaf engine's deck resolver.
 * This never starts a game, changes a policy or claims card-text fidelity.
 * @returns {object}
 */
function run() {
  const totals = Object.fromEntries(['Pokémon','Trainer','Energy'].map(category=>[
    category,candidate.cards.filter(row=>row.category===category)
      .reduce((sum,row)=>sum+row.count,0)
  ]));
  assert.deepEqual(totals,candidate.category_counts);
  assert.equal(Object.values(totals).reduce((x,y)=>x+y,0),60);
  assert.equal(candidate.cards.filter(x=>x.name==='Mega Darkrai ex')
    .reduce((sum,x)=>sum+x.count,0),4);
  assert.equal(candidate.cards.filter(x=>x.name==='Dark Bell')
    .reduce((sum,x)=>sum+x.count,0),4);
  assert.equal(candidate.cards.filter(x=>x.name==='Hypnotoxic Laser')
    .reduce((sum,x)=>sum+x.count,0),4);
  const opts={
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  };
  const summary=summarisePlan(planAichi(candidate,opts));
  const result={
    schema:'agent15-abyss-eye-exploratory-60-printing-admission-v1',
    candidateLabel:candidate.label,
    totals,
    ...summary,
    earlyDirect:evaluate(frozenDeckCounts),
    competitivelyQualifiedGames:0,
    note:'Engine card-ID acceptance only; no registered Japanese 60, paper errata audit, representative opening policy, complete game or win rate.'
  };
  assert.equal(result.candidateResolved,true,
    'The frozen Mega Darkrai list still has unresolved pinned engine printings: '+
      JSON.stringify(result.candidateUnresolved));
  assert.deepEqual(result.unavailableSourceRanks,[23,25,28]);
  return result;
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
