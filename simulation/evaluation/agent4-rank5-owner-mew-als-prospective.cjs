'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REGISTRATION='results/aichi-2026/registrations/agent4-rank5-mew-als-owner-v1-20261102.json';
const VERSION='agent4-original-rank5-Mew-owner-full-ALS-two-seat-fresh-prospective-v1';

/** @returns {object} */
function preflight(){
  const bytes=fs.readFileSync(path.join(ROOT,REGISTRATION));
  const registration=JSON.parse(bytes.toString('utf8'));
  assert.equal(registration.schema,
    'agent4-rank5-owner-mew-als-prospective-two-arm-v1');
  assert.equal(registration.phase,'registered-before-first-Mew-ALS-experiment');
  assert.equal(registration.plannedAttempts,8);
  assert.equal(registration.sourceRank,5);
  assert.equal(registration.trials.length,4);
  const ids=new Set();
  for(const trial of registration.trials){
    assert.equal(trial.rank,5);
    assert.equal(trial.seed,registration.seeds[trial.candidateSlot]);
    assert.equal(trial.id,[5,0,trial.candidateSlot,trial.candidateId].join(':'));
    assert.ok(!ids.has(trial.id));
    ids.add(trial.id);
  }
  const field=JSON.parse(fs.readFileSync(path.join(ROOT,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const source=field.decks.find(x=>x.rank===5);
  assert.ok(source);
  assert.equal(source.cards.reduce((n,card)=>n+card.count,0),60);
  const engine=execFileSync('git',['-C',path.join(ROOT,'vendor/twinleaf'),
    'rev-parse','HEAD'],{encoding:'utf8'}).trim();
  assert.equal(engine,registration.enginePin);
  return {registration,engine,registrationSha256:
    createHash('sha256').update(bytes).digest('hex')};
}

/** @param {object} row @returns {object} */
function summarize(row){
  const seat=row.sourceSeat;
  const roots=Array.isArray(row.rootActionLedger)?row.rootActionLedger:[];
  const owner=roots.filter(r=>r.playerSlot===seat);
  const cards=printing=>owner.filter(r=>r.action==='PlayCardAction'&&
    typeof r.card==='string'&&r.card.startsWith(printing));
  const attacks=owner.filter(r=>r.action==='AttackAction');
  const audit=row.paperQuickBallPaymentAudit??null;
  return {
    trialId:row.trial.id,seed:row.trial.seed,sourceSeat:seat,
    finished:row.finished??null,endReason:row.endReason??null,
    rootActions:row.rootActionCount??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    sourcePhysicalDealFingerprint:row.sourceDealFingerprint??null,
    sourceQuickBallRoots:cards('Quick Ball').length,
    sourceMewVRoots:cards('Mew V').filter(r=>!r.card.startsWith('Mew VMAX')).length,
    sourceMewVMAXRoots:cards('Mew VMAX').length,
    sourceGenesectRoots:cards('Genesect V').length,
    sourceAttackRoots:attacks.length,
    sourceAttackEvents:attacks.map(r=>({
      ordinal:r.actionOrdinal,globalTurn:r.turnBefore
    })),
    nativeWinner:row.finished===true?(row.winner??null):null,
    unqualifiedPrizes:row.finalPrizes??null,
    error:row.error??null,
    quickBallLiveStores:audit?.liveSourceTrialCount??null,
    quickBallPaymentPrompts:audit?.inspectedPayments??null,
    quickBallInvalidPaymentVetoes:audit?.vetoedPayments??null,
    actorOnlyPolicy:row.actorOnlyCompositionOptIn??null,
    competitiveQualified:false
  };
}

/** @returns {object} */
function run(){
  const p=preflight();
  const reg=p.registration;
  const base={...reg.commonOptions,registeredTrials:reg.trials,
    registeredFrameName:reg.schema,allowAdditionalOriginalSourceRanks:true};
  let baseline,treatment;
  const previous=process.env.AGENT8_ACTOR_QUICK_BALL_DEV;
  try{
    process.env.AGENT8_ACTOR_QUICK_BALL_DEV='true';
    baseline=runDevelopment({...base,...reg.controlMewAls});
    treatment=runDevelopment({...base,...reg.treatmentMewAls});
  }finally{
    if(previous===undefined)delete process.env.AGENT8_ACTOR_QUICK_BALL_DEV;
    else process.env.AGENT8_ACTOR_QUICK_BALL_DEV=previous;
  }
  assert.equal(baseline.rows.length,4);
  assert.equal(treatment.rows.length,4);
  const control=new Map(baseline.rows.map(r=>[r.trial.id,r]));
  const pairs=treatment.rows.map(r=>{
    const c=control.get(r.trial.id);
    assert.ok(c);
    const off=summarize(c),on=summarize(r);
    assert.equal(off.seed,on.seed);
    assert.equal(off.sourceSeat,on.sourceSeat);
    return {id:r.trial.id,control:off,treatment:on,
      exactSameInitialFullDeal:typeof off.fullPhysicalDealFingerprint==='string'&&
        off.fullPhysicalDealFingerprint===on.fullPhysicalDealFingerprint,
      exactSameSourceDeal:typeof off.sourcePhysicalDealFingerprint==='string'&&
        off.sourcePhysicalDealFingerprint===on.sourcePhysicalDealFingerprint,
      competitiveQualified:false};
  });
  return {version:VERSION,sourceRank:5,
    sourceOriginalPrintedSixtySha256:reg.source60Sha256,
    registrationSha256:p.registrationSha256,
    enginePin:p.engine,attemptedGames:8,
    exactFullPairMatches:pairs.filter(x=>x.exactSameInitialFullDeal).length,
    competitiveQualifiedGames:0,winRate:null,
    caution:'This is a registered combined owner ALS policy diagnostic. The four toggle changes cannot be causally separated, and capped/engine results never certify paper-competitive wins.',
    pairs,rawControl:baseline,rawTreatment:treatment};
}
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,REGISTRATION,preflight,summarize,run};
