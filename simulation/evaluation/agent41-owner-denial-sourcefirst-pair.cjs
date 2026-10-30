'use strict';

const assert=require('node:assert/strict');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');

const VERSION='agent41-owner-denial-retrospective-sourcefirst-pair-v1';
const DENIAL='play-team-flare-grunt-denial';
const POLICY_ENV=Object.freeze({
  AGENT1_TEAM_FLARE_GRUNT_DEV:'true',
  AGENT41_OWNER_TERMINAL_ARBITRATION_DEV:'false',
  AGENT17_PUBLIC_CONTEXT_SPECIAL_DEV:'false',
  AGENT3_SPECIAL_ENERGY_ROOT_DEV:'false'
});

/** @param {object} row @returns {object|null} Genuine actor root diagnostic. */
function rootAudit(row){
  return row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root??null;
}

/**
 * Count exactly what the existing root actually proposed or sampled in the
 * native Store. A capped acceptance sample supplies a lower bound only.
 * No count is a paper legality or strategically successful discard claim.
 * @param {object} row
 * @returns {object}
 */
function denialEvidence(row){
  const audit=rootAudit(row);
  if(!audit)return {
    actorRootObserved:false,selected:null,
    sampledAcceptedLowerBound:null,sampledRejectedLowerBound:null,
    arbitrationChanged:null,arbitrationDenialReasonCount:null
  };
  const sample=(audit.nativeRootAcceptances??[])
    .filter(entry=>entry.kind===DENIAL);
  const arbitrated=audit.terminalArbitration??null;
  return {
    actorRootObserved:true,
    selected:audit.typedIntentCounts?.[DENIAL]??0,
    sampledAcceptedLowerBound:sample.filter(entry=>entry.accepted===true).length,
    sampledRejectedLowerBound:sample.filter(entry=>entry.accepted===false).length,
    acceptanceSampleEntries:audit.nativeRootAcceptances?.length??0,
    rootChoicesTotal:audit.selectedRootDecisions??null,
    arbitrationChanged:arbitrated?.changedRoots??null,
    arbitrationDenialReasonCount:
      arbitrated?.reasons?.['deny-visible-active-energy-before-turn-ending-attack']??null
  };
}

/** @param {object} row @returns {string} */
function disposition(row){
  if(typeof row.status==='string')return row.status;
  if(row.finished===true)return 'native-terminal-unqualified';
  if(row.finished===false)return 'native-censored-unqualified';
  return 'incomplete-native-record';
}

/** @param {object[]} before @param {object[]} after @returns {object|null} */
function firstPublicRootDifference(before,after){
  if(!Array.isArray(before)||!Array.isArray(after))return null;
  const at=Array.from({length:Math.max(before.length,after.length)},
    (_,i)=>i).find(i=>JSON.stringify(before[i])!==JSON.stringify(after[i]));
  if(at===undefined)return {different:false,ordinal:null,control:null,treatment:null};
  const redact=root=>root?{
    actionOrdinal:root.actionOrdinal,turnBefore:root.turnBefore,
    playerSlot:root.playerSlot,action:root.action,
    card:root.card??null,attack:root.attack??null
  }:null;
  return {different:true,ordinal:at+1,
    control:redact(before[at]),treatment:redact(after[at])};
}

/**
 * Preserve same-deck actual first-player and physical-deal conditions. Every
 * attempt remains visible even when the Store errors or a witness is absent.
 * @param {object} control
 * @param {object} treatment
 * @returns {object}
 */
