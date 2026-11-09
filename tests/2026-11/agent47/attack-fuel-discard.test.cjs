'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {energyUnits,paysPrintedCost,proposeAttackFuelDiscard} =
  require('../../../simulation/twinleaf/2026-11/agent47-attack-fuel-discard-frontier.cjs');
const DCE='Double Colorless Energy SUM';
const B='Battle VIP Pass FST',H='Hisuian Heavy Ball ASR';
const catalog={
  basicEnergies:new Set(['Psychic Energy MEE','Grass Energy MEE']),
  basicEnergyTypes:{Psychic:5,Grass:0},colorlessEnergyType:9,
  specialConditions:{ASLEEP:2,PARALYZED:3}
};
const makeInput=(hand=[B,DCE,H],cost=[9,9])=>{
  const menu=[];
  for(let i=0;i<hand.length;i++)for(let j=i+1;j<hand.length;j++)
    menu.push([hand[i],hand[j]].sort());
  menu.sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b),'en'));
  const actor={decisionKind:'owner-prompt',actorSeat:0,globalTurn:4,
    ownHand:[...hand],ownPublic:{active:{printing:'Mew VMAX FST',
      energies:[],attacks:[{name:'Cross Fusion Strike',cost}],
      publicRestrictions:{},specialConditions:[]},stadium:[],
      publicTurnRestrictions:{}},
    opponentPublic:{stadium:[]},
    ownTurnResources:{energyPlayedTurn:0,energyPlayLocked:false}};
  return {actor,prompt:{id:7,message:'CHOOSE_CARD_TO_DISCARD',requiredCount:2,menu}};
};

test('one DCE rescues a payable Cross Fusion Strike from generic discard',()=>{
  const input=makeInput();
  const x=proposeAttackFuelDiscard(input,catalog);
  assert.equal(x.changed,true);
  assert.deepEqual(x.baseline,[B,DCE]);
  assert.deepEqual(x.proposal,[B,H]);
  assert.equal(x.reason,'preserve-one-attachment-immediate-attack');
  assert.ok(input.prompt.menu.some(m=>JSON.stringify(m)===JSON.stringify(x.proposal)));
});

test('no intervention when a second copy survives the baseline payment',()=>{
  const input=makeInput([B,B,DCE,DCE,H]);
  assert.equal(proposeAttackFuelDiscard(input,catalog).changed,false);
});

test('no intervention when all native-valid bundles spend sole Energy',()=>{
  const input=makeInput([B,DCE]);
  assert.equal(proposeAttackFuelDiscard(input,catalog).changed,false);
});

test('Temple of Sinnoh changes Double Colorless to one Colorless',()=>{
  const input=makeInput();
  input.actor.opponentPublic.stadium.push('Temple of Sinnoh ASR');
  assert.deepEqual(energyUnits(DCE,catalog,true),[9]);
  assert.equal(proposeAttackFuelDiscard(input,catalog).changed,false);
});

test('respects spent attachment, attack-lock and Sleep',()=>{
  const input=makeInput();
  input.actor.ownTurnResources.energyPlayedTurn=4;
  assert.equal(proposeAttackFuelDiscard(input,catalog).changed,false);
  input.actor.ownTurnResources.energyPlayedTurn=0;
  input.actor.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=1;
  assert.equal(proposeAttackFuelDiscard(input,catalog).changed,false);
  input.actor.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=0;
  input.actor.ownPublic.active.specialConditions.push(2);
  assert.equal(proposeAttackFuelDiscard(input,catalog).changed,false);
});

test('does not protect Energy when Active attack is already paid',()=>{
  const input=makeInput();
  input.actor.ownPublic.active.energies.push(DCE);
  assert.equal(proposeAttackFuelDiscard(input,catalog).changed,false);
});

test('type-specific one-attachment funding and insufficient single Energy',()=>{
  const input=makeInput([B,'Psychic Energy MEE','VS Seeker PHF'],[5,9]);
  assert.equal(proposeAttackFuelDiscard(input,catalog).changed,false);
  input.actor.ownPublic.active.energies.push('Grass Energy MEE');
  assert.equal(proposeAttackFuelDiscard(input,catalog).changed,true);
  assert.deepEqual(energyUnits('Psychic Energy MEE',catalog,false),[5]);
  assert.equal(paysPrintedCost([5,9],[0,5],9),true);
  assert.equal(paysPrintedCost([5,9],[5],9),false);
});

