'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {gitBlobSha}=require('./agent41-joint-source-r5-r11-v1.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {withSelectedEnvironment}=require('./agent22-joint-vip-selected-v2.cjs');
const {withRegisteredCandidateLilliePanel,withCandidateLillieAfterPass}=require('../twinleaf/agent7-prospective-candidate-lillie-after-pass.cjs');
const {chooseLillieAfterPass}=require('../twinleaf/agent12-actor-only-lillie-after-pass.cjs');
const root=path.resolve(__dirname,'../..');
const manifestFile='simulation/evaluation/agent22-rank11-candidate-turn32-lillie-v1.json';
const expected='85f608ae7a34cdc330358ed4c089c2e1cb13eac8';
const filename=path.join(root,'agent22-rank11-candidate-turn32-lillie-v1-output.json');
const read=p=>fs.readFileSync(path.join(root,p));
function profile(){
 assert.equal(gitBlobSha(read(manifestFile)),expected);
 const m=JSON.parse(read(manifestFile));
 const base=JSON.parse(read('simulation/evaluation/agent41-joint-source-r5-r11-v1.json'));
 assert.equal(m.pinnedVendor,base.pinnedVendor);
 assert.equal(gitBlobSha(read('simulation/evaluation/agent41-bilateral-v2-development.cjs')),m.sourceRunnerGitBlob);
 assert.equal(gitBlobSha(read('results/aichi-2026/full-decklists.json')),m.sourcePrintedRosterGitBlob);
 assert.equal(gitBlobSha(read('simulation/twinleaf/agent7-prospective-candidate-lillie-after-pass.cjs')),m.candidateOnlyLillieAdapterGitBlob);
 assert.equal(gitBlobSha(read('simulation/twinleaf/agent12-actor-only-lillie-after-pass.cjs')),m.printedLillieChooserGitBlob);
 assert.equal(m.registeredTrials.length,2);
 assert.deepEqual(m.registeredModes,['frozen-selected-control','candidate-only-turn32-lillie-after-pass']);
 return {m,base};
}
function save(data){
 const lock=filename+'.lock',fd=fs.openSync(lock,'wx');
 const tmp=filename+'.'+process.pid+'.tmp';
 try{
  fs.writeFileSync(tmp,JSON.stringify(data,null,2)+'\n',{flag:'wx'});
  fs.renameSync(tmp,filename);
 }finally{
  if(fs.existsSync(tmp))fs.unlinkSync(tmp);
  fs.closeSync(fd);fs.unlinkSync(lock);
 }
}
function run(){
 const {m,base}=profile();
 const out={schema:m.schema,registeredBlob:expected,pinnedVendor:m.pinnedVendor,
   cohorts:[],attempts:0,competitiveQualifiedGames:0};
 for(const mode of m.registeredModes){
  let cohort;
  try{
   const opts={...base.policyOptions,registeredTrials:m.registeredTrials,
     registeredFrameName:m.schema+':'+mode};
   const selected=withSelectedEnvironment(()=>mode==='frozen-selected-control'?
     {result:runDevelopment(opts),audit:null}:
     withRegisteredCandidateLilliePanel(
       ()=>runDevelopment(opts),m.registeredTrials,{
         runTrial:(execute,trial)=>withCandidateLillieAfterPass(execute,trial,{
           chooseLillie:view=>view.globalTurn===32?
             chooseLillieAfterPass(view):null
         })
       }));
   assert.deepEqual(selected.result.rows.map(r=>r.trial.id),
     m.registeredTrials.map(t=>t.id));
   cohort={mode,raw:selected.result,policyAudit:selected.audit,error:null};
  }catch(error){cohort={mode,raw:null,policyAudit:null,
    registeredTrials:m.registeredTrials,error:String(error?.stack??error)};}
  out.cohorts.push(cohort);out.attempts+=m.registeredTrials.length;
  save(out);
  process.stdout.write(JSON.stringify({mode,error:cohort.error,
    dispositions:cohort.raw?.rows.map(r=>[r.trial.id,r.endReason??r.error])})+'\n');
 }
 assert.equal(out.attempts,m.scheduledNativeAttempts);
 assert.ok(out.cohorts.every(c=>!c.error),'Native failure retained');
 return out;
}
if(require.main===module){
 if(process.argv.includes('--inspect-only'))console.log(JSON.stringify({
   schema:profile().m.schema,registeredBlob:expected,competitiveQualifiedGames:0}));
 else run();
}
module.exports={profile,run};
