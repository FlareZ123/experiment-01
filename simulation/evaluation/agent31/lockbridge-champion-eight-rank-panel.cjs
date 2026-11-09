'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const registration=require('../../../results/aichi-2026/registrations/2026-11/agent31-lockbridge-panel-frozen-20261109.json');
const candidate=require('../../../results/aichi-2026/2026-11/agent31-lockbridge-shadow-rider-v1.json');
const frozen=require('../agent41-frozen-bilateral-development-v2.json');
const {runDevelopment,validateRegisteredTrialGroups}=
  require('../agent41-bilateral-v2-development.cjs');
const {classifyNativeAttempt}=require('../agent41-native-attempt-disposition.cjs');
const {withPaperSemanticsProfileV1,PINNED_TWINLEAF}=
  require('../../twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs');
const {installUnderworldDoorPsychicRecipientHook}=
  require('../../twinleaf/underworld-door-psychic-recipient-hook.cjs');

const VERSION='agent31-lockbridge-versus-champion-eight-original-ranks-v1';
const CANDIDATES=['champion-reference','agent31-lockbridge-shadow-rider-v1'];
const ROOT=path.resolve(__dirname,'../../..');
const OUTPUT=process.env.AGENT31_LOCKBRIDGE_OUTPUT||
  path.join(ROOT,'agent31-lockbridge-eight-rank-native.json');
const digest=value=>createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/** @returns {object[]} Precommitted independent physical source groups. */
function inspect(){
  assert.equal(registration.schema,
    'agent31-20261109-lockbridge-v1-champion-eight-rank-physical-panel');
  assert.equal(registration.status,'FROZEN BEFORE FIRST NATIVE GAME');
  assert.deepEqual(registration.candidateIds,CANDIDATES);
  assert.deepEqual(registration.sourceRanks,[1,2,5,6,11,13,17,24]);
  assert.equal(registration.sourcePhysicalGroups,16);
  assert.equal(registration.registeredNativeAttempts,32);
  assert.equal(registration.nativeRootActionLimit,260);
  assert.equal(registration.groups.length,16);
  assert.equal(registration.trials.length,32);
  assert.equal(candidate.label,CANDIDATES[1]);
  assert.deepEqual(candidate.category_counts,
    {'Pokémon':18,Trainer:31,Energy:11});
  assert.equal(candidate.cards.reduce((n,x)=>n+x.count,0),60);
  assert.equal(frozen.pinnedVendorRevision,PINNED_TWINLEAF);
  const roster=require('../../../results/aichi-2026/full-decklists.json');
  const admitted=require('../agent25-authenticated-source-admission.cjs')
    .authenticatedSourceRanks(roster,true);
  const seeds=new Set(),ids=new Set();
  for(const group of registration.groups){
    assert.ok(admitted.includes(group.rank));
    assert.ok(!seeds.has(group.seed));
    seeds.add(group.seed);
    for(const id of CANDIDATES){
      const trial=registration.trials.find(t=>t.id===group.id+':'+id);
      assert.ok(trial,'Unregistered source comparison '+group.id+' '+id);
      assert.equal(trial.seed,group.seed);
      assert.equal(trial.rank,group.rank);
      assert.equal(trial.candidateSlot,group.candidateSlot);
      assert.ok(!ids.has(trial.id));ids.add(trial.id);
    }
  }
  assert.equal(ids.size,32);
  for(const id of CANDIDATES){
    const trials=registration.trials.filter(t=>t.candidateId===id);
    validateRegisteredTrialGroups(trials,admitted,false,true);
  }
  return registration.groups.map(g=>({...g}));
}

/** @param {object} row @returns {object} Native evidence from a real Store. */
function diagnosis(row){
  const native=classifyNativeAttempt(row);
  const roots=row.rootActionLedger??
    row.nativeAbortEvidence?.rootActionLedger??[];
  const seat=row.trial.candidateSlot==='A'?0:1;
  const terminal=native.kind==='ENGINE_TERMINAL';
  return {
    id:row.trial.id,rank:row.trial.rank,seed:row.trial.seed,
    candidateId:row.trial.candidateId,
    candidateSlot:row.trial.candidateSlot,candidateSeat:seat,
    nativeDisposition:native.kind,finished:terminal,
    nativeWinner:terminal?native.winner:null,
    candidateNativeWon:terminal&&native.winner===seat,
    candidateNativeLost:terminal&&native.winner===1-seat,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    actualStarterSeat:row.actualStarterSeat??null,
    rootCount:roots.length,rootDigest:digest(roots),
    sourceAttackRootCount:roots.filter(r=>r.action==='AttackAction'&&
      r.playerSlot===1-seat).length,
    contenderAttackRootCount:roots.filter(r=>r.action==='AttackAction'&&
      r.playerSlot===seat).length,
    error:row.error?String(row.error).slice(0,1400):null,
    nativeEndReason:row.endReason??null,
    rootActionLedger:roots,competitivePaperQualified:false
  };
}

