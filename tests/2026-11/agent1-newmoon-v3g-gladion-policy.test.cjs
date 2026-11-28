'use strict';
const assert=require('node:assert/strict');
const {POLICY_VERSION,DECK_SHA,createPolicy,fullyPrizedDusknoir}=
 require('../../simulation/evaluation/2026-11/agent1-newmoon-v3g-gladion-policy.cjs');
const list=require('../../results/als/new-moon-dusknoir-gladion-prize-rescue-v3g-60.json');
assert.equal(list.counts.total,60);
assert.equal(DECK_SHA,'1a5f094b06f79ff9168ca68c71fbb5f57db5352ecfe4877db48d6b93e51fcfc0');
let assertions=2;
function check(a,b){assert.deepEqual(a,b);assertions++;}
const physical=e=>e.id==='sv6pt5-20'?'Dusknoir SFA 020':
 e.id==='sv6pt5-19'?'Dusclops SFA 019':
 e.id==='sm11-71'?'Mewtwo & Mew-GX UNM 071':
 e.id==='sm4-95'?'Gladion CIN 95':e.name+' '+e.id;
function remove(a,needle){
 const i=a.findIndex(x=>x.includes(needle));if(i<0)throw Error('missing '+needle);
 return a.splice(i,1)[0];
}
function fixture(seat=0){
 const all=list.entries.flatMap(e=>Array(e.count).fill(physical(e)));
 check(all.length,60);
 const prize=['Dusknoir SFA 020','Sky Field','Field Blower','Unown','Basic Psychic','Telepathic Psychic']
   .map(n=>remove(all,n));
 const active=remove(all,'Mewtwo & Mew-GX');
 const bench=remove(all,'Dusclops');
 const hand=[remove(all,'Gladion'),...Array.from({length:6},()=>all.shift())];
 const own={
  active:{printing:active,evolutionPrintings:[active],energies:[],tools:[]},
  bench:[{printing:bench,evolutionPrintings:[bench],energies:[],tools:[]}],
  prizeCount:6,prizeSlots:Array.from({length:6},(_,i)=>({index:i})),
  deckCount:all.length,handCount:hand.length,discard:[],lostZone:[],
  resolvingSupporter:[],stadium:[],
  publicTurnRestrictions:{supporterPlayLocked:false,gxUsed:false}};
 // A Stage1 requires one underlying physical Duskull. Move it from deck
 // to the in-play evolution stack, keeping the exact 60-card census.
 const underneath=remove(all,'Duskull');
 own.bench[0].evolutionPrintings=[underneath,bench];
 own.deckCount=all.length;
 const known=Object.entries(all.reduce((acc,x)=>{
  acc[x]=(acc[x]??0)+1;return acc;},{})).map(([printing,copies])=>({printing,copies}));
 const obs={actorSeat:seat,decisionKind:'owner-root',globalTurn:4,
  ownPublic:own,ownHand:hand,
  opponentPublic:{active:{printing:'Vileplume BUS 006',hp:140,damage:0,
   tools:['Stealthy Hood UNB 186'],
   abilities:['Disgusting Pollen'],abilitySuppressions:[{
     abilityName:'Disgusting Pollen',suppressed:false}]},
  bench:[],prizeCount:3},
  ownerK1:{epoch:4,exactMembershipKnown:true,
   knownPrintings:known,invalidationReason:null},
  ownTurnResources:{supporterPlayedTurn:0}};
 const policy=createPolicy({role:'candidate',seat,policyVersion:POLICY_VERSION,config:{}});
 const gladion={kind:'play-card',token:'gladion',actorPrinting:'Gladion CIN 95',
  publicMetadata:{cardType:'trainer',handIndex:0}};
 const root=()=>policy.decide({role:'candidate',seat,observation:obs,prompt:null,
  actionFrontier:{items:[gladion]}});
 function prizePrompt(opts={}){
  obs.decisionKind='owner-prompt';
  const kind=opts.kind??'card';
  const pt=opts.promptType??(kind==='card'?'ChooseCardsPrompt':'ChoosePrizePrompt');
  const sourceZone=opts.sourceZone??'prizes';
  const pmt={actingSeat:seat,promptType:pt,
   source:{classification:'actor-choice',sourceKind:'card-effect',
    sourcePrinting:'Gladion CIN 95',effectName:'Gladion'},
   publicMetadata:{selectionType:kind==='card'?'card-combination':'prize-slots',
    sourceZone,ownerSeat:'actor',isOwnerVisible:true,
    ...(kind==='card'?{minimumCount:1,maximumCount:1}:{requiredCount:1})},
   choices:[{kind,token:'dusknoir',printing:opts.printing??'Dusknoir SFA 020',
    publicMetadata:{sourceZone,selectionType:kind==='card'?'card-combination':'prize-slots',
    ownerSeat:'actor',isOwnerVisible:opts.visible??true}}]};
  const result=policy.decide({role:'candidate',seat,observation:obs,prompt:pmt,
   actionFrontier:null});
  obs.decisionKind='owner-root';return result;
 }
 return {all,prize,active,bench,hand,obs,policy,gladion,root,prizePrompt};
}
function test(name,fn){try{fn()}catch(e){throw Error(name+': '+e.message)}}
test('full 60-card physical census K1 + prized Dusknoir proven',()=>{
 const f=fixture();check(fullyPrizedDusknoir(f.obs),true);
 check(f.root(),{kind:'select-action',token:'gladion'});
 check(f.prizePrompt(),{kind:'select-choices',tokens:['dusknoir']});
});
test('PrizeSlots choice only with visible printing',()=>{
 const f=fixture();check(f.root().token,'gladion');
 check(f.prizePrompt({kind:'prize-slot',sourceZone:'prize'}).tokens[0],'dusknoir');
});
test('unknown Prize printing withheld',()=>{
 const f=fixture();check(f.root().token,'gladion');
 check(f.prizePrompt({kind:'prize-slot',printing:'Unknown Prize'}).kind,'abstain');
});
test('non-owner-visible Prize withheld',()=>{
 const f=fixture();check(f.root().token,'gladion');
 check(f.prizePrompt({visible:false}).kind,'abstain');
});
test('K0 cannot assert Prize identity',()=>{
 const f=fixture();f.obs.ownerK1=null;
 check(fullyPrizedDusknoir(f.obs),false);check(f.root().kind,'abstain');
});
test('stale K1 cannot assert Prize identity',()=>{
 const f=fixture();f.obs.ownerK1.invalidationReason='SHUFFLE';
 check(f.root().kind,'abstain');
});
test('incomplete K1 deck count cannot assert Prize identity',()=>{
 const f=fixture();f.obs.ownerK1.knownPrintings[0].copies--;
 check(f.root().kind,'abstain');
});
test('unaccounted 59th card refuses inference',()=>{
 const f=fixture();f.obs.ownPublic.discard.pop();f.obs.ownPublic.deckCount--;
 check(f.root().kind,'abstain');
});
test('singleton Dusknoir in actual deck not Prized',()=>{
 const f=fixture();f.obs.ownerK1.knownPrintings.push({printing:'Dusknoir SFA 020',copies:1});
 f.obs.ownPublic.deckCount++;
 check(f.root().kind,'abstain');
});
test("can't play Gladion if already Supporter-played",()=>{
 const f=fixture();f.obs.ownTurnResources.supporterPlayedTurn=1;
 check(f.root().kind,'abstain');
});
test("can't play Gladion from non-hand actor action",()=>{
 const f=fixture();f.gladion.publicMetadata.handIndex=3;
 check(f.root().kind,'abstain');
});
test("can't Gladion through Supporter lock",()=>{
 const f=fixture();f.obs.ownPublic.publicTurnRestrictions.supporterPlayLocked=true;
 check(f.root().kind,'abstain');
});
test('no staged Duskull or Dusclops no Stage2-specific rescue',()=>{
 const f=fixture();f.obs.ownPublic.bench=[];
 check(f.root().kind,'abstain');
});
test('turn-change invalidates already selected Gladion plan',()=>{
 const f=fixture();check(f.root().token,'gladion');f.obs.globalTurn++;
 check(f.prizePrompt().kind,'abstain');
});
test('source mismatch cannot impersonate Gladion owner prompt',()=>{
 const f=fixture();check(f.root().token,'gladion');
 f.prizePrompt({printing:'Other'});check(f.prizePrompt().kind,'abstain');
});

test('native evolutionStack includes current Stage1 and active Basic',()=>{
 const f=fixture();
 check(f.obs.ownPublic.active.evolutionPrintings.includes(
  f.obs.ownPublic.active.printing),true);
 check(f.obs.ownPublic.bench[0].evolutionPrintings.includes(
  f.obs.ownPublic.bench[0].printing),true);
 check(fullyPrizedDusknoir(f.obs),true);
});
test('malformed stack omitting current Stage1 fails physical census',()=>{
 const f=fixture();f.obs.ownPublic.bench[0].evolutionPrintings.pop();
 check(fullyPrizedDusknoir(f.obs),false);
 check(f.root().kind,'abstain');
});

console.log('v3g Gladion physical-census research assertions passed: '+assertions);
