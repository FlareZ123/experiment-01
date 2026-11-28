'use strict';
// Integration-only source-policy test. Requires only Node built-ins and the four
// sibling source-only regressions; never modifies the registered worker branch.
const PATCH_MODULES=[
 ['agent2-direct-terminal-causal-scope-reproduce.cjs','compileWorker(patchWorker(workerSource))','compileWorker(PREPATCHED)'],
 ['agent2-spiky-energy-direct-final-reproduce.cjs','compile(patchWorker(source))','compile(PREPATCHED)'],
 ['agent2-guzma-free-pivot-final-reproduce.cjs','compile(patchWorker(source))','compile(PREPATCHED)'],
 ['agent2-compressor-double-payload-raihan-reproduce.cjs','load(patchWorker(source))','load(PREPATCHED)']
];
const BEACH_ANCHOR='Array.isArray(view.ownHand) && view.ownHand.length<=5 &&';
function replaceExactlyOnce(src,oldText,newText) {
 if(typeof src!=='string'||src.split(oldText).length!==2)
  throw Error('Missing or duplicated integration anchor: '+oldText.slice(0,80));
 return src.replace(oldText,newText);
}
function moduleSourceTexts(explicitTexts){
 if(explicitTexts)return explicitTexts;
 const fs=require('node:fs'),path=require('node:path');
 return Object.fromEntries(PATCH_MODULES.map(([filename])=>
  [filename,fs.readFileSync(path.join(__dirname,filename),'utf8')]));
}
function loadTrustedModule(text){
 const module={exports:{}};
 new Function('module','exports',text)(module,module.exports);
 return module.exports;
}
function compose(source,texts){
 let combined=source;const modules=[];
 for(const [filename] of PATCH_MODULES){
  const body=texts[filename];if(typeof body!=='string')throw Error('Missing '+filename);
  const mod=loadTrustedModule(body);
  if(typeof mod.patchWorker!=='function')throw Error('No patchWorker in '+filename);
  combined=mod.patchWorker(combined);
  modules.push(filename);
 }
 combined=replaceExactlyOnce(combined,BEACH_ANCHOR,
  'Array.isArray(view.ownHand) && view.ownHand.length<7 &&');
 const worker=loadTrustedModule(combined);
 if(typeof worker.createPolicy!=='function')throw Error('Combined source failed to export candidate worker');
 return {combined,modules:modules.concat(['Tropical Beach six-hand fallback'])};
}
function runSubtests(source,combined,texts){
 const results=[];
 for(const [filename,anchor,replacement] of PATCH_MODULES){
  const body=replaceExactlyOnce(texts[filename],anchor,replacement);
  const module={exports:{}};
  new Function('module','exports','PREPATCHED',body)(module,module.exports,combined);
  const res=module.exports.run(source);
  if(!res.allMatched)throw Error('Source-policy test mismatch '+filename);
  results.push({test:filename,data:res});
 }
 return results;
}
const ENERGY='Psychic Energy SVE',BEACH='Tropical Beach BWP 50';
function p(printing,opts={}){
 return {printing,name:printing.split(' ').slice(0,-1).join(' '),
 hp:opts.hp??210,damage:opts.damage??0,energies:opts.energies??[],
 abilities:[],abilitySuppressions:[],tools:[],specialConditions:[],
 attacks:opts.attacks??[],publicRestrictions:{},
 printed:{types:['Psychic'],subtypes:['Basic','V'],stage:'BASIC',
  retreatCost:[],weakness:[],resistance:[]}};
}
function player(active,handCount,deckCount,stadium=[]){
 return {active,bench:[null,null,null,null,null],stadium,handCount,deckCount,
 prizeCount:6,discard:[],lostZone:[],
 publicTurnRestrictions:{gxUsed:false,vstarUsed:false}};
}
const PROFILES=[
 {schema:'agent46-candidate-profile-v1',profileId:'hood-shield-shadow-rider-v1',
 deckSha256:'1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924'},
 {schema:'agent46-candidate-profile-v1',profileId:'lockbridge-shadow-rider-v1',
 deckSha256:'011cb8481b473c8566935d6835fc9a2a5762e4f09349f23c8284ec19b0cac642'}
];
const BEACH_CASES=[
 {name:'six in hand, opponent Beach, three deck',hand:6,deck:3,owner:'opponent',live:true,expected:['pass','beach']},
 {name:'six in hand, own Beach, twenty deck',hand:6,deck:20,owner:'own',live:true,expected:['pass','beach']},
 {name:'six in hand, opponent Beach, four deck',hand:6,deck:4,owner:'opponent',live:true,expected:['pass','beach']},
 {name:'five in hand, four deck',hand:5,deck:4,owner:'opponent',live:true,expected:['beach','beach']},
 {name:'seven in hand, no useful draw',hand:7,deck:30,owner:'opponent',live:true,expected:['pass','pass']},
 {name:'six in hand but only two deck',hand:6,deck:2,owner:'opponent',live:true,expected:['pass','pass']},
 {name:'six in hand, effect not live',hand:6,deck:30,owner:'opponent',live:false,expected:['pass','pass']},
 {name:'six in hand, Beach not actually in play',hand:6,deck:30,owner:'none',live:true,expected:['pass','pass']},
 {name:'six in hand, wrong printed Beach token',hand:6,deck:30,owner:'opponent',live:true,tokenPrinting:'Tropical Beach BWP 51',expected:['pass','pass']},
 {name:'six in hand, own payable direct Shadow Mist offered',hand:6,deck:30,owner:'opponent',live:true,attack:true,expected:['attack','attack']}
];
function beachRoot(seat,x){
 const hand=Array.from({length:x.hand},(_,i)=>i%2?ENERGY:'Quick Ball FST');
 const own=p('Shadow Rider Calyrex V CRE',x.attack?{
  energies:[ENERGY],attacks:[{name:'Shadow Mist',cost:['Psychic'],damage:'10'}]
 }:{attacks:[{name:'Shadow Mist',cost:['Psychic'],damage:'10'}]});
 const other=p('Iron Thorns ex TWM');
 const ownState=player(own,x.hand,x.deck,x.owner==='own'?[BEACH]:[]);
 const oppState=player(other,4,24,x.owner==='opponent'?[BEACH]:[]);
 return {role:'candidate',seat,prompt:null,publicEventReceipt:null,
 observation:{actorSeat:seat,globalTurn:3,phase:2,decisionKind:'owner-root',
  ownHand:hand,ownPublic:ownState,opponentPublic:oppState,
  ownTurnResources:{supporterPlayedTurn:0,energyPlayedTurn:false,retreatedTurn:0},
  ownerK1:null},
 actionFrontier:{items:[
  {kind:'use-stadium',token:'beach',actorPrinting:x.tokenPrinting??BEACH,
   publicMetadata:{stadiumEffectLive:x.live}},
  {kind:'pass',token:'pass'},
  ...(x.attack?[{kind:'attack',token:'attack',attackName:'Shadow Mist'}]:[])
 ]}};
}
function beachTest(source,combined){
 const policies=[loadTrustedModule(source),loadTrustedModule(combined)];
 const errors=[];let n=0,changed=0;
 for(const seat of [0,1])for(const config of PROFILES)for(const row of BEACH_CASES){
  const request=beachRoot(seat,row);
  const actual=policies.map(w=>
   w.createPolicy({role:'candidate',seat,policyVersion:w.POLICY_VERSION,config})
    .decide(request).token);
  n++;if(actual[0]!==actual[1])changed++;
  if(actual.join('|')!==row.expected.join('|'))
   errors.push({seat,profile:config.profileId,case:row.name,actual,expected:row.expected});
 }
 const res={test:'Tropical Beach integrated root fallback',scenarios:BEACH_CASES.length,
  pairedGroups:n,workerDecisions:2*n,changed,unchanged:n-changed,
  allMatched:errors.length===0,errors};
 if(errors.length)throw Error(JSON.stringify(res));
 return res;
}
function run(source,explicitTexts=null){
 const texts=moduleSourceTexts(explicitTexts);
 const {combined,modules}=compose(source,texts);
 const subtests=runSubtests(source,combined,texts);
 const beach=beachTest(source,combined);
 const totals=subtests.reduce((out,t)=>{
  const d=t.data;
  out.groups+=d.groups??d.pairedGroups??d.promptGroups??d.pairedRootGroups??0;
  out.workerCalls+=d.pairedWorkerDecisions??d.workerDecisions??d.pairedPromptCalls??d.rootPolicyCalls??0;
  out.changes+=d.changedRoot??d.changed??0;
  out.controls+=d.unchangedRoot??d.unchanged??0;
  out.continuationChecks+=d.promptAndRetreatChecks??d.continuationChecks??0;
  return out;
 },{groups:beach.pairedGroups,workerCalls:beach.workerDecisions,
   changes:beach.changed,controls:beach.unchanged,continuationChecks:0});
 if(totals.groups!==totals.changes+totals.controls||totals.workerCalls!==2*totals.groups)
  throw Error('Integration summary invariant violation');
 return {schema:'agent2-combined-tactical-source-proposals-v1',sourceBytes:source.length,
  combinedBytes:combined.length,patches:modules,
  pairedGroups:totals.groups,actualWorkerDecisionCalls:totals.workerCalls,
  intendedCorrections:totals.changes,unchangedControls:totals.controls,
  stagedContinuationChecks:totals.continuationChecks,
  tests:[...subtests,beach],allMatched:true};
}
module.exports={compose,run,runSubtests,beachTest};
if(typeof require==='function'&&require.main===module){
 const fs=require('node:fs');
 if(!process.argv[2])throw Error('Provide a trusted exact candidate policy worker source path');
 process.stdout.write(JSON.stringify(run(fs.readFileSync(process.argv[2],'utf8')),null,2)+'\n');
}
