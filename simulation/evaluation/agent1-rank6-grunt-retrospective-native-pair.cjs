'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');

const REGISTRATION='results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json';
const REGISTERED_BLOB='8c54d8497f9927b04d501237462f64a42173d33d';
const VERSION='agent1-rank6-retrospective-team-flare-grunt-native-pair-v1';

/**
 * Compare the same original physical 16 rank6 source/candidate deals under
 * default and a deliberately opt-in source-available Team Flare Grunt policy.
 * This is retrospectively selected mechanics development, not a new
 * prespecified competitive sample. Retain every Store exception and cap.
 * @returns {object} Both full native root archives and all-attempt receipts.
 */
function runGruntPair(){
  const root=path.resolve(__dirname,'../..');
  const bytes=fs.readFileSync(path.join(root,REGISTRATION));
  const blob=createHash('sha1').update('blob '+bytes.length+'\0')
    .update(bytes).digest('hex');
  assert.equal(blob,REGISTERED_BLOB);
  const plan=JSON.parse(bytes.toString('utf8'));
  const trials=require('./agent41-prospective-canonical-scout.cjs')
    .plannedTrials(plan).filter(t=>t.rank===6);
  assert.equal(trials.length,16);
  const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
  const previous=process.env.AGENT1_TEAM_FLARE_GRUNT_DEV;
  /** @param {boolean} optIn */
  const run=optIn=>{
    process.env.AGENT1_TEAM_FLARE_GRUNT_DEV=String(optIn);
    const result=runDevelopment({...plan.frozenRunOptions,
      registeredTrials:trials,
      registeredFrameName:REGISTRATION+'#retrospective-rank6-grunt'});
    assert.equal(result.attempted,16);
    assert.equal(result.rows.length,16);
    return result;
  };
  let control,treatment;
  try{
    control=run(false);
    treatment=run(true);
  }finally{
    if(previous===undefined)delete process.env.AGENT1_TEAM_FLARE_GRUNT_DEV;
    else process.env.AGENT1_TEAM_FLARE_GRUNT_DEV=previous;
  }
  const oldById=new Map(control.rows.map(r=>[r.trial.id,r]));
  const newById=new Map(treatment.rows.map(r=>[r.trial.id,r]));
  assert.equal(oldById.size,16);
  assert.equal(newById.size,16);
  const receipts=[];
  for(const [id,a] of oldById){
    const b=newById.get(id);
    assert.ok(b,'An original registered trial was dropped');
    assert.deepEqual(a.trial,b.trial);
    for(const field of ['sourceDealFingerprint',
      'fullPhysicalDealFingerprint','candidateDeckFingerprint',
      'sourceDeckFingerprint','actualStarterSeat',
      'sourceActuallyFirst','verifiedFirstTurn']){
      assert.deepEqual(a[field],b[field],
        'Original physical deal or deck drift at '+id+' '+field);
    }
    const sourceGruntRoots=row=>(row.rootActionLedger??[]).filter(e=>
      e.playerSlot===row.sourceSeat&&
      e.action==='PlayCardAction'&&
      e.card==='Team Flare Grunt');
    const baseline=sourceGruntRoots(a);
    const treated=sourceGruntRoots(b);
    receipts.push({id,sourceSeat:b.sourceSeat,
      sourceActuallyFirst:b.sourceActuallyFirst,
      sourceDealSha256:b.sourceDealFingerprint,
      controlStatus:a.status??(a.finished?'terminal':'capped'),
      treatmentStatus:b.status??(b.finished?'terminal':'capped'),
      controlSourceGruntRoots:baseline.map(e=>e.actionOrdinal),
      treatmentSourceGruntRoots:treated.map(e=>({
        ordinal:e.actionOrdinal,turn:e.turnBefore,
        initiatingRootActionOrdinal:e.initiatingRootActionOrdinal
      })),
      rootShaUnchanged:a.rootActionLedgerSha256===b.rootActionLedgerSha256,
      controlSourceAttacks:a.attackDeclarations?.source??null,
      treatmentSourceAttacks:b.attackDeclarations?.source??null,
      nativePromptErrors:[a.status??null,b.status??null]});
  }
  return {schema:VERSION,
    preregisteredSeedSource:REGISTRATION,registrationBlob:blob,
    trialIds:trials.map(t=>t.id),baseline:control,treatment,
    summary:{
      pairedAttempts:16,
      baselineNativeGruntPlays:receipts.reduce((n,r)=>
        n+r.controlSourceGruntRoots.length,0),
      treatedNativeGruntPlays:receipts.reduce((n,r)=>
        n+r.treatmentSourceGruntRoots.length,0),
      sourcePhysicalDealPairsPreserved:16,
      changedRootHistories:receipts.filter(r=>!r.rootShaUnchanged).length,
      baselineErrors:receipts.filter(r=>r.nativePromptErrors[0]).length,
      treatmentErrors:receipts.filter(r=>r.nativePromptErrors[1]).length,
      receipts,competitiveQualifiedGames:0,retrospective:true,
      limitation:'Retrospective known seeds, all 16 arms retained. Native PlayCardAction proves accepted root only. Energy displacement and opponent response still require separate physical witnesses. No gameplay-quality or win-rate qualification.'
    }};
}

if(require.main===module)
  process.stdout.write(JSON.stringify(runGruntPair(),null,2)+'\n');

module.exports={VERSION,REGISTERED_BLOB,runGruntPair};
