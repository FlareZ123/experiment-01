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
  decisionKind:'owner-root',ownHand:['Ace Trainer ROS 69'],ownPublic:own,opponentPublic:opp,
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
 return {own,opp,obs,blast,night,duo,ace,items,root,target,settle,p:policy};
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

function shadowFixture(){
 const f=make('Regidrago VSTAR');
 f.own.active={printing:'Dusknoir SFA20',hp:160,damage:0,
  specialConditions:[],tools:[],abilities:['Cursed Blast'],
  abilitySuppressions:[{abilityName:'Cursed Blast',suppressed:false}]};
 f.opp.active={printing:'Vileplume BUS sm3-6',hp:140,damage:0,
  tools:['Stealthy Hood UNB 186'],specialConditions:[],
  abilities:['Disgusting Pollen'],
  abilitySuppressions:[{abilityName:'Disgusting Pollen',suppressed:false}]};
 f.items.push({kind:'attack',token:'shadow',attackName:'Shadow Bind',
  actorPrinting:f.own.active.printing,publicMetadata:{attackCostPayable:true,
  attackSource:{sourceKind:'active-pokemon',sourceSlot:'ACTIVE',
    sourceCardFullName:f.own.active.printing}}});
 return f;
}
test('Stage2 direct Shadow Bind beats Hooded BUS without any self-KO',()=>{
 const f=shadowFixture();f.opp.prizeCount=1;
 assert(f.root().token,'shadow');
});
test('Shadow Bind must actually be payable',()=>{
 const f=shadowFixture();f.items.at(-1).publicMetadata.attackCostPayable=false;
 assert(f.root().kind,'abstain');
});
test('Shadow Bind requires correct Active Stage2 provenance',()=>{
 const f=shadowFixture();f.items.at(-1).publicMetadata.attackSource.sourceCardFullName='Mewtwo & Mew-GX';
 assert(f.root().kind,'abstain');
});
test('BUS Basic-attack lock never misattributes Mewtwo as Stage2',()=>{
 const f=shadowFixture();f.own.active.printing='Mewtwo & Mew-GX UNM71';
 assert(f.root().kind,'abstain');
});
test('unknown opponent Tool damage protection vetoes Shadow Bind',()=>{
 const f=shadowFixture();f.opp.active.tools=['Stealthy Hood','Eviolite'];
 assert(f.root().kind,'abstain');
});
test('status risk vetoes Shadow Bind',()=>{
 const f=shadowFixture();f.own.active.specialConditions=['CONFUSED'];
 assert(f.root().kind,'abstain');
});


test('Ace preserving held singleton Secret Box defers to funded Night Watch',()=>{
 const f=make();assert(f.root().token,'blast');assert(f.target().tokens[0],'target');
 f.settle();f.obs.ownHand.push('Secret Box TWM 163');
 assert(f.root().token,'night');
});
test('Ace preserves held unused Forest Seal Stone',()=>{
 const f=make();f.own.publicTurnRestrictions.vstarUsed=false;
 assert(f.root().token,'blast');assert(f.target().tokens[0],'target');
 f.settle();f.obs.ownHand.push('Forest Seal Stone SIT 156');
 assert(f.root().token,'night');
});
test('used Forest Seal Stone no longer blocks Ace',()=>{
 const f=make();f.own.publicTurnRestrictions.vstarUsed=true;
 assert(f.root().token,'blast');assert(f.target().tokens[0],'target');
 f.settle();f.obs.ownHand.push('Forest Seal Stone SIT 156');
 assert(f.root().token,'ace');
});
test('unknown hand declines disruptive Ace but retains lethal attack',()=>{
 const f=make();assert(f.root().token,'blast');assert(f.target().tokens[0],'target');
 f.settle();delete f.obs.ownHand;assert(f.root().token,'night');
});


