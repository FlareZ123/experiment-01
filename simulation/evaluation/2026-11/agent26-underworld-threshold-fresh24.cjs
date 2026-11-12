'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {runDevelopment} = require('../agent41-bilateral-v2-development.cjs');
const frozen = require('../agent41-frozen-bilateral-development-v2.json');
const {withPaperSemanticsProfileV1, PINNED_TWINLEAF} =
  require('../../twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs');
const {gitBlobHash} = require('../agent42-strict-profile-preflight.cjs');
const {ledger} = require('./agent33-rank7-hood-active-funding-fresh16.cjs');

const VERSION = 'agent26-underworld-immediate-max-geist-payability-fresh24-v1';
const ROOT = path.resolve(__dirname, '../../..');
const REG_PATH = 'results/aichi-2026/registrations/2026-11/agent26-underworld-immediate-max-geist-payability-fresh24-20261112.json';
const REG_BLOB = 'f5e6536f7cd1fed6974acdd9134f83bae383293f';
const OUT = path.join(ROOT, 'agent26-underworld-threshold-fresh24-native.json');
const RANKS = Object.freeze([1,11,13]);

/**
 * Check the separately committed, prospective immutable seed registration.
 * @returns {{registration:object,hood:object}}
 */
function preflight() {
  const source = fs.readFileSync(path.join(ROOT, REG_PATH));
  assert.equal(gitBlobHash(source), REG_BLOB);
  const registration = JSON.parse(source.toString('utf8'));
  const hood = require('../../../results/aichi-2026/candidate-hood-shadow-rider.json');
  assert.equal(hood.cards.reduce((n,c)=>n+c.count,0),60);
  assert.equal(registration.pinnedTwinleaf, PINNED_TWINLEAF);
  assert.equal(registration.registeredBeforeNativeResultsForTheseSeeds,true);
  assert.deepEqual(registration.sourceRanks,RANKS);
  assert.equal(registration.registeredPairs,24);
  assert.equal(registration.control,'actorUnderworldActiveFundingThresholdV2:false');
  assert.equal(registration.treatment,'actorUnderworldActiveFundingThresholdV2:true');
  assert.equal(registration.totalNativeAttempts,48);
  assert.equal(registration.trials.length,24);
  const seen = new Set();
  const byRank = Object.fromEntries(RANKS.map(rank=>[rank,0]));
  for(const trial of registration.trials){
    assert.ok(RANKS.includes(trial.rank));
    assert.equal(trial.candidateId,'hood-shield-v1');
    assert.ok(['A','B'].includes(trial.candidateSlot));
    assert.ok(Number.isInteger(trial.repeat)&&trial.repeat>=0&&trial.repeat<4);
    assert.equal(trial.id,[trial.rank,trial.repeat,trial.candidateSlot,
      trial.candidateId].join(':'));
    assert.equal(registration.seedGroups[trial.rank][trial.candidateSlot][trial.repeat],
      trial.seed);
    assert.ok(Number.isSafeInteger(trial.seed)&&trial.seed>=0&&trial.seed<2**32);
    assert.equal(seen.has(trial.seed),false);
    seen.add(trial.seed);
    byRank[trial.rank]++;
  }
  assert.deepEqual(Object.values(byRank),[8,8,8]);
  return {registration,hood};
}

/**
 * The first actual native root that differed across the two physically
 * paired and independently randomized games. Only action metadata is used.
 * @param {object} a Control native game row
 * @param {object} b Treatment native game row
 * @returns {object|null}
 */
function firstRootDivergence(a,b){
  const left=a.rootActionLedger??[],right=b.rootActionLedger??[];
  const sig=x=>JSON.stringify([
    x.actionOrdinal,x.turnBefore,x.playerSlot,x.action,
    x.card??null,x.attack??null
  ]);
  let index=0;
  while(index<left.length&&index<right.length&&
    sig(left[index])===sig(right[index]))index++;
  if(index===left.length&&index===right.length)return null;
  const projection=x=>x?({
    actionOrdinal:x.actionOrdinal,globalTurn:x.turnBefore,
    playerSlot:x.playerSlot,action:x.action,
    card:x.card??null,attack:x.attack??null
  }):null;
  return {index,control:projection(left[index]),
    treatment:projection(right[index])};
}

