'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const test=require('node:test');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {runStewardBroaderV8}=require('../simulation/evaluation/agent36-issue25-common-v8.cjs');
const {runIssue25V8WithOwnerAbilityPolicy}=require('../simulation/evaluation/agent36-issue25-v8-owner-ability-policy.cjs');
const {writeReceipt}=require('../simulation/evaluation/agent1-issue25-v4-public-receipt.cjs');

test('pinned native owner-ability loader resolves actual Store, bot and prompt classes',()=>{
  initializeCards();
  const {loadNativeAbilityDependencies}=require(
    '../simulation/twinleaf/agent36-owner-ability-confirm-policy.cjs');
  const {ptcgServer,types}=loadNativeAbilityDependencies();
  for(const name of ['Store','SimpleTacticsAi','ConfirmPrompt',
    'ChooseCardsPrompt','ResolvePromptAction']){
    assert.equal(typeof ptcgServer[name],'function',name);
  }
  assert.equal(typeof types.CardType.WATER,'number');
  assert.equal(typeof types.SuperType.POKEMON,'number');
  assert.equal(typeof types.Stage.VMAX,'number');
  assert.equal(types.GameMessage.WANT_TO_USE_ABILITY,
    'WANT_TO_USE_ABILITY');
});

function idOf(row){return row.trial?.id??row.id??null;}
function rootsOf(row){
  const direct=row.rootActionLedger;
  const archived=row.nativePublicRootArchive?.rootActionLedger;
  const aborted=row.nativeAbortEvidence?.rootActionLedger;
  if(Array.isArray(direct)&&direct.length>0)return direct;
  if(Array.isArray(archived))return archived;
  if(Array.isArray(aborted))return aborted;
  return Array.isArray(direct)?direct:[];
}

function preservePublicTerminalFields(execution){
  const rawById=new Map((execution.rawDevelopment?.rows??[])
    .map(row=>[idOf(row),row]));
  execution.diagnostic.attemptedRows=
    (execution.diagnostic.attemptedRows??[]).map(status=>{
      const raw=rawById.get(status.id);
      if(!raw)return status;
      const direct=raw.rootActionLedger;
      const archived=raw.nativePublicRootArchive?.rootActionLedger;
      const aborted=raw.nativeAbortEvidence?.rootActionLedger;
      const observed=Array.isArray(direct)&&direct.length>0?direct:
        Array.isArray(archived)?archived:
        Array.isArray(aborted)?aborted:Array.isArray(direct)?direct:null;
      const nativeRootActionCount=raw.rootActionCount??
        (Array.isArray(observed)?observed.length:
          status.nativeRootActionCount??null);
      const nativeOutcome=status.status==='engine-error'||
        raw.nativeAbortProvenance?.aborted===true||
        raw.nativeAbortEvidence?.aborted===true||
        raw.error!==undefined&&raw.error!==null?'engine-error':
        raw.finished===true?'native-terminal':
        raw.finished===false&&raw.actionCount===128&&
          nativeRootActionCount===128?'action-cap':'returned-unqualified';
      return {
        ...status,
        status:nativeOutcome==='native-terminal'?
          'native-terminal-unqualified':
          nativeOutcome==='action-cap'?'root-cap-unqualified':status.status,
        nativeOutcome,
        actionCount:raw.actionCount??null,
        finished:raw.finished??status.finished??null,
        winner:raw.winner??null,
        endReason:raw.endReason??null,
        finalPrizes:raw.finalPrizes??null,
        finalBoard:raw.finalBoard??null,
        candidateAttackSettlement:raw.candidateAttackSettlement??null,
        settledPublicAttackCount:raw.settledPublicAttackCount??null,
        attackDeclarations:raw.attackDeclarations??null,
        firstSettledPublicAttack:raw.firstSettledPublicAttack??null,
        nativeRootActionCount,
        terminalWinnerMatchesCandidate:raw.finished===true&&
          raw.winner===(raw.candidateSeat??status.candidateSeat)
      };
    });
}