test('first-turn VIP preserved from v2 shared opening, v3 policy',()=>{
 const f=make();f.obs.globalTurn=1;f.own.bench=[];
 f.opp.active.printing='Bunnelby PRC 121';f.opp.active.hp=60;
 f.items.splice(0,f.items.length,{kind:'play-card',token:'vip',
  actorPrinting:'Battle VIP Pass FST 225',publicMetadata:{cardType:'trainer',handIndex:0}});
 assert(f.root().token,'vip');
});
test('real active-attachment setup prioritizes TPE before VIP',()=>{
 const f=make();f.obs.globalTurn=1;f.own.bench=[];f.own.active.energies=[];
 f.obs.ownTurnResources.energyPlayedTurn=0;
 f.items.splice(0,f.items.length,
  {kind:'play-card',token:'vip',actorPrinting:'Battle VIP Pass FST 225',
    publicMetadata:{cardType:'trainer'}},
  {kind:'play-card',token:'tpe',actorPrinting:'Telepathic Psychic Energy MEG 88',
   targetPrinting:f.own.active.printing,
   publicMetadata:{cardType:'energy',targetZone:'active',targetSeat:'actor'}}
 );
 assert(f.root().token,'tpe');
});
test('v2 Tool Jammer locked line is not inherited into v3',()=>{
 const f=make();
 f.own.active.printing='Dusclops SFA 19';
 f.own.active.energies=['Basic Psychic Energy','Basic Psychic Energy'];
 f.own.active.abilities=['Cursed Blast'];
 f.own.active.abilitySuppressions=[{abilityName:'Cursed Blast',suppressed:false}];
 f.own.bench=[{printing:'Dusclops SFA 19',tools:[],energies:[],
   abilities:['Cursed Blast'],abilitySuppressions:[{abilityName:'Cursed Blast',suppressed:false}]}];
 f.opp.active.printing='Vileplume BUS 6';f.opp.active.hp=140;
 f.opp.active.tools=['Stealthy Hood UNB 186'];
 f.opp.active.abilities=['Disgusting Pollen'];
 f.opp.active.abilitySuppressions=[{abilityName:'Disgusting Pollen',suppressed:false}];
 f.opp.bench=[{printing:'Vileplume AOR 3',abilities:['Irritating Pollen'],
   abilitySuppressions:[{abilityName:'Irritating Pollen',suppressed:false}]}];
 f.own.publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining=0;
 f.opp.publicTurnRestrictions={stadiumAndToolHaveNoEffectTurnsRemaining:0};
 f.obs.ownHand=['Tool Jammer BST 136'];f.own.stadium=[];f.opp.stadium=[];
 f.items.splice(0,f.items.length,
  {kind:'play-card',token:'jam',actorPrinting:'Tool Jammer BST 136',
   publicMetadata:{targetZone:'active',targetSeat:'actor'}});
 assert(f.root().kind,'abstain');
});
test('Night Watch damage prevention vetoes pre-Blast sacrifice',()=>{
 const f=make();f.night.publicMetadata.damagePrevented=true;
 assert(f.root().kind,'abstain');
});
test('Night Watch reduced damage vetoes 280 closure',()=>{
 const f=make();f.night.publicMetadata.damageReduced=20;
 assert(f.root().kind,'abstain');
});
test('printed Miraculous Duo damage reduction vetoes Mega Lopunny',()=>{
 const f=make('Mega Lopunny ex');f.duo.publicMetadata.damageAfterResistance=180;
 assert(f.root().kind,'abstain');
});
test('Shadow Bind prevention vetoes Hooded BUS claimed KO',()=>{
 const f=shadowFixture();f.items.at(-1).publicMetadata.damagePrevented=true;
 assert(f.root().kind,'abstain');
});
test('unmodeled Shadow Bind damage modifier veto',()=>{
 const f=shadowFixture();f.items.at(-1).publicMetadata.hasUnmodeledModifier=true;
 assert(f.root().kind,'abstain');
});


