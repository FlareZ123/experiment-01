'use strict';

const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {pairedCandidateSlots}=require('./new-moon-lockbreak-source-diagnostic.cjs');
const {runArm}=require('./new-moon-second-start-paired.cjs');
const {withRank11ExclusiveOpeners}=require('./rank11-exclusive-openers.cjs');
const {withSameTargetAttachEnergySelection}=
  require('./same-target-attach-energy-hook.cjs');
const {exclusiveTrialSeed}=require('./rank11-exclusive-prospective-seeds.cjs');

/** Retrospectively identified genuine error, now replayed as a regression. */
function run(){
  const sourceSeat=0,repeat=43,seed=exclusiveTrialSeed(sourceSeat,repeat);
  assert.equal(seed,336035391);
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(r=>r.rank===11);
  assert.equal(source?.status,'ready');
  const candidate=pairedCandidateSlots().lockbreak;
  const play=()=>withRank11ExclusiveOpeners(sourceSeat,()=>runArm(
    candidate,source.cards,1-sourceSeat,seed,48,false
  ));
  let legacyException=null;
  try {play();}
  catch(error) {
    legacyException=error instanceof Error?error.message:String(error);
  }
  assert.match(legacyException??'',/invalid result to AttachEnergyPrompt/,
    'Archived bot sameTarget failure must reproduce before patch');
  const corrected=withSameTargetAttachEnergySelection(play);
  assert.ok(corrected.audit.repairedPromptCount>=1,
    'No original sameTarget-invalid bot selection reached repair');
  assert.equal(corrected.result.result.verifiedByDrawLog,true);
  return {schema:'rank11-same-target-energy-retrospective-failure-replay-v1',
    seat:sourceSeat,repeat,seed,
    engine:plan.engineRevision,sourceRank:11,
    legacyException,correctedFirstTurnSlot:
      corrected.result.result.firstTurnSlot,
    correctedGameActions:corrected.result.result.actions,
    correction:corrected.audit,
    sourcePolicy:corrected.result.policyAudit,
    qualifiedCompetitiveGames:0,
    scope:'One originally failed source seed and reversible bot prompt correction; no win-rate evidence'};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
