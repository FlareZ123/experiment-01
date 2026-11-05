'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {actorObservation}=
  require('../twinleaf/actor-observation-contract.cjs');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {runStewardInnermostPrizeV5}=
  require('./agent36-issue25-steward-innermost-prize-v5.cjs');

const VERSION='agent20-issue25-v5-registered-two-source-pass-actor-visible-v1';
const REGISTRATION=
  require('../../results/aichi-2026/registrations/agent35-v5-original-source-pass-opportunity-pair-20261105.json');
const digest=value=>createHash('sha256').update(JSON.stringify(value))
  .digest('hex');

/**
 * Capture the two previously registered original-source Pass decisions.
 * Installation is at headless.runMatch, INSIDE the existing selected v5
 * prompt policy and the canonical actor root policy. No action is changed.
 * Only the acting player's own hand and public state enter the snapshot.
 * 
 * @template T
 * @param {()=>T} next
 * @param {{headless?:{runMatch:Function},SimpleTacticsAi?:Function,
 *   observe?:Function,registration?:object}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withRegisteredSourcePassSnapshots(next,deps={}){
  assert.equal(typeof next,'function');
  const headless=deps.headless??require('../twinleaf/headless.cjs');
  const SimpleTacticsAi=deps.SimpleTacticsAi??require(path.resolve(
    __dirname,'../../vendor/twinleaf/ptcg-server/output/simple-bot/simple-tactics-ai'
  )).SimpleTacticsAi;
  const observe=deps.observe??actorObservation;
  const registration=deps.registration??REGISTRATION;
  assert.equal(registration.roots?.length,2);
  const previous=headless.runMatch;
  assert.equal(typeof previous,'function');
  const cases=[];

  function observedRunMatch(request){
    const target=registration.roots.find(row=>
      typeof request?.label==='string'&&request.label.endsWith(row.id));
    if(!target)return previous(request);
    const proto=SimpleTacticsAi.prototype;
    const prior=Object.getOwnPropertyDescriptor(proto,'decodeNextAction');
    assert.equal(typeof prior?.value,'function');
    const captured=[];
    function observedDecode(state,...args){
      const owner=state?.players?.[target.sourceSeat];
      const isOwnerTarget=state?.activePlayer===target.sourceSeat&&
        state?.turn===target.turn&&
        owner?.id===this.client?.id&&
        !state.prompts?.some(prompt=>prompt.result===undefined);
      const before=isOwnerTarget?observe(state,target.sourceSeat):null;
      const action=prior.value.call(this,state,...args);
      if(before&&action?.constructor?.name==='PassTurnAction'){
        assert.equal(before.decisionKind,'owner-root');
        captured.push({
          id:target.id,
          sourceSeat:target.sourceSeat,
          globalTurn:before.globalTurn,
          chosenAction:'PassTurnAction',
          ownerVisibleBeforeChoice:before,
          observerReadOnly:true,
          opponentPrivateZonesExcluded:true
        });
      }
      return action;
    }
    Object.defineProperty(proto,'decodeNextAction',{
      ...prior,value:observedDecode
    });
    let returned=false;
    try{
      const result=previous(request);
      returned=true;
      return result;
    }finally{
      assert.strictEqual(proto.decodeNextAction,observedDecode,
        'Native root decoder unexpectedly replaced during owner audit');
      Object.defineProperty(proto,'decodeNextAction',prior);
      cases.push({
        id:target.id,
        nativeReturned:returned,
        captured,
        selectedPassCount:captured.length,
        sourcePassPaperPayability:'unverified'
      });
    }
  }

  headless.runMatch=observedRunMatch;
  try{
    const result=next();
    return {result,audit:{
      version:VERSION,
      originalRegisteredTargets:registration.roots.map(r=>r.id),
      cases,
      readOnly:true,
      sourceIndependentBothSeats:true,
      opponentHiddenZonesNeverInspected:true,
      competitiveGamesQualified:0
    }};
  }finally{
    assert.strictEqual(headless.runMatch,observedRunMatch,
      'Native match decoder unexpectedly replaced during owner audit');
    headless.runMatch=previous;
  }
}

/**
 * Match genuine previously recorded Pass decisions to owner-only snapshots
 * and to the pre-existing printed-card negative-necessity screen.
 * An unresolved card's positive paper legality is NEVER inferred.
 *
 * @param {object} native Native selected v5 return.
 * @param {object} snapshots Read-only live observer audit.
 * @param {object} [registration] Frozen historical anchor manifest.
 * @returns {object}
 */
