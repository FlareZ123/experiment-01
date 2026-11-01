'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {createHash}=require('node:crypto');
const {gitBlobHash}=
  require('./agent42-strict-profile-preflight.cjs');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {save}=require('./agent43-guzma-original-source-pair.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REGISTRATION=
  'results/aichi-2026/registrations/agent43-rank11-fresh-guzma-gust-20261101.json';
const REGISTERED_BLOB='7a6439fe1952b0c49c0b3c9ed0a255b58df06c1c';
const VERSION='agent43-fresh-rank11-nominal-guzma-gust-bothseat-paired-v1';

/** Immutable first-run preflight. This does not simulate or screen any seed. */
function preflight(){
  const bytes=fs.readFileSync(path.join(ROOT,REGISTRATION));
  assert.equal(gitBlobHash(bytes),REGISTERED_BLOB,
    'Changed original preregistered fresh rank11 trial frame');
  const registration=JSON.parse(bytes.toString('utf8'));
  assert.equal(registration.schema,
    'agent43-rank11-guzma-nominal-gust-fresh-paired-20261101-v1');
  assert.equal(registration.registeredBeforeNativeGames,true);
  assert.equal(registration.sourceRank,11);
  assert.equal(registration.trials.length,16);
  assert.equal(registration.plannedNativeAttempts,32);
  assert.equal(registration.oneBooleanTreatmentOnly.startsWith(
    'actorGuzmaNominalGust=false vs true'),true);
  assert.equal(registration.fixedEnvironment.AGENT2_HELD_GUZMA_MOBILITY_DEV,
    'true');
  const native=execFileSync('git',['-C',path.join(ROOT,'vendor/twinleaf'),
    'rev-parse','HEAD'],{encoding:'utf8'}).trim();
  assert.equal(native,registration.enginePin);
  const roster=fs.readFileSync(path.join(ROOT,
    'results/aichi-2026/full-decklists.json'));
  assert.equal(gitBlobHash(roster),
    registration.originalSourceRosterBlobSha);
  const source=JSON.parse(roster.toString('utf8'))
    .decks.find(deck=>deck.rank===11);
  assert.ok(source);
  assert.equal(source.cards.reduce((n,c)=>n+c.count,0),60);
  const seeds=[...registration.seeds.A,...registration.seeds.B];
  assert.equal(seeds.length,8);
  assert.equal(new Set(seeds).size,8);
  assert.ok(seeds.every(n=>Number.isSafeInteger(n)&&n>=0&&n<=0xffffffff));
  const keys=new Set();
  for(const slot of ['A','B']){
    for(let i=0;i<4;i++){
      for(const candidateId of registration.candidateIds){
        const id=['11',i,slot,candidateId].join(':');
        assert.ok(!keys.has(id));
        keys.add(id);
        const arms=registration.trials.filter(t=>t.id===id);
        assert.equal(arms.length,1);
        assert.equal(arms[0].rank,11);
        assert.equal(arms[0].seed,registration.seeds[slot][i]);
        assert.equal(arms[0].candidateSlot,slot);
        assert.equal(arms[0].candidateId,candidateId);
        assert.equal(arms[0].repeat,i);
      }
    }
  }
  assert.deepEqual(registration.candidateIds,
    ['champion-reference','new-moon-lockbreaker-v1']);
  assert.equal(registration.setupAndPolicyFixed.actorOnlyComposition,true);
  assert.equal(registration.setupAndPolicyFixed.actorGuzmaPromptContinuation,true);
  return {registration,source,native,
    rosterBlob:gitBlobHash(roster),registrationBlob:REGISTERED_BLOB};
}

/** @param {object} row */
function evidence(row){
  const bridge=row.actorOnlyDecisionCoverage?.guzmaPromptAudit;
  const abort=row.nativeAbortEvidence;
  return {
    id:row.trial?.id??null,
    seed:row.trial?.seed??null,
    sourceRank:row.trial?.rank??null,
    status:row.status??(row.finished===true?'terminal':'unfinished'),
    error:row.error??null,
    finished:row.finished??null,winner:row.winner??null,
    sourceDeal:row.sourceDealFingerprint??
      abort?.sourceDealFingerprint?.digestSha256??null,
    fullPhysicalDeal:row.fullPhysicalDealFingerprint??null,
    actualFirstSeat:row.actualStarterSeat??
      row.nativeSetupCoinChoiceReceipt?.firstSeatFromVerifiedDraw??null,
    nativeSetupStatus:row.nativeSetupCoinChoiceReceipt?.status??null,
    physicalStatus:row.physicalZoneQualification?.status??null,
    sourceAttackDeclarations:row.attackDeclarations?.source??
      row.sourceAttackDeclarations??null,
    candidateAttackDeclarations:row.attackDeclarations?.candidate??
      row.candidateAttackDeclarations??null,
    rootActionLedgerSha256:row.rootActionLedgerSha256??null,
    rootCount:row.rootActionCount??null,
    guzmaAcceptedRoots:bridge?.acceptedGuzmaRoots??null,
    guzmaOwnerPromotions:bridge?.ownTargetPhysicalConfirmations??null,
    gustTargetProposals:bridge?.gustTargetProposals??null,
    gustTargetAcceptances:bridge?.gustTargetAcceptances??null,
    gustPhysicalConfirmations:bridge?.gustTargetPhysicalConfirmations??null,
    gustPhysicalMismatches:bridge?.gustTargetPhysicalMismatches??null,
    opponentGustDelegations:bridge?.opponentTargetDelegations??null,
    actualOpponentReplyCount:row.sourceReplyCount??null,
    competitivelyQualified:false
  };
}

/** Preserve all native arms irrespective of errors, caps, or no-opportunity. */
function run(){
  const provenance=preflight();
  const registration=provenance.registration;
  const opts={...registration.setupAndPolicyFixed,
    registeredTrials:registration.trials,
    registeredFrameName:registration.schema};
  assert.equal(opts.actorOnlyComposition,true);
  const previous=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  let baseline,treatment;
  try{
    baseline=runDevelopment({...opts,actorGuzmaNominalGust:false});
    treatment=runDevelopment({...opts,actorGuzmaNominalGust:true});
  }finally{
    if(previous===undefined)
      delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
    else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=previous;
  }
  assert.equal(baseline.rows.length,16);
  assert.equal(treatment.rows.length,16);
  const peers=new Map(treatment.rows.map(row=>[row.trial.id,row]));
  assert.equal(peers.size,16);
  const comparisons=baseline.rows.map(row=>{
    const other=peers.get(row.trial.id);
    assert.ok(other,'Missing treatment arm: '+row.trial.id);
    assert.equal(row.trial.seed,other.trial.seed);
    assert.equal(row.trial.candidateSlot,other.trial.candidateSlot);
    assert.equal(row.trial.candidateId,other.trial.candidateId);
    const a=evidence(row),b=evidence(other);
    const sameFull=Boolean(a.fullPhysicalDeal&&b.fullPhysicalDeal)?
      a.fullPhysicalDeal===b.fullPhysicalDeal:null;
    const sameSource=Boolean(a.sourceDeal&&b.sourceDeal)?
      a.sourceDeal===b.sourceDeal:null;
    const sameFirst=a.actualFirstSeat!==null&&b.actualFirstSeat!==null?
      a.actualFirstSeat===b.actualFirstSeat:null;
    return {
      id:row.trial.id,seed:row.trial.seed,
      candidateSlot:row.trial.candidateSlot,
      candidateId:row.trial.candidateId,
      sameFullPhysicalDeal:sameFull,sameSourceDeal:sameSource,
      sameNativeFirstSeat:sameFirst,
      baseline:a,treatment:b
    };
  });
  const counts=rows=>rows.reduce((acc,row)=>{
    const name=row.status??(row.finished===true?'terminal':'unfinished');
    acc[name]=(acc[name]??0)+1;
    return acc;
  },{});
  const totals=rows=>rows.reduce((acc,row)=>{
    const a=evidence(row);
    for(const key of ['guzmaAcceptedRoots','guzmaOwnerPromotions',
      'gustTargetProposals','gustTargetAcceptances',
      'gustPhysicalConfirmations','gustPhysicalMismatches']){
      if(a[key]!==null)acc[key]=(acc[key]??0)+a[key];
    }
    return acc;
  },{});
  const summary={
    version:VERSION,registeredUtc:registration.registeredUtc,
    registrationBlob:provenance.registrationBlob,
    rosterBlob:provenance.rosterBlob,nativeRevision:provenance.native,
    runnerCommit:process.env.GITHUB_SHA??null,
    independentSourceDealSeeds:8,originalSourceRank:11,
    originalSourceCards:provenance.source.cards
      .reduce((n,c)=>n+c.count,0),
    sourceArchetype:provenance.source.archetype,
    candidateIds:registration.candidateIds,
    attemptsPerPolicy:16,totalNativeAttempts:32,
    controlStatuses:counts(baseline.rows),
    treatmentStatuses:counts(treatment.rows),
    nativeGuzmaTotalsControl:totals(baseline.rows),
    nativeGuzmaTotalsTreatment:totals(treatment.rows),
    matchedSameFullPhysicalDeals:comparisons.filter(p=>
      p.sameFullPhysicalDeal===true).length,
    matchedSameSourceDeals:comparisons.filter(p=>
      p.sameSourceDeal===true).length,
    matchedSameStart:comparisons.filter(p=>
      p.sameNativeFirstSeat===true).length,
    comparisons,
    comparisonDigest:createHash('sha256')
      .update(JSON.stringify(comparisons)).digest('hex'),
    competitiveQualifiedGames:0,verified99Point5:false,
    caveats:[
      'Prospective original deals were registered before first game; this tactical rule was developed beforehand on staged fixtures',
      'Unchanged 60-card candidates and 60-card source 11 are tested with developmental bots, no certified paper prompt coverage or 25-minute clock',
      'Native terminal engine wins and surviving action-cap results do not establish competitive-game win rate',
      'Null opportunity means no observation; a zero proposal count is not a negative competitive matchup result',
      'Native first-target printed damage predicts only nominal knockout and can be modified by Tools/Abilities'
    ]
  };
  return {summary,raw:{summary,registration,baseline,treatment}};
}
if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    const p=preflight();
    process.stdout.write(JSON.stringify({version:VERSION,
      registrationBlob:p.registrationBlob,firstRunSeeds:8,attempts:32,
      native:p.native,source:p.source.archetype},null,2)+'\n');
  }else{
    const result=run();
    const where=process.env.AGENT43_FRESH_GUZMA_NATIVE_OUTPUT;
    if(where)save(where,result.raw);
    process.stdout.write('AGENT43_FRESH_RANK11_GUZMA '+
      JSON.stringify({version:VERSION,
        controlStatuses:result.summary.controlStatuses,
        treatmentStatuses:result.summary.treatmentStatuses,
        nativeGuzmaTotalsControl:result.summary.nativeGuzmaTotalsControl,
        nativeGuzmaTotalsTreatment:result.summary.nativeGuzmaTotalsTreatment,
        matchedSourceDeals:result.summary.matchedSameSourceDeals,
        comparisonDigest:result.summary.comparisonDigest,
        competitiveQualifiedGames:0})+'\n');
  }
}
module.exports={VERSION,preflight,evidence,run};