/**
 * Pair only physically identical observed source openings and starting seats.
 * Different candidate sixty-card inventories cannot yield identical entire
 * two-player deals, so full-deal digests are archived, never equated.
 * @param {object[]} rows All 32 attempted native games.
 * @returns {object} Failure-inclusive matchup panel.
 */
function compare(rows){
  assert.equal(rows.length,32);
  const byId=new Map(rows.map(x=>[x.id,x]));
  assert.equal(byId.size,32);
  const groups=registration.groups.map(group=>{
    const [champion,challenger]=CANDIDATES
      .map(id=>byId.get(group.id+':'+id));
    assert.ok(champion&&challenger,'Missing native arm '+group.id);
    const sourceMatched=Boolean(champion.sourceDealFingerprint&&
      challenger.sourceDealFingerprint&&
      champion.sourceDealFingerprint===challenger.sourceDealFingerprint);
    const starterMatched=champion.actualStarterSeat!==null&&
      champion.actualStarterSeat===challenger.actualStarterSeat;
    const comparable=sourceMatched&&starterMatched;
    const bothTerminal=champion.finished&&challenger.finished;
    return {
      id:group.id,rank:group.rank,sourceSeed:group.seed,
      candidateSlot:group.candidateSlot,sourceMatched,starterMatched,
      comparable,bothTerminal,
      championWins:champion.candidateNativeWon,
      challengerWins:challenger.candidateNativeWon,
      nativeWinReversal:comparable&&bothTerminal&&
        champion.candidateNativeWon!==challenger.candidateNativeWon,
      champion,challenger,competitiveQualified:false
    };
  });
  const arms=groups.flatMap(g=>[g.champion,g.challenger]);
  const byCandidate=Object.fromEntries(CANDIDATES.map(id=>{
    const selected=arms.filter(row=>row.candidateId===id);
    return [id,{
      nativeWins:selected.filter(x=>x.candidateNativeWon).length,
      nativeLosses:selected.filter(x=>x.candidateNativeLost).length,
      naturalNativeTerminals:selected.filter(x=>x.finished).length,
      errors:selected.filter(x=>x.nativeDisposition==='NATIVE_ABORT').length,
      actionCaps:selected.filter(x=>x.nativeDisposition==='ACTION_CAP').length,
      otherUnqualified:selected.filter(x=>!x.finished&&
        x.nativeDisposition!=='NATIVE_ABORT'&&
        x.nativeDisposition!=='ACTION_CAP').length
    }];
  }));
  const matchedTerminal=groups.filter(g=>g.comparable&&g.bothTerminal);
  const summary={
    registeredPhysicalGroups:16,
    executedNativeAttempts:arms.length,
    paperQualifiedGames:0,
    sourceOpeningsMatched:groups.filter(g=>g.sourceMatched).length,
    sourceAndStarterMatched:groups.filter(g=>g.comparable).length,
    bothNativeTerminalWhenMatched:matchedTerminal.length,
    nativeWinnerReversals:matchedTerminal.filter(g=>g.nativeWinReversal).length,
    challengerNativeGains:matchedTerminal.filter(g=>
      g.challengerWins&&!g.championWins).length,
    challengerNativeLosses:matchedTerminal.filter(g=>
      g.championWins&&!g.challengerWins).length,
    byCandidate
  };
  const byRank=registration.sourceRanks.map(rank=>{
    const subset=groups.filter(g=>g.rank===rank);
    return {rank,groups:subset.length,
      comparable:subset.filter(g=>g.comparable).length,
      bothTerminal:subset.filter(g=>g.comparable&&g.bothTerminal).length,
      championWins:subset.filter(g=>g.championWins).length,
      challengerWins:subset.filter(g=>g.challengerWins).length,
      errors:subset.flatMap(g=>[g.champion,g.challenger])
        .filter(r=>r.nativeDisposition==='NATIVE_ABORT').length};
  });
  return {summary,byRank,groups,
    admission:arms.every(a=>a.rootCount===0)?
      'INVALID_ALL_ZERO_NATIVE_ROOTS':'DEVELOPMENT_ONLY',
    selectedDeck:'NONE',reliableFieldWinRate:null};
}

