'use strict';
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {planAichi}=require('./aichi-pilot.cjs');
const {initializeCards,runMatch}=require('../twinleaf/headless.cjs');
const {withActorOwnedSetup,VERSION}=require(
  '../twinleaf/agent9-actor-owned-setup.cjs');
const {withNativePaperSupporterDiscipline}=require(
  '../twinleaf/agent41-paper-supporter-discipline.cjs');
/** @param {unknown} data */
function hash(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data))
    .digest('hex');
}
function main(){
  initializeCards();
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  assert.equal(plan.candidate.cards.length,60);
  const cases=[
    {rank:6,seed:407516727,candidateSeat:1},
    {rank:11,seed:482443328,candidateSeat:1},
    {rank:24,seed:2804067880,candidateSeat:0}
  ];
  const rows=[];
  for(const item of cases) {
    const source=plan.opponents.find(d=>d.rank===item.rank);
    assert.equal(source.status,'ready');
    assert.equal(source.cards.length,60);
    const request={
      deckA:item.candidateSeat===0?plan.candidate.cards:source.cards,
      deckB:item.candidateSeat===1?plan.candidate.cards:source.cards,
      seed:item.seed,maxActions:105,strictPromptValidation:true,
      isolatePolicyRandomness:true,
      forestSealSearchCorrection:true,
      doubleDragonRecovery:true,supporterDecisionCorrection:true,
      captureDecisionTrace:true,
      captureInitialSourceDealFingerprintSeat:1-item.candidateSeat,
      enforceVisiblePlayLockBothSeats:true
    };
    const arm={...item,candidate60Sha256:hash(plan.candidate.cards),
      source60Sha256:hash(source.cards),policyVersion:VERSION,
      status:'not-attempted'};
    try {
      const guarded=withNativePaperSupporterDiscipline(
        ()=>withActorOwnedSetup(()=>runMatch(request)));
      const {result:game,audit:actor}=guarded.result;
      const quota=guarded.audit;
      const plays=(game.decisionTrace??[]).filter(row=>
        row.action==='PlayCardAction');
      const matching=actor.events.map(event=>({
        ...event,
        sameTurnRootPlays:plays.filter(play=>
          play.turnBefore===event.turn && play.playerSlot===event.seat &&
          (event.printing===play.card ||
            event.printing.startsWith(play.card+' ')))
          .map(play=>({ordinal:play.actionOrdinal,card:play.card}))
      }));
      arm.status='completed-development-cap';
      arm.actualFirstSlot=game.firstTurnSlot;
      arm.verifiedByDrawLog=game.verifiedByDrawLog;
      arm.actionCount=game.actions;
      arm.endReason=game.endReason;
      arm.finished=game.finished;
      arm.winner=game.finished?game.winner:null;
      arm.actualNativePlayCount=plays.length;
      arm.actorOnlyProposals=actor.actorOnlyProposals;
      arm.genericBotDelegations=actor.fullStateDelegations;
      arm.actorOnlyRootCandidates=matching;
      arm.matchedNativeRootProposals=matching.filter(e=>
        e.sameTurnRootPlays.length>0).length;
      arm.nativeSupporterQuotaQualified=
        quota.nativeSupporterQuotaQualified===true;
      arm.forbiddenSupporterDispatchCount=
        quota.rootDispatchVetoes?.length??null;
      arm.sourceInitialDealSha256=
        game.initialSourceDealFingerprint?.digestSha256??null;
      arm.decisionRootSha256=hash(game.decisionTrace??[]);
      arm.competitiveGameQualified=false;
    }catch(err){
      arm.status='native-execution-error';
      arm.error=String(err?.message??err);
      arm.competitiveGameQualified=false;
    }
    rows.push(arm);
  }
  const summary={
    version:'agent9-actor-setup-real-store-dev-v1',
    claim:'Native accepted action evidence requires matching root rows; this is a bounded development policy',
    rows,competitiveQualifiedGames:0,
    actorOnlyProposals:rows.reduce((sum,row)=>sum+(row.actorOnlyProposals??0),0),
    matchedNativeRootProposals:rows.reduce((sum,row)=>
      sum+(row.matchedNativeRootProposals??0),0),
    successfulNativeRuns:rows.filter(row=>
      row.status==='completed-development-cap').length
  };
  console.log(JSON.stringify(summary,null,2));
  // This diagnostic must prove at least one real-root candidate choice.
  assert.ok(summary.matchedNativeRootProposals>0,
    'No actor-only setup proposal reached a logged native root');
}
if(require.main===module)main();
module.exports={main};
