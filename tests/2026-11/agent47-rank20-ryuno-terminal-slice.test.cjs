'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {decideRank20RyunoSlice:decide,canTerminalRyuno}=require('../../simulation/evaluation/2026-11/agent47-rank20-ryuno-terminal-slice.cjs');
const copy=x=>JSON.parse(JSON.stringify(x));
function state(seat=0){
  return {
    role:'opponent',seat,observation:{actorSeat:seat,globalTurn:8,
      ownPublic:{prizeCount:3,discard:['Mega Dragonite ex ASC 152'],stadium:[],
        publicTurnRestrictions:{stadiumAndToolHaveNoEffectTurnsRemaining:0,attackLockTurnsRemaining:0,attackMaxEnergyTurnsRemaining:0},
        active:{printing:'Regidrago VSTAR SIT 136',energies:['Grass Energy MEE 9','Grass Energy MEE 9','Fire Energy MEE 10'],tools:[],specialConditions:[],
          publicRestrictions:{cannotUseAttacksNextTurn:[],cannotAttackNextTurn:false}}},
      opponentPublic:{stadium:[],publicTurnRestrictions:{stadiumAndToolHaveNoEffectTurnsRemaining:0},
        active:{printing:'Shadow Rider Calyrex VMAX CRE 75',hp:320,damage:0,tools:[],specialConditions:[],
          printed:{types:['Psychic'],subtypes:['VMAX'],weakness:[{type:'Darkness',value:'×2'}],resistance:[{type:'Fighting',value:'-30'}]},
          publicRestrictions:{cannotUseAttacksNextTurn:[]}}}},
    prompt:null,actionFrontier:{items:[
      {kind:'attack',token:'budew',attackName:'Itchy Pollen',publicMetadata:{attackCostPayable:true}},
      {kind:'attack',token:'apex',attackName:'Apex Dragon',publicMetadata:{attackCostPayable:true,hasPrevention:false,hasUnmodeledModifier:false,damagePrevented:0,damageReduced:0,isLegal:true}},
      {kind:'pass',token:'pass'}
    ]}
  };
}
function attackPrompt(s) {
  s.prompt={promptType:'ChooseAttackPrompt',source:{sourceAttack:'Apex Dragon'},choices:[
    {kind:'attack',token:'noivern',printing:'Noivern ex PAL 153',publicMetadata:{sourceAttack:'Dominating Echo',sourceZone:'discard',ownerSeat:'actor',eligible:true}},
    {kind:'attack',token:'ryuno',printing:'Mega Dragonite ex ASC 152',publicMetadata:{sourceAttack:'Ryuno Glide',sourceZone:'discard',ownerSeat:'actor',eligible:true}}
  ]};return s;
}
function energyPrompt(s){
  s.prompt={promptType:'ChooseEnergyPrompt',source:{sourceAttack:'Ryuno Glide'},
    publicMetadata:{selectionType:'energy-payment',minimumCount:2,maximumCount:2},choices:[
      {kind:'card',token:'dde',printing:'Double Dragon Energy ROS 97',publicMetadata:{sourceZone:'active',ownerSeat:'actor',eligible:true}},
      {kind:'card',token:'grass',printing:'Grass Energy MEE 9',publicMetadata:{sourceZone:'active',ownerSeat:'actor',eligible:true}},
      {kind:'card',token:'fire',printing:'Fire Energy MEE 10',publicMetadata:{sourceZone:'active',ownerSeat:'actor',eligible:true}}
    ]};return s;
}
test('both actor seats: select payable Apex over offered alternative',()=>{
  for(const seat of [0,1]){
    const s=state(seat);assert.equal(canTerminalRyuno(s),true);
    assert.deepEqual(decide(s),{kind:'select-action',token:'apex'});
    const wrong=copy(s);wrong.observation.actorSeat=1-seat;assert.equal(decide(wrong),null);
    wrong.observation.actorSeat=seat;wrong.role='candidate';assert.equal(decide(wrong),null);
  }
});
test('offered Apex can use visible Basic cost when optional action annotations are absent',()=>{
  const s=state();s.actionFrontier.items[1].publicMetadata={};
  assert.deepEqual(decide(s),{kind:'select-action',token:'apex'});
  s.observation.ownPublic.active.energies=['Grass Energy MEE 9','Fire Energy MEE 10'];
  assert.equal(decide(s),null);
});
test('minimal root metadata can execute; explicit prevention veto',()=>{
  const s=state();s.actionFrontier.items[1].publicMetadata={attackCostPayable:true};
  assert.deepEqual(decide(s),{kind:'select-action',token:'apex'});
  s.actionFrontier.items[1].publicMetadata.hasPrevention=true;assert.equal(decide(s),null);
});
test('existing worker Apex effectName and source-unannotated choice remain executable',()=>{
  const s=attackPrompt(state());
  s.prompt.source={classification:'actor-choice',sourceKind:'card-effect',sourcePrinting:'Regidrago VSTAR SIT 136',effectName:'Apex Dragon'};
  delete s.prompt.choices[1].publicMetadata.sourceZone;
  delete s.prompt.choices[1].publicMetadata.ownerSeat;
  assert.deepEqual(decide(s),{kind:'select-choice',token:'ryuno'});
  s.prompt.choices[1].publicMetadata.ownerSeat='opponent';assert.equal(decide(s),null);
});
test('copy exact source Mega Dragonite Ryuno over Dominating Echo; reject wrong source',()=>{
  const s=attackPrompt(state());assert.deepEqual(decide(s),{kind:'select-choice',token:'ryuno'});
  const bad=copy(s);bad.prompt.choices[1].publicMetadata.sourceZone='deck';assert.equal(decide(bad),null);
  bad.prompt.choices[1].publicMetadata.sourceZone='discard';bad.prompt.choices[1].printing='Mega Dragonite ex WRONG 152';assert.equal(decide(bad),null);
  bad.prompt.choices[1].printing='Mega Dragonite ex ASC 152';bad.prompt.choices[1].publicMetadata.eligible=false;assert.equal(decide(bad),null);
});
test('prompt continuation pays two distinct attached Basics, not a Double Dragon; underpayment fails closed',()=>{
  const s=energyPrompt(state());assert.deepEqual(decide(s),{kind:'select-choices',tokens:['grass','fire']});
  const missing=copy(s);missing.prompt.choices=missing.prompt.choices.filter(c=>c.token!=='fire');assert.equal(decide(missing),null);
  const foreign=copy(s);foreign.prompt.choices[2].publicMetadata.ownerSeat='opponent';assert.equal(decide(foreign),null);
  const uncertain=copy(s);uncertain.prompt.publicMetadata.minimumCount=1;assert.equal(decide(uncertain),null);
});
test('ten negative-control states: no invented terminal conversion',()=>{
  const s=state();const cases=[
    x=>x.observation.ownPublic.prizeCount=4,
    x=>x.observation.opponentPublic.active.tools.push('Bravery Charm PAL 173'),
    x=>x.observation.opponentPublic.active.hp=330,
    x=>x.observation.opponentPublic.active.printing='Shadow Rider Calyrex V CRE 74',
    x=>x.observation.ownPublic.discard=[],
    x=>x.observation.ownPublic.active.energies=['Double Dragon Energy ROS 97'],
    x=>x.observation.opponentPublic.stadium=['Jamming Tower TWM 153'],
    x=>x.observation.ownPublic.active.publicRestrictions.cannotAttackNextTurn=true,
    x=>x.actionFrontier.items[1].publicMetadata.hasUnmodeledModifier=true,
    x=>x.actionFrontier.items[1].publicMetadata.attackCostPayable=false
  ];
  for(let i=0;i<cases.length;i++){const x=copy(s);cases[i](x);assert.equal(decide(x),null,'negative '+i);}
});
test('unsupported native prompt families and non-Apex origins remain delegated',()=>{
  const s=state();s.prompt={promptType:'PutDamagePrompt',choices:[]};assert.equal(decide(s),null);
  s.prompt={promptType:'ChooseEnergyPrompt',source:{sourceAttack:'Other'},publicMetadata:{selectionType:'energy-payment',minimumCount:2,maximumCount:2},choices:[]};assert.equal(decide(s),null);
  s.prompt={promptType:'ChooseAttackPrompt',source:{sourceAttack:'Copycat'},choices:attackPrompt(state()).prompt.choices};assert.equal(decide(s),null);
});
