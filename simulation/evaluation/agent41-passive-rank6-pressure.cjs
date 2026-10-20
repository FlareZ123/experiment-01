'use strict';

const assert=require('node:assert/strict');

/**
 * Reconcile actual Store-root actor/turn evidence with Agent39's native
 * read-only Initialization snapshots. A turn-one Pass is a boundary for a
 * continuously active Ability, never the action that creates that Ability.
 * This is an evidence classification, not a competitive success predicate.
 *
 * @param {object} audit Native observer output.
 * @param {object[]} rootTrace Post-choice actual Store roots.
 * @param {{sourceSeat:0|1,candidateSeat:0|1,sourceActuallyFirst:boolean}} context
 * @returns {object}
 */
function rank6PassivePressureEvidence(audit,rootTrace,context){
  assert.equal(audit?.schema,'agent39-sourcefirst-native-initialization-boundaries-v1');
  assert.ok(Array.isArray(rootTrace));
  const {sourceSeat,candidateSeat,sourceActuallyFirst}=context;
  assert.ok((sourceSeat===0||sourceSeat===1)&&candidateSeat===1-sourceSeat);
  assert.equal(audit.sourceSeat,sourceSeat);
  assert.equal(audit.candidateSeat,candidateSeat);
  const publicRoot=row=>row?{
    ordinal:row.actionOrdinal,turn:row.turnBefore,seat:row.playerSlot,
    action:row.action,card:row.card??null
  }:null;
  const sourceEnd=rootTrace.find(row=>row.playerSlot===sourceSeat &&
    row.turnBefore===1&&row.action==='PassTurnAction')??null;
  const candidateFirst=rootTrace.find(row=>row.playerSlot===candidateSeat &&
    row.turnBefore===2&&row.action!=='ResolvePromptAction')??null;
  const sourceReturn=rootTrace.find(row=>row.playerSlot===sourceSeat &&
    row.turnBefore===3&&row.action!=='ResolvePromptAction')??null;
  const t1=audit.sourceTurn1;
  const t2=audit.candidateTurn2;
  const t3=audit.sourceReturnTurn3;
  const sourceActiveContinuity=Boolean(sourceActuallyFirst &&
    t1?.globalTurn===1&&t1?.sourceActiveIronThornsEx===true&&
    t2?.globalTurn===2&&t2?.sourceActiveIronThornsEx===true);
  const nativeCapabilitySuppressed=Boolean(sourceActiveContinuity &&
    t2?.targetPrinting&&t2?.targetPowerName&&
    t2?.targetNativeAbilityBlocked===true);
  const rootedReplyAndReturn=Boolean(sourceEnd&&candidateFirst&&sourceReturn&&
    t3?.globalTurn===3);
  let status;
  if(!sourceActuallyFirst)status='source-was-not-first';
  else if(!t1||!sourceEnd)status='source-turn-one-boundary-unverified';
  else if(!t2||!candidateFirst)status='candidate-turn-two-boundary-unverified';
  else if(!sourceActiveContinuity)status='source-active-lock-continuity-absent';
  else if(!t2.targetPrinting||!t2.targetPowerName)status='no-eligible-visible-power';
  else if(!nativeCapabilitySuppressed)status='native-printed-power-block-unverified';
  else if(!rootedReplyAndReturn)status='source-return-or-reply-unverified';
  else status='native-capability-suppression-with-rooted-turn-continuity';

  return {
    schema:'agent41-rank6-passive-initialization-root-classification-v1',
    pressureKind:'passive-ability-suppression',
    status,sourceSeat,candidateSeat,sourceActuallyFirst,
    sourceActiveContinuity,nativeCapabilitySuppressed,rootedReplyAndReturn,
    sourceTurnOneEndRoot:publicRoot(sourceEnd),
    candidateTurnTwoFirstRoot:publicRoot(candidateFirst),
    sourceTurnThreeFirstRoot:publicRoot(sourceReturn),
    targetPrinting:t2?.targetPrinting??null,
    targetPowerName:t2?.targetPowerName??null,
    sourceTurnOneSnapshotPresent:Boolean(t1),
    candidateTurnTwoSnapshotPresent:Boolean(t2),
    sourceReturnSnapshotPresent:Boolean(t3),
    passiveAbilityCausedBySourceRoot:false,
    candidateActionLegalityIndependentlyVerified:false,
    actualTacticalOpportunityDenied:false,
    wholePolicyInformationSetSafe:false,
    paperRulesCertified:false,
    competitiveGameQualified:false
  };
}

module.exports={rank6PassivePressureEvidence};