/** Atomic locked result preservation, including every native abort. */
function save(record){
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  const lock=OUTPUT+'.lock';
  const fd=fs.openSync(lock,'wx',0o600);
  const temp=OUTPUT+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(temp,JSON.stringify(record)+'\n',{flag:'wx'});
    const h=fs.openSync(temp,'r');
    try{fs.fsyncSync(h);}finally{fs.closeSync(h);}
    fs.renameSync(temp,OUTPUT);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}

/** Execute both decks against the same frozen original-source seed panel. */
function run(){
  const groups=inspect();
  const ambient=[
    ['AGENT2_HELD_GUZMA_MOBILITY_DEV','true'],
    ['AGENT4_NATIVE_PAYMENT_RECEIPT_DEV','true']
  ];
  const prior=ambient.map(([k])=>process.env[k]);
  ambient.forEach(([k,v])=>{process.env[k]=v;});
  const restoreDoor=installUnderworldDoorPsychicRecipientHook();
  const native=[];
  try{
    for(const candidateId of CANDIDATES){
      const trials=registration.trials.filter(t=>t.candidateId===candidateId);
      const withProfile=withPaperSemanticsProfileV1(
        ()=>runDevelopment({
          ...frozen.policyOptions,
          registeredTrials:trials,
          registeredFrameName:VERSION+'-'+candidateId,
          registeredCandidateDecks:{
            [CANDIDATES[1]]:candidate
          },
          allowSingleCandidatePerGroup:true,
          allowAdditionalOriginalSourceRanks:true,
          nativeRootActionLimit:registration.nativeRootActionLimit,
          isolatePolicyRandomness:true,
          isolatePhysicalShuffleRandomnessAfterSetup:true,
          bilateralBasicEnergyRecipientFrontier:true,
          actorUnderworldDoorPromptOwner:true,
          actorUnderworldDoorRoot:true,
          actorFundedShadowRiderFloatStoneRoot:false,
          actorGuzmaPromptContinuation:true,
          actorZeroEnergyStrandFloatStoneRoot:true,
          actorSeekerGuzmaNominalKo:true,
          actorZeroEnergyStrandFloatStoneTargetTurn:null,
          actorZeroEnergyStrandFloatStoneOwnerSeat:null,
          actorSeekerGuzmaOwnerSeat:null,
          actorSeekerGuzmaGlobalTurn:null
        }),
        {celestialRoar:true,mewEnergyMix:true,attachEnergyTarget:true}
      );
      assert.equal(withProfile.result.attempted,groups.length);
      native.push({candidateId,profileAudit:withProfile.audit,
        batch:withProfile.result});
    }
  }finally{
    restoreDoor();
    ambient.forEach(([k],i)=>{
      if(prior[i]===undefined)delete process.env[k];
      else process.env[k]=prior[i];
    });
  }
  const allRows=native.flatMap(x=>x.batch.rows.map(diagnosis));
  const analysis=compare(allRows);
  const record={schema:VERSION,registration,candidate60:candidate,
    printedCandidateIds:CANDIDATES,
    sourceRanks:registration.sourceRanks,
    pinnedNativeTwinleaf:PINNED_TWINLEAF,
    githubSha:process.env.GITHUB_SHA??null,
    fixedBothContenderSixties:true,
    samePlayerPolicyForAllNativeArms:true,
    paperSemanticsProfileBothArms:true,
    policyAndPostSetupPhysicalRngIsolated:true,
    noNewRegisteredDealsAfterOutcome:true,
    analysis,native,competitivelyQualifiedGames:0};
  save(record);
  process.stdout.write('AGENT31_LOCKBRIDGE_NATIVE '+
    JSON.stringify({admission:analysis.admission,
      summary:analysis.summary,byRank:analysis.byRank,
      output:OUTPUT})+'\n');
  return record;
}
if(require.main===module){
  if(process.argv.includes('--inspect-only'))
    process.stdout.write(JSON.stringify(inspect())+'\n');
  else{
    const result=run();
    if(result.analysis.admission!=='DEVELOPMENT_ONLY')
      process.exitCode=1;
  }
}
module.exports={VERSION,CANDIDATES,inspect,diagnosis,compare,run};
