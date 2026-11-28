'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {selectNativeOfferedRank2LethalRetreat:choose}=
  require('../../simulation/evaluation/2026-11/agent25-native-offered-lethal-retreat.cjs');
const E='Psychic Energy MEE';
const psychic=n=>Array(n).fill(E);
const active=()=>({printing:'Shadow Rider Calyrex V CRE',hp:210,
  damage:0,energies:[],tools:[],specialConditions:[],
  printed:{stage:2,subtypes:[],types:['Psychic'],resistance:[]},
  attacks:[{name:'Shadow Mist',cost:['Psychic']}]});
const vmax=n=>({printing:'Shadow Rider Calyrex VMAX CRE',hp:320,
  damage:0,energies:psychic(n),tools:[],specialConditions:[],
  printed:{stage:5,subtypes:[],types:['Psychic'],resistance:[]},
  attacks:[{name:'Max Geist',cost:['Psychic','Psychic','Colorless']}]});
const vbench=()=>({printing:'Shadow Rider Calyrex V CRE',hp:210,
  damage:0,energies:[],tools:[],printed:{stage:2,subtypes:[]},attacks:[]});
const stoutland=()=>({printing:'Stoutland BCR',hp:140,damage:0,
  tools:[],printed:{resistance:[]}});
const item=(kind,token,index,printing)=>({
  kind,token,targetPrinting:printing,
  publicMetadata:{targetSeat:'actor',targetZone:'bench',
    targetIndex:index,benchIndex:index}
});
function witness(seat=0){
  const bench=[vbench(),vmax(5),null,null,null];
  return {role:'candidate',seat,prompt:null,
    observation:{actorSeat:seat,decisionKind:'owner-root',
      ownPublic:{active:active(),bench,stadium:[],
        publicTurnRestrictions:{itemPlayLocked:true}},
      opponentPublic:{active:stoutland(),stadium:[],
        bench:[{printing:'Vileplume AOR'},null,null,null,null]}},
    actionFrontier:{items:[{kind:'pass',token:'pass'},
      item('retreat','retreat-vmax',1,'Shadow Rider Calyrex VMAX CRE')]}};
}
for(const seat of [0,1]) {
  test(`physical seat ${seat}: native-offered retreat reaches 160 > 140 against rank2 Sentinel`,()=>{
    const w=witness(seat);
    assert.deepEqual(w.observation.ownPublic.active.printed.subtypes,[]);
    assert.equal(w.observation.ownPublic.active.printed.stage,2);
    assert.deepEqual(choose(w),{kind:'select-action',token:'retreat-vmax'});
  });
}
test('four total Psychic cannot satisfy 140-HP knockout',()=>{
  const w=witness();w.observation.ownPublic.bench[1].energies=psychic(4);
  assert.equal(choose(w),null);
});
test('a VMAX with two physical Psychic cannot pay Max Geist even with five elsewhere',()=>{
  const w=witness();w.observation.ownPublic.bench[1].energies=psychic(2);
  w.observation.ownPublic.bench[0].energies=psychic(3);
  assert.equal(choose(w),null);
});
test('candidate never invents retreat not offered by native frontier',()=>{
  const w=witness();w.actionFrontier.items=[{kind:'pass',token:'pass'}];
  assert.equal(choose(w),null);
});
test('rejects mismatched actual native recipient and untrusted target index',()=>{
  const w=witness();w.actionFrontier.items[1].targetPrinting='Latias ex SSP';
  assert.equal(choose(w),null);
  w.actionFrontier.items[1].targetPrinting='Shadow Rider Calyrex VMAX CRE';
  w.actionFrontier.items[1].publicMetadata.targetIndex=4;
  assert.equal(choose(w),null);
});
test('rejects source-insufficient or untrusted actor contexts',()=>{
  const w=witness();w.observation.actorSeat=1;
  assert.equal(choose(w),null);
  w.observation.actorSeat=0;w.prompt={type:'ChooseCardsPrompt'};
  assert.equal(choose(w),null);
  w.prompt=null;w.observation.decisionKind='owner-prompt';
  assert.equal(choose(w),null);
  w.observation.decisionKind='owner-root';w.role='opponent';
  assert.equal(choose(w),null);
});
test('does not overgeneralize to other targets or missing actual Vileplume',()=>{
  const w=witness();w.observation.opponentPublic.active.printing='Iron Thorns ex TWM';
  assert.equal(choose(w),null);
  w.observation.opponentPublic.active.printing='Stoutland BCR';
  w.observation.opponentPublic.bench=[];
  assert.equal(choose(w),null);
});
test('rejects unknown attack-modifier environments and status effects',()=>{
  const w=witness();w.observation.opponentPublic.stadium=['Silent Lab PRC'];
  assert.equal(choose(w),null);
  w.observation.opponentPublic.stadium=[];
  w.observation.opponentPublic.active.tools=['Metal Frying Pan FLI'];
  assert.equal(choose(w),null);
  w.observation.opponentPublic.active.tools=[];
  w.observation.ownPublic.active.specialConditions=['ASLEEP'];
  assert.equal(choose(w),null);
});
test('requires genuinely stranded zero-Energy active and public Item lock',()=>{
  const w=witness();w.observation.ownPublic.active.energies=psychic(1);
  assert.equal(choose(w),null);
  w.observation.ownPublic.active.energies=[];
  w.observation.ownPublic.publicTurnRestrictions.itemPlayLocked=false;
  assert.equal(choose(w),null);
});
test('native retreater tie-break is stable independent of action order',()=>{
  const w=witness();
  w.observation.ownPublic.bench[2]=vmax(5);
  const added=item('retreat','retreat-later',2,'Shadow Rider Calyrex VMAX CRE');
  const original=w.actionFrontier.items[1];
  w.actionFrontier.items=[added,original,{kind:'pass',token:'pass'}];
  assert.deepEqual(choose(w),{kind:'select-action',token:'retreat-vmax'});
  w.actionFrontier.items=[original,{kind:'pass',token:'pass'},added];
  assert.deepEqual(choose(w),{kind:'select-action',token:'retreat-vmax'});
});
