'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const reg=require('../../../results/aichi-2026/registrations/agent45-source-funded-hood-vs-champion-rank5-20261109.json');
const {runNativeBatch}=require('../agent32-fresh-perfection-field.cjs');
const {runDevelopment}=require('../agent41-bilateral-v2-development.cjs');
const {withPaperSemanticsProfileV1,PINNED_TWINLEAF}=
  require('../../twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs');
const sourceV6=require('./agent8-source-mew-funding-v6.cjs');

const ROOT=path.resolve(__dirname,'../../..');
const OUTPUT=path.join(ROOT,'artifacts/agent45-rank5-funded-hood-champion-24native.json');
const VERSION=reg.schema;
const FUNDING=[false,true];

/** @returns {object} Frozen registration plus source and contender constraints. */
function verifyRegistration(){
  assert.equal(VERSION,'agent45-rank5-source-funded-hood-champion-prospective-v1');
  assert.equal(reg.enginePin,PINNED_TWINLEAF);
  assert.deepEqual(reg.candidates,['champion-reference','hood-shield-v1']);
  assert.deepEqual(reg.sourceFundingFactor,['S0','S1']);
  assert.equal(reg.sourceRank,5);
  assert.equal(reg.rootCap,260);
  assert.equal(reg.groups.length,6);
  assert.equal(reg.batches.length,4);
  assert.equal(reg.expectedNativeAttempts,24);
  assert.equal(new Set(reg.groups.map(g=>g.seed)).size,reg.groups.length);
  assert.deepEqual(reg.sameJointPaperSemanticsProfile,
    {celestialRoar:true,mewEnergyMix:true,attachEnergyTarget:true});
  const hood=require('../../../results/aichi-2026/candidate-hood-shadow-rider.json');
  assert.equal(hood.cards.reduce((sum,c)=>sum+c.count,0),60);
  assert.equal(hood.archetype,'Shadow Rider Calyrex / Stealthy Hood / Arven');
  for(const batch of reg.batches){
    assert.ok(reg.candidates.includes(batch.candidateId));
    assert.equal(typeof batch.sourceFunded,'boolean');
    assert.equal(batch.registeredTrials.length,reg.groups.length);
    for(let i=0;i<reg.groups.length;i++){
      const row=batch.registeredTrials[i],group=reg.groups[i];
      assert.equal(row.rank,5);
      assert.equal(row.seed,group.seed);
      assert.equal(row.repeat,group.repeat);
      assert.equal(row.candidateSlot,group.candidateSlot);
      assert.equal(row.candidateId,batch.candidateId);
      assert.equal(row.id,[row.rank,row.repeat,row.candidateSlot,
        row.candidateId].join(':'));
    }
  }
  assert.equal(new Set(reg.batches.map(b=>b.candidateId+
    ':'+b.sourceFunded)).size,4);
  return {hood,registration:reg};
}

/**
 * Source owner DCE recipient is the only S0/S1 policy change. Keep the
 * identical paper engine hook profile and owner policy for both sixties.
 * @param {object} batch Immutable registered phase.
 * @param {(options:object)=>object} [runner]
 * @returns {object}
 */
function runBatch(batch,runner=runDevelopment){
  const {hood}=verifyRegistration();
  const joint=runNativeBatch(false,base=>{
    return withPaperSemanticsProfileV1(()=>runner({
      ...base,...sourceV6.options(batch.sourceFunded),
      registeredCandidateDecks:{
        'hood-shield-v1':{label:'hood-shield-v1',cards:hood.cards}
      },
      paperSupporterQuota:true,
      paperSameTargetAttachEnergy:true,
      physicalZoneGate:true,
      isolatePolicyRandomness:true,
      isolatePhysicalShuffleRandomnessAfterSetup:true,
      nativeRootActionLimit:reg.rootCap
    }),reg.sameJointPaperSemanticsProfile).result;
  },{
    registeredTrials:batch.registeredTrials,
    registeredFrameName:VERSION+':'+batch.candidateId+
      ':'+(batch.sourceFunded?'S1':'S0'),
    nativeRootActionLimit:reg.rootCap,
    vipAfterPass:true,vipPreferMewtwoDonor:true
  });
  assert.equal(joint.selected.rawDevelopment.rows.length,6);
  return joint;
}

