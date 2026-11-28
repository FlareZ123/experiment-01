'use strict';
const {createPolicy,POLICY_VERSION}=require('../../simulation/evaluation/2026-11/agent1-newmoon-v3-finisher-slice.cjs');
let checks=0;
function assert(a,b,label){if(a!==b)throw Error((label||'assert')+': '+a+' != '+b);checks++;}
function make(name='Regidrago VSTAR',seat=0){
 const hp=name.includes('Lopunny')?330:name.includes('Kangaskhan')?300:name.includes('Thorns')?230:280;
 const mk=(printing,h=270,abilities=[])=>({printing,hp:h,damage:0,abilities,
  tools:[],specialConditions:[],abilitySuppressions:abilities.map(abilityName=>({abilityName,suppressed:false}))});
 const active=mk('Mewtwo & Mew-GX UNM71',270,['Perfection']);
 const dusk=mk('Dusknoir SFA20',160,['Cursed Blast']);
 const donor=mk('Trevenant & Dusknoir-GX SM217');
 const own={active,bench:[dusk,donor],prizeCount:6,publicTurnRestrictions:{gxUsed:false}};
 const opp={active:mk(name,hp),bench:[],prizeCount:6,handCount:5};
 const blast={kind:'use-ability',token:'blast',actorPrinting:dusk.printing,
  publicMetadata:{abilityName:'Cursed Blast',sourceZone:'bench',sourceIndex:0}};
 const night={kind:'attack',token:'night',attackName:'Night Watch',
  actorPrinting:donor.printing,publicMetadata:{attackCostPayable:true,
   attackSource:{sourceKind:'bench-pokemon',sourceSlot:'BENCH',sourceIndex:1,
     sourceCardFullName:donor.printing,attackName:'Night Watch'}}};
 const duo={kind:'attack',token:'duo',attackName:'Miraculous Duo-GX',
  actorPrinting:active.printing,publicMetadata:{attackCostPayable:true,
    attackSource:{sourceKind:'active-pokemon',sourceSlot:'ACTIVE',
     sourceCardFullName:active.printing,attackName:'Miraculous Duo-GX'}}};
 const ace={kind:'play-card',token:'ace',actorPrinting:'Ace Trainer ROS69'};
 const items=[blast,night,duo,ace],obs={actorSeat:seat,globalTurn:5,
  decisionKind:'owner-root',ownPublic:own,opponentPublic:opp,
  ownTurnResources:{supporterPlayedTurn:0}};
 const policy=createPolicy({role:'candidate',seat,policyVersion:POLICY_VERSION,config:{}});
 const root=()=>policy.decide({role:'candidate',seat,observation:obs,prompt:null,actionFrontier:{items}});
 const target=()=>{
  obs.decisionKind='owner-prompt';
  const d=policy.decide({role:'candidate',seat,observation:obs,
   actionFrontier:null,prompt:{actingSeat:seat,promptType:'ChoosePokemonPrompt',
   source:{classification:'actor-choice',sourceKind:'card-effect',effectName:'Cursed Blast',
     sourcePrinting:dusk.printing},
   publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
   choices:[{kind:'pokemon',token:'target',printing:opp.active.printing,
     publicMetadata:{isOwnerVisible:true,ownerSeat:'opponent',targetZone:'active'}}]}});
  obs.decisionKind='owner-root';return d;
 };
 const settle=()=>{opp.active.damage+=130;opp.prizeCount--;own.bench[0]=null;};
 return {own,opp,obs,blast,night,duo,ace,items,root,target,settle};
}
const test=(name,fn)=>{try{fn()}catch(e){throw Error(name+': '+e.message);}};
test('Regidrago blast target Ace Night Watch',()=>{
 const f=make();assert(f.root().token,'blast');assert(f.target().tokens[0],'target');
 f.settle();assert(f.root().token,'ace');f.obs.ownTurnResources.supporterPlayedTurn=1;
 assert(f.root().token,'night');assert(f.root().kind,'abstain');
});
test('Mega Absol with low hand skips Ace',()=>{
 const f=make('Mega Absol ex');assert(f.root().token,'blast');assert(f.target().tokens[0],'target');
 f.settle();f.opp.handCount=2;assert(f.root().token,'night');
});
for(const name of ['Mega Lopunny ex','Mega Kangaskhan ex','Iron Thorns ex']){
 test('printed GX against '+name,()=>{
  const f=make(name);f.own.active.abilitySuppressions[0].suppressed=true;
  assert(f.root().token,'blast');assert(f.target().tokens[0],'target');f.settle();
  f.obs.ownTurnResources.supporterPlayedTurn=1;assert(f.root().token,'duo');
 });
}
test('game-winning attack skips hand reduction',()=>{
 const f=make();f.own.prizeCount=2;f.opp.prizeCount=3;
 assert(f.root().token,'blast');assert(f.target().tokens[0],'target');f.settle();
 assert(f.root().token,'night');
});
const veto=[
 ['last opponent Prize',f=>f.opp.prizeCount=1],
 ['attack not payable',f=>f.night.publicMetadata.attackCostPayable=false],
 ['attacker status unknown',f=>delete f.own.active.specialConditions],
 ['opponent Tool live',f=>f.opp.active.tools=['Stealthy Hood']],
 ['Dusknoir Ability suppressed',f=>f.own.bench[0].abilitySuppressions[0].suppressed=true],
 ['donor source mismatch',f=>f.night.publicMetadata.attackSource.sourceIndex=0],
 ['target outside certified subset',f=>f.opp.active.printing='Mega Dragonite ex'],
 ['attack alone already KOs',f=>f.opp.active.damage=140],
 ['HP modified',f=>f.opp.active.hp=370],
 ['Perfection suppressed',f=>f.own.active.abilitySuppressions[0].suppressed=true],
 ['Dusknoir absent',f=>f.own.bench[0]=null],
 ['unknown attack source',f=>delete f.night.publicMetadata.attackSource],
 ['unknown Prize count',f=>f.opp.prizeCount=null],
 ['GX spent versus Thorns',f=>{f.opp.active.printing='Iron Thorns ex';f.opp.active.hp=230;f.own.publicTurnRestrictions.gxUsed=true;f.night.publicMetadata.attackCostPayable=false;}]
];
for(const [n,change]of veto)test(n,()=>{const f=make();change(f);assert(f.root().kind,'abstain');});
const breaks=[
 ['reposition',f=>{f.opp.active.printing='Bunnelby';}],
 ['partial damage settlement',f=>{f.opp.active.damage=100;f.opp.prizeCount=5;}],
 ['Prize award absent',f=>{f.opp.active.damage=130;}],
 ['attacker changed',f=>{f.opp.active.damage=130;f.opp.prizeCount=5;f.own.active.printing='Meloetta';}],
 ['payable attack vanished',f=>{f.opp.active.damage=130;f.opp.prizeCount=5;f.night.publicMetadata.attackCostPayable=false;}],
 ['turn advanced and Dusknoir no longer in play',f=>{f.obs.globalTurn++;f.own.bench[0]=null;}]
];
for(const [n,change]of breaks)test(n,()=>{
 const f=make();assert(f.root().token,'blast');assert(f.target().tokens[0],'target');
 change(f);assert(f.root().kind,'abstain');
});
test('seat-one exact actor routing',()=>{
 const f=make('Regidrago VSTAR',1);assert(f.root().token,'blast');
 assert(f.target().tokens[0],'target');f.settle();assert(f.root().token,'ace');
});
test('invalid policy init config rejected',()=>{
 let rejected=false;try{createPolicy({role:'candidate',seat:0,policyVersion:POLICY_VERSION,
  config:{hash:'untrusted'}})}catch{rejected=true;}assert(rejected,true);
});
console.log('Agent1 v3 research actor tests: '+checks+' assertions passed');
