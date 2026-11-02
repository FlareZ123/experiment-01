'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {gitBlobHash}=require('./agent42-strict-profile-preflight.cjs');
const {auditSourceClosure}=require('./agent36-source-closure-audit.cjs');
const {sourcePrizeProgress}=require('./agent18-source-prize-progress.cjs');
const profile=require('./agent18-rank5-selected-canary-v1.json');
const ROOT=path.resolve(__dirname,'../..');

/** @param {string} root @param {object} [environment] */
function preflight(root=ROOT,environment=process.env,chosen=profile){
  const entrypoint=fs.readFileSync(path.join(root,
    'simulation/evaluation/agent18-rank5-selected-canary.cjs'));
  assert.equal(gitBlobHash(entrypoint),chosen.selectedEntrypointGitBlobSha,
    'Selected canary entrypoint changed; register new exact code before execution');
  const runner=path.resolve(root,chosen.runner);
  const source=fs.readFileSync(runner);
  assert.equal(gitBlobHash(source),chosen.runnerGitBlobSha,
    'Selected runner changed; repin and explicitly register a new treatment');
  const signature=source.toString('utf8')
    .match(/function runDevelopment\(\{([\s\S]*?)\}=\{\}\)\{/);
  assert.ok(signature,'Selected runDevelopment option signature disappeared');
  const all=[...signature[1].matchAll(/([A-Za-z]\w*)\s*=\s*(false|true|null)/g)];
  assert.equal(all.length,chosen.expectedRunnerOptions,
    'Runner options changed without selection review');
  const defaults=Object.fromEntries(all.map(match=>[
    match[1],match[2]==='null'?null:match[2]==='true'
  ]));
  assert.equal(Object.keys(defaults).length,all.length,
    'Duplicate option parameters in selected runner');
  assert.ok(Array.isArray(chosen.enabled));
  for(const name of chosen.enabled){
    assert.equal(defaults[name],false,
      'Enabled option absent or no longer default-off: '+name);
    defaults[name]=true;
  }
  const ambient=Object.keys(environment).filter(name=>
    /^AGENT\d+_/.test(name)&&environment[name]!==undefined).sort();
  assert.deepEqual(ambient,chosen.allowedAmbientAgentVariables,
    'Ambient agent environment changes selected policy');
  const roster=fs.readFileSync(path.join(root,'results/aichi-2026/full-decklists.json'));
  assert.equal(gitBlobHash(roster),chosen.originalRosterGitBlobSha,
    'Authenticated original printed roster drifted');
  const original=JSON.parse(roster.toString('utf8')).decks.find(
    row=>row.rank===chosen.rank);
  assert.ok(original);
  assert.equal(original.cards.reduce((n,card)=>n+card.count,0),60);
  assert.equal(new Set(chosen.seeds.map(s=>s.seat)).size,2);
  assert.deepEqual(chosen.seeds.map(s=>s.seat).sort(),['A','B']);
  const trials=chosen.seeds.flatMap((s,i)=>chosen.candidateIds.map(
    candidateId=>({id:[chosen.rank,i,s.seat,candidateId].join(':'),
      rank:chosen.rank,repeat:i,candidateSlot:s.seat,
      candidateId,seed:s.seed})));
  assert.equal(trials.length,4);
  const closure=auditSourceClosure(root,[chosen.runner]);
  const closurePinned=typeof chosen.verifiedClosureSha256==='string'&&
    closure.digest===chosen.verifiedClosureSha256 &&
    closure.files.length===chosen.expectedStaticClosureFiles;
  assert.equal(closurePinned,true,
    'Frozen static import closure or file count changed; create a new profile');
  return {options:defaults,trials,closureDigest:closure.digest,closurePinned,
    closureFiles:closure.files.length,ambient,
    originalRank:original.rank,sourceCards:60};
}

/** Execute only this registered four-attempt developmental Store canary. */
function run(chosen=profile){
  const prepared=preflight(ROOT,process.env,chosen);
  const actualPin=execFileSync('git',['-C',
    path.join(ROOT,'vendor/twinleaf'),'rev-parse','HEAD'],
    {encoding:'utf8'}).trim();
  assert.equal(actualPin,chosen.vendorRevision,
    'Native engine differs from selected pinned revision');
  const prior={};
  for(const [key,value] of Object.entries(chosen.injectedEnv)){
    prior[key]=process.env[key];
    process.env[key]=value;
  }
  try{
    const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
    const result=runDevelopment({...prepared.options,
      registeredTrials:prepared.trials,
      registeredFrameName:chosen.schema+'-original-rank5-both-seats'});
    const rows=result.rows??[];
    const originalRoster=JSON.parse(fs.readFileSync(path.join(ROOT,
      'results/aichi-2026/full-decklists.json'),'utf8'));
    const source=originalRoster.decks.find(x=>x.rank===chosen.rank);
    const trainerNames=new Set(source.cards.filter(x=>x.category==='Trainer')
      .map(x=>x.name));
    const statusCounts={};
    const armDispositions=rows.map(row=>{
      const status=row.status??(row.finished===true?
        'engine-terminal-unqualified':row.endReason==='action-limit'?
        'action-capped-unqualified':'incomplete-unqualified');
      statusCounts[status]=(statusCounts[status]??0)+1;
      const roots=(row.rootActionLedger??[])
        .filter(x=>x.playerSlot===row.sourceSeat);
      const sourceTrainers=roots.filter(x=>
        x.action==='PlayCardAction'&&trainerNames.has(x.card));
      const sourceAttacks=row.sourceAttackSettlement?.settled??0;
      const sourceReplies=row.sourceAttackSettlement
        ?.withVerifiedSameEpochSourceReturn??0;
      const payoff=(row.sourceSeat===0||row.sourceSeat===1)?
        sourcePrizeProgress(row.sourceAttackSettlement,row.sourceSeat):null;
      const prizeAttacks=payoff?.sourceAttacksWithNativePrizeProgress??0;
      const prizeReturns=payoff
        ?.actualSameEpochOpponentReturnsAfterPrizeProgress??0;
      return {
        trialId:row.trial?.id??null,status,sourceSeat:row.sourceSeat??null,
        actualStarterSeat:row.actualStarterSeat??null,
        sourceDealFingerprint:row.sourceDealFingerprint??null,
        physicalZoneStatus:row.physicalZoneQualification?.status??'NOT_OBSERVED',
        sourceTrainerRootCount:sourceTrainers.length,
        sourceAttackDeclarations:row.sourceAttackSettlement?.declarations??null,
        sourceSettledAttacks:sourceAttacks,
        candidateSettledAttacks:row.candidateAttackSettlement?.settled??null,
        sourceAttackOpponentVerifiedSameEpochReturns:sourceReplies,
        nativeSourcePrizeProgress:payoff,
        PAPER_PAYMENT_VERIFIED:'UNQUALIFIED_FULL_GAME',
        SOURCE_PAYOFF_WITNESSED:prizeAttacks>0?
          'NATIVE_SOURCE_PRIZE_PROGRESS_PAPER_UNQUALIFIED':
          sourceAttacks>0?'ATTACK_WITHOUT_NATIVE_PRIZE_PROGRESS':'NOT_OBSERVED',
        OPPONENT_CONTINUATION_WITNESSED:prizeReturns>0?
          'NATIVE_RETURN_AFTER_PRIZE_PROGRESS_PAPER_UNQUALIFIED':
          prizeAttacks>0?'NO_VERIFIED_AFTER_PRIZE_OPPONENT_RETURN':
          'NO_OBSERVED_SOURCE_PRIZE_PROGRESS',
        firstMissingQualification:row.status?'NATIVE_ERROR_OR_REJECTED_ROOT':
          sourceAttacks===0?'SOURCE_ATTACK_NOT_OBSERVED':
          prizeAttacks===0?'SOURCE_PRIZE_PROGRESS_NOT_OBSERVED':
          prizeReturns===0?'OPPONENT_RETURN_AFTER_SOURCE_PRIZE_NOT_OBSERVED':
          'PAPER_MECHANICS_AND_OPPONENT_COMPETENCE_UNVERIFIED',
        competitiveGameQualified:false
      };
    });
    const expected=prepared.trials.map(x=>x.id).sort();
    const actual=rows.map(x=>x.trial?.id).sort();
    const bothSeats=JSON.stringify(expected)===JSON.stringify(actual);
    const deckFingerprintsMatch=rows.length===expected.length &&
      rows.every(row=>row.sourceDeckFingerprint===
        chosen.expectedSourceDeckFingerprint &&
        row.candidateDeckFingerprint===
          chosen.expectedCandidateDeckFingerprints[row.trial?.candidateId]);
    return {schema:chosen.schema,profile:chosen,sourceClosureDigest:prepared.closureDigest,
      closureFiles:prepared.closureFiles,nativePin:actualPin,
      actualResearchCommit:process.env.GITHUB_SHA??null,
      registered:expected,attempted:rows.length,statusCounts,armDispositions,
      registeredDeckFingerprintsMatched:deckFingerprintsMatch,
      dispositions:{
        CONFIG_FROZEN:prepared.closurePinned&&deckFingerprintsMatch?
          'STATIC_SOURCE_CLOSURE_AND_NATIVE_DECKS_PINNED_COMPUTED_IMPORTS_UNRESOLVED':
          'UNVERIFIED_STATIC_OR_ACTUAL_DECK_FINGERPRINT',
        BOTH_SEATS_EXECUTED:bothSeats?'ALL_REGISTERED_ATTEMPTS_RECORDED':'INCOMPLETE',
        PAPER_PAYMENT_VERIFIED:'UNQUALIFIED_FULL_GAME',
        SOURCE_PAYOFF_WITNESSED:armDispositions.some(x=>
          x.nativeSourcePrizeProgress?.sourceAttacksWithNativePrizeProgress>0)?
          'SOME_NATIVE_SOURCE_PRIZE_PROGRESS_PAPER_UNQUALIFIED':'ZERO_NATIVE_SOURCE_PRIZE_PROGRESS',
        OPPONENT_CONTINUATION_WITNESSED:armDispositions.some(x=>
          x.nativeSourcePrizeProgress
            ?.actualSameEpochOpponentReturnsAfterPrizeProgress>0)?
          'SOME_NATIVE_RETURNS_AFTER_PRIZE_PAPER_UNQUALIFIED':
          'ZERO_VERIFIED_AFTER_PRIZE_SOURCE_REPLIES'
      },
      allOriginalSourceDealsEqualAcrossCandidates:result.sourcePairs?.every(
        x=>x.sameSourcePhysicalDeal===true)??false,
      competitiveGameQualified:false,target99Point5Verified:false,
      rows};
  }finally{
    for(const [key,value] of Object.entries(prior)){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={profile,preflight,run};
