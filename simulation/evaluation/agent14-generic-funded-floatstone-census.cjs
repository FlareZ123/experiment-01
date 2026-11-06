'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {createHash}=require('node:crypto');
const profile=require('./agent41-frozen-bilateral-development-v2.json');
const {registeredTrials}=require(
  './agent14-prospective-generic-funded-floatstone.cjs');
const {treatmentOptions}=require(
  './agent10-rank9-known-dead-attack-counterfactual.cjs');

const VERSION='agent14-generic-funded-original-source-opportunity-census-v2-held-gates';
const ROOT=path.resolve(__dirname,'../..');
const BASELINE_FINGERPRINT=
  'cf2722c6fbd637a43c20a05dcc4a0d26cae7f1171d5cb2ecdab229ddee65b4b6';
const OUTPUT=path.join(ROOT,'agent14-generic-funded-floatstone-census.json');

/**
 * Recompute the immutable initial-deal + full root-ledger digest from the
 * previous preregistered original 12 paired control attempts. Any later
 * source changes making replay incomparable are explicitly disclosed.
 * @param {object[]} rows Real native result rows.
 * @returns {string} 64-character lowercase SHA-256.
 */
function baselineFingerprint(rows){
  const selected=rows.map(row=>[
    row.trial.id,row.rootActionLedgerSha256,row.fullPhysicalDealFingerprint
  ]);
  return createHash('sha256').update(JSON.stringify(selected)).digest('hex');
}

/**
 * Atomic locked output of complete observation counters and public comparison
 * identity. Does not overwrite previous completed data after crashes.
 * @param {object} value Reproducibility envelope.
 */
function save(value){
  const lock=OUTPUT+'.lock',temporary=OUTPUT+'.tmp.'+process.pid;
  const fd=fs.openSync(lock,'wx');
  try{
    fs.writeFileSync(temporary,JSON.stringify(value,null,2)+'\n');
    fs.renameSync(temporary,OUTPUT);
  }finally{
    if(fs.existsSync(temporary))fs.unlinkSync(temporary);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}

/**
 * Observer-only genuine owner-root rerun of the exact prior original physical
 * seeds and unchanged bilateral policy. Same-file helper makes zero native
 * selections and reads only the detached acting owner's view.
 * @returns {object} Aggregate and by-trial owner-root evidence.
 */
function run(){
  const trials=registeredTrials();
  assert.equal(trials.length,12);
  const previous={};
  for(const [key,value] of Object.entries(profile.injectedResearchEnvironment)){
    previous[key]=process.env[key];
    process.env[key]=value;
  }
  try{
    require('./agent41-frozen-bilateral-development-v1.cjs')
      .assertPinnedNativeStore(ROOT,profile);
    const options={
      ...treatmentOptions(),
      actorNaturalEvolutionRoot:true,
      actorVipBeforeAttack:true,
      actorVipMegaAbsolTarget:true,
      bilateralKnownDeadAttackRoot:true,
      actorRank9MegaAbsolFundingRoot:true,
      actorFlexiblePaidRetreatRoot:true,
      actorUnderworldDoorRoot:true,
      actorUnderworldDoorPromptOwner:true,
      actorGenericFundedFloatStoneRoot:false,
      actorGenericFundedFloatStoneCensus:true,
      registeredTrials:trials,
      allowAdditionalOriginalSourceRanks:true,
      registeredFrameName:VERSION
    };
    const observed=require('./agent41-bilateral-v2-development.cjs')
      .runDevelopment(options);
    assert.equal(observed.attempted,12);
    const sections=observed.rows.map(row=>{
      const rootAudit=row.actorOnlyDecisionCoverage
        ?.detailedComponentAudits?.root;
      const census=rootAudit?.genericFundedFloatStoneAudit;
      assert.ok(census,'missing nested canonical actor-root census');
      assert.equal(rootAudit?.genericFundedFloatStoneAuditOptIn,true);
      return {
        id:row.trial.id,
        sourceSeat:row.sourceSeat,candidateSeat:row.candidateSeat,
        actualStarterSeat:row.actualStarterSeat,
        sourceDeckFingerprint:row.sourceDeckFingerprint,
        candidateDeckFingerprint:row.candidateDeckFingerprint,
        fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint,
        rootActionLedgerSha256:row.rootActionLedgerSha256,
        actionCount:row.actionCount,endReason:row.endReason,
        nativeGameFinished:row.finished,
        census
      };
    });
    const finger=baselineFingerprint(observed.rows);
    const keys=['ownerRoots','ownerHeldToolRoots',
      'ownerAttachedToolRoots','partiallyFundedActiveRoots',
      'currentlyEligibleRoots','declinedWhileToolHeld',
      'selectedAsNativeIntent'];
    const aggregate=Object.fromEntries(keys.map(key=>[
      key,sections.reduce((sum,s)=>sum+(s.census[key]??0),0)
    ]));
    aggregate.eligibleBySeat=[0,1].map(seat=>sections.reduce(
      (sum,s)=>sum+s.census.eligibleBySeat[seat],0));
    const gateFields=require('../twinleaf/agent14-floatstone-held-owner-gates.cjs')
      .FIELDS;
    aggregate.heldGateCounts=Object.fromEntries(gateFields.map(gate=>[
      gate,sections.reduce((sum,s)=>sum+
        (s.census.heldGateCounts?.[gate]??0),0)
    ]));
    for(const gate of gateFields){
      assert.ok(aggregate.heldGateCounts[gate]<=aggregate.ownerHeldToolRoots,
        'held-only gate count exceeds held-root denominator');
    }
    const result={
      version:VERSION,registeredTrials:trials.map(x=>x.id),
      enginePin:profile.pinnedVendorRevision,
      researchHead:process.env.GITHUB_SHA??null,
      controlOriginalRunId:41884669860,
      controlRawArtifactId:13351940105,
      controlRawJsonSha256:
        'f66065ed23626de9253d20203cce5ac068e58f22e4324fd8ea11c98736e02fd9',
      originalBaselineFingerprint:BASELINE_FINGERPRINT,
      replayFingerprint:finger,
      exactPreviouslyRegisteredOpeningAndNativeRoots:
        finger===BASELINE_FINGERPRINT,
      samePhysicalSourceAndCandidateDecks:true,
      selectedPolicyUnchanged:true,
      observerOptionOnly:true,
      registeredArms:12,
      aggregate,rows:sections,
      competitiveQualifiedGames:0,
      caveat:'Observer records eligibility of a conservative owner-only proposal. Root replay identity checked against exact original development archive. No intervention, paper-game or win-rate inference.'
    };
    save(result);
    return result;
  }finally{
    for(const [key,value] of Object.entries(previous)){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
}

if(require.main===module){
  try{
    const v=run();
    console.log('AGENT14_GENERIC_FUNDED_CENSUS',JSON.stringify({
      identicalPriorNativeRoots:v.exactPreviouslyRegisteredOpeningAndNativeRoots,
      originalDigest:v.originalBaselineFingerprint,
      observedDigest:v.replayFingerprint,
      aggregate:v.aggregate,byRank:v.rows.map(x=>({
        id:x.id,eligible:x.census.currentlyEligibleRoots,
        held:x.census.ownerHeldToolRoots,
        partiallyFunded:x.census.partiallyFundedActiveRoots,
        passes: x.actionCount,
        end:x.endReason
      })),
      competitiveQualifiedGames:0
    }));
    if(!v.exactPreviouslyRegisteredOpeningAndNativeRoots)process.exitCode=1;
  }catch(e){
    console.error(e);
    process.exitCode=1;
  }
}
module.exports={VERSION,baselineFingerprint,run};
