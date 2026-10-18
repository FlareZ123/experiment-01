'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds} = require('../../scripts/aichi-decorrelated-seeds.cjs');
const {runMatch,initializeCards} = require('./headless.cjs');

/**
 * Compare historical action-class trace to additive attack-declaration log on
 * one authentic source-dealt complete match, retaining weak-bot caveats.
 * @returns {object}
 */
function runTest() {
  initializeCards();
  const seed = deriveSlotSeeds(20261016,'pilot',8,0).A;
  assert.equal(seed,3755937400);
  const dir = path.resolve(__dirname,'../../results/aichi-2026');
  const candidate = JSON.parse(fs.readFileSync(path.join(dir,
    'candidate-temple-shadow-rider.json'),'utf8'));
  const input = planAichi(candidate,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const rank8 = input.opponents.find(row=>row.rank===8);
  assert.equal(input.candidate.cards.length,60);
  assert.equal(rank8?.cards.length,60);
  const game = runMatch({
    deckA:input.candidate.cards,deckB:rank8.cards,
    label:'agent14:rank8:full-source-attack-log',
    seed,maxActions:600,strictPromptValidation:true,
    forestSealSearchCorrection:true,doubleDragonRecovery:true,
    supporterDecisionCorrection:true,isolatePolicyRandomness:true,
    captureEngineAttackDeclarations:true,
    leleEntryAbilityLockCorrection:true,
    radiantGateLockCorrection:true,
    entryDrawLockCorrection:true,
    distinctAttachTargetsCorrection:true
  });
  assert.equal(game.finished,true,
    'Archived legal corrected rank-8 source replay must reach terminal');
  assert.equal(game.verifiedByDrawLog,true);
  assert.ok(game.attackTrace.length>0,
    'Source game must exercise regular attack declaration paths');
  assert.ok(game.engineAttackDeclarationTrace.length>0,
    'Real Store log observer must capture source game attacks');
  const raw=game.attackTrace.map(event=>({
    seat:event.seat,turn:event.turn,attack:event.attack
  }));
  const ledger=game.engineAttackDeclarationTrace.map(event=>({
    logIndex:event.logIndex,
    actionOrdinal:event.actionOrdinal,
    turnBefore:event.turnBefore,
    rootActionSeat:event.rootActionSeat,
    triggerAction:event.triggerAction,
    playerName:event.playerName,
    attackName:event.attackName
  }));
  return {
    kind:'rank8-full-source-real-Store-attack-declaration-comparison-v1',
    seed,rank:8,sourceCandidateSeat:'A',
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    actions:game.actions,turns:game.turns,
    finished:game.finished,winner:game.winner,
    prizesRemaining:game.prizesRemaining,
    policy:game.policy,
    originalAttackActionTrace:raw,
    additiveStoreAttackDeclarations:ledger,
    qualification:'one source-dealt bot-policy game; attack declarations only, zero independently qualified competitive games',
    opponentActionQualityUnverified:true
  };
}

if (require.main===module) {
  process.stdout.write(JSON.stringify(runTest(),null,2)+'\n');
}
module.exports={runTest};
