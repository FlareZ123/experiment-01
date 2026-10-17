'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {runMatch,initializeCards}=require('./headless.cjs');
const {withRank10SourceKoraidonFork}=
  require('./rank10-koraidon-source-attack-fork.cjs');

const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const engine=part=>require(path.join(root,part));

/**
 * Genuine source-dealt opponent Pass versus printed attack on its exact turn.
 * The unchanged control and alternate share 60s, initial RNG/seat and every
 * policy step before the recorded decision. Both decisions are actual root
 * Store actions; no staged card is placed into play.
 */
function main() {
  const seed=deriveSlotSeeds(20261016,'pilot',10,0).A;
  assert.equal(seed,3162592764);
  initializeCards();
  const {AttackAction,RetreatAction}=engine('game/store/actions/game-actions');
  const types={
    Store:engine('game/store/store').Store,
    Bot:engine('simple-bot/simple-tactics-ai').SimpleTacticsAi,
    AttackAction,RetreatAction
  };
  const candidates=[
    {id:'champion-reference',value:1},
    {id:'hood-shield-v1',value:JSON.parse(fs.readFileSync(path.resolve(__dirname,
      '../../results/aichi-2026/candidate-hood-shadow-rider.json'),'utf8'))}
  ];
  const pairs=[];
  for(const candidate of candidates) {
    const field=planAichi(candidate.value,{
      allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
    const opponent=field.opponents.find(x=>x.rank===10);
    assert.ok(field.candidate.cards?.length===60&&opponent?.cards?.length===60);
    const request={
      deckA:field.candidate.cards,deckB:opponent.cards,
      label:'Aichi comparative diagnostic pilot:10:0:'+candidate.id+':A',
      seed,maxActions:600,
      strictPromptValidation:true,forestSealSearchCorrection:true,
      doubleDragonRecovery:true,supporterDecisionCorrection:true,
      isolatePolicyRandomness:true,captureDecisionTrace:true,
      captureAttackPassProbes:true,prototypeSafeSimulatorIsolation:false,
      leleEntryAbilityLockCorrection:true,
      radiantGateLockCorrection:true,entryDrawLockCorrection:true
    };
    const rawControl=runMatch(request);
    const control=withRank10SourceKoraidonFork(types,
      ()=>runMatch(request),{forceAttack:false});
    assert.deepEqual(control.result,rawControl,
      'Read-only source decision capture altered the original game');
    const alternate=withRank10SourceKoraidonFork(types,
      ()=>runMatch(request),{forceAttack:true});
    const retreat=withRank10SourceKoraidonFork(types,
      ()=>runMatch(request),{forceRetreat:true});
    assert.equal(control.sourceDecisions.length,1,
      'Original source decision was not the intended single Koraidon pass');
    assert.equal(alternate.sourceDecisions.length,1,
      'Alternate source decision was not the same single Koraidon pass');
    const [prior]=control.sourceDecisions;
    const [changed]=alternate.sourceDecisions;
    assert.equal(prior.stateDigest,changed.stateDigest,
      'Source hands/decks/Prizes/public-state changed before the fork');
    assert.equal(changed.originalAction,'PassTurnAction');
    assert.equal(retreat.sourceDecisions.length,1,
      'Retreat alternate source decision was not the same single Koraidon pass');
    assert.equal(retreat.sourceDecisions[0].stateDigest,prior.stateDigest,
      'Pre-retreat hidden/public state differed from authentic source Pass');
    assert.equal(retreat.sourceDecisions[0].selectedRetreatIndex,0,
      'Published Regidrago VSTAR retreat target changed');
    assert.equal(alternate.result.firstTurnSlot,rawControl.firstTurnSlot);
    assert.equal(alternate.result.firstTurnSlot,1);
    assert.deepEqual(alternate.result.deckHashes,rawControl.deckHashes);
    assert.deepEqual(retreat.result.deckHashes,rawControl.deckHashes);
    assert.ok(retreat.result.decisionTrace.some(a=>
      a.turnBefore===5&&a.playerSlot===1&&a.action==='RetreatAction'),
      'Source Regidrago promotion was not dispatched as an actual RetreatAction');
    assert.ok(alternate.result.attackTrace.some(a=>
      a.seat===1&&a.turn===5&&a.attack==='Retribution Strike'),
      'Printed alternate was not actually declared in the root game');
    pairs.push({
      candidate:candidate.id,
      sameSourcePredecisionState:true,
      immutableSourceDeckHashes:rawControl.deckHashes,
      actualCandidateFirstTurnSlot:rawControl.firstTurnSlot,
      predecision:prior,
      substitution:changed.selectedAttack,
      control:{finished:rawControl.finished,endReason:rawControl.endReason,
        winner:rawControl.winner,prizesRemaining:rawControl.prizesRemaining,
        attacksAfterDecision:rawControl.attackTrace.filter(a=>a.turn>=5).slice(0,12)},
      alternate:{finished:alternate.result.finished,endReason:alternate.result.endReason,
        winner:alternate.result.winner,prizesRemaining:alternate.result.prizesRemaining,
        attacksAfterDecision:alternate.result.attackTrace.filter(a=>a.turn>=5).slice(0,12)},
      retreat:{finished:retreat.result.finished,endReason:retreat.result.endReason,
        winner:retreat.result.winner,prizesRemaining:retreat.result.prizesRemaining,
        actionsAtTurn5:retreat.result.decisionTrace.filter(a=>
          a.turnBefore===5&&a.playerSlot===1).map(a=>({action:a.action,card:a.card||null})),
        attacksAfterDecision:retreat.result.attackTrace.filter(a=>a.turn>=5).slice(0,12)}
    });
  }
  return {schema:'aichi-rank10-source-koraidon-turn5-fork-v1',
    seed,sourceOpponentRank:10,physicalCandidateSeat:0,
    engineRevision:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    rulesAndSimulatorQualification:'not independently reviewed',
    qualifiedForCompetitiveInference:false,pairs};
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={main};
