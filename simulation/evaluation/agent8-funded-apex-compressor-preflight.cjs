'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const file=path.resolve(__dirname,'../../results/aichi-2026/registrations/agent8-funded-apex-compressor-retrospective-20261103.json');
/** Verify registered original-source cohort before compiler checkout. */
function preflight(){
 const buffer=fs.readFileSync(file);
 const p=JSON.parse(buffer);
 assert.equal(p.schema,'agent8-funded-apex-compressor-retrospective-v1');
 assert.equal(p.enginePin,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
 assert.equal(p.plannedNativeAttempts,6);
 assert.equal(p.sampledPreviously,true);
 assert.deepEqual(p.previouslyInspectedSourceDeals.map(x=>[x.seed,x.sourceSeat]),
   [[3588534981,1],[1571178812,0]]);
 assert.deepEqual(p.registeredModes,
   ['control','source-compressor-after-Pass','repeat-control']);
 assert.equal(p.fullOriginalPrintedSixties,true);
 assert.equal(p.fixedControls.battleCompressorMinimumPaperHook,true);
 return {manifest:p,sha256:createHash('sha256').update(buffer).digest('hex')};
}
if(require.main===module){
 const p=preflight();
 console.log(JSON.stringify({sha256:p.sha256,attempts:p.manifest.plannedNativeAttempts,competitiveQualified:false}));
}
module.exports={preflight};