function busDevelopment(){
 const f=make();
 f.opp.active.printing='Vileplume BUS 006';f.opp.active.hp=140;
 f.opp.active.tools=['Stealthy Hood UNB 186'];
 f.opp.active.abilities=['Disgusting Pollen'];
 f.opp.active.abilitySuppressions=[{abilityName:'Disgusting Pollen',suppressed:false}];
 f.own.active.printing='Dusclops SFA 019';
 f.own.active.abilities=['Cursed Blast'];
 f.own.active.energies=['Basic Psychic Energy','Telepathic Psychic Energy'];
 f.obs.ownHand=['Dusknoir SFA 020','Basic Psychic Energy'];
 f.items.splice(0,f.items.length,
  {kind:'play-card',token:'evolve',actorPrinting:'Dusknoir SFA 020',
   publicMetadata:{cardType:'pokemon',targetZone:'active',targetSeat:'actor'}},
  {kind:'play-card',token:'charge',actorPrinting:'Basic Psychic Energy',
   targetPrinting:'Dusclops SFA 019',
   publicMetadata:{cardType:'energy',targetZone:'active',targetSeat:'actor'}} );
 f.obs.ownTurnResources.energyPlayedTurn=0;
 return f;
}
test('Stage2 evolution of an established Active Dusclops through BUS',()=>{
 const f=busDevelopment();assert(f.root().token,'evolve');
});
test('Stage2 cannot evolve from source-unrelated target slot',()=>{
 const f=busDevelopment();f.items[0].publicMetadata.targetZone='bench';
 assert(f.root().token,'charge');
});
test('energy Stage1 if Stage2 not in hand',()=>{
 const f=busDevelopment();f.obs.ownHand=['Basic Psychic Energy'];
 assert(f.root().token,'charge');
});
test('do not attach second energy when manual attachment already used',()=>{
 const f=busDevelopment();f.obs.ownHand=[];
 f.obs.ownTurnResources.energyPlayedTurn=1;assert(f.root().kind,'abstain');
});
test('do not charge Dusclops if Vileplume lock is not live',()=>{
 const f=busDevelopment();f.obs.ownHand=[];
 f.opp.active.abilitySuppressions[0].suppressed=true;
 assert(f.root().kind,'abstain');
});
test('promote paid Bench Stage2 Dusknoir through live BUS lock',()=>{
 const f=busDevelopment();f.own.active.printing='Mewtwo & Mew-GX UNM 71';
 f.own.bench=[{printing:'Dusknoir SFA 020',
   energies:['Basic Psychic Energy','Basic Psychic Energy','Basic Psychic Energy']}];
 f.items.splice(0,f.items.length,{kind:'retreat',token:'retreat-stage2',
  targetPrinting:'Dusknoir SFA 020',publicMetadata:{
   targetSeat:'actor',targetZone:'bench',targetIndex:0}});
 assert(f.root().token,'retreat-stage2');
});
test('do not promote unfunded Bench Stage2 prematurely',()=>{
 const f=busDevelopment();f.own.active.printing='Mewtwo & Mew-GX UNM 71';
 f.own.bench=[{printing:'Dusknoir SFA 020',
   energies:['Basic Psychic Energy']}];
 f.items.splice(0,f.items.length,{kind:'retreat',token:'retreat-stage2',
  targetPrinting:'Dusknoir SFA 020',publicMetadata:{
   targetSeat:'actor',targetZone:'bench',targetIndex:0}});
 assert(f.root().kind,'abstain');
});
test('do not promote Stage2 if target bench slot mismatches',()=>{
 const f=busDevelopment();f.own.active.printing='Mewtwo & Mew-GX UNM 71';
 f.own.bench=[{printing:'Dusknoir SFA 020',
   energies:['Basic Psychic Energy','Basic Psychic Energy','Basic Psychic Energy']}];
 f.items.splice(0,f.items.length,{kind:'retreat',token:'wrong-bench',
  targetPrinting:'Dusknoir SFA 020',publicMetadata:{
   targetSeat:'actor',targetZone:'bench',targetIndex:2}});
 assert(f.root().kind,'abstain');
});


