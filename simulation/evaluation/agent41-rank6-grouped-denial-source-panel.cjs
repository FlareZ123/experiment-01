'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');

const VERSION='agent41-preregistered-rank6-grouped-denial-source-panel-v1';
const REGISTRATION='results/aichi-2026/registrations/agent41-rank6-grouped-denial-original-source-20261031.json';
const REGISTRATION_BLOB='6f4a694403069674f33daf81eff18971e214b758';
const ENGINE_PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const IDS=['champion-reference','new-moon-lockbreaker-v1'];

/** Read only the precommitted original-source trial schedule. */
function readRegistration(){
  const bytes=fs.readFileSync(path.resolve(__dirname,'../..',REGISTRATION));
  const gitBlob=createHash('sha1')
    .update('blob '+bytes.length+'\0').update(bytes).digest('hex');
  assert.equal(gitBlob,REGISTRATION_BLOB,'Frozen preregistration was modified');
  const plan=JSON.parse(bytes.toString('utf8'));
  assert.equal(plan.schema,
    'agent41-rank6-grouped-denial-original-source-20261031-v1');
  assert.equal(plan.enginePin,ENGINE_PIN);
  assert.equal(plan.rank,6);
  assert.equal(plan.distinctSeedGroups,24);
  assert.equal(plan.games,48);
  assert.equal(plan.sameRootProbeAll,true);
  assert.equal(plan.sameRootChoiceApply,false);
  assert.deepEqual(plan.candidateIds,IDS);
  assert.equal(plan.trials.length,48);
  const seeds=new Map();
  const ids=new Set();
  for(const trial of plan.trials){
    assert.equal(trial.rank,6);
    assert.ok(Number.isSafeInteger(trial.repeat)&&
      trial.repeat>=0&&trial.repeat<24);
    assert.ok(Number.isSafeInteger(trial.seed)&&
      trial.seed>=0&&trial.seed<=0xffffffff);
    assert.ok(trial.candidateSlot===((trial.repeat%2===0)?'A':'B'));
    assert.ok(IDS.includes(trial.candidateId));
    assert.equal(trial.id,
      [trial.rank,trial.repeat,trial.candidateSlot,trial.candidateId].join(':'));
    assert.ok(!ids.has(trial.id));
    ids.add(trial.id);
    const entries=seeds.get(trial.repeat)??[];
    entries.push(trial);
    seeds.set(trial.repeat,entries);
  }
  assert.equal(seeds.size,24);
  assert.equal(new Set(plan.trials.map(t=>t.seed)).size,24);
  for(const entries of seeds.values()){
    assert.equal(entries.length,2);
    assert.equal(entries[0].seed,entries[1].seed);
    assert.deepEqual(entries.map(x=>x.candidateId).sort(),IDS.slice().sort());
  }
  return plan;
}

