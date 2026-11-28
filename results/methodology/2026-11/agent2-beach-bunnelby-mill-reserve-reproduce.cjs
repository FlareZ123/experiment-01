'use strict';
// Source-specific counterplay: don't draw to seven at end of turn if a known
// opposing Active Bunnelby PRC Barrage/Burrow can mill the last two deck cards
// before our mandatory next draw. Executed actor-visible source policy only.
const ANCHOR="Array.isArray(view.ownHand) && view.ownHand.length<7 &&";
const BEFORE="function chooseRoot(";
function patchWorker(source){
 if(typeof source!=='string'||source.split(ANCHOR).length!==2||source.split(BEFORE).length!==2)
  throw Error('Missing/duplicate validated Beach source anchor');
 const helper=[
 "function beachSafeAgainstKnownDoubleBurrow(view){",
 " const opp=view.opponentPublic?.active;",
 " if(!hasName(opp?.printing,'Bunnelby PRC'))return true;",
 " if(!Number.isFinite(view.ownPublic?.deckCount)||!Array.isArray(view.ownHand))return false;",
 " const count=view.ownPublic.deckCount-(7-view.ownHand.length);",
 " // Barrage lets source Bunnelby PRC use Burrow twice, milling two.",
 " // Keep at least one card for the mandatory next-turn draw.",
 " return count>=3;",
 "}"
 ].join('\n')+'\n';
 return source.replace(BEFORE,helper+BEFORE).replace(ANCHOR,
 "Array.isArray(view.ownHand) && view.ownHand.length<7 && beachSafeAgainstKnownDoubleBurrow(view) &&");
}
function compile(source){
 const module={exports:{}};
 new Function('module','exports',source)(module,module.exports);
 return module.exports;
}
const B='Tropical Beach BWP 50',E='Psychic Energy SVE';
function mon(printing,o={}){
 return {printing,hp:o.hp??210,damage:0,abilities:[],abilitySuppressions:[],
  energies:o.energies??[],tools:[],specialConditions:[],publicRestrictions:{},
  attacks:[{name:'Shadow Mist',cost:['Psychic'],damage:'10'}],
  printed:{stage:'BASIC',types:['Psychic'],subtypes:['Basic'],retreatCost:[],weakness:[],resistance:[]}};
}
const PROFILES=[
 {schema:'agent46-candidate-profile-v1',profileId:'hood-shield-shadow-rider-v1',
  deckSha256:'1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924'},
 {schema:'agent46-candidate-profile-v1',profileId:'lockbridge-shadow-rider-v1',
  deckSha256:'011cb8481b473c8566935d6835fc9a2a5762e4f09349f23c8284ec19b0cac642'}
];
const CASES=[
 {label:'six hand, deck 3, active Barrage Bunnelby can Burrow twice',h:6,d:3,bunnelby:true,expected:['beach','pass']},
 {label:'five hand, deck 4, active Barrage Bunnelby can Burrow twice',h:5,d:4,bunnelby:true,expected:['beach','pass']},
 {label:'six hand, deck 4, Bunnelby double Burrow leaves one draw',h:6,d:4,bunnelby:true,expected:['beach','beach']},
 {label:'five hand, deck 5, Bunnelby double Burrow leaves one draw',h:5,d:5,bunnelby:true,expected:['beach','beach']},
 {label:'six hand, deck 10, Bunnelby, no urgent deckout',h:6,d:10,bunnelby:true,expected:['beach','beach']},
 {label:'six hand, deck 3, opponent Iron Thorns not source mill',h:6,d:3,bunnelby:false,expected:['beach','beach']},
 {label:'seven hand, Bunnelby, no draw possible',h:7,d:10,bunnelby:true,expected:['pass','pass']},
 {label:'six hand, deck 2, Bunnelby, existing two-card reserve blocks',h:6,d:2,bunnelby:true,expected:['pass','pass']},
 {label:'six hand, deck 3, Bunnelby but Stadium effect not live',h:6,d:3,bunnelby:true,live:false,expected:['pass','pass']},
 {label:'six hand, deck 3, Bunnelby with safely available payable attack',h:6,d:3,bunnelby:true,attack:true,expected:['attack','attack']}
];
function player(active,handCount,deckCount,stadium=[]){
 return {active,bench:[null,null,null,null,null],handCount,deckCount,
  prizeCount:6,stadium,discard:[],lostZone:[],
  publicTurnRestrictions:{gxUsed:false,vstarUsed:false}};
}
function req(seat,row){
 const hand=Array.from({length:row.h},(_,i)=>i%2?E:'Quick Ball FST');
 const own=mon('Shadow Rider Calyrex V CRE',row.attack?{energies:[E]}:{});
 const opp=mon(row.bunnelby?'Bunnelby PRC 121':'Iron Thorns ex TWM 77',
  row.bunnelby?{energies:['Capture Energy RCL 171']}:{});
 return {role:'candidate',seat,prompt:null,publicEventReceipt:null,
  observation:{actorSeat:seat,globalTurn:12,phase:2,decisionKind:'owner-root',
   ownHand:hand,ownPublic:player(own,row.h,row.d,[]),
   opponentPublic:player(opp,4,22,[B]),
   ownTurnResources:{supporterPlayedTurn:0,energyPlayedTurn:10,retreatedTurn:0,vstarUsed:false},ownerK1:null},
  actionFrontier:{items:[{kind:'use-stadium',token:'beach',actorPrinting:B,
    publicMetadata:{stadiumEffectLive:row.live!==false}},
   {kind:'pass',token:'pass'},
   ...(row.attack?[{kind:'attack',token:'attack',attackName:'Shadow Mist'}]:[])]}};
}
function run(source){
 const versions=[compile(source),compile(patchWorker(source))];
 let groups=0,changed=0;const errors=[];
 for(const seat of [0,1])for(const cfg of PROFILES)for(const row of CASES){
  const x=req(seat,row),got=versions.map(w=>w.createPolicy({
   role:'candidate',seat,policyVersion:w.POLICY_VERSION,config:cfg
  }).decide(x).token);
  groups++;if(got[0]!==got[1])changed++;
  if(got.join('|')!==row.expected.join('|'))
   errors.push({seat,profile:cfg.profileId,row:row.label,expected:row.expected,got});
 }
 const report={schema:'agent2-beach-bunnelby-reserve-v1',
  scenarios:CASES.length,pairedGroups:groups,workerCalls:2*groups,
  changed,preserved:groups-changed,allMatched:errors.length===0,errors};
 if(errors.length)throw Error(JSON.stringify(report));
 return report;
}
module.exports={patchWorker,run};