test('BUS locked Stage1 evolution from previously Benched Duskull',()=>{
 const f=busDevelopment();f.own.active.printing='Mewtwo & Mew-GX UNM71';
 f.own.bench=[{printing:'Duskull VIV69',energies:['Basic Psychic Energy'],
  tools:[],specialConditions:[]}];f.obs.ownHand=['Dusclops SFA 19'];
 f.items.splice(0,f.items.length,{kind:'play-card',token:'evolve-duskull',
 actorPrinting:'Dusclops SFA 19',targetPrinting:'Duskull VIV69',
 publicMetadata:{cardType:'pokemon',targetSeat:'actor',targetZone:'bench',targetIndex:0}});
 assert(f.root().token,'evolve-duskull');
});
test('BUS lock requires Stage1 native evolution eligibility',()=>{
 const f=busDevelopment();f.own.active.printing='Mewtwo & Mew-GX UNM71';
 f.own.bench=[{printing:'Duskull VIV69',energies:[],tools:[],specialConditions:[]}];
 f.obs.ownHand=['Dusclops SFA 19'];f.obs.ownTurnResources.energyPlayedTurn=1;
 f.items.splice(0,f.items.length,{kind:'play-card',token:'wrong-index',
 actorPrinting:'Dusclops SFA 19',targetPrinting:'Duskull VIV69',
 publicMetadata:{cardType:'pokemon',targetSeat:'actor',targetZone:'bench',targetIndex:3}});
 assert(f.root().kind,'abstain');
});
test('BUS hand Duskull establishes evolution lineage',()=>{
 const f=busDevelopment();f.own.active.printing='Mewtwo & Mew-GX UNM71';
 f.own.bench=[];f.obs.ownHand=['Duskull VIV69'];
 f.items.splice(0,f.items.length,{kind:'play-card',token:'bench-dusk',
 actorPrinting:'Duskull VIV 69',publicMetadata:{cardType:'pokemon',targetZone:'bench',targetSeat:'actor'}});
 assert(f.root().token,'bench-dusk');
});
test('TPE under BUS Item lock recruits absent Duskull',()=>{
 const f=busDevelopment();f.own.active.printing='Mewtwo & Mew-GX UNM 71';
 f.own.active.printed={types:['Psychic']};f.own.bench=[];f.obs.ownHand=[];
 f.items.splice(0,f.items.length,{kind:'play-card',token:'tpe-recruit',
 actorPrinting:'Telepathic Psychic Energy MEG 88',
 targetPrinting:f.own.active.printing,
 publicMetadata:{cardType:'energy',targetZone:'active',targetSeat:'actor'}});
 assert(f.root().token,'tpe-recruit');
});
test('no TPE when Bench full',()=>{
 const f=busDevelopment();f.own.active.printing='Mewtwo & Mew-GX UNM 71';
 f.own.active.printed={types:['Psychic']};f.own.bench=[...Array(5)].map(()=>
  ({printing:'Unown AOR 30'}));f.obs.ownHand=[];
 f.items.splice(0,f.items.length,{kind:'play-card',token:'tpe',
 actorPrinting:'Telepathic Psychic Energy MEG 88',targetPrinting:f.own.active.printing,
 publicMetadata:{cardType:'energy',targetZone:'active',targetSeat:'actor'}});
 assert(f.root().kind,'abstain');
});


test('Powerglass requires basic Psychic discard and no Tool blank',()=>{
 const f=busDevelopment();f.obs.ownHand=['Powerglass SFA 63'];
 f.obs.ownTurnResources.energyPlayedTurn=1;f.own.discard=['Basic Psychic Energy'];
 f.own.active.tools=[];f.items.splice(0,f.items.length,{
 kind:'play-card',token:'glass',actorPrinting:'Powerglass SFA 63',
 targetPrinting:f.own.active.printing,publicMetadata:{cardType:'trainer',
 targetSeat:'actor',targetZone:'active'}});
 assert(f.root().token,'glass');
 f.opp.stadium=['Jamming Tower TWM 153'];
 assert(f.root().kind,'abstain');
 f.opp.stadium=[];f.own.discard=['Telepathic Psychic Energy'];
 assert(f.root().kind,'abstain');
 f.own.discard=['Basic Psychic Energy'];f.own.active.tools=['Forest Seal Stone'];
 assert(f.root().kind,'abstain');
});
test('Powerglass and manual Energy support partially funded Active Stage2',()=>{
 const f=busDevelopment();f.own.active.printing='Dusknoir SFA 20';
 f.own.active.tools=[];f.own.discard=['Basic Psychic Energy'];
 f.obs.ownHand=['Powerglass SFA 63'];
 f.obs.ownTurnResources.energyPlayedTurn=1;
 f.items.splice(0,f.items.length,{kind:'play-card',token:'glass',
 actorPrinting:'Powerglass SFA 63',publicMetadata:{cardType:'trainer',
 targetSeat:'actor',targetZone:'active'}});
 assert(f.root().token,'glass');
 f.obs.ownTurnResources.energyPlayedTurn=0;
 f.items.splice(0,f.items.length,{kind:'play-card',token:'attach',
 actorPrinting:'Basic Psychic Energy',targetPrinting:f.own.active.printing,
 publicMetadata:{cardType:'energy',targetSeat:'actor',targetZone:'active'}});
 assert(f.root().token,'attach');
});


