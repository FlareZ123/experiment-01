'use strict';

const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {pairedCandidateSlots}=
  require('./new-moon-lockbreak-source-diagnostic.cjs');
const {runArm}=require('./new-moon-second-start-paired.cjs');
const {withRank11ExclusiveOpeners}=
  require('./rank11-exclusive-openers.cjs');
const {withSameTargetAttachEnergySelection}=
  require('./same-target-attach-energy-hook.cjs');
const {withAcceptedEnergyPromptPublicWitness,VERSION}=
  require('./accepted-energy-prompt-public-witness.cjs');
const {exclusiveTrialSeed}=
  require('./rank11-exclusive-prospective-seeds.cjs');

/**
 * Existing genuine original-Store source-rank11 failing seed, replayed with
 * prior reversible sameTarget repair. The public witness is read-only and
 * records no hidden prompt selections. This is not a prospective win test.
 */
function run(){
  const sourceSeat=0,repeat=43,seed=exclusiveTrialSeed(sourceSeat,repeat);
  assert.equal(seed,336035391);
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(row=>row.rank===11);
  assert.equal(source?.status,'ready');
  const candidate=pairedCandidateSlots().lockbreak;
  const play=()=>withRank11ExclusiveOpeners(sourceSeat,()=>runArm(
    candidate,source.cards,1-sourceSeat,seed,48,false));
  const control=withSameTargetAttachEnergySelection(play);
  const witnessed=withAcceptedEnergyPromptPublicWitness(()=>
    withSameTargetAttachEnergySelection(play));
  const unobservedGame=control.result.result;
  const game=witnessed.result.result.result;
  const fix=witnessed.result.audit;
  const publicIdentity=g=>({
    actions:g.actions,turns:g.turns,finished:g.finished,
    winner:g.winner,firstTurnSlot:g.firstTurnSlot,
    prizesRemaining:g.prizesRemaining,
    rootActionLedger:g.rootActionLedger,
    attackTrace:g.attackTrace,abilityTrace:g.abilityTrace,
    cardsPlayedBySeat:g.cardsPlayedBySeat
  });
  assert.deepEqual(publicIdentity(game),publicIdentity(unobservedGame),
    'Read-only prompt witness changed genuine native public replay');
  assert.equal(fix.repairedPromptCount,control.audit.repairedPromptCount,
    'Read-only witness changed resolver correction calls');
  assert.equal(game.verifiedByDrawLog,true);
  assert.ok(fix.repairedPromptCount>=1);
  assert.ok(witnessed.audit.acceptedEnergyPromptResolutions>=1,
    'Expected authentic AttachEnergyPrompt response');
  assert.ok(witnessed.audit.publiclyChangedResolutions>=1,
    'Expected at least one public native Energy recipient change');
  assert.equal(witnessed.audit.schema,VERSION);
  assert.equal(witnessed.audit.acceptedPromptTargetsFullyCertified,false);
  return {
    schema:'agent1-rank11-accepted-energy-prompt-public-native-v1',
    sourceRank:11,seed,sourceSeat,
    pinnedTwinleaf:plan.engineRevision,
    actualStarter:game.firstTurnSlot,
    nativeActions:game.actions,
    sameCheckoutUnobservedControlCompared:true,
    nativePublicReplaysEqual:true,
    comparedRootCount:Array.isArray(game.rootActionLedger)?
      game.rootActionLedger.length:null,
    legacyRootLedgerCaptured:Array.isArray(game.rootActionLedger),
    nativeSameTargetRepairs:fix.repairedPromptCount,
    energyPromptPublicWitness:witnessed.audit,
    competitiveQualifiedGames:0,
    limitation:'One selected corrected 48-root original-Store seed, weak generic policy; no competitive win-rate inference'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
