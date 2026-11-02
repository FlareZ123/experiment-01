'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {gitBlobHash}=require('./agent42-strict-profile-preflight.cjs');
const {auditSourceClosure}=require('./agent36-source-closure-audit.cjs');
const profile=require('./agent18-rank5-selected-canary-v1.json');
const ROOT=path.resolve(__dirname,'../..');

/** @param {string} root @param {object} [environment] */
function preflight(root=ROOT,environment=process.env){
  const runner=path.resolve(root,profile.runner);
  const source=fs.readFileSync(runner);
  assert.equal(gitBlobHash(source),profile.runnerGitBlobSha,
    'Selected runner changed; repin and explicitly register a new treatment');
  const signature=source.toString('utf8')
    .match(/function runDevelopment\(\{([\s\S]*?)\}=\{\}\)\{/);
  assert.ok(signature,'Selected runDevelopment option signature disappeared');
  const all=[...signature[1].matchAll(/([A-Za-z]\w*)\s*=\s*(false|true|null)/g)];
  assert.equal(all.length,profile.expectedRunnerOptions,
    'Runner options changed without selection review');
  const defaults=Object.fromEntries(all.map(match=>[
    match[1],match[2]==='null'?null:match[2]==='true'
  ]));
  assert.equal(Object.keys(defaults).length,all.length,
    'Duplicate option parameters in selected runner');
  assert.ok(Array.isArray(profile.enabled));
  for(const name of profile.enabled){
    assert.equal(defaults[name],false,
      'Enabled option absent or no longer default-off: '+name);
    defaults[name]=true;
  }
  const ambient=Object.keys(environment).filter(name=>
    /^AGENT\d+_/.test(name)&&environment[name]!==undefined).sort();
  assert.deepEqual(ambient,profile.allowedAmbientAgentVariables,
    'Ambient agent environment changes selected policy');
  const roster=fs.readFileSync(path.join(root,'results/aichi-2026/full-decklists.json'));
  assert.equal(gitBlobHash(roster),profile.originalRosterGitBlobSha,
    'Authenticated original printed roster drifted');
  const original=JSON.parse(roster.toString('utf8')).decks.find(
    row=>row.rank===profile.rank);
  assert.ok(original);
  assert.equal(original.cards.reduce((n,card)=>n+card.count,0),60);
  assert.equal(new Set(profile.seeds.map(s=>s.seat)).size,2);
  assert.deepEqual(profile.seeds.map(s=>s.seat).sort(),['A','B']);
  const trials=profile.seeds.flatMap((s,i)=>profile.candidateIds.map(
    candidateId=>({id:[profile.rank,i,s.seat,candidateId].join(':'),
      rank:profile.rank,repeat:i,candidateSlot:s.seat,
      candidateId,seed:s.seed})));
  assert.equal(trials.length,4);
  const closure=auditSourceClosure(root,[profile.runner]);
  const closurePinned=typeof profile.verifiedClosureSha256==='string'&&
    closure.digest===profile.verifiedClosureSha256;
  return {options:defaults,trials,closureDigest:closure.digest,closurePinned,
    closureFiles:closure.files.length,ambient,
    originalRank:original.rank,sourceCards:60};
}

/** Execute only this registered four-attempt developmental Store canary. */
function run(){
  const prepared=preflight();
  const actualPin=execFileSync('git',['-C',
    path.join(ROOT,'vendor/twinleaf'),'rev-parse','HEAD'],
    {encoding:'utf8'}).trim();
  assert.equal(actualPin,profile.vendorRevision,
    'Native engine differs from selected pinned revision');
  const prior={};
  for(const [key,value] of Object.entries(profile.injectedEnv)){
    prior[key]=process.env[key];
    process.env[key]=value;
  }
  try{
    const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
    const result=runDevelopment({...prepared.options,
      registeredTrials:prepared.trials,
      registeredFrameName:profile.schema+'-original-rank5-both-seats'});
    const rows=result.rows??[];
    const statusCounts={};
    for(const row of rows){
      const key=row.status??'missing-status';
      statusCounts[key]=(statusCounts[key]??0)+1;
    }
    const expected=prepared.trials.map(x=>x.id).sort();
    const actual=rows.map(x=>x.trial?.id).sort();
    const bothSeats=JSON.stringify(expected)===JSON.stringify(actual);
    return {schema:profile.schema,profile,sourceClosureDigest:prepared.closureDigest,
      closureFiles:prepared.closureFiles,nativePin:actualPin,
      actualResearchCommit:process.env.GITHUB_SHA??null,
      registered:expected,attempted:rows.length,statusCounts,
      dispositions:{
        CONFIG_FROZEN:prepared.closurePinned?'VERIFIED':'UNVERIFIED_TRANSITIVE_CLOSURE',
        BOTH_SEATS_EXECUTED:bothSeats?'ALL_REGISTERED_ATTEMPTS_RECORDED':'INCOMPLETE',
        PAPER_PAYMENT_VERIFIED:'UNQUALIFIED_FULL_GAME',
        SOURCE_PAYOFF_WITNESSED:'NOT_CERTIFIED',
        OPPONENT_CONTINUATION_WITNESSED:'NOT_CERTIFIED'
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