function treasureFixture(){
 const f=make();
 f.own.bench=[{printing:'Dusclops SFA 019',abilities:['Cursed Blast'],
  tools:[],energies:[],abilitySuppressions:[{abilityName:'Cursed Blast',suppressed:false}]}];
 f.obs.globalTurn=3;f.obs.ownHand=['Mysterious Treasure FLI 113','Battle VIP Pass FST 225'];
 f.items.splice(0,f.items.length,{kind:'play-card',token:'treasure',
 actorPrinting:'Mysterious Treasure FLI 113',
 publicMetadata:{cardType:'trainer',handIndex:0}});
 const prompt=(zone,choices)=>{
  f.obs.decisionKind='owner-prompt';
  const pp={actingSeat:0,promptType:'ChooseCardsPrompt',
   source:{classification:'actor-choice',sourceKind:'card-effect',
    effectName:'Mysterious Treasure',sourcePrinting:'Mysterious Treasure FLI 113'},
   publicMetadata:{selectionType:'card-combination',ownerSeat:'actor',
    sourceZone:zone,isOwnerVisible:true,minimumCount:1,maximumCount:1},
   choices:choices.map(([token,printing])=>({token,printing,kind:'card',
    publicMetadata:{sourceZone:zone,ownerSeat:'actor',isOwnerVisible:true}}))};
  return f.p.decide({role:'candidate',seat:0,observation:f.obs,prompt:pp,
   actionFrontier:null});
 };
 return {...f,prompt};
}
test('Mysterious Treasure paid root converts dead VIP to Dusknoir',()=>{
 const f=treasureFixture();assert(f.root().token,'treasure');
});
test('Mysterious Treasure payment prompt chooses only dead VIP',()=>{
 const f=treasureFixture();assert(f.prompt('hand',[
  ['vip','Battle VIP Pass FST 225'],['dusknoir','Dusknoir SFA 020']
 ]).tokens[0],'vip');
});
test('Mysterious Treasure owner deck prompt chooses required Stage2',()=>{
 const f=treasureFixture();assert(f.prompt('deck',[
  ['trev','Trevenant & Dusknoir-GX SM217'],
  ['du','Dusclops SFA 019'],
  ['noir','Dusknoir SFA 020']
 ]).tokens[0],'noir');
});
test('Treasure refuses discard of singleton instead of dead VIP',()=>{
 const f=treasureFixture();assert(f.prompt('hand',[
  ['trev','Trevenant & Dusknoir-GX SM217'],
  ['seals','Forest Seal Stone SIT 156']
 ]).kind,'abstain');
});
test('Treasure refuses unverified opposing deck-choice provenance',()=>{
 const f=treasureFixture();
 f.obs.decisionKind='owner-prompt';
 const wrong=f.p.decide({role:'candidate',seat:0,observation:f.obs,
  actionFrontier:null,prompt:{actingSeat:0,promptType:'ChooseCardsPrompt',
   source:{classification:'actor-choice',sourceKind:'card-effect',
    effectName:'Mysterious Treasure',sourcePrinting:'Mysterious Treasure FLI 113'},
   publicMetadata:{selectionType:'card-combination',sourceZone:'deck',
    ownerSeat:'actor',isOwnerVisible:true,minimumCount:1,maximumCount:1},
   choices:[{kind:'card',token:'fake',printing:'Dusknoir SFA 020',
    publicMetadata:{sourceZone:'deck',ownerSeat:'opponent',isOwnerVisible:true}}]}});
 assert(wrong.kind,'abstain');
});
test('Treasure first turn preserves VIP from being sacrificed',()=>{
 const f=treasureFixture();f.obs.globalTurn=1;
 assert(f.root().kind,'abstain');
});
test('Treasure falls back to missing Stage1 if Duskull is established',()=>{
 const f=treasureFixture();f.own.bench[0].printing='Duskull VIV 069';
 assert(f.prompt('deck',[['s1','Dusclops SFA 019'],['s2','Dusknoir SFA 020']]).tokens[0],'s1');
});
test('Treasure no target if Dusknoir already held',()=>{
 const f=treasureFixture();f.obs.ownHand.push('Dusknoir SFA 020');
 assert(f.root().kind,'abstain');
});


