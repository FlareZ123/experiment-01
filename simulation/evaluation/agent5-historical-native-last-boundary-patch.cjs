'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {randomUUID}=require('node:crypto');

const VERSION='agent5-historical-rank1-inner-boundary-native-hook-patch-v1';
const SOURCE=path.resolve(__dirname,'agent41-bilateral-v2-development.cjs');
const ORIGINAL_BLOB='b457267feb58d9e35a7bb5e33f57660f5096fcb2';
const MARK='  const runWithSameTargetAttachEnergy=()=>{';
const NEXT='  const runWithNativeAcceptedTargets=()=>{';
const ROW='  return {\n    trial,qualifiesForCompetitiveInference:false,';
const ADDED='agent5Rank1TrapAudit:agent5TrapAudit,';
const INJECT=[
  '  // Agent5: additive final Store boundary, after selected actor policy.',
  '  let agent5TrapAudit=null;',
  '  const runWithRank1AceTrap=()=>{',
  '    const mode=process.env.AGENT5_RANK1_T37_FORK_MODE;',
  "    if(!mode||trial.rank!==1||",
  "       trial.candidateId!=='new-moon-lockbreaker-v1'||",
  "       trial.candidateSlot!=='A')return runMatch(request);",
  "    const selected=require('../twinleaf/agent5-rank1-ace-trap-native-fork.cjs')",
  '      .withRank1AceTrapFork(()=>runMatch(request),mode,',
  '        {targetStoreNumber:1});',
  '    agent5TrapAudit=selected.audit;',
  '    return selected.result;',
  '  };',
  ''
].join('\n');

/**
 * Patches only the exact archived source to put the selected owner-root
 * intervention nearest the genuine Store, after every canonical policy.
 * @param {string} source
 * @returns {string}
 */
function patchSource(source){
  assert.equal(source.includes(ADDED),false,
    'Historical bridge already installed; refusing repeated mutation');
  assert.equal(source.split(MARK).length,2);
  assert.equal(source.split(ROW).length,2);
  const first=source.indexOf(MARK);
  const end=source.indexOf(NEXT,first);
  assert.ok(first>=0&&end>first);
  const section=source.slice(first,end);
  assert.equal(section.split('runMatch(request)').length-1,2);
  const switched=section.replaceAll('runMatch(request)',
    'runWithRank1AceTrap()');
  const combined=source.slice(0,first)+INJECT+switched+source.slice(end);
  return combined.replace(ROW,
    '  return {\n    '+ADDED+'\n    trial,qualifiesForCompetitiveInference:false,');
}

/**
 * Atomic, exclusively locked CI overlay; vendor code is unchanged.
 * @returns {object}
 */
function run(){
  const current=execFileSync('git',['hash-object',SOURCE],{
    encoding:'utf8'}).trim();
  assert.equal(current,ORIGINAL_BLOB,
    'Refusing to patch any runner except exact archival source');
  const old=fs.readFileSync(SOURCE,'utf8');
  const revised=patchSource(old);
  const lock=SOURCE+'.agent5.lock';
  const temp=SOURCE+'.'+randomUUID()+'.new';
  const lockfd=fs.openSync(lock,'wx');
  try{
    fs.writeFileSync(temp,revised,'utf8');
    fs.renameSync(temp,SOURCE);
  }finally{
    fs.closeSync(lockfd);
    fs.rmSync(lock,{force:true});
    fs.rmSync(temp,{force:true});
  }
  const newBlob=execFileSync('git',['hash-object',SOURCE],{
    encoding:'utf8'}).trim();
  return {schema:VERSION,originalBlob:current,patchedBlob:newBlob,
    changedTextBytes:Buffer.byteLength(revised)-Buffer.byteLength(old),
    exactNativeRunMatchCallsSwitched:2,registeredNewMoonOnly:true,
    vendorModified:false};
}
if(require.main===module)process.stdout.write(JSON.stringify(run())+'\n');
module.exports={VERSION,ORIGINAL_BLOB,patchSource,run};