function compareProfiles(control,treatment){
  assert.equal(control.sourceFirstRetrospective,true);
  assert.equal(treatment.sourceFirstRetrospective,true);
  assert.equal(control.attempted,4);
  assert.equal(treatment.attempted,4);
  const treatedById=new Map(treatment.rows.map(row=>[row.trial.id,row]));
  assert.equal(treatedById.size,4);
  const rows=control.rows.map(a=>{
    const b=treatedById.get(a.trial.id);
    assert.ok(b,'Missing treatment for original physical trial '+a.trial.id);
    assert.equal(a.trial.seed,b.trial.seed);
    assert.equal(a.trial.candidateSlot,b.trial.candidateSlot);
    assert.equal(a.trial.candidateId,b.trial.candidateId);
    const decksMatch=typeof a.candidateDeckFingerprint==='string'&&
      a.candidateDeckFingerprint===b.candidateDeckFingerprint&&
      typeof a.sourceDeckFingerprint==='string'&&
      a.sourceDeckFingerprint===b.sourceDeckFingerprint&&
      a.enginePin===b.enginePin;
    const fullDealMatch=typeof a.fullPhysicalDealFingerprint==='string'&&
      a.fullPhysicalDealFingerprint===b.fullPhysicalDealFingerprint;
    const sourceDealMatch=typeof a.sourceDealFingerprint==='string'&&
      a.sourceDealFingerprint===b.sourceDealFingerprint;
    const firstPlayerMatch=a.verifiedFirstTurn===true&&
      b.verifiedFirstTurn===true&&
      a.actualStarterSeat===b.actualStarterSeat;
    return {
      trialId:a.trial.id,rank:a.trial.rank,seed:a.trial.seed,
      candidateId:a.trial.candidateId,candidateSlot:a.trial.candidateSlot,
      sourceSeat:a.sourceSeat??null,
      nativeDeckAndEngineMatch:decksMatch,
      sourceInitialDealMatch:sourceDealMatch,
      fullInitialDealMatch:fullDealMatch,
      actualFirstPlayerMatch:firstPlayerMatch,
      controlDisposition:disposition(a),
      treatmentDisposition:disposition(b),
      controlDenial:denialEvidence(a),
      treatmentDenial:denialEvidence(b),
      publicRootDifference:firstPublicRootDifference(
        a.rootActionLedger,b.rootActionLedger),
      controlNativeWinner:a.finished===true?a.winner:null,
      treatmentNativeWinner:b.finished===true?b.winner:null,
      qualifiedCompetitiveOutcome:false
    };
  });
  assert.equal(rows.length,4);
  return {
    schema:VERSION+'-comparison',
    expectedAttempts:8,
    observedAttempts:control.attempted+treatment.attempted,
    matchedInitialPhysicalStarts:rows.filter(row=>
      row.fullInitialDealMatch&&row.sourceInitialDealMatch&&
      row.actualFirstPlayerMatch&&row.nativeDeckAndEngineMatch).length,
    treatmentSelectedDenialsObserved:rows.reduce(
      (sum,row)=>sum+(row.treatmentDenial.selected??0),0),
    treatmentAcceptedDenialsSampleLowerBound:rows.reduce(
      (sum,row)=>sum+(row.treatmentDenial.sampledAcceptedLowerBound??0),0),
    treatmentRowsMissingRootAudit:rows.filter(row=>
      !row.treatmentDenial.actorRootObserved).length,
    rows,competitiveQualifiedGames:0,winRateCertified:false
  };
}

/**
 * Temporarily install one sealed policy profile into the current process,
 * then restore all environment variables even after a native Store failure.
 * @param {boolean} treatment
 * @param {Function} [execute] Pure-test injection with same options shape.
 * @returns {object}
 */
function runProfile(treatment,execute=runDevelopment){
  const assignments={...POLICY_ENV,
    AGENT41_OWNER_DENIAL_ARBITRATION_DEV:treatment?'true':'false'};
  const old=Object.fromEntries(Object.keys(assignments).map(
    key=>[key,process.env[key]]));
  try{
    for(const [key,value] of Object.entries(assignments))process.env[key]=value;
    return execute({
      actorOnlyComposition:true,
      sourceFirstRetrospective:true,
      mandatoryOptionFallback:true,
      paperSupporterQuota:true,
      paperSameTargetAttachEnergy:true,
      nativePressureWindows:true,
      nativeAcceptedTargets:true
    });
  }finally{
    for(const [key,value] of Object.entries(old)){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
}

/**
 * Two matched, already retrospective four-arm policies. The Store and its
 * source intervention remain unqualified for real competitive inference.
 * @param {Function} [execute]
 * @returns {object}
 */
function runPair(execute=runDevelopment){
  const control=runProfile(false,execute);
  const treatment=runProfile(true,execute);
  const comparison=compareProfiles(control,treatment);
  return {
    schema:VERSION,
    registration:'results/aichi-2026/registrations/agent41-denial-owner-sourcefirst-retrospective-20261030.md',
    profiles:{
      common:{...POLICY_ENV},
      controlDenialArbitration:'false',treatmentDenialArbitration:'true'
    },
    comparison,control,treatment,
    competitiveQualifiedGames:0,winRateCertified:false
  };
}

if(require.main===module){
  process.stdout.write(JSON.stringify(runPair(),null,2)+'\n');
}
module.exports={VERSION,POLICY_ENV,denialEvidence,
  disposition,firstPublicRootDifference,compareProfiles,runProfile,runPair};