function starFixture() {
 const f=busDevelopment();
 f.own.active.printing='Mewtwo & Mew-GX UNM071';
 f.own.bench=[
  {printing:'Dusclops SFA 019',tools:[],energies:[],
   abilities:['Cursed Blast'],abilitySuppressions:[{abilityName:'Cursed Blast',suppressed:false}]},
  {printing:'Galarian Articuno V CRE058',tools:['Forest Seal Stone SIT156'],
   energies:[],abilities:[],abilitySuppressions:[]}
 ];
 f.obs.ownHand=['Basic Psychic Energy'];f.obs.ownTurnResources.energyPlayedTurn=1;
 f.items.splice(0,f.items.length,{kind:'use-ability',token:'star',
  publicMetadata:{abilityName:'Star Alchemy',sourceZone:'bench',sourceIndex:1}});
 const prompt=(printedTarget)=>{
  f.obs.decisionKind='owner-prompt';
  return f.p.decide({role:'candidate',seat:0,observation:f.obs,
   actionFrontier:null,prompt:{actingSeat:0,promptType:'ChooseCardsPrompt',
   source:{classification:'actor-choice',sourceKind:'card-effect',
    sourcePrinting:'Forest Seal Stone SIT156',effectName:'Star Alchemy'},
   publicMetadata:{selectionType:'card-combination',sourceZone:'deck',
    ownerSeat:'actor',isOwnerVisible:true,minimumCount:1,maximumCount:1},
   choices:[{kind:'card',token:'selected',printing:printedTarget,
    publicMetadata:{sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true}}]}})
 };
 return {...f,prompt};
}
test('BUS Forest Seal Stone searches missing Stage2',()=>{
 const f=starFixture();assert(f.root().token,'star');
});
test('BUS Forest Seal Stone prompt picks Dusknoir among actual owner deck cards',()=>{
 const f=starFixture();assert(f.prompt('Dusknoir SFA 020').tokens[0],'selected');
});
test('BUS Star search rejects other Stage2 source',()=>{
 const f=starFixture();assert(f.prompt('Trevenant & Dusknoir-GX SM217').kind,'abstain');
});
test('BUS install Stone on free Articuno V Tool slot',()=>{
 const f=starFixture();f.own.bench[1].tools=[];
 f.obs.ownHand=['Forest Seal Stone SIT156'];
 f.items.splice(0,f.items.length,{kind:'play-card',token:'stone',
 actorPrinting:'Forest Seal Stone SIT156',targetPrinting:'Galarian Articuno V CRE058',
 publicMetadata:{cardType:'trainer',targetSeat:'actor',targetZone:'bench',targetIndex:1}});
 assert(f.root().token,'stone');
});
test('BUS refuses Stone attach to wrong Bench holder',()=>{
 const f=starFixture();f.own.bench[1].tools=[];
 f.obs.ownHand=['Forest Seal Stone SIT156'];
 f.items.splice(0,f.items.length,{kind:'play-card',token:'wrong-index',
 actorPrinting:'Forest Seal Stone SIT156',
 publicMetadata:{cardType:'trainer',targetSeat:'actor',targetZone:'bench',targetIndex:3}});
 assert(f.root().kind,'abstain');
});
test('BUS holds Stone when target Stage2 is already in hand',()=>{
 const f=starFixture();f.obs.ownHand.push('Dusknoir SFA 020');
 assert(f.root().kind,'abstain');
});
test('BUS Star target changes to Stage1 when only Duskull is established',()=>{
 const f=starFixture();f.own.bench[0].printing='Duskull VIV069';
 assert(f.prompt('Dusclops SFA 019').tokens[0],'selected');
});
test('BUS no Star if Disgusting Pollen suppressed',()=>{
 const f=starFixture();f.opp.active.abilitySuppressions[0].suppressed=true;
 assert(f.root().kind,'abstain');
});


