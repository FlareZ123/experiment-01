'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const VERSION='agent28-native-mixed-console-to-atomic-json-v1';
const BOUNDARY='AGENT28_JSON_BOUNDARY\n';
const DEFAULT_FILE='agent28-rank19-adp-gx-vs-ray-native.json';

/**
 * Separate native ADP's unsolicited console message from an otherwise valid
 * JSON result without suppressing either. Output is locked and atomically
 * replaced. A previously normalized result is accepted unchanged.
 * @param {string} filepath Path to the completed mixed stdout file.
 * @returns {{alreadyClean:boolean,nativeLines:number,pairs:number}}
 */
function normalizeNativePairOutput(filepath){
  assert.ok(typeof filepath==='string'&&filepath.length>0);
  const original=fs.readFileSync(filepath,'utf8');
  const marker=original.lastIndexOf(BOUNDARY);
  if(marker<0){
    const parsed=JSON.parse(original);
    return {alreadyClean:true,nativeLines:0,pairs:parsed.pairs.length};
  }
  const nativeLogs=original.slice(0,marker);
  const json=original.slice(marker+BOUNDARY.length);
  const parsed=JSON.parse(json);
  assert.ok(Array.isArray(parsed.pairs));
  const diagnosticFile=filepath.replace(/\.json$/,'.native-console.log');
  assert.notEqual(diagnosticFile,filepath);
  const lockPath=filepath+'.lock';
  const lock=fs.openSync(lockPath,'wx');
  const tempJson=filepath+'.tmp.'+process.pid;
  const tempLogs=diagnosticFile+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(tempLogs,nativeLogs,'utf8');
    fs.writeFileSync(tempJson,json,'utf8');
    fs.renameSync(tempLogs,diagnosticFile);
    fs.renameSync(tempJson,filepath);
  }finally{
    fs.closeSync(lock);
    fs.rmSync(lockPath,{force:true});
  }
  return {alreadyClean:false,nativeLines:nativeLogs.split(/\r?\n/)
    .filter(Boolean).length,pairs:parsed.pairs.length};
}

if(require.main===module){
  const report=normalizeNativePairOutput(
    path.resolve(process.cwd(),process.argv[2]??DEFAULT_FILE));
  console.log('AGENT28_NATIVE_EVIDENCE_OUTPUT_NORMALIZED',JSON.stringify(report));
}
module.exports={VERSION,BOUNDARY,DEFAULT_FILE,normalizeNativePairOutput};
