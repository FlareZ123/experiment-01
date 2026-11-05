'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {runMirroredIssue25V6,loadMirroredRegistration}=
  require('./agent1-issue25-mirrored-r6-r11-v6.cjs');
const {hashRegisteredFile}=
  require('./agent36-issue25-selected-v0.cjs');

const VERSION='agent4-issue25-symmetric-special-energy-evolution-v1';
const ROOT=path.resolve(__dirname,'../..');
const OUTPUT='artifacts/agent4-issue25-symmetric-resources-v1.json';
const SOURCE='results/aichi-2026/full-decklists.json';
const PROFILE='simulation/evaluation/agent4-issue25-symmetric-owner-resources-v1.cjs';
const sha256=value=>createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/**
 * Return the original source's exact published Energy names, never Energy
 * acquired from or inferred about the opposing private hand.
 * @returns {Map<number,Set<string>>}
 */
function publishedEnergyByRank(){
  const registry=JSON.parse(fs.readFileSync(path.join(ROOT,SOURCE),'utf8'));
  const result=new Map();
  for(const rank of [6,11]){
    const deck=registry.decks.find(d=>d.rank===rank);
    assert.ok(deck&&Array.isArray(deck.cards));
    assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60);
    result.set(rank,new Set(deck.cards.filter(c=>c.category==='Energy')
      .map(c=>c.name)));
  }
  return result;
}

/**
 * A literal source action ledger is a post-Store diagnostic, not a paper-legal
 * receipt. Keep the complete native ledger in the archived raw output.
 * @param {object} row
 * @param {Set<string>} energyNames
 * @returns {object}
 */
function sourceActions(row,energyNames){
  const trial=row.trial;
  assert.ok(trial&&[6,11].includes(trial.rank));
  const sourceSeat=trial.candidateSlot==='A'?1:0;
  const ledger=Array.isArray(row.rootActionLedger)?
    row.rootActionLedger:[];
  const source=ledger.filter(x=>x.playerSlot===sourceSeat);
  const energy=source.filter(x=>x.action==='PlayCardAction'&&
    typeof x.card==='string'&&
    [...energyNames].some(n=>x.card===n||x.card.startsWith(n+' ')));
  return {
    id:trial.id,rank:trial.rank,sourceSeat,
    candidateId:trial.candidateId,seed:trial.seed,
    status:row.status??(row.finished?'native-terminal':'native-nonterminal'),
    finished:row.finished===true,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    sourceFirstOwnHandMultisetSha256:row.sourceFirstOwnHandMultisetSha256??null,
    nativeRootCount:row.rootActionCount??ledger.length,
    sourceRootCount:source.length,
    sourcePlayCardNames:source.filter(x=>x.action==='PlayCardAction')
      .map(x=>x.card??null),
    sourceEnergyPlayNames:energy.map(x=>x.card),
    sourceAttackNames:source.filter(x=>x.action==='AttackAction')
      .map(x=>x.attack??null),
    sourceActionLedgerSha256:sha256(source),
    sourceActionLedger:source,
    sourceAttackSettlement:row.sourceAttackSettlement??null,
    candidateRepliesAfterSourceAttacks:
      row.candidateRepliesAfterSourceAttacks??null,
    nativeAcceptedTargetSidecar:
      row.nativeAcceptedTargetSidecar??null,
    nativeAbortProvenance:row.nativeAbortProvenance??null,
    competitiveGamesQualified:0
  };
}

/**
 * Preserve the exact eight registered arms in each development mode. Native
 * source deals are compared within the same candidate 60 across policy modes;
 * a shared integer seed alone is never considered proof of matched cards.
 * @param {object} control
 * @param {object} enabled
 */