test('certified non-GX direct 150 KO takes prizes without sacrificing Dusknoir',()=>{
 const f=make();f.own.bench[0]=null;f.opp.active.damage=130;
 f.night.publicMetadata.damageAfterResistance=150;
 f.night.publicMetadata.attackSource.sourceIndex=1;
 assert(f.root().token,'night');
});
test('certified direct GX KO only when GX remains legal',()=>{
 const f=make();f.own.bench[0]=null;f.opp.active.printing='Moltres ex';
 f.opp.active.hp=190;f.duo.publicMetadata.damageAfterResistance=200;
 f.duo.publicMetadata.attackSource.sourceIndex=0;
 assert(f.root().token,'duo');
 f.own.publicTurnRestrictions.gxUsed=true;
 assert(f.root().kind,'abstain');
});
test('certified non-GX KO preferred to once-per-game GX',()=>{
 const f=make();f.own.bench[0]=null;
 f.opp.active.printing='Damaged Eevee';f.opp.active.hp=140;
 f.night.publicMetadata.damageAfterResistance=150;
 f.duo.publicMetadata.damageAfterResistance=200;
 f.duo.publicMetadata.attackSource.sourceIndex=0;
 assert(f.root().token,'night');
});
test('not enough certified damage never hallucinated as lethal',()=>{
 const f=make();f.own.bench[0]=null;f.opp.active.damage=100;
 f.night.publicMetadata.damageAfterResistance=150;
 assert(f.root().kind,'abstain');
});
test('certified source must match owner Active or Bench donor',()=>{
 const f=make();f.own.bench[0]=null;f.opp.active.damage=130;
 f.night.publicMetadata.damageAfterResistance=150;
 f.night.publicMetadata.attackSource.sourceIndex=0;
 assert(f.root().kind,'abstain');
});
test('suppressed Perfection cannot borrow otherwise certifiable donor KO',()=>{
 const f=make();f.own.bench[0]=null;f.opp.active.damage=130;
 f.night.publicMetadata.damageAfterResistance=150;
 f.own.active.abilitySuppressions[0].suppressed=true;
 assert(f.root().kind,'abstain');
});
test('certified Mewtwo direct attack cannot strike through suppressed GX use',()=>{
 const f=make();f.own.bench[0]=null;f.opp.active.hp=200;
 f.opp.active.printing='Gallade';f.duo.publicMetadata.damageAfterResistance=200;
 f.own.publicTurnRestrictions.gxUsed=true;
 assert(f.root().kind,'abstain');
});
test('certified lethal vetoes known damage prevention even if nominally paid',()=>{
 const f=make();f.own.bench[0]=null;f.opp.active.damage=130;
 f.night.publicMetadata.damageAfterResistance=150;
 f.night.publicMetadata.damagePrevented=true;
 assert(f.root().kind,'abstain');
});
test('certified lethal vetoes target damage mismatch',()=>{
 const f=make();f.own.bench[0]=null;f.opp.active.damage=130;
 f.night.publicMetadata.damageAfterResistance=150;
 f.night.publicMetadata.targetDamage=0;
 assert(f.root().kind,'abstain');
});
test('certified lethal Active Stage2 Shadow Bind targets unlocked low-HP opponent',()=>{
 const f=make();f.own.active.printing='Dusknoir SFA020';
 f.own.active.specialConditions=[];
 f.own.bench=[];f.opp.active.printing='Klefki SVI96';f.opp.active.hp=70;
 f.items.splice(0,f.items.length,{kind:'attack',token:'shadow',
 actorPrinting:'Dusknoir SFA020',attackName:'Shadow Bind',
 publicMetadata:{attackCostPayable:true,damageAfterResistance:150,
 attackSource:{sourceKind:'active-pokemon',sourceSlot:'ACTIVE',sourceIndex:0,
 sourceCardFullName:'Dusknoir SFA020',attackName:'Shadow Bind'}}});
 assert(f.root().token,'shadow');
});