/** @param {object} row @returns {object} */
function compact(row){
  const roots=row.rootActionLedger??row.nativeAbortEvidence?.rootActionLedger??[];
  const candidateSeat=row.trial.candidateSlot==='A'?0:1;
  const nativeStatus=row.error?'engine-error':
    row.finished===true?'native-terminal':
    roots.length>=reg.rootCap?'root-cap':'unfinished-or-unverified';
  const sourceSeat=1-candidateSeat;
  const sourceAttacks=roots.filter(r=>r.playerSlot===sourceSeat&&
    r.action==='AttackAction');
  return {
    id:row.trial.id,rank:row.trial.rank,seed:row.trial.seed,
    repeat:row.trial.repeat,slot:row.trial.candidateSlot,
    candidate:row.trial.candidateId,
    candidateSeat,sourceSeat,
    actualStarterSeat:row.actualStarterSeat??
      row.verifiedFirstTurn?.firstTurnSlot??null,
    sourcePhysicalDeal:row.sourceDealFingerprint??null,
    fullPhysicalDeal:row.fullPhysicalDealFingerprint??null,
    status:nativeStatus,finished:row.finished===true,error:row.error?
      String(row.error).slice(0,1600):null,
    winner:nativeStatus==='native-terminal'?row.winner??null:null,
    candidateNativeWin:nativeStatus==='native-terminal'&&
      row.winner===candidateSeat,
    sourceAttacks:sourceAttacks.length,
    sourceCrossFusionStrikes:sourceAttacks.filter(r=>
      r.attack==='Cross Fusion Strike').length,
    nativeRoots:roots.length,
    nativeRootLedgerSha256:createHash('sha256')
      .update(JSON.stringify(roots)).digest('hex'),
    nativePhysicalIntegrity:row.physicalZoneQualification?.status??null,
    competitivePaperQualified:false
  };
}

/** @param {object} a @param {object} b @returns {boolean} */
function sourceMatched(a,b){
  return !!a.sourcePhysicalDeal&&
    a.sourcePhysicalDeal===b.sourcePhysicalDeal&&
    a.actualStarterSeat!==null&&
    a.actualStarterSeat===b.actualStarterSeat;
}

/** @param {object} row @returns {[number,number]} */
function winnerRange(row){
  return row.status==='native-terminal'?
    [Number(row.candidateNativeWin),Number(row.candidateNativeWin)]:[0,1];
}

/**
 * Prospective four-arm analysis. Every registered attempt is retained,
 * including native errors, root caps and physical source mismatches.
 * @param {object[]} batches Each batch has candidateId,sourceFunded,rows.
 * @returns {object}
 */
