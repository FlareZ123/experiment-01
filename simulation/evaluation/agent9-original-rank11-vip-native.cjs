'use strict';

const assert=require('node:assert/strict');
const {frozenInputs,runVariant}=
  require('./agent3-source-vip-k1-native-pair.cjs');
const {executeDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('./agent7-canonical-actor-composition.cjs');

/**
 * Reuse the pre-existing rank11 original-deal fixture and canonical actor,
 * with one independently opt-in both-seat VIP bridge. There is no new game
 * engine or replay algorithm and no outcome-qualification claim.
 * @param {object} fixture Previously established physical source deal.
 * @returns {object} One complete native Store run and VIP-specific receipts.
 */
function executeOwnerVip(fixture){
  const {trial,prepared,options}=fixture;
  const executor=()=>executeDevelopment(trial,prepared,{
    mandatoryOptionFallback:options.mandatoryOptionFallback,
    paperSupporterQuota:options.paperSupporterQuota,
    paperFullBenchCallForFamily:options.paperFullBenchCallForFamily,
    paperSameTargetAttachEnergy:options.paperSameTargetAttachEnergy,
    nativeAcceptedTargets:options.nativeAcceptedTargets,
    registeredTrial:false
  });
  const canonical=withCanonicalActorOnlyPolicy(executor,{
    pokemon:execute=>
      require('../twinleaf/agent8-actor-only-choose-pokemon.cjs')
        .withActorOnlyChoosePokemon(execute,{
          choose:require('../twinleaf/agent1-charged-promotion-choice.cjs')
            .chooseChargedOwnPromotion
        })
  },{
    ownerSingleSearch:options.actorOnlySingleSearch,
    genericFallbackAttribution:options.actorGenericFallbackAttribution,
    actorHandDiscard:options.actorHandDiscard,
    actorChoosePokemon:options.actorChoosePokemon,
    ownerVipAfterPass:true
  });
  const row=canonical.result;
  const candidateSeat=trial.candidateSlot==='A'?0:1;
  const sourceSeat=1-candidateSeat;
  const audit=canonical.audit.detailedComponentAudits.ownerVipAfterPass;
  assert.ok(audit,'Executed canonical policy omitted VIP audit');
  const roots=row.rootActionLedger??[];
  // Pinned headless.rootActionLedger stores native Card.name, not fullName.
  // Exact printing is independently audited at the owner-root proposal.
  const vipRoots=roots.filter(root=>
    root.action==='PlayCardAction'&&root.playerSlot===sourceSeat&&
    root.card==='Battle VIP Pass');
  const sourceEarlyRoots=roots.filter(root=>
    root.playerSlot===sourceSeat&&root.turnBefore<=2)
    .slice(0,24).map(root=>({
      ordinal:root.actionOrdinal,turn:root.turnBefore,
      action:root.action,card:root.card??null,
      prompt:root.pendingPrompt??null
    }));
  const nextTurnCandidateRoots=roots.filter(root=>
    root.playerSlot===candidateSeat&&root.turnBefore===2)
    .slice(0,12).map(root=>({
      ordinal:root.actionOrdinal,turn:root.turnBefore,
      action:root.action,card:root.card??null,
      prompt:root.pendingPrompt??null
    }));
  const first=vipRoots[0]??null;
  const opponentReply=roots.find(root=>
    root.playerSlot===candidateSeat&&
    root.turnBefore===2&&root.action!=='ResolvePromptAction'&&
    !root.pendingPrompt)??null;
  return {
    schema:'agent9-source-rank11-native-vip-integration-v1',
    trial:row.trial.id,sourceSeat,candidateSeat,
    sourceDealFingerprint:row.sourceDealFingerprint,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint,
    actualStarterSeat:row.actualStarterSeat,
    verifiedFirstTurn:row.verifiedFirstTurn,
    actorPolicyVersion:canonical.audit.version,
    rootActionLedgerSha256:row.rootActionLedgerSha256,
    rootActionCount:row.rootActionCount,
    sourceVipRoots:vipRoots,sourceEarlyRoots,nextTurnCandidateRoots,
    sourceVipFirstTurnRoot:first,
    nativeVipAudit:audit,
    firstCandidateReplyAfterVip:opponentReply?{
      ordinal:opponentReply.actionOrdinal,turn:opponentReply.turnBefore,
      action:opponentReply.action,
      card:opponentReply.card??null,
      attack:opponentReply.attack??null
    }:null,
    rootTail:roots.slice(-8),
    finished:row.finished,winner:row.winner,
    endReason:row.endReason,
    qualifiedCompetitiveGame:false
  };
}

function run(){
  const fixture=frozenInputs();
  const control=runVariant('baseline',fixture);
  const treatment=executeOwnerVip(fixture);
  assert.equal(control.status,'native-returned');
  assert.equal(control.sourceDealFingerprint,treatment.sourceDealFingerprint,
    'Source physical cards differ between treatment and original baseline');
  assert.equal(control.fullPhysicalDealFingerprint,
    treatment.fullPhysicalDealFingerprint,
    'Two-player physical setup differed');
  assert.equal(control.actualStarterSeat,treatment.actualStarterSeat,
    'Coin-winner and first-player order differed');
  assert.equal(treatment.nativeVipAudit.rejectedItems,0);
  assert.equal(treatment.nativeVipAudit.rejectedSearches,0);
  // This historically selected first-turn source deal is known to hold VIP.
  // Require the actual owner action and physical Bench effect; do not let a
  // default-off no-op produce a green CI job.
  const gate={
    vipSourcePlayObserved:treatment.sourceVipRoots.length>=1,
    vipSearchAccepted:treatment.nativeVipAudit.acceptedSearches>=1,
    vipBenchPhysicallyConfirmed:treatment.nativeVipAudit.nativeBenchConfirmed>=1,
    opponentNextRootObserved:Boolean(treatment.firstCandidateReplyAfterVip)
  };
  return {gatePassed:Object.values(gate).every(Boolean),gate,
    schema:'agent9-rank11-battle-vip-original-deal-native-two-arm-v1',
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    historicalFixture:true,seed:fixture.trial.seed,
    sourceRank:11,
    baseline:{
      trial:control.trial,
      sourceDealFingerprint:control.sourceDealFingerprint,
      rootActionLedgerSha256:control.rootActionLedgerSha256,
      rootActionCount:control.rootActionCount,
      firstSourceOwnTurn:control.firstSourceOwnTurn??null,
      finished:control.finished,winner:control.winner
    },
    treatment,
    competitiveQualifiedGames:0,
    caveat:'Retrospective known-VIP-hand physical source deal. One action-mechanism test under a source-unqualified simulator, never a comparative win rate.'
  };
}
if(require.main===module){
  const output=run();
  process.stdout.write(JSON.stringify(output,null,2)+'\n');
  process.stderr.write('AGENT9_VIP_DIAGNOSTIC '+JSON.stringify({
    gate:output.gate,audit:output.treatment.nativeVipAudit,
    sourceRoot:output.treatment.sourceVipFirstTurnRoot,
    firstReply:output.treatment.firstCandidateReplyAfterVip,
    sourceStarter:output.treatment.actualStarterSeat,
    controlRoots:output.baseline.rootActionCount,
    treatmentRoots:output.treatment.rootActionCount,
    sourceEarlyRoots:output.treatment.sourceEarlyRoots,
    nextTurnCandidateRoots:output.treatment.nextTurnCandidateRoots
  })+'\n');
  if(!output.gatePassed)process.exitCode=1;
}
module.exports={executeOwnerVip,run};