test('full-source paid Night Watch applies damage and two-card hand pressure',()=>{
 const f=make();f.own.bench[0]=null;
 f.night.publicMetadata.attackSource.sourceCardName='Trevenant & Dusknoir-GX';
 assert(f.root().token,'night');
});
test('paid pressure can attack instead of unsafe last-Prize Cursed Blast',()=>{
 const f=make();f.opp.prizeCount=1;
 f.night.publicMetadata.attackSource.sourceCardName='Trevenant & Dusknoir-GX';
 assert(f.root().token,'night');
});
test('nonlethal Night Watch uses current paid source but refuses known damage reduction',()=>{
 const f=make();f.own.bench[0]=null;f.night.publicMetadata.damageReduced=20;
 f.night.publicMetadata.attackSource.sourceCardName='Trevenant & Dusknoir-GX';
 assert(f.root().kind,'abstain');
});
test('paid Stage2 Shadow Bind can progress two-hit knockout without item-lock target',()=>{
 const f=make();f.own.active.printing='Dusknoir SFA 20';f.own.bench=[];
 f.items.splice(0,f.items.length,{kind:'attack',token:'shadow',
 actorPrinting:'Dusknoir SFA 20',attackName:'Shadow Bind',
 publicMetadata:{attackCostPayable:true,attackSource:{sourceKind:'active-pokemon',
 sourceSlot:'ACTIVE',sourceIndex:0,sourceCardName:'Dusknoir',
 sourceCardFullName:'Dusknoir SFA 20',attackName:'Shadow Bind'}}});
 assert(f.root().token,'shadow');
});
test('paid Dusclops chip 50 can advance partial counter-KO',()=>{
 const f=make();f.own.active.printing='Dusclops SFA 19';f.own.bench=[];
 f.items.splice(0,f.items.length,{kind:'attack',token:'willow',
 actorPrinting:'Dusclops SFA 19',attackName:'Will-O-Wisp',
 publicMetadata:{attackCostPayable:true,attackSource:{sourceKind:'active-pokemon',
 sourceSlot:'ACTIVE',sourceIndex:0,sourceCardName:'Dusclops',
 sourceCardFullName:'Dusclops SFA 19',attackName:'Will-O-Wisp'}}});
 assert(f.root().token,'willow');
});
test('refill with Lillie only when hand thin and Supporter open',()=>{
 const f=make();f.own.bench[0]=null;f.obs.ownHand=['Lillie’s Determination'];
 f.items.splice(0,f.items.length,{kind:'play-card',token:'lillie',
 actorPrinting:"Lillie's Determination MEG 119",
 publicMetadata:{cardType:'trainer'}});
 assert(f.root().token,'lillie');
});
test('refill cannot consume a second Supporter this turn',()=>{
 const f=make();f.own.bench[0]=null;f.obs.ownHand=["Lillie's Determination"];
 f.obs.ownTurnResources.supporterPlayedTurn=1;
 f.items.splice(0,f.items.length,{kind:'play-card',token:'lillie',
 actorPrinting:"Lillie's Determination MEG119",
 publicMetadata:{cardType:'trainer'}});
 assert(f.root().kind,'abstain');
});
test('refill protects singleton Secret Box hand',()=>{
 const f=make();f.own.bench[0]=null;
 f.obs.ownHand=["Lillie's Determination",'Secret Box TWM 163'];
 f.items.splice(0,f.items.length,{kind:'play-card',token:'lillie',
 actorPrinting:"Lillie's Determination MEG119",
 publicMetadata:{cardType:'trainer'}});
 assert(f.root().kind,'abstain');
});
test('refill protects held Dusknoir when evolved board already exists',()=>{
 const f=make();f.own.bench[0]=null;
 f.obs.ownHand=["Lillie's Determination",'Dusknoir SFA 20'];
 f.items.splice(0,f.items.length,{kind:'play-card',token:'lillie',
 actorPrinting:"Lillie's Determination MEG119",
 publicMetadata:{cardType:'trainer'}});
 assert(f.root().kind,'abstain');
});

console.log('Agent1 v3 research actor tests: '+checks+' assertions passed');
