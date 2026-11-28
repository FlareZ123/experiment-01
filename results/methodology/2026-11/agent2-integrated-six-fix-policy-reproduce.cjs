'use strict';
// End-to-end source-policy regression for six bounded, hypothetical policy patches.
// No game engine, CI dispatch, repo modification, or external access.
const fs=require('node:fs'),path=require('node:path');
const INTEGRATOR='agent2-integrated-tactical-policy-reproduce.cjs';
const KO='agent2-snorlax-block-ko-promotion-reproduce.cjs';
const FOUR=[
 'agent2-direct-terminal-causal-scope-reproduce.cjs',
 'agent2-spiky-energy-direct-final-reproduce.cjs',
 'agent2-guzma-free-pivot-final-reproduce.cjs',
 'agent2-compressor-double-payload-raihan-reproduce.cjs'
];
function load(source){
 const module={exports:{}};
 new Function('module','exports',source)(module,module.exports);
 return module.exports;
}
function readTexts(){
 const names=[INTEGRATOR,KO,...FOUR];
 return Object.fromEntries(names.map(n=>[n,fs.readFileSync(path.join(__dirname,n),'utf8')]));
}
function run(source,provided=null){
 const texts=provided??readTexts();
 const integrate=load(texts[INTEGRATOR]),ko=load(texts[KO]);
 const five=integrate.compose(source,texts).combined;
 const six=ko.patchWorker(five);
 const sixPolicy=load(six);
 if(typeof sixPolicy.createPolicy!=='function')throw Error('Six-patch worker export missing');
 // IMPORTANT: all previous controls now execute against the *six-patch* code.
 // Do not add isolated test counts without retesting interactions.
 const parts=integrate.runSubtests(source,six,texts);
 const beach=integrate.beachTest(source,six);
 const promotion=ko.run(five);
 const tested=[...parts.map(x=>x.data),beach,promotion];
 const groups=tested.reduce((a,x)=>a+(x.groups??x.pairedGroups??x.promptGroups??x.pairedRootGroups??0),0);
 const changes=tested.reduce((a,x)=>a+(x.changedRoot??x.changed??0),0);
 const unchanged=tested.reduce((a,x)=>a+(x.unchangedRoot??x.unchanged??x.preserved??0),0);
 const continuations=tested.reduce((a,x)=>a+(x.promptAndRetreatChecks??x.continuationChecks??0),0);
 if(groups!==308||changes!==92||unchanged!==216||continuations!==48||
   groups!==changes+unchanged||tested.some(x=>!x.allMatched))
  throw new Error('Six-patch integration count or control invariant failed: '+
    JSON.stringify({groups,changes,unchanged,continuations}));
 return {schema:'agent2-six-patch-source-policy-integration-v1',
  originalSourceBytes:source.length,fiveSourceBytes:five.length,sixSourceBytes:six.length,
  pairedGroups:groups,sourceWorkerCalls:2*groups,intendedCorrections:changes,
  preservedControls:unchanged,stagedContinuationChecks:continuations,
  suites:[...parts.map(x=>({test:x.test,paired:x.data.groups??x.data.pairedGroups??x.data.promptGroups??x.data.pairedRootGroups})),
    {test:'Tropical Beach',paired:beach.pairedGroups},
    {test:'Snorlax Block mandatory KO promotion',paired:promotion.pairedGroups}],
  allMatched:true};
}
module.exports={run};
if(require.main===module){
 const file=process.argv[2];
 if(!file)throw Error('Pass a local trusted original source worker path');
 process.stdout.write(JSON.stringify(run(fs.readFileSync(file,'utf8')),null,2)+'\n');
}
