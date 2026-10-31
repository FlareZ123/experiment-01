'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {REGISTRATION_BLOB,plannedTrials}=
  require('../simulation/evaluation/agent41-prospective-canonical-scout.cjs');
const {runDevelopment}=
  require('../simulation/evaluation/agent41-bilateral-v2-development.cjs');
const {FRAME}=require('../simulation/evaluation/agent38-plumeria-preregistered-32.cjs');
const {withOriginalSourceFlareFork}=
  require('../simulation/twinleaf/agent4-live-source-flare-vs-plumeria-fork.cjs');
const SOURCE='6:1:A:champion-reference';
const PAIR='6:1:A:new-moon-lockbreaker-v1';
const VERSION='agent4-original-source6-turn15-plumeria-flare-native-pair-v1';

/**
 * Previously frozen original rank6 repeat1 source-seat1 match pair.
 * Plumeria is the normal prior after-Pass choice. Only one source turn15
 * root may replace it with original native Team Flare Grunt if both canPlay.
 * @param {'plumeria'|'flare'} mode
 * @returns {object}
 */
function runFixedDenialFork(mode){
  assert.ok(mode==='plumeria'||mode==='flare');
  const b=fs.readFileSync(path.resolve(__dirname,'..',FRAME));
  const gitBlob=createHash('sha1').update('blob '+b.length+'\0')
    .update(b).digest('hex');
  assert.equal(gitBlob,REGISTRATION_BLOB,'Frozen frame modified');
  const plan=JSON.parse(b.toString('utf8'));
  const selected=plannedTrials(plan).filter(t=>t.id===SOURCE||t.id===PAIR);
  assert.deepEqual(selected.map(t=>t.id).sort(),[SOURCE,PAIR].sort());
  assert.equal(selected[0].seed,2906058002);
  const module=require('../simulation/twinleaf/agent4-plumeria-after-pass.cjs');
  const original=module.withOwnerPlumeriaAfterPass;
  if(mode==='flare'){
    module.withOwnerPlumeriaAfterPass=function(execute){
      let evidence;
      const selected=original(()=>{
        const fork=withOriginalSourceFlareFork(execute,{seat:1,turn:15});
        evidence=fork.audit;
        return fork.result;
      });
      selected.audit.agent4PhysicalFlareFork=evidence;
      return selected;
    };
  }
  let report;
  try{
    report=runDevelopment({...plan.frozenRunOptions,
      registeredTrials:selected,registeredFrameName:FRAME,
      actorPlumeriaAfterPass:true});
  }finally{module.withOwnerPlumeriaAfterPass=original;}
  assert.equal(report.attempted,2);
  assert.equal(report.rows.length,2);
  assert.equal(report.enginePin,plan.enginePin);
  assert.equal(report.actorPlumeriaAfterPassOptIn,true);
  assert.equal(report.competitiveQualifiedGames,0);
  for(const row of report.rows){
    assert.equal(row.qualifiesForCompetitiveInference,false);
    assert.equal(row.verifiedFirstTurn,true);
    assert.equal(row.sourceSeat,1);
    assert.equal(row.sourceDeckFingerprint,
      'b50e4cf27c449653cf9c61e4e830b7a3d61f9b1c7e42a7dfd2d781a1c6e6895a');
    assert.equal(row.sourceDealFingerprint,
      '5a279b398275ccbe23197da3764ecd7f5fec00e1214fd13f7b7b4a8b31f1cbdf');
  }
  return {version:VERSION,mode,frame:FRAME,frameGitBlob:gitBlob,
    sourceSeat:1,sourceTurn:15,sourceTrial:SOURCE,
    selectedPreviousNativePlumeriaRequiresNativeFlareCanPlay:true,
    settledPhysicalConservationUnverified:true,
    policyAndOpponentContinuationDevelopmentOnly:true,
    competitiveQualifiedGames:0,report};
}
module.exports={VERSION,runFixedDenialFork};
if(require.main===module){
  assert.equal(process.argv.length,3);
  process.stdout.write(JSON.stringify(runFixedDenialFork(process.argv[2]))+'\n');
}
