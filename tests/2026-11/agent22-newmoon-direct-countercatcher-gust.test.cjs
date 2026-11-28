'use strict';
const assert=require('node:assert/strict');
const {createDirectGustSlice,targetPrizesAndHp,choosePotentialFinish}=
 require('../../simulation/evaluation/2026-11/agent22-newmoon-direct-countercatcher-gust.cjs');
let checks=0;
const clone=x=>JSON.parse(JSON.stringify(x));
const base=()=>({
 role:'candidate',seat:0,prompt:null,
 observation:{actorSeat:0,globalTurn:9,decisionKind:'owner-root',
  ownHand:['Counter Catcher PAR'],
  ownPublic:{prizeCount:3,stadium:[],
   active:{printing:'Mewtwo & Mew-GX UNM',tools:[],
    specialConditions:[],energies:['Basic Psychic Energy SVE'],
    attacks:[{name:'Miraculous Duo-GX',damage:200}]},
   bench:[],discard:[],publicTurnRestrictions:{gxUsed:false}},
  opponentPublic:{prizeCount:2,stadium:[],
   active:{printing:'Pikachu SSH',hp:60,damage:0,tools:[]},
   bench:[{printing:'Mega Absol ex ME1',hp:280,damage:80,tools:[],
    printed:{resistance:[]}}]}
 },actionFrontier:{items:[
  {kind:'play-card',token:'cc',actorPrinting:'Counter Catcher PAR',
   publicMetadata:{cardType:'trainer',handIndex:0}},
  {kind:'attack',token:'duo',actorPrinting:'Mewtwo & Mew-GX UNM',
   attackName:'Miraculous Duo-GX',publicMetadata:{
    attackCostPayable:true,attackSource:{sourceKind:'active-pokemon',
     sourceSlot:'ACTIVE',sourceIndex:0,
     sourceCardFullName:'Mewtwo & Mew-GX UNM',
     attackName:'Miraculous Duo-GX'}}}
 ]}
});
function prompt(r,print){
 const a=clone(r);a.observation.decisionKind='owner-prompt';
 a.actionFrontier=null;
 a.prompt={actingSeat:0,promptType:'ChoosePokemonPrompt',
  source:{classification:'actor-choice',sourceKind:'card-effect',
   sourcePrinting:'Counter Catcher PAR',effectName:'Counter Catcher'},
  publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
  choices:[{kind:'pokemon',token:'target',printing:print,
   publicMetadata:{ownerSeat:'opponent',isOwnerVisible:true,
    targetZone:'bench',benchIndex:0}}]};
 return a;
}
function finishOf(r){
 const a=clone(r),t=a.observation.opponentPublic.bench[0];
 a.observation.opponentPublic.bench=[a.observation.opponentPublic.active];
 a.observation.opponentPublic.active=t;
 a.actionFrontier.items=[a.actionFrontier.items[1]];
 return a;
}
{
 const s=createDirectGustSlice({seat:0}),q=base();
 let a=s.decide(q);assert.equal(a.decision.token,'cc');checks++;
 a=s.decide(prompt(q,'Mega Absol ex ME1'));
 assert.equal(a.decision.tokens[0],'target');checks++;
 a=s.decide(finishOf(q));assert.equal(a.decision.token,'duo');checks++;
 assert.equal(a.reason,'A22_DIRECT_CC_PRINTED_GX_CONDITIONAL_TERMINAL');checks++;
 assert.equal(s.peek(),null);checks++;
}
const checkRoot=(change,pass)=>{
 const q=base(),s=createDirectGustSlice({seat:0});
 change(q);const a=s.decide(q);
 assert.equal(!!a,pass);checks++;
};
for(const change of [
 q=>{q.observation.ownPublic.prizeCount=2},
 q=>{q.observation.opponentPublic.prizeCount=3},
 q=>{q.observation.ownHand=[]},
 q=>{q.actionFrontier.items.shift()},
 q=>{q.observation.opponentPublic.bench[0].damage=79},
 q=>{q.observation.opponentPublic.bench[0].tools=['Stealthy Hood']},
 q=>{q.observation.ownPublic.active.printing='Gengar'},
 q=>{q.observation.ownPublic.active.attacks=[]},
 q=>{q.observation.opponentPublic.stadium=['Temple of Sinnoh']},
 q=>{q.observation.ownPublic.publicTurnRestrictions.gxUsed=true},
 q=>{q.actionFrontier.items[1].publicMetadata.attackCostPayable=false},
 q=>{q.actionFrontier.items[1].publicMetadata.attackSource.sourceSlot='BENCH'}
])checkRoot(change,false);
for(const change of [
 q=>{q.observation.opponentPublic.bench[0].damage=100},
 q=>{q.observation.opponentPublic.prizeCount=1},
 q=>{q.observation.opponentPublic.bench[0]={
  printing:'Mega Kangaskhan ex ME1',hp:300,damage:110,tools:[],
  printed:{resistance:[]}}}
])checkRoot(change,true);
for(const tweak of [
 q=>{q.observation.globalTurn=10},
 q=>{q.observation.actorSeat=1},
 q=>{q.prompt.source.effectName='Unknown'},
 q=>{q.prompt.choices[0].publicMetadata.ownerSeat='actor'},
 q=>{q.prompt.choices[0].printing='Mega Lopunny ex'},
 q=>{q.observation.opponentPublic.bench[0].damage=70}
]){
 const s=createDirectGustSlice({seat:0}),q=base();
 s.decide(q);
 const p=prompt(q,'Mega Absol ex ME1');tweak(p);
 assert.equal(s.decide(p),null);checks++;
 assert.equal(s.peek(),null);checks++;
}
for(const tweak of [
 q=>{q.observation.opponentPublic.prizeCount=1},
 q=>{q.observation.opponentPublic.active.damage=50},
 q=>{q.observation.opponentPublic.active.printing='Mega Kangaskhan ex'},
 q=>{q.observation.ownPublic.active.printing='Pikachu'},
 q=>{q.actionFrontier.items=[]}
]){
 const s=createDirectGustSlice({seat:0}),q=base();
 s.decide(q);s.decide(prompt(q,'Mega Absol ex ME1'));
 const f=finishOf(q);tweak(f);
 assert.equal(s.decide(f),null);checks++;
 assert.equal(s.peek(),null);checks++;
}
// Actual native Perfection Ability + owner-only Night Watch prompt; no
// fictional direct Bench-sourced attack and no Dusknoir involvement.
const regi=()=>{
 const q=base();q.observation.ownPublic.prizeCount=2;
 q.observation.opponentPublic.prizeCount=1;
 q.observation.ownPublic.active.abilities=['Perfection'];
 q.observation.ownPublic.active.abilitySuppressions=[
  {abilityName:'Perfection',suppressed:false}];
 q.observation.ownPublic.active.energies=[
  'Basic Psychic Energy SVE','Basic Psychic Energy SVE',
  'Basic Psychic Energy SVE'];
 q.observation.ownPublic.discard=['Trevenant & Dusknoir-GX SMP'];
 q.observation.opponentPublic.bench[0]={
  printing:'Regidrago VSTAR SIT',hp:280,damage:130,tools:[],
  printed:{resistance:[]}};
 q.actionFrontier.items[1]={
  kind:'use-ability',token:'perfection',actorPrinting:'Mewtwo & Mew-GX UNM',
  publicMetadata:{abilityName:'Perfection',sourceZone:'active',
   sourceSeat:'actor',sourceIndex:0}};
 return q;
};
const nightPrompt=q=>{
 const p=clone(q);p.observation.decisionKind='owner-prompt';
 p.actionFrontier=null;
 p.prompt={actingSeat:0,promptType:'ChooseAttackPrompt',
  source:{classification:'actor-choice',sourceKind:'card-effect',
   effectName:'Perfection',sourcePrinting:'Mewtwo & Mew-GX UNM'},
  publicMetadata:{selectionType:'attack'},
  choices:[{kind:'attack',token:'night',printing:'Trevenant & Dusknoir-GX SMP',
   publicMetadata:{sourceZone:'discard',sourceAttack:'Night Watch',
    ownerSeat:'actor',isOwnerVisible:true}}]};
 return p;
};
{
 const s=createDirectGustSlice({seat:0}),q=regi();
 assert.equal(s.decide(q).decision.token,'cc');checks++;
 assert.equal(s.decide(prompt(q,'Regidrago VSTAR SIT')).decision.tokens[0],
  'target');checks++;
 const f=finishOf(q);
 assert.equal(s.decide(f).decision.token,'perfection');checks++;
 assert.equal(s.decide(nightPrompt(f)).decision.token,'night');checks++;
 assert.equal(s.peek(),null);checks++;
}
for(const tweak of [
 q=>{q.observation.ownPublic.active.abilitySuppressions[0].suppressed=true},
 q=>{q.observation.ownPublic.discard=[]},
 q=>{q.observation.ownPublic.active.energies=[]},
 q=>{q.observation.opponentPublic.bench[0].damage=129},
 q=>{q.observation.ownPublic.prizeCount=3},
 q=>{q.actionFrontier.items[1]={kind:'attack',token:'night',
   attackName:'Night Watch',actorPrinting:'Trevenant & Dusknoir-GX SMP',
   publicMetadata:{attackCostPayable:true}}},
]){
 const q=regi(),s=createDirectGustSlice({seat:0});tweak(q);
 assert.equal(s.decide(q),null);checks++;
}
assert.equal(checks,54);
console.log('Agent22 Counter Catcher direct no-selfKO gust policy: '+
 checks+' checked synthetic actor branches passed');