test('no dependence on opponent concealed cards or unavailable special metadata',()=>{
  const input=makeInput();
  const original=proposeAttackFuelDiscard(input,catalog);
  input.actor.opponentPublic.hand=['secret'];
  input.actor.opponentPublic.prizes=['secret'];
  assert.deepEqual(proposeAttackFuelDiscard(input,catalog),original);
  input.actor.ownPublic.active.energies.push('Double Dragon Energy ROS');
  assert.equal(proposeAttackFuelDiscard(input,catalog).changed,false);
});

test('public Perfection donor makes held Psychic a protected attack-funding resource',()=>{
  const input=makeInput([B,'Psychic Energy MEE',H],[9,9,9]);
  const active=input.actor.ownPublic.active;
  active.printing='Mewtwo & Mew-GX UNM';
  active.abilities=['Perfection'];
  active.energies=['Psychic Energy MEE'];
  input.actor.ownPublic.bench=[{printing:'Gengar & Mimikyu-GX TEU'}];
  const donorCatalog={...catalog,perfectionDonors:new Map([
    ['Gengar & Mimikyu-GX TEU',[
      {name:'Poltergeist',cost:[5,5],gxAttack:false},
      {name:'Horror House-GX',cost:[5],gxAttack:true}
    ]]
  ])};
  const x=proposeAttackFuelDiscard(input,donorCatalog);
  assert.equal(x.changed,true);
  assert.deepEqual(x.proposal,[B,H]);
});

test('Perfection proposal requires actually public donor and active Ability',()=>{
  const input=makeInput([B,'Psychic Energy MEE',H],[9,9,9]);
  input.actor.ownPublic.active.printing='Mewtwo & Mew-GX UNM';
  input.actor.ownPublic.active.abilities=['Perfection'];
  input.actor.ownPublic.active.energies=['Psychic Energy MEE'];
  const donorCatalog={...catalog,perfectionDonors:new Map([
    ['Gengar & Mimikyu-GX TEU',[
      {name:'Poltergeist',cost:[5,5],gxAttack:false}
    ]]
  ])};
  assert.equal(proposeAttackFuelDiscard(input,donorCatalog).changed,false);
  input.actor.ownPublic.discard=['Gengar & Mimikyu-GX TEU'];
  assert.equal(proposeAttackFuelDiscard(input,donorCatalog).changed,true);
  input.actor.ownPublic.active.abilities=[];
  assert.equal(proposeAttackFuelDiscard(input,donorCatalog).changed,false);
});

test('Perfection route respects visible opposing Ability lock and GX expenditure',()=>{
  const input=makeInput([B,'Psychic Energy MEE',H],[9,9,9]);
  input.actor.ownPublic.active.printing='Mewtwo & Mew-GX UNM';
  input.actor.ownPublic.active.abilities=['Perfection'];
  input.actor.ownPublic.active.energies=['Psychic Energy MEE'];
  input.actor.ownPublic.discard=['Gengar & Mimikyu-GX TEU'];
  const donorCatalog={...catalog,perfectionDonors:new Map([
    ['Gengar & Mimikyu-GX TEU',[
      {name:'Poltergeist',cost:[5,5],gxAttack:false},
      {name:'Horror House-GX',cost:[5],gxAttack:true}
    ]]
  ])};
  input.actor.opponentPublic.active={abilities:['Initialization']};
  assert.equal(proposeAttackFuelDiscard(input,donorCatalog).changed,false);
  input.actor.opponentPublic.active={abilities:[]};
  input.actor.ownPublic.publicTurnRestrictions.gxUsed=true;
  assert.equal(proposeAttackFuelDiscard(input,donorCatalog).changed,true);
  input.actor.ownPublic.stadium=['Path to the Peak CRE'];
  assert.equal(proposeAttackFuelDiscard(input,donorCatalog).changed,false);
});