function joinRegisteredPassOpportunities(native,snapshots,registration=REGISTRATION){
  const rows=native?.rawDevelopment?.rows??[];
  assert.equal(rows.length,8,'All eight original v5 attempts must survive');
  const byId=new Map(rows.map(row=>[row.trial?.id??row.id,row]));
  assert.equal(byId.size,8);
  assert.deepEqual(snapshots.originalRegisteredTargets,
    registration.roots.map(r=>r.id));
  const opportunities=registration.roots.map(target=>{
    const row=byId.get(target.id);
    assert.ok(row,'registered native row absent');
    const roots=row.rootActionLedger;
    assert.ok(Array.isArray(roots));
    const sourceDealMatched=row.sourceDealFingerprint===
      target.sourceDealFingerprint;
    const fullDealMatched=row.fullPhysicalDealFingerprint===
      target.fullPhysicalDealFingerprint;
    const publicRootDigest=digest(roots);
    const rootTapeMatched=publicRootDigest===
      target.originalAcceptedRootLedgerSha256;
    const sourcePass=roots.filter(root=>
      root.actionOrdinal===target.passRootOrdinal&&
      root.action==='PassTurnAction'&&
      root.playerSlot===target.sourceSeat&&
      root.turnBefore===target.turn);
    const caseAudit=snapshots.cases.find(x=>x.id===target.id);
    const ownerSnapshot=caseAudit?.captured?.length===1?
      caseAudit.captured[0].ownerVisibleBeforeChoice:null;
    const frontier=row.actorOnlyDecisionCoverage?.
      detailedComponentAudits?.ownerGenericTrainerFrontier?.roots??null;
    const matchingFrontiers=frontier?.filter(item=>
      item.seat===target.sourceSeat&&
      item.turn===target.turn&&
      item.chosen?.action==='PassTurnAction'&&
      item.dispatch==='native-accepted')??[];
    const screen=matchingFrontiers.length===1?
      matchingFrontiers[0].ownerPaperNecessity??null:null;
    const eligibleNegative=screen?.rows?.filter(x=>
      x.paperPlayable===false)??[];
    const unresolved=screen?.rows?.filter(x=>
      x.paperPlayable===null)??[];
    const exactHistoricRootReproduced=
      sourceDealMatched&&fullDealMatched&&rootTapeMatched&&
      sourcePass.length===1;
    return {
      id:target.id,sourceRank:target.sourceRank,
      sourceSeat:target.sourceSeat,candidateSeat:target.candidateSeat,
      globalTurn:target.turn,passRootOrdinal:target.passRootOrdinal,
      sourceDealMatched,fullDealMatched,rootTapeMatched,
      exactHistoricRootReproduced,
      actualPassAccepted:sourcePass.length===1,
      nativeDisposition:row.status??null,
      ownerSnapshotCount:caseAudit?.selectedPassCount??null,
      ownerVisibleBeforeChoice:ownerSnapshot,
      selectedOwnerTrainerScreen:screen,
      paperNecessaryRejectedTrainerCopies:eligibleNegative.length,
      printedNecessaryBlockers:eligibleNegative.map(x=>({
        handIndex:x.handIndex,printing:x.printing,
        reasons:x.necessaryBlockers
      })),
      unresolvedHeldTrainerCopies:unresolved.length,
      allHeldTrainerCopiesScreened:screen!==null,
      ownerActorObservationVerified:ownerSnapshot?.actorSeat===
        target.sourceSeat&&ownerSnapshot?.globalTurn===target.turn,
      independentPaperPayableAlternativeVerified:false,
      ownerPaperLegalActionSetComplete:false,
      opponentPrivateInformationUsed:false,
      qualifiedGames:0
    };
  });
  return {
    schema:VERSION,
    selectedHistoricalAnchors:opportunities.length,
    nativeAttemptCount:rows.length,
    sourceRootsRetrospectivelySelected:true,
    samePrinted60SourceIndependentPolicy:true,
    fullRootTapeParityAtBothAnchors:opportunities.every(x=>
      x.exactHistoricRootReproduced),
    snapshotsAndNecessaryScreensPresent:opportunities.every(x=>
      x.ownerActorObservationVerified&&x.allHeldTrainerCopiesScreened),
    opportunities,
    nativeStatuses:rows.map(row=>({
      id:row.trial?.id??row.id,
      status:row.status??null,
      acceptedNativeRoots:row.rootActionLedger?.length??null
    })),
    paperPayableAlternative:'unverified',
    finalGameQualification:'FAIL-development-only',
    qualifiedGames:0
  };
}

/**
 * Replay every original registered source cell with the same v5 common
 * policy and *only* an owner-private read-only Trainer/snapshot audit.
 * Changes in physical deal or genuine Store roots disqualify comparisons.
 * @param {{selectedRunner?:Function,observer?:Function}} [deps]
 * @returns {object}
 */
function runOriginalV5SourcePassOpportunities(deps={}){
  const selected=deps.observer??withRegisteredSourcePassSnapshots;
  const replay=selected(()=>(
    deps.selectedRunner??(()=>runStewardInnermostPrizeV5({
      runner:options=>runDevelopment({
        ...options,ownerGenericTrainerFrontier:true
      })
    }))
  )());
  const joined=joinRegisteredPassOpportunities(replay.result,replay.audit);
  return {...joined,sourceObserverVersion:replay.audit.version};
}

module.exports={
  VERSION,REGISTRATION,withRegisteredSourcePassSnapshots,
  joinRegisteredPassOpportunities,runOriginalV5SourcePassOpportunities
};
