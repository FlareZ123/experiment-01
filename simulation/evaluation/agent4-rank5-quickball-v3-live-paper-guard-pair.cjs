'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REGISTRATION='results/aichi-2026/registrations/agent4-rank5-quickball-v3-live-paper-guard-20261102.json';
const VERSION='agent4-rank5-source-quickball-v3-live-paper-guard-samedeal-v1';
const hash=x=>createHash('sha256').update(x).digest('hex');

/** @returns {object} */
function preflight(){
  const bytes=fs.readFileSync(path.join(ROOT,REGISTRATION));
  const registration=JSON.parse(bytes.toString('utf8'));
  assert.equal(registration.schema,
    'agent4-rank5-quickball-v3-live-paper-guard-registered-pair-v1');
  assert.equal(registration.phase,'registered-before-integration-native-result');
  assert.equal(registration.originalSourceRank,5);
  assert.equal(registration.plannedNativeAttempts,8);
  assert.equal(registration.allowPostOutcomeExclusions,false);
  assert.equal(registration.trials.length,4);
  assert.deepEqual(registration.modes,
    ['v3-quickball-paper-guard-off','v3-quickball-paper-guard-on']);
  const seen=new Set();
  for(const trial of registration.trials){
    assert.equal(trial.rank,5);
    assert.equal(trial.repeat,0);
    assert.equal(trial.seed,registration.seeds[trial.candidateSlot]);
    assert.equal(trial.id,[5,0,trial.candidateSlot,trial.candidateId].join(':'));
    assert.ok(!seen.has(trial.id));
    seen.add(trial.id);
  }
  const full=JSON.parse(fs.readFileSync(path.join(ROOT,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const source=full.decks.find(row=>row.rank===5);
  assert.ok(source);
  assert.equal(source.cards.reduce((n,card)=>n+card.count,0),60);
  const pinned=execFileSync('git',['-C',path.join(ROOT,'vendor/twinleaf'),
    'rev-parse','HEAD'],{encoding:'utf8'}).trim();
  assert.equal(pinned,registration.enginePin);
  return {registration,registrationSha256:hash(bytes),
    sourcePrintedSixty:source.cards,pinned};
}

/** @param {object} row @returns {object} */
function compact(row){
  const a=row.paperQuickBallPaymentAudit??null;
  return {
    id:row.trial?.id??null,seed:row.trial?.seed??null,
    finished:row.finished??null,winner:row.finished===true?row.winner??null:null,
    status:row.status??null,error:row.error??null,
    sourceSeat:row.sourceSeat??null,candidateSeat:row.candidateSeat??null,
    sourcePhysicalDeal:row.sourceDealFingerprint??null,
    fullPhysicalDeal:row.fullPhysicalDealFingerprint??null,
    nativeRootSha:row.rootActionLedgerSha256??null,
    sourceAttackDeclarations:row.sourceAttackDeclarations??null,
    candidateAttackDeclarations:row.candidateAttackDeclarations??null,
    v3Requested:row.paperQuickBallPaymentOptIn===true,
    v3AuditVersion:a?.version??null,liveSourceTrialCount:a?.liveSourceTrialCount??null,
    inspectedRoots:a?.inspectedRoots??null,inspectedPaymentPrompts:a?.inspectedPayments??null,
    ignoredOptionalSearchPrompts:a?.ignoredOptionalSearchPrompts??null,
    vetoedRoots:a?.vetoedRoots??null,vetoedPayments:a?.vetoedPayments??null,
    competitiveQualified:false
  };
}

/** @returns {object} */
function run(){
  const p=preflight();
  const options={...p.registration.fixedOptions,
    registeredTrials:p.registration.trials,
    registeredFrameName:p.registration.schema,
    allowAdditionalOriginalSourceRanks:true};
  const before=process.env.AGENT8_ACTOR_QUICK_BALL_DEV;
  let control,treatment;
  try{
    process.env.AGENT8_ACTOR_QUICK_BALL_DEV='true';
    control=runDevelopment({...options,paperQuickBallPayment:false});
    treatment=runDevelopment({...options,paperQuickBallPayment:true});
  }finally{
    if(before===undefined)delete process.env.AGENT8_ACTOR_QUICK_BALL_DEV;
    else process.env.AGENT8_ACTOR_QUICK_BALL_DEV=before;
  }
  assert.equal(control.rows.length,4);
  assert.equal(treatment.rows.length,4);
  const originals=new Map(control.rows.map(row=>[row.trial?.id,row]));
  const pairs=treatment.rows.map(row=>{
    const prior=originals.get(row.trial?.id);
    assert.ok(prior,'Each registered pair must have original native control');
    const off=compact(prior),on=compact(row);
    assert.equal(off.seed,on.seed);
    assert.equal(off.sourceSeat,on.sourceSeat);
    assert.equal(on.v3Requested,true);
    const sameSource=typeof off.sourcePhysicalDeal==='string'&&
      off.sourcePhysicalDeal===on.sourcePhysicalDeal;
    const sameFull=typeof off.fullPhysicalDeal==='string'&&
      off.fullPhysicalDeal===on.fullPhysicalDeal;
    return {id:row.trial.id,samePhysicalSourceDeal:sameSource,
      sameFullPhysicalDeal:sameFull,
      sameNativeRootLedger:off.nativeRootSha!=null&&
        off.nativeRootSha===on.nativeRootSha,
      control:off,treatment:on,
      competitiveQualified:false};
  });
  return {version:VERSION,sourceRank:5,
    sourcePrinted60Sha256:p.registration.sourcePrinted60Sha256,
    registrationSha256:p.registrationSha256,
    enginePin:p.pinned,attemptedGames:8,pairedGames:4,
    sameSourceDeals:pairs.filter(p=>p.samePhysicalSourceDeal).length,
    sameFullDeals:pairs.filter(p=>p.sameFullPhysicalDeal).length,
    competitiveQualifiedGames:0,qualifiedWinRate:null,
    caveat:'Original rank5 real Store same-seed four-pair comparison, only paper-cost guard changes. Any engine-terminal win, abort or cap remains unqualified.',
    pairs,rawControl:control,rawTreatment:treatment};
}
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,REGISTRATION,preflight,compact,run};