test('native bounded Telepath Energy can fund a known Perfection attack',()=>{
  const telepath='Telepath [P] Energy M3';
  const input=makeInput([B,telepath,H],[9,9,9]);
  input.actor.ownPublic.active.printing='Mewtwo & Mew-GX UNM';
  input.actor.ownPublic.active.abilities=['Perfection'];
  input.actor.ownPublic.active.energies=['Psychic Energy MEE'];
  input.actor.ownPublic.discard=['Gengar & Mimikyu-GX TEU'];
  const source={...catalog,specialEnergies:new Set([telepath]),
    perfectionDonors:new Map([['Gengar & Mimikyu-GX TEU',[
      {name:'Poltergeist',cost:[5,5],gxAttack:false}
    ]]])};
  assert.deepEqual(energyUnits(telepath,source,false),[5]);
  const result=proposeAttackFuelDiscard(input,source);
  assert.equal(result.changed,true);
  assert.deepEqual(result.proposal,[B,H]);
  input.actor.opponentPublic.stadium=['Temple of Sinnoh ASR'];
  assert.deepEqual(energyUnits(telepath,source,true),[9]);
  assert.equal(proposeAttackFuelDiscard(input,source).changed,false);
});

test('unknown Special remains unsupported and cannot create fictitious attack fuel',()=>{
  const input=makeInput([B,'Unimplemented Special Energy XX',H],[9,9]);
  const source={...catalog,specialEnergies:new Set(['Unimplemented Special Energy XX'])};
  assert.equal(energyUnits('Unimplemented Special Energy XX',source,false),null);
  assert.equal(proposeAttackFuelDiscard(input,source).changed,false);
});

test('special-only attachment lock preserves Basic routes while excluding Telepath',()=>{
  const basic=makeInput([B,'Psychic Energy MEE',H],[5]);
  basic.actor.ownPublic.publicTurnRestrictions.specialEnergyPlayLocked=true;
  assert.equal(proposeAttackFuelDiscard(basic,catalog).changed,true);
  const special=makeInput([B,'Telepath [P] Energy M3',H],[5]);
  special.actor.ownPublic.publicTurnRestrictions.specialEnergyPlayLocked=true;
  const specialCatalog={...catalog,
    specialEnergies:new Set(['Telepath [P] Energy M3'])};
  assert.equal(proposeAttackFuelDiscard(special,specialCatalog).changed,false);
});

test('opt-in Store prompt resolution chooses validated physical cards and restores hooks',()=>{
  const {withActorHandDiscard}=
    require('../../../simulation/twinleaf/agent47-actor-hand-discard.cjs');
  class AddPlayerAction{}
  class ResolvePromptAction{
    constructor(id,result){this.id=id;this.result=result;}
  }
  class ChooseCardsPrompt {
    constructor(player,cards){this.id=7;this.playerId=player.id;this.cards={cards};
      this.message='CHOOSE_CARD_TO_DISCARD';
      this.options={min:2,max:2,allowCancel:false};}
    validate(cards){return Array.isArray(cards)&&cards.length===2&&
      new Set(cards).size===2&&cards.every(c=>this.cards.cards.includes(c));}
  }
  class Store {
    constructor(state){this.state=state;}
    dispatch(action){
      if(action instanceof ResolvePromptAction){
        const pending=this.state.prompts.find(p=>p.id===action.id);
        assert.ok(pending.validate(action.result));
        pending.result=action.result;
      }
      return this.state;
    }
  }
  class SimpleTacticsAi {
    constructor(id){this.client={id};}
    decodeNextAction(){return 'baseline';}
  }
  const beforeBot=SimpleTacticsAi.prototype.decodeNextAction;
  const beforeDispatch=Store.prototype.dispatch;
  const owner={id:11,hand:{cards:[B,DCE,H].map((fullName,i)=>({fullName,i}))}};
  const state={players:[owner,{id:12,hand:{cards:[]}}],
    prompts:[new ChooseCardsPrompt(owner,owner.hand.cards)]};
  const store=new Store(state),bot=new SimpleTacticsAi(11);
  const input=makeInput();
  const execution=withActorHandDiscard(()=>{
    store.dispatch(new AddPlayerAction());
    const action=bot.decodeNextAction(store.state);
    assert.ok(action instanceof ResolvePromptAction);
    store.dispatch(action);
    return action.result.map(c=>c.fullName).sort();
  },{Store,SimpleTacticsAi,ResolvePromptAction,
    observe:()=>input,getCatalog:()=>catalog,validate:()=>{}},
  {attackFuelDiscard:true});
  assert.deepEqual(execution.result,[B,H]);
  assert.equal(execution.audit.accepted,1);
  assert.equal(execution.audit.attackFuelSelected,1);
  assert.equal(execution.audit.attackFuelAlternativeProposals,1);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,beforeBot);
  assert.strictEqual(Store.prototype.dispatch,beforeDispatch);
});
