'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const headless=require('../twinleaf/headless.cjs');
const {runStewardCommonVoltV7}=
  require('./agent36-issue25-common-v7.cjs');
const {withSourceFollowupOwnerWitness,VERSION:WITNESS}=
  require('../twinleaf/agent5-v7-source-followup-owner-witness.cjs');
const registration=require('../../results/aichi-2026/registrations/agent36-issue25-common-v6-96root-20261106.json');

const VERSION='agent5-common-v7-original-owner-nextturn-passive-census-v1';
const PREFIX='agent41-bilateral-v2-common-policy-development-';
const REGISTERED=new Map(registration.trials.map(t=>[
  t.id,{sourceSeat:t.candidateSlot==='A'?1:0,rank:t.rank}
]));
const ANCHORS=[
  ['6:200:A:champion-reference',16,['PassTurnAction']],
  ['6:200:A:new-moon-lockbreaker-v1',16,
    ['PlayCardAction','PassTurnAction']],
  ['6:201:B:champion-reference',5,['PassTurnAction']],
  ['6:201:B:champion-reference',13,['PassTurnAction']],
  ['6:201:B:champion-reference',17,['PassTurnAction']]
];

/**
 * Run a passive original-owner Store observer INSIDE the actual v7 owner-Volt
 * hook. Match observations against five independently established v7 genuine
 * after-attack source turns; do not infer playability from held cards alone.
 * The prior registered eight arms, 96-root horizon and actual bilateral
 * decision policy are unchanged.
 * @param {{headless?:{runMatch:Function},runner?:Function,witness?:Function}} deps
 * @returns {object} Full v7 and read-only census.
 */
function run(deps={}){
  const runtime=deps.headless??headless;
  const runner=deps.runner??runStewardCommonVoltV7;
  const witness=deps.witness??withSourceFollowupOwnerWitness;
  const original=runtime.runMatch;
  assert.equal(typeof original,'function');
  const records=[];
  function observerMatch(request){
    const label=String(request?.label??'');
    assert.ok(label.startsWith(PREFIX),'Unregistered native match label');
    const id=label.slice(PREFIX.length);
    const meta=REGISTERED.get(id);
    assert.ok(meta,'Unexpected unregistered original trial');
    try{
      const observed=witness(()=>original(request),{
        sourceSeat:meta.sourceSeat,trialId:id
      });
      records.push({id,status:'returned',audit:observed.audit});
      return observed.result;
    }catch(error){
      records.push({id,status:'engine-error',
        audit:error?.agent5V7SourceFollowupAudit??null});
      throw error;
    }
  }
  runtime.runMatch=observerMatch;
  let baseline;
  try{
    baseline=runner({headless:runtime});
  }finally{
    assert.strictEqual(runtime.runMatch,observerMatch);
    runtime.runMatch=original;
  }
  assert.equal(records.length,8,'All registered games must be retained');
  assert.equal(new Set(records.map(r=>r.id)).size,8);
  assert.deepEqual(new Set(records.map(r=>r.id)),new Set(REGISTERED.keys()));
  const byId=new Map(records.map(r=>[r.id,r]));
  const anchors=ANCHORS.map(([id,turn,kinds])=>{
    const attempts=byId.get(id)?.audit?.acceptedSourceVoluntaryAfterVolt??[];
    const matching=attempts.filter(r=>r.globalTurn===turn);
    const actual=matching.map(r=>r.actionKind);
    return {id,globalTurn:turn,expectedRootKinds:kinds,
      actualRootKinds:actual,matched:
        JSON.stringify(actual)===JSON.stringify(kinds),
      ownerVisibleAcceptedRoots:matching};
  });
  return {schema:VERSION,witnessVersion:WITNESS,
    sourceRegistration:'results/aichi-2026/registrations/agent36-issue25-common-v6-96root-20261106.json',
    independentArchiveAnchor:'results/methodology/agent9-v7-real-source-next-turn-root-audit-20261106.md',
    unchangedNativeRunner:'simulation/evaluation/agent36-issue25-common-v7.cjs',
    originalNativeRootHorizon:96,pinnedTwinleaf:registration.pinnedTwinleaf,
    allEightRegisteredNativeRunsRetained:true,
    actualOwnerFollowupAnchorsMatched:anchors.filter(x=>x.matched).length,
    anchors,records,unmodifiedV7:baseline,
    ownerHandIsSourceVisibleOnly:true,
    paperOptionsCertified:false,competitivelyQualifiedGames:0,
    winRateEstimate:null};
}
/** Locked atomic output: neither partial JSON nor partial digest is published. */
function lockedWrite(filename,obj){
  fs.mkdirSync(path.dirname(filename),{recursive:true});
  const lock=filename+'.lock';
  const fd=fs.openSync(lock,'wx');
  const tmp=filename+'.'+process.pid+'.tmp';
  const shaTmp=tmp+'.sha256';
  try{
    const body=JSON.stringify(obj,null,2)+'\n';
    fs.writeFileSync(tmp,body,{flag:'wx'});
    const digest=createHash('sha256').update(body).digest('hex');
    fs.writeFileSync(shaTmp,digest+'  '+path.basename(filename)+'\n',
      {flag:'wx'});
    fs.renameSync(tmp,filename);
    fs.renameSync(shaTmp,filename+'.sha256');
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    if(fs.existsSync(shaTmp))fs.unlinkSync(shaTmp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}
module.exports={VERSION,PREFIX,ANCHORS,run,lockedWrite};
if(require.main===module){
  const folder=process.env.AGENT5_V7_OWNER_FOLLOWUP_DIR;
  assert.ok(folder,'Set AGENT5_V7_OWNER_FOLLOWUP_DIR');
  const out=run();
  lockedWrite(path.join(folder,'agent5-v7-owner-followup.json'),out);
  process.stdout.write(JSON.stringify({
    schema:VERSION,attempts:out.records.length,
    anchorMatches:out.actualOwnerFollowupAnchorsMatched,
    anchors:out.anchors.map(x=>({
      id:x.id,turn:x.globalTurn,matched:x.matched,
      rootKinds:x.actualRootKinds,held: x.ownerVisibleAcceptedRoots.map(
        y=>y.sourceOwnerView.hand)
    })),competitiveGamesQualified:0
  })+'\n');
}
