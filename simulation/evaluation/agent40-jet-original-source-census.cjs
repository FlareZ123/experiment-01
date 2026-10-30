'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {withLiveJetRootCensus,VERSION:OBSERVER_VERSION}=
  require('../twinleaf/agent40-live-jet-root-census.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REGISTRATION='results/aichi-2026/registrations/agent40-jet-natural-source-census-20261030.json';
const REG_BLOB='7684f6c81861b777b6ce19ab016042c9d12329f1';
const VERSION='agent40-original-jet-native-readonly-12-arm-v1';

/**
 * Verify frozen case selection and native exact original rank identities
 * before permitting any observation. This registration predates gameplay.
 * @returns {object}
 */
function registration(){
  const bytes=fs.readFileSync(path.join(ROOT,REGISTRATION));
  const sha=createHash('sha1').update('blob '+bytes.length+'\0')
    .update(bytes).digest('hex');
  assert.equal(sha,REG_BLOB,'Original preregistration modified');
  const plan=JSON.parse(bytes.toString('utf8'));
  assert.equal(plan.registeredAttempts,12);
  assert.equal(plan.trials.length,12);
  assert.equal(plan.candidateComparisonRank,1);
  assert.deepEqual(plan.sourceRanks,[2,7,15]);
  assert.equal(plan.maxActions,200);
  assert.equal(plan.observationsOnly,true);
  assert.equal(plan.originalDecisionsUnchanged,true);
  const ids=new Set(),seeds=new Set();
  for(const trial of plan.trials){
    assert.ok(plan.sourceRanks.includes(trial.rank));
    assert.ok(trial.sourceSeat===0||trial.sourceSeat===1);
    assert.ok(trial.repeat===0||trial.repeat===1);
    assert.ok(Number.isSafeInteger(trial.seed)&&trial.seed>=0&&
      trial.seed<=0xffffffff);
    const id=[trial.rank,trial.sourceSeat,trial.repeat].join(':');
    assert.equal(ids.has(id),false,'Duplicate registered cell');
    assert.equal(seeds.has(trial.seed),false,'Reused source deal seed');
    ids.add(id);seeds.add(trial.seed);
  }
  assert.equal(ids.size,12);
  return plan;
}

/**
 * Single prerecorded bounded nonintervention sweep. Preserve all exceptions
 * and action caps; do not filter by observed positive root or game outcome.
 * @returns {object}
 */
function run(){
  const plan=registration();
  // Deferred native imports let the frozen registration and observer
  // contract be tested without compiling the optional Twinleaf submodule.
  const {planAichi}=require('./aichi-pilot.cjs');
  const {runMatch}=require('../twinleaf/headless.cjs');
  const resolved=planAichi(plan.candidateComparisonRank,{
    allowEquivalentBasicEnergies:plan.allowEquivalentBasicEnergies,
    allowBasicEnergyMirrorPrintings:plan.allowEquivalentBasicEnergies,
    allowJapanesePromoHooks:plan.allowJapanesePromoHooks
  });
  const sourceDecks=new Map(resolved.opponents.map(x=>[x.rank,x]));
  assert.equal(resolved.candidate.cards?.length,60,
    'Authenticated comparison source must resolve exactly 60');
  for(const rank of plan.sourceRanks){
    const opponent=sourceDecks.get(rank);
    assert.equal(opponent?.status,'ready',
      'Preregistered original source '+rank+' needs resolved 60');
    assert.equal(opponent.cards.length,60);
  }
  const rows=[];
  for(const t of plan.trials){
    const original=sourceDecks.get(t.rank);
    const decks=t.sourceSeat===0?
      [original.cards,resolved.candidate.cards]:
      [resolved.candidate.cards,original.cards];
    const request={
      deckA:decks[0],deckB:decks[1],seed:t.seed,
      maxActions:plan.maxActions,
      strictPromptValidation:plan.strictPromptValidation,
      isolatePolicyRandomness:plan.isolatePolicyRandomness,
      label:'agent40-jet-native-root-census:'+t.rank+':'+
        t.sourceSeat+':'+t.repeat
    };
    const id=[t.rank,t.sourceSeat,t.repeat].join(':');
    try{
      const {result,audit}=withLiveJetRootCensus(
        ()=>runMatch(request),{trackedSeat:t.sourceSeat});
      rows.push({id,...t,status:'returned',finished:result?.finished===true,
        nativeResultStatus:result?.status??null,
        realStoreObserved:audit.realStoreObserved,
        sourceRootAudit:audit.bySeat[t.sourceSeat],
        heldSamples:audit.sourceHeldRootExamples,
        proposedSamples:audit.sourceProposalExamples});
    }catch(error){
      const audit=error?.agent40JetCensus??null;
      rows.push({id,...t,status:'native-exception',
        error:String(error?.stack??error).slice(0,2000),
        realStoreObserved:audit?.realStoreObserved??false,
        sourceRootAudit:audit?.bySeat?.[t.sourceSeat]??null,
        heldSamples:audit?.sourceHeldRootExamples??[],
        proposedSamples:audit?.sourceProposalExamples??[]});
    }
  }
  assert.equal(rows.length,plan.registeredAttempts);
  return {schema:VERSION,observerVersion:OBSERVER_VERSION,
    registrationPath:REGISTRATION,registrationBlob:REG_BLOB,
    enginePin:plan.enginePin,originalSourceRanks:plan.sourceRanks,
    candidateComparisonRank:plan.candidateComparisonRank,
    exactSourceManifest:plan.exactSourceManifest,
    frozenMaxActions:plan.maxActions,
    registeredAttempts:rows.length,
    nativeExceptions:rows.filter(x=>x.status==='native-exception').length,
    returned:rows.filter(x=>x.status==='returned').length,
    totalOwnerRoots:rows.reduce((n,r)=>n+(r.sourceRootAudit?.roots??0),0),
    totalHeldJetRoots:rows.reduce((n,r)=>
      n+(r.sourceRootAudit?.heldJetRoots??0),0),
    totalProposedJetRoots:rows.reduce((n,r)=>
      n+(r.sourceRootAudit?.proposedJetRoots??0),0),
    rows,competitiveQualifiedGames:0,
    claim:'Observation of weak-bot genuine owner roots only; no action changed or strong fixed-deck win rate inferred.'};
}

/**
 * One locked/atomic archive write for the manual-only Actions artifact.
 * @param {string} destination
 * @param {object} value
 */
function writeArchive(destination,value){
  const lock=destination+'.lock',temp=destination+'.tmp-'+process.pid;
  const lockFd=fs.openSync(lock,'wx');
  try{
    const fd=fs.openSync(temp,'wx');
    try{
      fs.writeFileSync(fd,JSON.stringify(value,null,2)+'\n');
      fs.fsyncSync(fd);
    }finally{fs.closeSync(fd);}
    fs.renameSync(temp,destination);
  }finally{
    fs.closeSync(lockFd);
    fs.rmSync(lock,{force:true});
    fs.rmSync(temp,{force:true});
  }
}

if(require.main===module){
  const outcome=run();
  writeArchive(path.join(ROOT,'agent40-jet-original-source-census.json'),
    outcome);
  process.stdout.write(JSON.stringify({
    schema:outcome.schema,attempted:outcome.registeredAttempts,
    returned:outcome.returned,nativeExceptions:outcome.nativeExceptions,
    totalOwnerRoots:outcome.totalOwnerRoots,
    totalHeldJetRoots:outcome.totalHeldJetRoots,
    totalProposedJetRoots:outcome.totalProposedJetRoots,
    competitiveQualifiedGames:0
  })+'\n');
}

module.exports={VERSION,REGISTRATION,REG_BLOB,registration,run,writeArchive};
