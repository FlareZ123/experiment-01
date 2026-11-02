'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REGISTRATION='results/aichi-2026/registrations/agent15-rank31-paper-v10-natural-paired-20261102.json';
const REGISTERED_BLOB='b0a3859fe16e8bd9bee54af57a95ba4401a09f69';
const AMENDMENT='results/aichi-2026/registrations/agent15-rank31-v10-pre-game-telemetry-amendment-20261102.json';
const AMENDMENT_BLOB='7cdf9be1eab951568560e0535d39cf25e722fcae';

/** @param {Buffer} bytes @returns {string} */
function gitBlobSha(bytes){
  return createHash('sha1').update('blob '+bytes.length+'\0')
    .update(bytes).digest('hex');
}
/** @param {unknown} value @returns {string} */
function sha256(value){
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}
/** @returns {{registration:object,source:object,rosterGitBlob:string,head:string}} */
function preflight(){
  const bytes=fs.readFileSync(path.join(ROOT,REGISTRATION));
  assert.equal(gitBlobSha(bytes),REGISTERED_BLOB);
  const registration=JSON.parse(bytes.toString('utf8'));
  const amendmentBytes=fs.readFileSync(path.join(ROOT,AMENDMENT));
  assert.equal(gitBlobSha(amendmentBytes),AMENDMENT_BLOB);
  const amendment=JSON.parse(amendmentBytes.toString('utf8'));
  assert.equal(amendment.parentRegistration,REGISTRATION);
  assert.equal(amendment.parentRegistrationGitBlob,REGISTERED_BLOB);
  assert.equal(amendment.pregameFailedWorkflow,41395333780);
  assert.equal(amendment.sourceGameStartedBeforeAmendment,false);
  assert.deepEqual(amendment.effectiveOverrides,{losslessNativeRootJoin:false});
  assert.equal(registration.schema,
    'agent15-rank31-source-v10-paper-payment-natural-same-deal-v1');
  assert.equal(registration.phase,
    'registered-before-first-native-rank31-v10-comparison');
  assert.equal(registration.sourceRank,31);
  assert.equal(registration.attemptsPerPolicy,4);
  assert.equal(registration.plannedNativeAttempts,8);
  assert.equal(registration.trials.length,4);
  const rosterBytes=fs.readFileSync(path.join(ROOT,
    'results/aichi-2026/full-decklists.json'));
  assert.equal(gitBlobSha(rosterBytes),registration.sourceRosterGitBlob);
  const roster=JSON.parse(rosterBytes.toString('utf8'));
  const source=roster.decks.find(row=>row.rank===31);
  assert.ok(source);
  const count=(name,set,number)=>source.cards.filter(c=>c.name===name&&
    c.printing?.set===set&&String(c.printing?.number)===String(number))
    .reduce((n,c)=>n+c.count,0);
  assert.equal(source.cards.reduce((n,c)=>n+c.count,0),60);
  assert.equal(count('Roxie','CEC',205),4);
  assert.equal(count('Koffing','CEC',76),3);
  assert.equal(count('Radiant Alakazam','SIT',59),1);
  for(const trial of registration.trials){
    assert.equal(trial.rank,31);
    assert.equal(trial.repeat,0);
    assert.ok(['A','B'].includes(trial.candidateSlot));
    assert.ok(registration.candidateIds.includes(trial.candidateId));
    assert.equal(trial.id,
      [31,0,trial.candidateSlot,trial.candidateId].join(':'));
    assert.equal(trial.seed,registration.seeds[trial.candidateSlot]);
    assert.ok(Number.isSafeInteger(trial.seed)&&trial.seed>=0&&
      trial.seed<=0xffffffff);
  }
  const ids=new Set(registration.trials.map(t=>t.id));
  assert.equal(ids.size,4);
  for(const seat of ['A','B'])
    for(const candidate of registration.candidateIds)
      assert.ok(ids.has('31:0:'+seat+':'+candidate));
  const pinned=execFileSync('git',['-C',path.join(ROOT,'vendor/twinleaf'),
    'rev-parse','HEAD'],{encoding:'utf8'}).trim();
  assert.equal(pinned,registration.enginePin);
  const head=execFileSync('git',['-C',ROOT,'rev-parse','HEAD'],
    {encoding:'utf8'}).trim();
  return {registration,amendment,source,rosterGitBlob:gitBlobSha(rosterBytes),head};
}
/** @param {object} row */
function summarize(row){
  const a=row.sharedPaperPaymentPortfolioAudit??
    row.sharedPaperPaymentPortfolioAbortEvidence??null;
  const sourceDeal=row.sourceDealFingerprint??
    row.nativeAbortEvidence?.sourceDealFingerprint?.digestSha256??null;
  const fullDeal=row.fullPhysicalDealFingerprint??
    row.nativeAbortEvidence?.fullPhysicalDealFingerprint?.digestSha256??null;
  return {
    id:row.trial?.id??null,seed:row.trial?.seed??null,
    status:row.status??(row.finished===true?'engine-terminal-unqualified':
      row.finished===false?'action-limit-censored':'unclassified'),
    finished:row.finished??null,
    winner:row.finished===true?(row.winner??null):null,
    error:row.error??null,
    sourceDealFingerprint:typeof sourceDeal==='string'?
      sourceDeal:sourceDeal?.digestSha256??null,
    fullPhysicalDealFingerprint:typeof fullDeal==='string'?
      fullDeal:fullDeal?.digestSha256??null,
    setupStatus:row.nativeSetupCoinChoiceReceipt?.status??null,
    rootActions:row.rootActionCount??row.rootActionLedger?.length??null,
    sourceAttacks:row.sourceAttackDeclarations??null,
    candidateAttacks:row.candidateAttackDeclarations??null,
    v10Requested:row.sharedPaperPaymentPortfolioOptIn===true,
    v10AuditVersion:a?.schema??null,
    liveStores:a?.liveSourceTrialCount??null,
    roxieRoots:a?.inspectedRoxiePlayCardRoots??null,
    roxieNoEligibleVetoes:a?.vetoedRoxieNoEligibleRoots??null,
    roxiePaymentPrompts:a?.inspectedRoxiePaymentPrompts??null,
    ultraBallRoots:a?.inspectedUltraBallPlayCardRoots??null,
    ultraBallPaymentPrompts:a?.inspectedUltraBallPaymentPrompts??null,
    nativeAcceptedPromptReplies:a?.nativeAccepted??null,
    paperInvalidVetoes:a?.vetoedBeforeDispatch??null,
    competitiveQualified:false
  };
}
/** @returns {object} */
function run(){
  const p=preflight(),registration=p.registration;
  const options={...registration.fixedOptions,
    ...p.amendment.effectiveOverrides,
    registeredTrials:registration.trials,
    registeredFrameName:registration.schema,
    allowAdditionalOriginalSourceRanks:true};
  assert.equal(options.paperPromptPortfolio,undefined);
  const control=runDevelopment({...options,sharedPaperPaymentPortfolio:false});
  const treatment=runDevelopment({...options,sharedPaperPaymentPortfolio:true});
  assert.equal(control.rows.length,4);
  assert.equal(treatment.rows.length,4);
  assert.equal(control.attempted,4);
  assert.equal(treatment.attempted,4);
  assert.equal(control.sharedPaperPaymentPortfolioOptIn,false);
  assert.equal(treatment.sharedPaperPaymentPortfolioOptIn,true);
  const controls=new Map(control.rows.map(r=>[r.trial.id,summarize(r)]));
  const treated=new Map(treatment.rows.map(r=>[r.trial.id,summarize(r)]));
  const pairs=registration.trials.map(t=>{
    const left=controls.get(t.id),right=treated.get(t.id);
    assert.ok(left&&right);
    const both=typeof left.sourceDealFingerprint==='string'&&
      typeof right.sourceDealFingerprint==='string';
    const bothFull=typeof left.fullPhysicalDealFingerprint==='string'&&
      typeof right.fullPhysicalDealFingerprint==='string';
    const bothNativeSetup=left.setupStatus===
      'consistent-accepted-native-setup-and-first-draw'&&
      right.setupStatus==='consistent-accepted-native-setup-and-first-draw';
    return {id:t.id,sourceRank:31,seed:t.seed,
      candidateSlot:t.candidateSlot,candidateId:t.candidateId,
      bothNativeSetupCertified:bothNativeSetup,
      sourceFingerprintMatch:both?
        left.sourceDealFingerprint===right.sourceDealFingerprint:null,
      samePhysicalSourceDeal:both&&bothNativeSetup?
        left.sourceDealFingerprint===right.sourceDealFingerprint:null,
      fullPhysicalFingerprintMatch:bothFull?
        left.fullPhysicalDealFingerprint===
          right.fullPhysicalDealFingerprint:null,
      sameFullPhysicalDeal:bothFull&&bothNativeSetup?
        left.fullPhysicalDealFingerprint===
          right.fullPhysicalDealFingerprint:null,
      control:left,treatment:right};
  });
  return {
    schema:'agent15-rank31-v10-natural-paired-unqualified-native-v1',
    registeredUtc:registration.registeredUtc,
    registrationGitBlob:REGISTERED_BLOB,
    pregameAmendmentGitBlob:AMENDMENT_BLOB,
    originalFixedOptionSha256:sha256(registration.fixedOptions),
    effectiveOptionSha256:sha256(options),
    repositoryCommit:p.head,sourceRosterGitBlob:p.rosterGitBlob,
    enginePin:registration.enginePin,sourceRank:31,
    sourceArchetype:p.source.archetype,
    immutableOptionSha256:sha256(registration.fixedOptions),
    allAttemptedGames:8,allPairs:4,
    pairedSamePhysicalSourceDeals:pairs.filter(x=>
      x.samePhysicalSourceDeal===true).length,
    pairedSameFullPhysicalDeals:pairs.filter(x=>
      x.sameFullPhysicalDeal===true).length,
    pairs,control,treatment,
    competitiveQualifiedGames:0,
    caveat:'Prematch dependency amendment disables lossless ordinal observer after zero original rank31 games had started. All native games are developmental. No opponent competence, game clock, full paper effect/rand audits, or ranked-field win estimate.'
  };
}
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={REGISTRATION,REGISTERED_BLOB,gitBlobSha,sha256,preflight,summarize,run};