test('same-eight v8 owner ability policy settles Radiant VMAX search and Articuno negative controls',()=>{
  initializeCards();
  const control=runStewardBroaderV8();
  const treatment=runIssue25V8WithOwnerAbilityPolicy();
  const controlRaw=control.rawDevelopment?.rows??[];
  const treatmentRaw=treatment.rawDevelopment?.rows??[];
  preservePublicTerminalFields(control);
  preservePublicTerminalFields(treatment);
  const controlSummary=new Map(control.diagnostic.actualAttemptRows.map(row=>[row.id,row]));
  const treatmentSummary=new Map(treatment.diagnostic.actualAttemptRows.map(row=>[row.id,row]));
  const controlById=new Map(controlRaw.map(row=>[idOf(row),row]));
  const pairs=treatmentRaw.map(row=>{
    const id=idOf(row),before=controlById.get(id);
    const old=controlSummary.get(id),current=treatmentSummary.get(id);
    return {
      id,
      controlStatus:old?.status??null,
      treatmentStatus:current?.status??null,
      sameInitialSourceDeal:!!old?.sourceDealFingerprint&&
        old.sourceDealFingerprint===current?.sourceDealFingerprint,
      sameInitialFullPhysicalDeal:!!old?.fullPhysicalDealFingerprint&&
        old.fullPhysicalDealFingerprint===current?.fullPhysicalDealFingerprint,
      controlRootCount:before?rootsOf(before).length:0,
      treatmentRootCount:rootsOf(row).length,
      exactControlRootPrefix:!!before&&
        rootsOf(row).length>=rootsOf(before).length&&
        JSON.stringify(rootsOf(row).slice(0,rootsOf(before).length))===
          JSON.stringify(rootsOf(before)),
      nativeOutcome:current?.nativeOutcome??null,
      candidateSeat:current?.candidateSeat??row.candidateSeat??null,
      candidateAttackSettlement:row.candidateAttackSettlement??null
    };
  });
  const policyAudit=treatment.diagnostic.nativeOwnerAbilityPolicyAudit;
  const abilityAudit=policyAudit?.ownerAbilityConfirm;
  const confirmEvents=abilityAudit?.confirmEvents??[];
  const radiantDecision=confirmEvents.filter(event=>
    event.cardName==='Radiant Eternatus');
  const articunoDecisions=confirmEvents.filter(event=>
    event.cardName==='Articuno-GX');
  const searchEvents=abilityAudit?.radiantSearchEvents??[];
  const telepathAudit=policyAudit?.telepath;
  const archiveDir=process.env.ISSUE25_STEWARD_V8_ABILITY_POLICY_DIR;
  const archive=archiveDir?{
    control:writeReceipt(control,path.join(archiveDir,'control'),{
      prefix:'issue25-steward-v8',policyEntryPoint:control.manifest.policyEntryPoint
    }),
    treatment:writeReceipt(treatment,path.join(archiveDir,'treatment'),{
      prefix:'issue25-steward-v8',policyEntryPoint:treatment.manifest.policyEntryPoint
    })
  }:null;
  const report={
    schema:'agent36-v8-owner-ability-confirm-policy-native-v1',
    controlAttempts:controlRaw.length,treatmentAttempts:treatmentRaw.length,
    sameRegistration:pairs.length===8&&pairs.every(row=>controlById.has(row.id)),
    sameInitialSourceDeals:pairs.every(row=>row.sameInitialSourceDeal),
    sameInitialFullPhysicalDeals:pairs.every(row=>row.sameInitialFullPhysicalDeal),
    exactPriorRootPrefixAllArms:pairs.every(row=>row.exactControlRootPrefix),
    allTreatmentOutcomesTerminalOrCap:pairs.length===8&&pairs.every(row=>
      row.nativeOutcome==='native-terminal'||row.nativeOutcome==='action-cap'),
    confirmOffers:abilityAudit?.confirmOffers??0,
    confirmSettled:abilityAudit?.confirmSettled??0,
    confirmUnsettled:abilityAudit?.confirmUnsettled??0,
    radiantDecision,articunoDecisions,searchEvents,
    articunoMoveEnergyEvents:abilityAudit?.articunoMoveEnergyEvents??[],
    telepathAudit,pairs,archive,
    readsOpponentHidden:abilityAudit?.readsOpponentHidden??null,
    readsUnopenedDeck:abilityAudit?.readsUnopenedDeck??null,
    competitiveGamesQualified:0,releaseQualified:false
  };
  console.log('AGENT36_V8_OWNER_ABILITY_POLICY_NATIVE',JSON.stringify(report));
  assert.equal(report.controlAttempts,8);
  assert.equal(report.treatmentAttempts,8);
  assert.equal(report.sameRegistration,true);
  assert.equal(report.sameInitialSourceDeals,true);
  assert.equal(report.sameInitialFullPhysicalDeals,true);
  assert.equal(report.exactPriorRootPrefixAllArms,true);
  assert.equal(report.allTreatmentOutcomesTerminalOrCap,true);
  assert.equal(report.confirmOffers,11);
  assert.equal(report.confirmSettled,11);
  assert.equal(report.confirmUnsettled,0);
  assert.equal(report.readsOpponentHidden,false);
  assert.equal(report.readsUnopenedDeck,false);
  assert.equal(radiantDecision.length,1);
  assert.equal(radiantDecision[0].decision,true);
  assert.equal(radiantDecision[0].reason,'radiant-has-bench-capacity');
  assert.equal(articunoDecisions.length,2);
  assert.ok(articunoDecisions.every(event=>event.decision===false));
  assert.ok(articunoDecisions.every(event=>
    event.reason==='articuno-insufficient-or-excess-water-transfer'));
  assert.equal(searchEvents.length,1);
  assert.ok(searchEvents[0].targetCount>=1);
  assert.equal(searchEvents[0].allTargetsVmax,true);
  assert.equal(searchEvents[0].promptSettled,true);
  assert.equal(searchEvents[0].physicallyBenched,true);
  assert.equal(searchEvents[0].stillInDeck,false);
  assert.equal(report.articunoMoveEnergyEvents.length,0);
  assert.ok(telepathAudit);
  assert.equal(telepathAudit.readsOpponentHidden,false);
  assert.equal(telepathAudit.readsUnopenedDeck,false);
  assert.ok(telepathAudit.matchingOwnerSearches>=2);
  assert.equal(telepathAudit.settled,telepathAudit.matchingOwnerSearches);
  assert.equal(telepathAudit.shuffleMissing,0);
  assert.equal(telepathAudit.custodyFailures,0);
  assert.equal(treatment.manifest.releaseQualified,false);
  assert.equal(treatment.diagnostic.competitiveGamesQualified,0);
});