function compare(batches){
  assert.equal(batches.length,4);
  const rows=reg.groups.map((group,i)=>{
    const arms=batches.map(batch=>{
      const r=compact(batch.rows[i]);
      assert.equal(r.seed,group.seed);
      assert.equal(r.repeat,group.repeat);
      assert.equal(r.slot,group.candidateSlot);
      assert.equal(r.candidate,batch.candidateId);
      return {...r,sourceFunded:batch.sourceFunded};
    });
    const [c0,c1,h0,h1]=arms;
    assert.deepEqual(arms.map(x=>[x.candidate,x.sourceFunded]),[
      ['champion-reference',false],['champion-reference',true],
      ['hood-shield-v1',false],['hood-shield-v1',true]
    ]);
    const allSourceMatched=arms.every(x=>sourceMatched(c0,x));
    const withinCandidateMatched=sourceMatched(c0,c1)&&
      sourceMatched(h0,h1);
    const compareAtFunded=sourceMatched(c1,h1);
    const compareAtControl=sourceMatched(c0,h0);
    const contrast=(a,b,matched)=>{
      if(!matched)return {comparable:false,bothTerminal:false,
        observedDelta:null,sharpDeltaBound:null};
      const [cmin,cmax]=winnerRange(a);
      const [hmin,hmax]=winnerRange(b);
      return {comparable:true,bothTerminal:
        a.status==='native-terminal'&&b.status==='native-terminal',
        observedDelta:a.status==='native-terminal'&&
          b.status==='native-terminal'?
            Number(b.candidateNativeWin)-Number(a.candidateNativeWin):null,
        sharpDeltaBound:[hmin-cmax,hmax-cmin]};
    };
    return {rank:5,repeat:group.repeat,seed:group.seed,
      candidateSlot:group.candidateSlot,allSourceMatched,
      withinCandidateMatched,
      baseline:contrast(c0,h0,compareAtControl),
      funded:contrast(c1,h1,compareAtFunded),
      sourceFundingChangesChampion:sourceMatched(c0,c1)&&
        c0.status==='native-terminal'&&c1.status==='native-terminal'?
        Number(c1.candidateNativeWin)-Number(c0.candidateNativeWin):null,
      sourceFundingChangesHood:sourceMatched(h0,h1)&&
        h0.status==='native-terminal'&&h1.status==='native-terminal'?
        Number(h1.candidateNativeWin)-Number(h0.candidateNativeWin):null,
      arms};
  });
  const summary={registeredGroups:rows.length,registeredGames:24,
    returnedGames:rows.reduce((n,row)=>n+row.arms.length,0),
    allFourSourceMatchedGroups:rows.filter(r=>r.allSourceMatched).length,
    fundedBothTerminalSourceMatched:rows.filter(r=>r.funded.bothTerminal).length,
    baselineBothTerminalSourceMatched:rows.filter(r=>r.baseline.bothTerminal).length,
    nativeTerminals:rows.flatMap(r=>r.arms)
      .filter(r=>r.status==='native-terminal').length,
    nativeErrors:rows.flatMap(r=>r.arms)
      .filter(r=>r.status==='engine-error').length,
    nativeCaps:rows.flatMap(r=>r.arms)
      .filter(r=>r.status==='root-cap').length,
    sourceCrossFusionStrikes:rows.reduce((n,r)=>n+
      r.arms.reduce((m,a)=>m+a.sourceCrossFusionStrikes,0),0),
    paperCompetitiveQualifiedGames:0};
  const sumBound=key=>{
    const eligible=rows.filter(r=>r[key].comparable);
    return {comparableGroups:eligible.length,
      bothTerminal:eligible.filter(r=>r[key].bothTerminal).length,
      sharpDifferenceBound:[
        eligible.reduce((n,r)=>n+r[key].sharpDeltaBound[0],0),
        eligible.reduce((n,r)=>n+r[key].sharpDeltaBound[1],0)
      ]};
  };
  return {schema:VERSION,
    status:summary.allFourSourceMatchedGroups===6?
      'SOURCE-PHYSICALLY-MATCHED-DEVELOPMENT-ONLY':
      'INVALID-SOURCE-PHYSICAL-MISMATCHES',
    summary,comparison:{control:sumBound('baseline'),funded:sumBound('funded')},
    rows,competitivelyQualifiedGames:0,finalDeckSelection:'none'};
}

/** @param {{runBatch?:(batch:object)=>object}} [deps] */
function run(deps={}){
  verifyRegistration();
  const batches=[];
  for(const batch of reg.batches){
    const x=(deps.runBatch??runBatch)(batch);
    const rows=x.selected?.rawDevelopment?.rows;
    assert.ok(Array.isArray(rows)&&rows.length===6);
    batches.push({candidateId:batch.candidateId,
      sourceFunded:batch.sourceFunded,rows});
  }
  const result={...compare(batches),
    enginePin:reg.enginePin,registration:reg,
    originalSource60Unchanged:true,candidateSixtiesUnchanged:true,
    policyDifference:'source owner DCE recipient only',
    enginePaperProfile:reg.sameJointPaperSemanticsProfile,
    rawNativeBatches:batches};
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  const lock=OUTPUT+'.lock',fd=fs.openSync(lock,'wx',0o600);
  const temp=OUTPUT+'.tmp.'+process.pid;
  try {
    fs.writeFileSync(temp,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
    const f=fs.openSync(temp,'r');try{fs.fsyncSync(f);}finally{fs.closeSync(f);}
    fs.renameSync(temp,OUTPUT);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
  return result;
}
if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    const verified=verifyRegistration();
    process.stdout.write(JSON.stringify({schema:VERSION,
      registrations:verified.registration.batches.length,
      groups:verified.registration.groups.length,
      attempts:verified.registration.expectedNativeAttempts,
      sourceRank:5,enginePin:PINNED_TWINLEAF,
      competitivePaperQualifiedGames:0})+'\n');
  }else {
    const r=run();
    process.stdout.write('AGENT45_RANK5_FUNDED_HOOD '+JSON.stringify({
      status:r.status,summary:r.summary,comparison:r.comparison})+'\n');
    if(r.status!=='SOURCE-PHYSICALLY-MATCHED-DEVELOPMENT-ONLY')
      process.exitCode=1;
  }
}
module.exports={VERSION,verifyRegistration,runBatch,compact,
  sourceMatched,winnerRange,compare,run};