function reconcile(control,enabled){
  const registration=loadMirroredRegistration();
  const sourceEnergy=publishedEnergyByRank();
  const registered=registration.trials.map(x=>x.id);
  const modes=[['baseline',control],['symmetric-resources',enabled]];
  const output=[];
  for(const [mode,data] of modes){
    const rows=data?.rawDevelopment?.rows;
    assert.ok(Array.isArray(rows)&&rows.length===registered.length,
      'Every native arm including censored and errored attempts must be present');
    const byId=new Map();
    for(const row of rows){
      const id=row.trial?.id;
      assert.ok(registered.includes(id),'Unexpected unregistered game '+id);
      assert.ok(!byId.has(id),'Duplicate native game '+id);
      byId.set(id,sourceActions(row,sourceEnergy.get(row.trial.rank)));
    }
    assert.deepEqual([...byId.keys()].sort(),registered.slice().sort());
    output.push({mode,manifest:data.manifest,
      rowSummaries:registered.map(id=>byId.get(id)),rawDevelopment:data.rawDevelopment});
  }
  const [baseline,resource]=output;
  const pairs=registered.map((id,i)=>{
    const before=baseline.rowSummaries[i],after=resource.rowSummaries[i];
    const sameSource=before.sourceDealFingerprint&&after.sourceDealFingerprint?
      before.sourceDealFingerprint===after.sourceDealFingerprint:null;
    const sameFull=before.fullPhysicalDealFingerprint&&
      after.fullPhysicalDealFingerprint?
        before.fullPhysicalDealFingerprint===after.fullPhysicalDealFingerprint:null;
    const sameFirstHand=before.sourceFirstOwnHandMultisetSha256&&
      after.sourceFirstOwnHandMultisetSha256?
        before.sourceFirstOwnHandMultisetSha256===
          after.sourceFirstOwnHandMultisetSha256:null;
    const original=before.sourceActionLedger;
    const treated=after.sourceActionLedger;
    const changedAt=Array.from({length:Math.max(original.length,treated.length)},
      (_,k)=>k).find(k=>JSON.stringify(original[k])!==
        JSON.stringify(treated[k]))??null;
    return {
      id,rank:before.rank,sourceSeat:before.sourceSeat,
      samePretreatmentSourceDeal:sameSource,
      samePretreatmentFullDeal:sameFull,
      sameFirstLiveSourceHand:sameFirstHand,
      fullSourceLedgerFirstDifferenceIndex:changedAt,
      baselineStatus:before.status,treatmentStatus:after.status,
      baselineSourceEnergyActions:before.sourceEnergyPlayNames,
      treatmentSourceEnergyActions:after.sourceEnergyPlayNames,
      baselineSourceAttacks:before.sourceAttackNames,
      treatmentSourceAttacks:after.sourceAttackNames,
      paperEnergyPaymentAndSourceReplyCertified:false
    };
  });
  return {
    schema:VERSION,
    observedNativeVendorPin:
      enabled.manifest?.pinnedTwinleafRevision??
      enabled.manifest?.enginePin??null,
    registrationPath:
      'results/aichi-2026/registrations/agent1-issue25-mirrored-r6-r11-20261104.json',
    frozenSelectedPolicyVersion:control.manifest.version,
    treatment:{
      billet:'source-independent same two-seat actor-only root policy',
      bilateralPublicContextSpecialEnergy:true,
      actorNaturalEvolutionRoot:true,
      nativeAcceptedTargets:true
    },
    contentProvenance:[PROFILE,SOURCE,
      'simulation/evaluation/agent1-issue25-mirrored-r6-r11-v6.cjs']
      .map(hashRegisteredFile),
    predeclaredTrialIDs:registered,
    attemptedNativeGames:registered.length*modes.length,
    matchedSourceDealCount:pairs.filter(p=>
      p.samePretreatmentSourceDeal===true).length,
    mismatchedSourceDealCount:pairs.filter(p=>
      p.samePretreatmentSourceDeal===false).length,
    unknownSourceDealCount:pairs.filter(p=>
      p.samePretreatmentSourceDeal===null).length,
    matchedFullPhysicalDealCount:pairs.filter(p=>
      p.samePretreatmentFullDeal===true).length,
    samePhysicalSourceHandCount:pairs.filter(p=>
      p.sameFirstLiveSourceHand===true).length,
    sourceEnergyNativeActionCounts:modes.map(([,data],m)=>
      output[m].rowSummaries.reduce((total,row)=>
        total+row.sourceEnergyPlayNames.length,0)),
    pairs,
    modes:output,
    competitiveGamesQualified:0,
    winRateCertified:false,
    verdict:'development-native-policy-option-scope-only'
  };
}

/** Run both policies against the unchanged eight historical v6 registrations. */
function run(){
  const control=runMirroredIssue25V6({
    runner:options=>runDevelopment({...options,nativeAcceptedTargets:true})
  });
  const enabled=runMirroredIssue25V6({
    runner:options=>runDevelopment({...options,
      nativeAcceptedTargets:true,
      bilateralPublicContextSpecialEnergy:true,
      actorNaturalEvolutionRoot:true})
  });
  return reconcile(control,enabled);
}

/** Atomically archive full failure-inclusive native receipts with a lock. */
function save(receipt,filename=OUTPUT){
  const target=path.join(ROOT,filename);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  const lock=target+'.lock';
  const handle=fs.openSync(lock,'wx');
  const temp=target+'.'+process.pid+'.tmp';
  try{
    fs.writeFileSync(temp,JSON.stringify(receipt,null,2)+'\n');
    fs.renameSync(temp,target);
  }finally{
    fs.closeSync(handle);
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.unlinkSync(lock);
  }
  return target;
}

if(require.main===module){
  const receipt=run();
  save(receipt);
  console.log('AGENT4_ISSUE25_SOURCE_RESOURCES',
    JSON.stringify({
      schema:receipt.schema,
      attemptedNativeGames:receipt.attemptedNativeGames,
      matchedSourceDealCount:receipt.matchedSourceDealCount,
      mismatchedSourceDealCount:receipt.mismatchedSourceDealCount,
      unknownSourceDealCount:receipt.unknownSourceDealCount,
      matchedFullPhysicalDealCount:receipt.matchedFullPhysicalDealCount,
      sourceEnergyNativeActionCounts:receipt.sourceEnergyNativeActionCounts,
      pairStatuses:receipt.pairs.map(p=>({
        id:p.id,sourceSeat:p.sourceSeat,
        physicalMatch:p.samePretreatmentFullDeal,
        sourceMatch:p.samePretreatmentSourceDeal,
        baseline:p.baselineStatus,treatment:p.treatmentStatus,
        baselineEnergy:p.baselineSourceEnergyActions,
        treatmentEnergy:p.treatmentSourceEnergyActions
      })),
      competitivelyQualifiedGames:0
    }));
}

module.exports={VERSION,OUTPUT,publishedEnergyByRank,sourceActions,
  reconcile,run,save};
