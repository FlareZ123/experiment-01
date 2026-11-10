'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const reg=require('../../../results/aichi-2026/registrations/2026-11/agent8-rank5-source-bench-priority-v1-20261110.json');
const {runDevelopment}=
  require('../agent41-bilateral-v2-development.cjs');
const {sourceSummary}=
  require('../agent37-rank5-fusion-mobility-prospective.cjs');
const {saveAtomic}=
  require('../agent37-rank5-source-quickball-discard-retrospective.cjs');
const {assertNativeRootOptionPropagation}=
  require('./agent26-native-root-option-propagation.cjs');

const VERSION='agent8-original-rank5-source-mew-genesect-bench-priority-v1';
const SOURCE_SHA='a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05';
const CANDIDATES=['champion-reference','new-moon-lockbreaker-v1'];
const ROOT=path.resolve(__dirname,'../../..');
const OUTPUT=path.join(ROOT,'artifacts/agent8-rank5-source-bench-priority-v1-native.json');
const PHASES=[{id:'control',priority:false},{id:'mewGenesectFirst',priority:true}];

/** @returns {object[]} Unexposed preregistered original-source physical deals. */
function registered(){
  assert.equal(reg.schema,'agent8-rank5-mew-genesect-bench-first-native-v1');
  assert.equal(reg.status,'FROZEN BEFORE FIRST NATIVE V1 GAME');
  assert.equal(reg.genuineOriginalSource.rank,5);
  assert.equal(reg.genuineOriginalSource.printed60Sha256,SOURCE_SHA);
  assert.equal(reg.enginePin,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.deepEqual(reg.fixedCandidates,CANDIDATES);
  assert.equal(reg.expectedNativeAttempts,16);
  assert.equal(reg.expectedGamePairs,8);
  assert.equal(reg.groups.length,4);
  const seeds=new Set();
  for(const g of reg.groups){
    assert.equal(g.rank,5);
    assert.equal(g.id,[g.rank,g.repeat,g.candidateSlot].join(':'));
    assert.ok(['A','B'].includes(g.candidateSlot));
    assert.ok(Number.isSafeInteger(g.seed)&&g.seed>0&&g.seed<0x80000000);
    assert.ok(!seeds.has(g.seed));seeds.add(g.seed);
  }
  for(const seat of ['A','B'])
    assert.equal(reg.groups.filter(g=>g.candidateSlot===seat).length,2);
  const original=require('../../../results/aichi-2026/original-printed60-admission-v1.json')
    .rows.find(x=>x.rank===5);
  assert.equal(original?.printed60Sha256,SOURCE_SHA);
  assert.equal(original?.physicalCards,60);
  return reg.groups.flatMap(g=>CANDIDATES.map(candidateId=>({
    ...g,candidateId,id:[g.id,candidateId].join(':')
  })));
}

/** @param {boolean} prioritized Source-seat Bench role choice. */
function options(prioritized){
  assert.equal(typeof prioritized,'boolean');
  const frozen=require('../agent41-frozen-bilateral-development-v2.json');
  assert.equal(frozen.policyOptions.actorOnlyComposition,true);
  return {
    ...frozen.policyOptions,
    actorNaturalEvolutionRoot:true,
    actorMewGenesectTechnoBlast:true,
    actorMewGenesectTechnoBlastSourceOnly:true,
    sourceScopedQuickBallRoot:true,
    actorHandDiscard:true,
    actorOnlySingleSearch:true,
    actorMewGenesectQuickBallSearch:true,
    actorDceMewMobilityRoot:true,
    actorMewDceRecipientRoot:true,
    actorMewDceRecipientSourceOnly:true,
    actorGenesectFusionDrawRoot:true,
    actorMewUltraBallRoot:true,
    actorMewUltraBallSearch:true,
    actorMewUltraBallPaymentGuard:true,
    actorMewGenesectBenchFirst:prioritized,
    actorMewGenesectBenchFirstSourceOnly:prioritized
  };
}

/** @param {object} row Real native trial. */
function details(row){
  const source=sourceSummary(row);
  const roots=(row.rootActionLedger??[])
    .filter(x=>x.playerSlot===source.sourceSeat);
  const sourceBenchRoots=roots.filter(x=>
    x.action==='PlayCardAction'&&
    ['Mew V FST','Genesect V FST','Dedenne-GX UNB',
      'Crobat V DAA',"Lillie's Clefairy ex JTG"].includes(x.card));
  const audit=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root??null;
  return {
    ...source,
    trialId:row.trial.id,
    nativeWinner:row.winner??null,
    nativeFinished:row.finished===true,
    nativeError:row.error??null,
    sourceBenchRoots:sourceBenchRoots.map(x=>({
      rootOrdinal:x.rootOrdinal??null,
      globalTurn:x.turn??x.globalTurn??null,
      printing:x.card,action:x.action
    })),
    sourceMewRoots:sourceBenchRoots.filter(x=>x.card==='Mew V FST').length,
    sourceGenesectRoots:sourceBenchRoots.filter(x=>x.card==='Genesect V FST').length,
    actualRootAudit:{
      installed:audit?.mewGenesectBenchFirstOptIn??null,
      sourceOwnerSeat:audit?.mewGenesectBenchFirstOwnerSeat??null
    }
  };
}

/** @param {object} row @param {boolean} priority */
function assertDelivered(row,priority){
  const sourceSeat=row.trial.candidateSlot==='A'?1:0;
  return assertNativeRootOptionPropagation([row],{
    mewGenesectBenchFirstOptIn:priority,
    mewGenesectBenchFirstOwnerSeat:priority?sourceSeat:null
  });
}

/** @param {{runPhase?:Function}} [deps] */
function run(deps={}){
  const trials=registered();
  const result={schema:VERSION,
    registration:'results/aichi-2026/registrations/2026-11/agent8-rank5-source-bench-priority-v1-20261110.json',
    registrationSha256:createHash('sha256').update(
      fs.readFileSync(path.join(ROOT,
        'results/aichi-2026/registrations/2026-11/agent8-rank5-source-bench-priority-v1-20261110.json'))
    ).digest('hex'),
    originalSourcePrinted60Sha256:SOURCE_SHA,
    fixedCandidates:CANDIDATES,
    enginePin:reg.enginePin,
    experimentFlag:'source-only mewGenesectBenchFirst before off-axis Basic',
    nativeAttempts:16,
    paperCompetitivelyQualifiedGames:0,
    phases:{},
    comparisons:[]
  };
  for(const phase of PHASES){
    const data=(deps.runPhase??runDevelopment)({
      ...options(phase.priority),
      registeredTrials:trials,
      registeredFrameName:VERSION+'-'+phase.id,
      nativeRootActionLimit:reg.rootLimit,
      allowAdditionalOriginalSourceRanks:true
    });
    assert.equal(data.attempted,trials.length);
    assert.deepEqual(data.rows.map(x=>x.trial.id),trials.map(t=>t.id));
    const audits=data.rows.map(row=>assertDelivered(row,phase.priority));
    result.phases[phase.id]={
      options:options(phase.priority),
      actualOptionDelivery:audits,
      summaries:data.rows.map(details),
      rawNativeRows:data.rows
    };
  }
  for(let i=0;i<trials.length;i++){
    const a=result.phases.control.summaries[i];
    const b=result.phases.mewGenesectFirst.summaries[i];
    const matched=Boolean(a.sourceDealFingerprint&&
      a.sourceDealFingerprint===b.sourceDealFingerprint&&
      a.fullPhysicalDealFingerprint&&
      a.fullPhysicalDealFingerprint===b.fullPhysicalDealFingerprint&&
      a.actualStarterSeat!==null&&
      a.actualStarterSeat===b.actualStarterSeat);
    result.comparisons.push({
      trial:trials[i],physicallyMatched:matched,
      control:a,priority:b,
      sourceBenchOrderChanged:JSON.stringify(a.sourceBenchRoots)!==
        JSON.stringify(b.sourceBenchRoots),
      sourceAttackDeclarationDelta:matched&&
        Number.isSafeInteger(a.sourceAttackDeclarations)&&
        Number.isSafeInteger(b.sourceAttackDeclarations)?
          b.sourceAttackDeclarations-a.sourceAttackDeclarations:null,
      winningSeatChanged:matched&&a.nativeFinished&&b.nativeFinished?
        a.nativeWinner!==b.nativeWinner:null,
      competitiveQualified:false
    });
  }
  result.totals={
    physicallyMatchedPairs:result.comparisons.filter(x=>x.physicallyMatched).length,
    sourceBenchOrderChanged:result.comparisons.filter(x=>
      x.physicallyMatched&&x.sourceBenchOrderChanged).length,
    nativeErrors:Object.fromEntries(PHASES.map(phase=>[phase.id,
      result.phases[phase.id].summaries.filter(x=>x.nativeError).length])),
    completeNativeTerminals:Object.fromEntries(PHASES.map(phase=>[phase.id,
      result.phases[phase.id].summaries.filter(x=>x.nativeFinished).length])),
    sourceAttackDeclarations:Object.fromEntries(PHASES.map(phase=>[phase.id,
      result.phases[phase.id].summaries.reduce((sum,x)=>
        sum+(x.sourceAttackDeclarations??0),0)])),
    paperQualified:0
  };
  return result;
}

if(require.main===module){
  const outcome=run();
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  saveAtomic(OUTPUT,outcome);
  console.log('AGENT8_RANK5_SOURCE_BENCH',JSON.stringify({
    registrationSha256:outcome.registrationSha256,totals:outcome.totals,
    comparisons:outcome.comparisons.map(c=>({
      id:c.trial.id,physicallyMatched:c.physicallyMatched,
      changed:c.sourceBenchOrderChanged,
      control:[c.control.nativeDisposition,c.control.nativeWinner],
      priority:[c.priority.nativeDisposition,c.priority.nativeWinner],
      sourceAttacks:[c.control.sourceAttackDeclarations,
        c.priority.sourceAttackDeclarations]
    }))
  }));
  if(outcome.totals.physicallyMatchedPairs!==8)process.exitCode=1;
}
module.exports={VERSION,PHASES,registered,options,details,assertDelivered,run};
