'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {createHash}=require('node:crypto');
const {gitBlobHash}=require('./agent42-strict-profile-preflight.cjs');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {replayFingerprint}=
  require('./agent43-guzma-held-root-retrospective.cjs');
const {withGuzmaPublicObstacleAudit,VERSION:OBSERVER_VERSION}=
  require('../twinleaf/agent31-guzma-public-obstacle-audit.cjs');
const {save}=require('./agent43-guzma-original-source-pair.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REGISTRATION=
  'results/aichi-2026/registrations/agent31-rank1-prospective-guzma-20261102.json';
const REGISTERED_BLOB='21d8b8c1093e315fcceadb7079ed64abf5966ce1';
const VERSION='agent31-rank1-prospective-readonly-guzma-funding-census-v1';

/** Verify that the previously frozen seed and roster files remain unchanged. */
function preflight(){
  const bytes=fs.readFileSync(path.join(ROOT,REGISTRATION));
  assert.equal(gitBlobHash(bytes),REGISTERED_BLOB,
    'Prospective registration changed after committed seed allocation');
  const registration=JSON.parse(bytes.toString('utf8'));
  assert.equal(registration.registeredBeforeNativeGames,true);
  assert.equal(registration.sourceRank,1);
  assert.equal(registration.trials.length,16);
  assert.equal(registration.totalNativeAttempts,32);
  assert.equal(registration.setupAndPolicyFixed.allowAdditionalOriginalSourceRanks,true);
  assert.deepEqual(registration.candidateIds,
    ['champion-reference','new-moon-lockbreaker-v1']);
  assert.equal(new Set([...registration.seeds.A,...registration.seeds.B]).size,8);
  const physical=registration.trials;
  for(const seat of ['A','B']){
    for(let i=0;i<4;i++){
      for(const candidateId of registration.candidateIds){
        const id=['1',i,seat,candidateId].join(':');
        const pairs=physical.filter(row=>row.id===id);
        assert.equal(pairs.length,1);
        assert.equal(pairs[0].seed,registration.seeds[seat][i]);
        assert.equal(pairs[0].rank,1);
      }
    }
  }
  assert.equal(new Set(physical.map(row=>row.id)).size,16);
  const native=execFileSync('git',['-C',path.join(ROOT,'vendor/twinleaf'),
    'rev-parse','HEAD'],{encoding:'utf8'}).trim();
  assert.equal(native,registration.enginePin);
  const roster=fs.readFileSync(path.join(ROOT,
    'results/aichi-2026/full-decklists.json'));
  assert.equal(gitBlobHash(roster),registration.originalSourceRosterBlobSha);
  const source=JSON.parse(roster.toString('utf8'))
    .decks.find(deck=>deck.rank===1);
  assert.ok(source);
  assert.equal(source.cards.reduce((n,entry)=>n+entry.count,0),60);
  return {registration,native,rosterBlob:gitBlobHash(roster),
    originalSourceArchetype:source.archetype};
}

/** A redacted native after-play receipt for a single registered trial. */
function publicReceipt(row){
  const abort=row.nativeAbortEvidence;
  return {
    id:row.trial.id,seed:row.trial.seed,
    candidateSlot:row.trial.candidateSlot,
    candidateId:row.trial.candidateId,
    status:row.status??(row.finished===true?'terminal':'unfinished'),
    error:row.error??null,
    sourceDeal:row.sourceDealFingerprint??
      abort?.sourceDealFingerprint?.digestSha256??null,
    fullPhysicalDeal:row.fullPhysicalDealFingerprint??null,
    actualFirstSeat:row.actualStarterSeat??
      row.nativeSetupCoinChoiceReceipt?.firstSeatFromVerifiedDraw??null,
    rootActionLedgerSha256:row.rootActionLedgerSha256??null,
    rootCount:row.rootActionCount??null,
    nativeSourceAttackCount:row.sourceAttackDeclarations??
      row.attackDeclarations?.source??null,
    nativeCandidateAttackCount:row.candidateAttackDeclarations??
      row.attackDeclarations?.candidate??null,
    competitivelyQualified:false
  };
}

/** Compare all sixteen native original-source arms. Null is unverified. */
function reconcile(control,observed){
  assert.equal(control.length,16);
  assert.equal(observed.length,16);
  const matching=new Map(observed.map(row=>[row.trial.id,row]));
  assert.equal(matching.size,16);
  return control.map(row=>{
    const partner=matching.get(row.trial.id);
    assert.ok(partner,'Missing prospective trial '+row.trial.id);
    const a=publicReceipt(row),b=publicReceipt(partner);
    assert.equal(a.seed,b.seed);
    assert.equal(a.candidateSlot,b.candidateSlot);
    assert.equal(a.candidateId,b.candidateId);
    const same=(key)=>a[key]===null||b[key]===null?
      null:a[key]===b[key];
    return {
      id:a.id,seed:a.seed,
      sameOriginalSourceDeal:same('sourceDeal'),
      sameCompletePhysicalDeal:same('fullPhysicalDeal'),
      sameVerifiedFirstSeat:same('actualFirstSeat'),
      sameNativeRootLedger:same('rootActionLedgerSha256'),
      sameNativeStatus:same('status'),
      control:a,readOnlyObserved:b
    };
  });
}

/**
 * Execute an independent, predeclared source rank 1 cohort twice.
 * No tactical preference, selection, cards, seed, or actor prompt is changed.
 */
function run(){
  const p=preflight();
  const flags={...p.registration.setupAndPolicyFixed,
    registeredTrials:p.registration.trials,
    registeredFrameName:p.registration.schema,
    actorGuzmaNominalGust:false};
  assert.equal(flags.actorOnlyComposition,true);
  assert.equal(flags.allowAdditionalOriginalSourceRanks,true);
  const old=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  let control,observed;
  try{
    control=runDevelopment(flags);
    observed=withGuzmaPublicObstacleAudit(()=>runDevelopment(flags));
  }finally{
    if(old===undefined)
      delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
    else
      process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=old;
  }
  const controlDigest=replayFingerprint(control.rows);
  const observedDigest=replayFingerprint(observed.result.rows);
  const pairs=reconcile(control.rows,observed.result.rows);
  const allStatusMatch=pairs.every(p=>p.sameNativeStatus===true);
  const allKnownRootMatch=pairs.every(p=>p.sameNativeRootLedger!==false);
  const allKnownSourceDealMatch=pairs.every(p=>
    p.sameOriginalSourceDeal!==false);
  const allKnownFullDealMatch=pairs.every(p=>
    p.sameCompletePhysicalDeal!==false);
  const strictReadOnlyMatched=controlDigest===observedDigest&&
    allStatusMatch&&allKnownRootMatch&&
    allKnownSourceDealMatch&&allKnownFullDealMatch;
  const payload={
    schema:VERSION,observerVersion:OBSERVER_VERSION,
    registrationPath:REGISTRATION,registrationBlob:REGISTERED_BLOB,
    registeredUtc:p.registration.registeredUtc,
    originalSourceRank:1,
    originalSourceArchetype:p.originalSourceArchetype,
    fixedNativeEngine:p.native,fixedRosterBlob:p.rosterBlob,
    nativeAttemptsPerPolicy:16,matchedNativeAttemptPairs:16,
    controlDigest,observedDigest,strictReadOnlyMatched,
    allStatusMatch,allKnownRootMatch,
    allKnownSourceDealMatch,allKnownFullDealMatch,
    pairs,obstacleAudit:observed.audit,
    operatorErrorCounts:{
      control:control.rows.filter(row=>row.error).length,
      observed:observed.result.rows.filter(row=>row.error).length
    },
    competitiveQualifiedGames:0,verified99Point5:false,
    limitations:[
      'Eight newly allocated random seed groups, two candidate sixty-card lists, both physical seats; 16 independent native deals per policy arm',
      'Some replay receipts may lack a physical-fingerprint field if a native abort occurs, and unobserved equality is not certified',
      'Read-only Store observer queries owner-visible post-choice roots only; native source and opponent reply policies remain developmental',
      'A fixed-damage Basic-energy-funded Bench attack is only a conservative necessary screen, not a proof of final attack legality or Knock Out',
      'Native terminal results are not credited as qualified game wins, and no registered selected tactical treatment was applied'
    ]
  };
  return payload;
}

if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    const p=preflight();
    process.stdout.write('AGENT31_RANK1_PRECHECK '+JSON.stringify({
      schema:VERSION,registrationBlob:REGISTERED_BLOB,
      fixedNativeEngine:p.native,trials:p.registration.trials.length,
      pairedReplays:32,sourceRank:1,competitiveQualifiedGames:0})+'\n');
  }else{
    const result=run();
    if(process.env.AGENT31_RANK1_GUZMA_OUTPUT)
      save(process.env.AGENT31_RANK1_GUZMA_OUTPUT,result);
    process.stdout.write('AGENT31_RANK1_GUZMA_PUBLIC_OBSTACLES '+JSON.stringify({
      schema:result.schema,strictReadOnlyMatched:result.strictReadOnlyMatched,
      games:result.obstacleAudit.gamesObserved,
      acceptedRoots:result.obstacleAudit.acceptedOwnerRoots,
      heldGuzmaRoots:result.obstacleAudit.acceptedOwnerRootsHoldingGuzma,
      heldGuzmaTurns:result.obstacleAudit.uniqueOwnerTurnsWithGuzma,
      fundedBenchTurns:result.obstacleAudit.ownerTurnsWithAnyFundedBenchAttack,
      nominalKoTurns:result.obstacleAudit.ownerTurnsWithAnyNominalBenchKo,
      nominalOpenTurns:result.obstacleAudit.ownerTurnsWithAnyNominalAndOpenSupporter,
      finalPrizeTurns:result.obstacleAudit.ownerTurnsWithFinalPrizeOpportunity,
      nonfinalPrizeTurns:result.obstacleAudit.ownerTurnsWithNonfinalOpportunity,
      controlDigest:result.controlDigest,observedDigest:result.observedDigest,
      competitiveQualifiedGames:0})+'\n');
    assert.equal(result.strictReadOnlyMatched,true,
      'Passive owner-view census must not change native action ledger or setup');
  }
}
module.exports={VERSION,REGISTERED_BLOB,preflight,publicReceipt,
  reconcile,run};
