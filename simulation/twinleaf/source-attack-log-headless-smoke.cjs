'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {runMatch,initializeCards} = require('./headless.cjs');

/**
 * Smoke the new opt-in Store log observer during an actual seeded, physical
 * 60-v-60 setup. The bounded first 20 root actions do not qualify a game,
 * establish matchup strength, or guarantee that either player attacks.
 * @returns {object}
 */
function runTest() {
  initializeCards();
  const dir = path.resolve(__dirname,'../../results/aichi-2026');
  const candidate = JSON.parse(fs.readFileSync(
    path.join(dir,'candidate-temple-shadow-rider.json'),'utf8'));
  const mapped = planAichi(candidate,{
    allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true
  });
  const opponent = mapped.opponents.find(row=>row.rank===8);
  assert.ok(opponent && opponent.cards.length===60);
  assert.equal(mapped.candidate.cards.length,60);
  const result = runMatch({
    deckA:mapped.candidate.cards,deckB:opponent.cards,
    seed:3755937400,label:'agent14:rank8:source-opening-log-smoke',
    maxActions:20,strictPromptValidation:true,
    captureEngineAttackDeclarations:true,
    isolatePolicyRandomness:true,
    forestSealSearchCorrection:true,
    doubleDragonRecovery:true,
    supporterDecisionCorrection:true,
    leleEntryAbilityLockCorrection:true,
    radiantGateLockCorrection:true,
    entryDrawLockCorrection:true
  });
  const events=result.engineAttackDeclarationTrace;
  assert.ok(Array.isArray(events),
    'Opt-in real Store attack-declaration ledger must be returned');
  assert.equal(events.every(e=>e.kind==='engine-attack-declaration'),true);
  assert.equal(events.every(e=>e.qualification==='engine-attack-declaration-only'),true);
  assert.equal(events.every(e=>e.logIndex>=0 && e.actionOrdinal>=1),true);
  return {
    kind:'opt-in-source-60-opening-attack-log-smoke-v1',
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    seed:result.seed,actions:result.actions,turns:result.turns,
    opponentRank:8,
    printedAttackActions:result.attackTrace.length,
    loggedAttackDeclarations:events,
    qualifiedCompetitiveGame:false
  };
}

if (require.main===module) {
  process.stdout.write(JSON.stringify(runTest(),null,2)+'\n');
}
module.exports={runTest};
