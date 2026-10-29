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
  const row=canonical.result,sourceSeat=1,candidateSeat=0;
  const audit=canonical.audit.detailedComponentAudits.ownerVipAfterPass;
  assert.ok(audit,'Executed canonical policy omitted VIP audit');
  const roots=row.rootActionLedger??[];
  const vipRoots=roots.filter(root=>
    root.action==='PlayCardAction'&&root.playerSlot===sourceSeat&&
    root.card==='Battle VIP Pass FST');
  const first=vipRoots[0]??null;
  const opponentReply=first?roots.find(root=>
    root.playerSlot===candidateSeat&&
    root.turnBefore===first.turnBefore+1&&
    root.pendingPrompt===null&&root.action!=='ResolvePromptAction'):null;
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
    sourceVipRoots:vipRoots,
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
  assert.ok(treatment.sourceVipRoots.length>=1,
    'The source-held VIP was never native-accepted');
  assert.ok(treatment.nativeVipAudit.nativeBenchConfirmed>=1,
    'The selected owner deck Basic cards were not confirmed on Bench');
  assert.ok(treatment.firstCandidateReplyAfterVip,
    'No subsequent normal opposing actor root followed the VIP line');
  return {
    schema:'agent9-rank11-battle-vip-original-deal-native-two-arm-v1',
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    historicalFixture:true,seed:fixture.trial.seed,
    sourceRank:11,
    baseline:{
      trial:control.trial,
      sourceDealFingerprint:control.sourceDealFingerprint,
      rootActionLedgerSha256:control.rootActionLedgerSha256,
      rootActionCount:control.rootActionCount,
      finished:control.finished,winner:control.winner
    },
    treatment,
    competitiveQualifiedGames:0,
    caveat:'Retrospective known-VIP-hand physical source deal. One action-mechanism test under a source-unqualified simulator, never a comparative win rate.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={executeOwnerVip,run};