/**
 * Native terminals are observed outcomes; action caps and engine errors
 * leave either eventual game winner possible.
 * @param {string} status
 * @returns {[number,number]}
 */
function candidateNativeWinBounds(status){
  if(status==='candidate-native-terminal')return [1,1];
  if(status==='original-native-terminal')return [0,0];
  return [0,1];
}

/** @param {object[]} pairs @returns {[number,number]} */
function pairedNativeWinDifferenceBounds(pairs){
  return pairs.reduce(([low,high],p)=>{
    const [cl,ch]=candidateNativeWinBounds(p.control.nativeStatus);
    const [tl,th]=candidateNativeWinBounds(p.treatment.nativeStatus);
    return [low+tl-ch,high+th-cl];
  },[0,0]);
}

/** @returns {object} */
function run(){
  const {registration,hood}=preflight();
  const common={
    ...frozen.policyOptions,
    registeredTrials:registration.trials,
    registeredCandidateDecks:{
      'hood-shield-v1':{label:'hood-shield-v1',cards:hood.cards}
    },
    registeredFrameName:registration.schema,
    allowSingleCandidatePerGroup:true,
    allowAdditionalOriginalSourceRanks:true,
    nativeRootActionLimit:260,
    isolatePolicyRandomness:true,
    isolatePhysicalShuffleRandomnessAfterSetup:true,
    actorOnlyComposition:true,
    actorMewMaxMiracleOverSelfCopy:true,
    actorMewGenesectTechnoBlast:true,
    actorDceMewMobilityRoot:true,
    actorGenesectFusionDrawRoot:true,
    actorNaturalEvolutionRoot:true,
    bilateralBasicEnergyRecipientFrontier:true,
    actorUnderworldDoorPromptOwner:true,
    actorUnderworldDoorRoot:true,
    nativeAllOwnerPassFrontier:true,
    actorGuzmaPromptContinuation:true,
    actorZeroEnergyStrandFloatStoneRoot:true,
    actorSeekerGuzmaNominalKo:true
  };
  const profile={
    celestialRoar:true,mewEnergyMix:true,attachEnergyTarget:true
  };
  const prior=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
  let control,treatment;
  const corrections=[];
  try{
    for(const flag of [false,true]){
      const joined=withPaperSemanticsProfileV1(()=>
        runDevelopment({...common,
          actorUnderworldActiveFundingPriority:false,
          actorUnderworldActiveFundingThresholdV2:flag}),profile);
      assert.equal(joined.result.rows.length,24);
      corrections.push(joined.audit);
      if(flag)treatment=joined.result;else control=joined.result;
    }
  }finally{
    if(prior===undefined)delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
    else process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV=prior;
  }
  const pairs=registration.trials.map((trial,i)=>{
    const a=ledger(control.rows[i]);
    const b=ledger(treatment.rows[i]);
    assert.equal(a.id,trial.id);
    assert.equal(b.id,trial.id);
    const physicallyMatched=Boolean(a.sourceDealFingerprint&&
      a.sourceDealFingerprint===b.sourceDealFingerprint&&
      a.entireDealFingerprint&&
      a.entireDealFingerprint===b.entireDealFingerprint&&
      a.firstPlayerSeat!==null&&
      a.firstPlayerSeat===b.firstPlayerSeat);
    assert.equal(physicallyMatched,true,
      'New arms must have equal original and candidate real physical initial deals');
    const actor=treatment.rows[i].actorOnlyDecisionCoverage
      ?.detailedComponentAudits?.root??{};
    return {
      trialId:trial.id,sourceRank:trial.rank,seed:trial.seed,
      candidateSlot:trial.candidateSlot,physicallyMatched,
      thresholdFundingRootSelections:actor.underworldActiveFundingThresholdV2Selected??0,
      firstDivergentRoot:firstRootDivergence(control.rows[i],treatment.rows[i]),
      control:a,treatment:b,
      competitivePaperQualified:false
    };
  });
  const sum=(rows,key,arm)=>rows.reduce((n,p)=>n+(p[arm][key]??0),0);
  const status=(rows,arm,s)=>rows.filter(p=>p[arm].nativeStatus===s).length;
  const rankSummary=rank=>{
    const rows=pairs.filter(p=>p.sourceRank===rank);
    return {
      pairs:rows.length,changedDecisionPairs:rows.filter(p=>
        p.firstDivergentRoot!==null).length,
      thresholdFundingRootsSelected:rows.reduce((n,p)=>n+p.thresholdFundingRootSelections,0),
      activePsychicControl:sum(rows,'paidActivePsychicRoots','control'),
      activePsychicTreatment:sum(rows,'paidActivePsychicRoots','treatment'),
      candidateSettledAttacksControl:sum(rows,'candidateSettledAttacks','control'),
      candidateSettledAttacksTreatment:sum(rows,'candidateSettledAttacks','treatment'),
      nativeCandidateWinsControl:status(rows,'control','candidate-native-terminal'),
      nativeCandidateWinsTreatment:status(rows,'treatment','candidate-native-terminal'),
      nativeSourceWinsControl:status(rows,'control','original-native-terminal'),
      nativeSourceWinsTreatment:status(rows,'treatment','original-native-terminal'),
      censoredControl:status(rows,'control','censored'),
      censoredTreatment:status(rows,'treatment','censored'),
      errorsControl:status(rows,'control','engine-error'),
      errorsTreatment:status(rows,'treatment','engine-error'),
      candidateNativeWinDifferenceBounds:
        pairedNativeWinDifferenceBounds(rows)
    };
  };
  const summary={
    registeredPairs:pairs.length,exactPhysicalPairs:
      pairs.filter(p=>p.physicallyMatched).length,
    sourceRanks:RANKS,
    changedDecisionPairs:pairs.filter(p=>p.firstDivergentRoot!==null).length,
    thresholdFundingRootsSelected:pairs.reduce((n,p)=>n+p.thresholdFundingRootSelections,0),
    activePsychicControl:sum(pairs,'paidActivePsychicRoots','control'),
    activePsychicTreatment:sum(pairs,'paidActivePsychicRoots','treatment'),
    candidateSettledAttacksControl:sum(pairs,'candidateSettledAttacks','control'),
    candidateSettledAttacksTreatment:sum(pairs,'candidateSettledAttacks','treatment'),
    candidateNativeWinDifferenceBounds:
      pairedNativeWinDifferenceBounds(pairs),
    bySourceRank:Object.fromEntries(RANKS.map(rank=>[rank,rankSummary(rank)])),
    fullIndependentPaperQualifiedGames:0
  };
  return {
    schema:VERSION,enginePin:PINNED_TWINLEAF,
    registrationPath:REG_PATH,registrationBlob:REG_BLOB,
    policyDifference:'actorUnderworldActiveFundingThresholdV2 false versus true',
    control,treatment,pairs,summary,corrections,
    developmentalNativeOnly:true
  };
}

/** Persist a unique, locked, atomic record without erasing prior evidence. */
function save(report){
  const lock=OUT+'.lock';
  const fd=fs.openSync(lock,'wx');
  const temp=OUT+'.tmp.'+process.pid;
  try{
    assert.equal(fs.existsSync(OUT),false,
      'Preserve first native result; do not overwrite a previous run');
    fs.writeFileSync(temp,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
    const f=fs.openSync(temp,'r');
    try{fs.fsyncSync(f);}finally{fs.closeSync(f);}
    fs.renameSync(temp,OUT);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}
if(require.main===module){
  if(process.argv.includes('--preflight')){
    const checked=preflight();
    process.stdout.write('AGENT26_HOOD_FRESH24_PREFLIGHT '+
      JSON.stringify({registered:checked.registration.trials.length,
        registrationBlob:REG_BLOB,qualified:0})+'\n');
  }else{
    const report=run();
    save(report);
    process.stdout.write('AGENT26_HOOD_FRESH24 '+
      JSON.stringify(report.summary)+'\n');
  }
}
module.exports={
  VERSION,REG_BLOB,REG_PATH,preflight,firstRootDivergence,
  candidateNativeWinBounds,pairedNativeWinDifferenceBounds,run,save
};