/** All counts are owner-root observational exposures, not win-rate inputs. */
function summarizeNativeResult(output,plan){
  assert.equal(output.attempted,plan.games);
  assert.equal(output.rows.length,plan.games);
  assert.equal(output.enginePin,ENGINE_PIN);
  const byId=new Map(output.rows.map(r=>[r.trial.id,r]));
  assert.equal(byId.size,plan.games);
  const rows=plan.trials.map(trial=>{
    const row=byId.get(trial.id);
    assert.ok(row,'Precommitted source arm must have a result row');
    const audit=row.actorOnlyDecisionCoverage?.detailedComponentAudits
      ?.root?.sameRootProposalChoice??null;
    const c=audit?.groupedDenialRootCounts??null;
    return {
      id:trial.id,rank:trial.rank,repeat:trial.repeat,
      candidateId:trial.candidateId,candidateSlot:trial.candidateSlot,
      sourceSeat:trial.candidateSlot==='A'?1:0,
      sourceDealFingerprint:row.sourceDealFingerprint??null,
      fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
      status:row.status??(row.finished===true?'engine-terminal':'censored'),
      winner:row.finished===true?row.winner??null:null,
      ownerRoots:audit?.ownerRoots??null,
      plumeriaOwnerRoots:c?.plumeriaRoots??null,
      plumeriaPhysicalOffers:c?.plumeriaPhysicalOffers??null,
      plumeriaAndFlareCoheldRoots:c?.plumeriaAndFlareCoheldRoots??null,
      bothOfferedRoots:c?.plumeriaAndFlareBothOfferedRoots??null,
      plumeriaAndAttackRoots:c?.plumeriaAndPayableAttackRoots??null,
      opposingBenchTargets:c?.plumeriaWithBenchTargetRoots??null,
      coheldExamples:c?.coheldFlareRootSamples??null,
      actorAuditObserved:audit!==null,
      qualified:false
    };
  });
  const sum=(field)=>rows.reduce((n,r)=>
    n+(Number.isSafeInteger(r[field])?r[field]:0),0);
  const positives=rows.filter(r=>
    (r.plumeriaAndFlareCoheldRoots??0)>0);
  const positiveSeedGroups=new Set(positives.map(r=>r.repeat));
  const absent=rows.filter(r=>r.actorAuditObserved!==true);
  const failing=rows.filter(r=>r.status!=='engine-terminal'&&
    r.status!=='censored');
  const perSeed=Array.from({length:24},(_,repeat)=>{
    const pair=rows.filter(r=>r.repeat===repeat);
    assert.equal(pair.length,2);
    return {repeat,seed:plan.trials.find(t=>t.repeat===repeat).seed,
      candidates:pair.map(r=>r.candidateId),
      sameSourcePhysicalDeal:pair.every(r=>
        typeof r.sourceDealFingerprint==='string'&&
        r.sourceDealFingerprint===pair[0].sourceDealFingerprint),
      coheldFlareObserved:pair.some(r=>
        (r.plumeriaAndFlareCoheldRoots??0)>0),
      bothNativeStoreOffersUnverified:true};
  });
  return {
    schema:'agent41-rank6-grouped-denial-observer-source-summary-v1',
    registrationPath:REGISTRATION,registrationBlob:REGISTRATION_BLOB,
    enginePin:ENGINE_PIN,unmodifiedCandidateIDs:IDS,
    scheduled:rows.length,uniqueSourceSeedGroups:perSeed.length,
    candidatePhysicalSeatDistribution:{A:24,B:24},
    resultsWithNativeActorAudit:rows.length-absent.length,
    unobservedActorAudits:absent.map(r=>r.id),
    errorOrUnsupportedArms:failing.map(r=>({id:r.id,status:r.status})),
    engineTerminals:rows.filter(r=>r.status==='engine-terminal').length,
    censored:rows.filter(r=>r.status==='censored').length,
    ownerRoots:sum('ownerRoots'),
    plumeriaOwnerRoots:sum('plumeriaOwnerRoots'),
    physicalPlumeriaCopyOffers:sum('plumeriaPhysicalOffers'),
    coheldFlareOwnerRoots:sum('plumeriaAndFlareCoheldRoots'),
    bothSupporterOffersRoots:sum('bothOfferedRoots'),
    plumeriaVersusAttackRoots:sum('plumeriaAndAttackRoots'),
    benchTargetRoots:sum('opposingBenchTargets'),
    armsWithCoheldFlare:positives.map(r=>r.id),
    distinctSeedGroupsWithCoheldFlare:positiveSeedGroups.size,
    perSeed,
    rows,
    competitiveQualifiedGames:0,
    evidenceType:'genuine native read-only owner-root source opportunities',
    limitation:'All 48 source/candidate game results are development-only. A held grouped offer has no native canPlay certificate or mandatory prompt settlement; two candidate games sharing each seed are correlated.'
  };
}

/** Evaluate a frozen complete original ranked source against two candidate 60s. */
function runPanel(){
  const plan=readRegistration();
  const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
  const result=runDevelopment({
    actorOnlyComposition:true,
    mandatoryOptionFallback:true,
    paperSupporterQuota:true,
    nativePressureWindows:true,
    nativeAcceptedTargets:true,
    sameRootProposalChoice:true,
    sameRootProbeAll:true,
    sameRootChoiceApply:false,
    registeredTrials:plan.trials,
    registeredFrameName:REGISTRATION
  });
  assert.equal(result.competitiveQualifiedGames,0);
  return {version:VERSION,registeredAt:plan.registeredAt,
    summary:summarizeNativeResult(result,plan),
    native:result};
}

if(require.main===module)
  process.stdout.write(JSON.stringify(runPanel(),null,2)+'\n');

module.exports={VERSION,REGISTRATION,REGISTRATION_BLOB,
  readRegistration,summarizeNativeResult,runPanel};
