'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {visiblePrizeValue,terminalGuzmaTarget:choose,frozenGuzmaScore:score}=
  require('../../simulation/evaluation/2026-11/agent25-three-prize-mega-guzma.cjs');
const psychic=n=>Array(n).fill('Psychic Energy MEE');
const attacker=n=>({printing:'Shadow Rider Calyrex VMAX CRE',energies:psychic(n),
  attacks:[{name:'Max Geist',cost:['Psychic','Psychic','Colorless']}],tools:[]});
const mega=()=>({printing:'Mega Absol ex MEG 86',hp:280,damage:0,tools:[],
  printed:{subtypes:[],types:['Darkness'],resistance:[]}});
const dedenne=()=>({printing:'Dedenne-GX UNB 57',hp:160,damage:0,tools:[],
  printed:{subtypes:[],types:['Lightning'],resistance:[{type:'Metal',value:-20}]}});
function request(seat=0){
  return {role:'candidate',seat,observation:{actorSeat:seat,decisionKind:'owner-prompt',
    ownPublic:{active:attacker(5),bench:[attacker(4),null,null,null,null],
      prizeCount:3,stadium:[]},
    opponentPublic:{active:{printing:'Bunnelby PRC',hp:70},
      bench:[dedenne(),mega(),null,null,null],stadium:[]}},
    prompt:{source:{effectName:'Guzma',sourcePrinting:'Guzma BUS 115'},
      publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,targetZone:'bench'},
      choices:[
        {kind:'pokemon',token:'dedenne',printing:'Dedenne-GX UNB 57',
          publicMetadata:{ownerSeat:'opponent',isOwnerVisible:true,benchIndex:0}},
        {kind:'pokemon',token:'mega',printing:'Mega Absol ex MEG 86',
          publicMetadata:{ownerSeat:'opponent',isOwnerVisible:true,benchIndex:1}}
      ]}};
}
test('actual Aichi modern Mega printings are three-prize, unlike old XY Mega EX',()=>{
  const names=['Mega Absol ex MEG 86','Mega Dragonite ex ASC 152',
    'Mega Lopunny ex PFL 84','Mega Kangaskhan ex MEG 104'];
  for(const name of names)assert.equal(visiblePrizeValue({printing:name,printed:{subtypes:[]}}),3,name);
  assert.equal(visiblePrizeValue({printing:'M Rayquaza-EX ROS 76'}),2);
  assert.equal(visiblePrizeValue({printing:'Regidrago VSTAR SIT 136'}),2);
  assert.equal(visiblePrizeValue({printing:'Renamed VSTAR printing',printed:{stage:6,subtypes:[]}}),2);
  assert.equal(visiblePrizeValue({printing:'Some VMAX',printed:{stage:5,subtypes:[]}}),3);
  assert.equal(visiblePrizeValue({printing:'Some V-UNION',printed:{stage:7,subtypes:[]}}),3);
  assert.equal(visiblePrizeValue({printing:'M Rayquaza-EX ROS 76',printed:{stage:9,subtypes:[]}}),2);
  assert.equal(visiblePrizeValue({printing:'Hisuian Goodra VSTAR LOR 136'}),2);
  assert.equal(visiblePrizeValue({printing:'Dedenne-GX UNB 57'}),2);
  assert.equal(visiblePrizeValue({printing:'Mega Lopunny & Jigglypuff-GX CEC 165'}),3);
  assert.equal(visiblePrizeValue({printing:'Radiant Eternatus CRZ 105'}),1);
});
test('frozen opponent-Guzma scorer ranks 160-HP Dedenne ahead of 280-HP 3-Prize Mega',()=>{
  const damage=10+9*30;
  assert.equal(damage,280);
  const frozenMega=score({maxGeistDamage:damage,remainingHP:280,assumedPrizeCount:2});
  const frozenDedenne=score({maxGeistDamage:damage,remainingHP:160,assumedPrizeCount:2});
  assert.equal(frozenMega,15920);assert.equal(frozenDedenne,16040);
  assert.ok(frozenDedenne>frozenMega,'frozen scorer chooses lower-prize target');
  const fixedMega=score({maxGeistDamage:damage,remainingHP:280,assumedPrizeCount:3});
  assert.equal(fixedMega,17620);
  assert.ok(fixedMega>frozenDedenne);
});
for(const seat of [0,1])test(`seat ${seat}: terminal Guzma prompt selects 3-Prize Mega over Dedenne`,()=>{
  const req=request(seat);
  assert.deepEqual(choose(req),{kind:'select-choices',tokens:['mega']});
});
test('Guzma must have a payable BENCH attacker; active VMAX cannot attack after forced self-switch',()=>{
  const req=request();req.observation.ownPublic.bench[0].energies=psychic(2);
  assert.equal(choose(req),null);
});
test('terminal choice requires enough attached Psychic and attack threshold',()=>{
  const req=request();req.observation.ownPublic.active.energies=psychic(4);
  assert.equal(choose(req),null);
  req.observation.ownPublic.active.energies=psychic(5);
  req.observation.opponentPublic.bench[1].hp=310;
  assert.equal(choose(req),null);
});
test('two-Prize target cannot be mispromoted into a three-Prize terminal KO',()=>{
  const req=request();req.observation.opponentPublic.bench[1]=dedenne();
  req.prompt.choices[1].printing='Dedenne-GX UNB 57';
  assert.equal(choose(req),null);
});
test('no real Mega target in owner-visible prompt -> null, never manufactures token',()=>{
  const req=request();req.prompt.choices.splice(1,1);
  assert.equal(choose(req),null);
  req.prompt.choices.push({kind:'pokemon',token:'forged',printing:'Mega Absol ex MEG 86',
    publicMetadata:{ownerSeat:'opponent',isOwnerVisible:true,benchIndex:9}});
  assert.equal(choose(req),null);
});
test('fail closed under hidden target identity or mismatched original printing',()=>{
  const req=request();req.prompt.choices[1].publicMetadata.isOwnerVisible=false;
  assert.equal(choose(req),null);
  req.prompt.choices[1].publicMetadata.isOwnerVisible=true;
  req.prompt.choices[1].printing='Mega Absol ex ASC 86';
  assert.equal(choose(req),null);
});
test('wrong role, seat, decision kind and unsupported prompt are rejected',()=>{
  const req=request();req.role='opponent';assert.equal(choose(req),null);
  req.role='candidate';req.observation.actorSeat=1;assert.equal(choose(req),null);
  req.observation.actorSeat=0;req.prompt.source.effectName='Boss';assert.equal(choose(req),null);
  req.prompt.source.effectName='Guzma';req.observation.decisionKind='owner-root';assert.equal(choose(req),null);
});
test('opponent Tool/Stadium and Psychic Resistance risk veto unverified lethal',()=>{
  const req=request();req.observation.opponentPublic.stadium=['Temple of Sinnoh ASR'];
  assert.equal(choose(req),null);
  req.observation.opponentPublic.stadium=[];
  req.observation.opponentPublic.bench[1].tools=['Metal Frying Pan'];
  assert.equal(choose(req),null);
  req.observation.opponentPublic.bench[1].tools=[];
  req.observation.opponentPublic.bench[1].printed.resistance=[{type:'Psychic',value:-30}];
  assert.equal(choose(req),null);
});
test('four remaining Prize cards: three-Prize knockout is not terminal',()=>{
  const req=request();req.observation.ownPublic.prizeCount=4;
  assert.equal(choose(req),null);
});
test('modern Mega ex with damage and only three Psychic still terminates when affordable',()=>{
  const req=request();req.observation.ownPublic.active.energies=[];
  req.observation.ownPublic.bench[0].energies=psychic(3);
  req.observation.opponentPublic.bench[1].damage=200;
  assert.deepEqual(choose(req),{kind:'select-choices',tokens:['mega']});
});
