'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {registered,options,summarizeWithAudit,bridgeCounters,compare,ROOT_LIMIT}=
  require('../../simulation/evaluation/2026-11/agent2-retreat-funding-original-source.cjs');

function sample(on=false){
  return {
    id:'13:3204:A:new-moon-lockbreaker-v1',rank:13,candidateSeat:0,seed:3204,
    fullPhysicalDealFingerprint:'same-full-deal',
    sourceDealFingerprint:'same-source-deal',
    candidateDeckFingerprint:'fixed-challenger-60',
    sourceDeckFingerprint:'fixed-original-60',
    rootActionLedger:[{
      actionOrdinal:9,turnBefore:3,playerSlot:1,
      action:'PlayCardAction',card:'Psychic Energy SVE'
    }],
    nativeAcceptedTargetSidecar:{events:[{
      rootActionOrdinal:9,playerSlot:1,
      declared:{kind:'play-card',ownerHandPrinting:'Psychic Energy SVE',
        target:{player:2,slot:on?1:2,index:0}},
      storeAccepted:true,publicBoardChanges:[{
        seat:1,position:on?'active':'bench',index:0,
        before:{energies:[]},after:{energies:['Psychic Energy SVE']}
      }]
    }]},
    actorOnlyDecisionCoverage:{detailedComponentAudits:{root:{
      retreatFundingBridgeOptIn:on,
      retreatFundingBridgeAttachmentsSelected:on?1:0,
      retreatFundingBridgeRetreatsSelected:on?1:0,
      acceptedActorRoots:4,rejectedActorRoots:0,
      nativePhysicalConfirmed:3,nativePhysicalUnconfirmed:1
    }}},
    status:'native-terminal',winner:1
  };
}
test('registered original rank11 and rank13 both-seat groups retain original IDs',()=>{
  const groups=registered();
  assert.equal(groups.length,4);
  assert.deepEqual(groups.map(x=>x.rank).sort(),[11,11,13,13]);
  assert.equal(new Set(groups.map(x=>x.seed)).size,4);
});
test('treatment changes only owner bridge flag in common baseline policy',()=>{
  const a=options(false),b=options(true);
  assert.equal(ROOT_LIMIT,260);
  assert.deepEqual(Object.keys(a),Object.keys(b));
  assert.deepEqual(Object.entries(a).filter(([key])=>key!=='retreatFundingBridge'),
    Object.entries(b).filter(([key])=>key!=='retreatFundingBridge'));
  assert.equal(a.retreatFundingBridge,false);
  assert.equal(b.retreatFundingBridge,true);
});
test('native target divergence detects same PlayCardAction different attachment slot',()=>{
  const left=sample(false),right=sample(true),out=compare(left,right);
  assert.equal(out.matchedOriginalPhysicalDeal,true);
  assert.equal(out.sameFixedOriginalSixties,true);
  assert.equal(out.firstRootDivergence?.ordinal??null,null);
  assert.equal(out.firstPhysicalTargetDivergence.index,0);
  assert.equal(out.selectedBridgeFullSequence,true);
  assert.equal(out.resultIsCompetitiveGame,false);
});
test('mismatch in source deal or fixed sixty prevents comparison',()=>{
  const left=sample(false),right=sample(true);
  right.sourceDealFingerprint='different';
  right.sourceDeckFingerprint='altered-60';
  const out=compare(left,right);
  assert.equal(out.matchedOriginalPhysicalDeal,false);
  assert.equal(out.sameFixedOriginalSixties,false);
  assert.equal(out.nativeTerminalComparable,false);
  assert.equal(out.nativeWinnerChanged,false);
});
test('bridge counters distinguish selected intents from non-attributed Store actions',()=>{
  const b=bridgeCounters(sample(true));
  assert.equal(b.selectedAttachments,1);
  assert.equal(b.selectedPaidRetreats,1);
  assert.equal(b.allAcceptedActiveEnergyAttachCount,1);
  assert.equal(b.nativePhysicalConfirmed,3);
  assert.match(b.note,/no attribution/);
});

test('compact summaries preserve actual bridge opt-in, physical targets and deck fingerprints',()=>{
  const source=sample(true);
  const raw={trial:{id:source.id,rank:source.rank,seed:source.seed,
    candidateSlot:'A'},actorOnlyDecisionCoverage:source.actorOnlyDecisionCoverage,
    nativeAcceptedTargetSidecar:source.nativeAcceptedTargetSidecar,
    candidateDeckFingerprint:source.candidateDeckFingerprint,
    sourceDeckFingerprint:source.sourceDeckFingerprint,
    fullPhysicalDealFingerprint:source.fullPhysicalDealFingerprint,
    sourceDealFingerprint:source.sourceDealFingerprint,
    rootActionLedger:source.rootActionLedger,finished:true,winner:1};
  const result=summarizeWithAudit(raw);
  assert.equal(bridgeCounters(result).optIn,true);
  assert.equal(bridgeCounters(result).selectedAttachments,1);
  assert.equal(result.candidateDeckFingerprint,'fixed-challenger-60');
  assert.equal(result.sourceDeckFingerprint,'fixed-original-60');
  assert.equal(result.nativeAcceptedTargetSidecar.events.length,1);
  const missing=sample(false);
  delete missing.sourceDeckFingerprint;
  assert.equal(compare(missing,result).sameFixedOriginalSixties,false);
});
