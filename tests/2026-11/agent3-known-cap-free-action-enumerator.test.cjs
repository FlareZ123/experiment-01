'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createKnownCapFreeActionEnumerator, assertKnownCapFreeAdapterAdmissionClear, EXPECTED_ENGINE_PIN } = require('../../simulation/evaluation/2026-11/agent3-known-cap-free-action-enumerator.cjs');

class PokemonCard { constructor({name='P',stage='BASIC',evolvesFrom=null,powers=[]}={}) { this.name=name;this.stage=stage;this.evolvesFrom=evolvesFrom;this.powers=powers; } }
class TrainerCard { constructor(trainerType){this.trainerType=trainerType;} }
class EnergyCard { constructor(fullName){this.fullName=fullName;} }
class PlayCardAction { constructor(clientId,handIndex,target){this.type='PLAY_CARD_ACTION';this.clientId=clientId;this.handIndex=handIndex;this.target=target;} }
class UseAbilityAction { constructor(clientId,name,target){this.type='USE_ABILITY_ACTION';this.clientId=clientId;this.name=name;this.target=target;} }
class UseTrainerAbilityAction { constructor(clientId,name,target){this.type='USE_TRAINER_ABILITY_ACTION';this.clientId=clientId;this.name=name;this.target=target;} }
class UseEnergyAbilityAction { constructor(clientId,name,target){this.type='USE_ENERGY_ABILITY_ACTION';this.clientId=clientId;this.name=name;this.target=target;} }
class AttackAction { constructor(clientId,name){this.type='ATTACK_ACTION';this.clientId=clientId;this.name=name;} }
const native={
  PokemonCard,TrainerCard,EnergyCard,
  cardActions:{PlayCardAction},gameActions:{UseAbilityAction,UseTrainerAbilityAction,UseEnergyAbilityAction,AttackAction},
  PlayerType:{BOTTOM_PLAYER:1,ANY:3},SlotType:{HAND:1,BENCH:2,DISCARD:5,BOARD:9},
  Stage:{BASIC:'BASIC'},TrainerType:{ITEM:'ITEM',TOOL:'TOOL',SUPPORTER:'SUPPORTER'},
  SpecialCondition:{PARALYZED:'PARALYZED',ASLEEP:'ASLEEP'}
};
function makeState(){
  const board=[0,1,2].map(i=>({
    cardList:{pokemonPlayedTurn:0,tools:[]},
    card:new PokemonCard({name:'Base'+i,powers:[{name:'P'+i+'a',useWhenInPlay:true},{name:'P'+i+'b',useWhenInPlay:true},{name:'P'+i+'c',useWhenInPlay:true}],attacks:i===0?[{name:'ActiveAttack'}]:[]}),
    target:{player:1,slot:2,index:i}
  }));
  const hand=[
    ...Array.from({length:9},(_,i)=>new PokemonCard({name:'Evolution'+i,stage:'STAGE_1',evolvesFrom:'Base0'})),
    ...Array.from({length:9},(_,i)=>new PokemonCard({name:'Basic'+i,stage:'BASIC'})),
    ...['E1','E2','E3'].map(x=>new EnergyCard(x)),
    ...Array.from({length:3},()=>new TrainerCard('TOOL')),
    ...Array.from({length:9},()=>new TrainerCard('ITEM')),
    ...Array.from({length:9},()=>new TrainerCard('SUPPORTER'))
  ];
  const discard=Array.from({length:9},(_,i)=>new PokemonCard({name:'D'+i,powers:[{name:'DPA'+i,useFromDiscard:true}]}));
  const player={
    id:'p0',hand:{cards:hand},bench:[{cards:[],getPokemonCard(){return undefined;}},{cards:[{}],getPokemonCard(){return board[1].card;}},{cards:[{}],getPokemonCard(){return board[2].card;}}],discard:{cards:discard},
    active:{specialConditions:[],tools:board[0].cardList.tools,getPokemonCard(){return board[0].card;}},
    supporter:{cards:[]},supporterTurn:0,energyPlayedTurn:0,
    forEachPokemon(_which,fn){for(const p of board)fn(p.cardList,p.card,p.target);}
  };
  return {activePlayer:0,turn:7,players:[player,{id:'p1'}]};
}
class ActionEnumerator {
  enumerate(state,player,clientId){
    return [
      ...this.evolveActions(state,player),...this.playBasicActions(state,player),
      ...this.attachEnergyActions(state,player),...this.attachToolActions(state,player),
      ...this.discardAbilityActions(state,player),...this.playItemActions(state,player),
      ...this.playStadiumActions(state,player),...this.playSupporterActions(state,player),
      ...this.abilityActions(state,player),...this.useStadiumActions(state,player),
      ...this.retreatActions(state,player),...this.attackActions(state,player),
      {type:'PASS_TURN',clientId}
    ];
  }
  capped(actions){return actions.slice(0,8);}
  evolveActions(state,player){
    const actions=[];const pokemons=[];
    player.forEachPokemon(1,(cardList,card,target)=>{if(cardList.pokemonPlayedTurn!==state.turn)pokemons.push({card,target});});
    for(const p of pokemons){for(let i=0;i<player.hand.cards.length;i++){const c=player.hand.cards[i];if(c instanceof PokemonCard&&c.evolvesFrom===p.card.name){actions.push(new PlayCardAction(player.id,i,p.target));if(actions.length>=8)return actions;}}}
    return actions;
  }
  playBasicActions(state,player){
    const empty=player.bench.filter(x=>x.cards.length===0);if(!empty.length)return [];
    const target={player:1,slot:2,index:0};const actions=[];
    for(let i=0;i<player.hand.cards.length;i++){const c=player.hand.cards[i];if(c instanceof PokemonCard&&c.stage==='BASIC'){actions.push(new PlayCardAction(player.id,i,target));if(actions.length>=8)break;}}
    return actions;
  }
  attachEnergyActions(state,player){
    if(player.energyPlayedTurn>=state.turn)return [];
    const indexes=[],seen=new Set();player.hand.cards.forEach((c,i)=>{if(c instanceof EnergyCard&&!seen.has(c.fullName)){seen.add(c.fullName);indexes.push(i);}});
    const actions=[];for(const index of indexes){player.forEachPokemon(1,(cardList,card,target)=>actions.push(new PlayCardAction(player.id,index,target)));if(actions.length>=8)break;}
    return actions.slice(0,8);
  }
  attachToolActions(state,player){
    const actions=[];for(let i=0;i<player.hand.cards.length;i++){const c=player.hand.cards[i];if(!(c instanceof TrainerCard)||c.trainerType!=='TOOL')continue;player.forEachPokemon(1,(cardList,card,target)=>{if(cardList.tools.length===0)actions.push(new PlayCardAction(player.id,i,target));});if(actions.length>=8)break;}return actions.slice(0,8);
  }
  discardAbilityActions(state,player){
    const actions=[];player.discard.cards.forEach((card,index)=>{if(!(card instanceof PokemonCard))return;const target={player:1,slot:5,index};for(const power of card.powers){if(power.useFromDiscard)actions.push(new UseAbilityAction(player.id,power.name,target));}});return actions.slice(0,8);
  }
  playItemActions(state,player){
    const actions=[],target={player:3,slot:9,index:0};for(let i=0;i<player.hand.cards.length;i++){const c=player.hand.cards[i];if(c instanceof TrainerCard&&c.trainerType==='ITEM'){actions.push(new PlayCardAction(player.id,i,target));if(actions.length>=8)break;}}return actions;
  }
  playStadiumActions(){return [{type:'STADIUM_MARKER'}];}
  playSupporterActions(state,player){
    if(player.supporter.cards.length>0||player.supporterTurn>=state.turn)return [];
    const actions=[],target={player:3,slot:9,index:0};for(let i=0;i<player.hand.cards.length;i++){const c=player.hand.cards[i];if(c instanceof TrainerCard&&c.trainerType==='SUPPORTER'){actions.push(new PlayCardAction(player.id,i,target));if(actions.length>=8)break;}}return actions;
  }
  abilityActions(state,player){
    const actions=[];player.forEachPokemon(1,(cardList,card,target)=>{for(const power of card.powers){if(power.useWhenInPlay)actions.push(new UseAbilityAction(player.id,power.name,target));}});return actions.slice(0,8);
  }
  useStadiumActions(){return [{type:'STADIUM_USE_MARKER'}];}
  retreatActions(){return [{type:'RETREAT_MARKER'}];}
  attackActions(state,player){
    const sp=player.active.specialConditions;
    if(sp.includes('PARALYZED')||sp.includes('ASLEEP'))return [];
    const active=player.active.getPokemonCard();
    if(!active)return [];
    return active.attacks.map(a=>new AttackAction(player.id,a.name));
  }
}
native.ActionEnumerator=ActionEnumerator;

test('pinned adapter removes all eight known per-family caps and preserves upstream ordering',()=>{
  const state=makeState();
  const original=new ActionEnumerator().enumerate(state,state.players[0],'p0');
  const enumerator=createKnownCapFreeActionEnumerator({native,enginePin:EXPECTED_ENGINE_PIN});
  const actions=enumerator.enumerate(state,state.players[0],'p0');
  const count=(type)=>actions.filter(x=>x.type===type).length;
  assert.equal(original.filter(x=>x.type==='PLAY_CARD_ACTION').length,8*6);
  assert.equal(original.filter(x=>x.type==='USE_ABILITY_ACTION').length,8*2);
  assert.equal(count('PLAY_CARD_ACTION'),9*6);
  assert.equal(count('USE_ABILITY_ACTION'),9*2);
  assert.equal(actions[54].type,'STADIUM_MARKER');
  assert.deepEqual(actions.slice(-4).map(x=>x.type),[
    'STADIUM_USE_MARKER','RETREAT_MARKER','ATTACK_ACTION','PASS_TURN'
  ]);
  assert.equal(actions.at(-1).type,'PASS_TURN');
  assert.equal(enumerator.__agent3UncappedAdapter.enginePin,EXPECTED_ENGINE_PIN);
});

test('Energy deduplication remains by fullName while target combinations are uncapped',()=>{
  const state=makeState();
  const player=state.players[0];
  player.hand.cards=Array.from({length:9},()=>new EnergyCard('Basic Psychic'));
  const enumerator=createKnownCapFreeActionEnumerator({native,enginePin:EXPECTED_ENGINE_PIN});
  const actions=enumerator.attachEnergyActions(state,player);
  assert.equal(actions.length,3);
});

test('adapter rejects an unreviewed Twinleaf pin or missing native exports',()=>{
  assert.throws(()=>createKnownCapFreeActionEnumerator({native,enginePin:'0'.repeat(40)}),/reviewed only for the pinned Twinleaf revision/);
  assert.throws(()=>createKnownCapFreeActionEnumerator({native:{...native,cardActions:{}},enginePin:EXPECTED_ENGINE_PIN}),/PlayCardAction constructor is required/);
});

test('adapter is behavior-identical to the pinned enumerator when no known cap is hit',()=>{
  const base=new PokemonCard({name:'Base',powers:[{name:'InPlay',useWhenInPlay:true}]});
  const cardList={pokemonPlayedTurn:0,tools:[]};
  const target={player:1,slot:2,index:0};
  const player={
    id:'p0',
    hand:{cards:[
      new PokemonCard({name:'Evolution',stage:'STAGE_1',evolvesFrom:'Base'}),
      new PokemonCard({name:'Basic',stage:'BASIC'}),
      new EnergyCard('E1'),new TrainerCard('TOOL'),
      new TrainerCard('ITEM'),new TrainerCard('SUPPORTER')
    ]},
    bench:[{cards:[]}],
    discard:{cards:[new PokemonCard({name:'Discard',powers:[{name:'DiscardPower',useFromDiscard:true}]})]},
    supporter:{cards:[]},supporterTurn:0,energyPlayedTurn:0,
    active:{specialConditions:[],tools:[],getPokemonCard(){return base;}},
    forEachPokemon(_which,fn){fn(cardList,base,target);}
  };
  player.bench=[{cards:[],getPokemonCard(){return undefined;}}];
  const state={activePlayer:0,turn:7,players:[player,{id:'p1'}]};
  const original=new ActionEnumerator().enumerate(state,player,'p0');
  const patched=createKnownCapFreeActionEnumerator({native,enginePin:EXPECTED_ENGINE_PIN}).enumerate(state,player,'p0');
  assert.deepEqual(patched,original);
});


test('tool abilities, active Tool attacks and Bench-usable attacks are enumerated',()=>{
  const state=makeState();
  const player=state.players[0];
  const tool=new TrainerCard('TOOL');
  tool.powers=[{name:'Star Alchemy',useWhenInPlay:true}];
  tool.attacks=[{name:'G Booster'}];
  player.active.tools.push(tool);
  player.active.getPokemonCard().attacks=[{name:'Active Attack'}];
  player.bench[1].getPokemonCard().attacks=[{name:'Bench Attack',useOnBench:true}];
  const enumerator=createKnownCapFreeActionEnumerator({native,enginePin:EXPECTED_ENGINE_PIN});
  const abilities=enumerator.abilityActions(state,player);
  const attacks=enumerator.attackActions(state,player);
  assert.ok(abilities.some(a=>a.type==='USE_ABILITY_ACTION'&&a.name==='Star Alchemy'));
  assert.deepEqual(attacks.map(a=>a.name),['Active Attack','Bench Attack','G Booster']);
  assert.deepEqual(attacks.map(a=>a.__agent3AttackSource.sourceKind),['active-pokemon','bench-pokemon','active-tool']);
  assert.equal(Object.getOwnPropertyDescriptor(attacks[1],'__agent3AttackSource').enumerable,false);
});

test('attack action expansion preserves the pinned Paralysis and Sleep gate',()=>{
  const state=makeState();
  const player=state.players[0];
  player.active.getPokemonCard().attacks=[{name:'Active Attack'}];
  player.active.specialConditions.push('PARALYZED');
  const enumerator=createKnownCapFreeActionEnumerator({native,enginePin:EXPECTED_ENGINE_PIN});
  assert.deepEqual(enumerator.attackActions(state,player),[]);
  player.active.specialConditions.splice(0,1,'ASLEEP');
  assert.deepEqual(enumerator.attackActions(state,player),[]);
});


test('hand Pokémon abilities and Trainer/Energy discard abilities are enumerated',()=>{
  const state=makeState();
  const player=state.players[0];
  const audino=new PokemonCard({name:'Audino',powers:[{name:'Busybody',useFromHand:true}]});
  const trumbeak=new PokemonCard({name:'Trumbeak',powers:[{name:'Mountain Pass',useFromHand:true}]});
  const minior=new PokemonCard({name:'Minior',powers:[{name:'Falling Star',useFromHand:true}]});
  const trainerInHand=new TrainerCard('ITEM');trainerInHand.powers=[{name:'Hand Trainer Power',useFromHand:true}];
  player.hand.cards=[audino,trumbeak,minior,trainerInHand];
  const trainer=new TrainerCard('ITEM');trainer.powers=[{name:'Discard Trainer Power',useFromDiscard:true}];
  const energy=new EnergyCard('Special Energy');energy.powers=[{name:'Discard Energy Power',useFromDiscard:true}];
  player.discard.cards=[trainer,energy];
  const enumerator=createKnownCapFreeActionEnumerator({native,enginePin:EXPECTED_ENGINE_PIN});
  const actions=enumerator.abilityActions(state,player).concat(enumerator.discardAbilityActions(state,player));
  assert.deepEqual(actions.filter(a=>a.type==='USE_ABILITY_ACTION'&&a.target.slot===1).map(a=>a.name),['Busybody','Mountain Pass','Falling Star']);
  assert.ok(actions.some(a=>a.type==='USE_TRAINER_ABILITY_ACTION'&&a.name==='Hand Trainer Power'&&a.target.slot===1));
  assert.ok(actions.some(a=>a.type==='USE_TRAINER_ABILITY_ACTION'&&a.name==='Discard Trainer Power'&&a.target.slot===5));
  assert.ok(actions.some(a=>a.type==='USE_ENERGY_ABILITY_ACTION'&&a.name==='Discard Energy Power'&&a.target.slot===5));
});


test('adapter-path admission requires the pinned marker and a locally untruncated frontier',()=>{
  const enumerator=createKnownCapFreeActionEnumerator({native,enginePin:EXPECTED_ENGINE_PIN});
  const diagnostics={truncated:false,omittedCount:0,unsupportedCount:0,enumeratedCount:20,validatedCount:20};
  const admitted=assertKnownCapFreeAdapterAdmissionClear({enumerator,enginePin:EXPECTED_ENGINE_PIN,frontierDiagnostics:diagnostics});
  assert.equal(admitted.adapter.enginePin,EXPECTED_ENGINE_PIN);
  assert.throws(()=>assertKnownCapFreeAdapterAdmissionClear({enumerator:{},enginePin:EXPECTED_ENGINE_PIN,frontierDiagnostics:diagnostics}),error=>error.code==='NATIVE_ACTION_ENUMERATOR_ADAPTER_MISSING');
  const incomplete={__agent3UncappedAdapter:{...enumerator.__agent3UncappedAdapter,includesHandAbilities:false}};
  assert.throws(()=>assertKnownCapFreeAdapterAdmissionClear({enumerator:incomplete,enginePin:EXPECTED_ENGINE_PIN,frontierDiagnostics:diagnostics}),error=>error.code==='NATIVE_ACTION_ENUMERATOR_ADAPTER_INCOMPLETE');
  assert.throws(()=>assertKnownCapFreeAdapterAdmissionClear({enumerator,enginePin:'0'.repeat(40),frontierDiagnostics:diagnostics}),error=>error.code==='NATIVE_ACTION_ENUMERATOR_ADAPTER_PIN_MISMATCH');
  assert.throws(()=>assertKnownCapFreeAdapterAdmissionClear({enumerator,enginePin:EXPECTED_ENGINE_PIN,frontierDiagnostics:{truncated:true,omittedCount:1,unsupportedCount:0}}),error=>error.code==='NATIVE_ACTION_FRONTIER_LOCAL_CAP');
  assert.throws(()=>assertKnownCapFreeAdapterAdmissionClear({enumerator,enginePin:EXPECTED_ENGINE_PIN,frontierDiagnostics:{truncated:false,omittedCount:0,unsupportedCount:1}}),error=>error.code==='NATIVE_ACTION_FRONTIER_UNSUPPORTED_ACTIONS');
});


test('same-name attack candidates follow native first-match source priority',()=>{
  const state=makeState();
  const player=state.players[0];
  player.active.getPokemonCard().attacks=[{name:'Shared Attack'}];
  player.bench[1].getPokemonCard().attacks=[{name:'Shared Attack',useOnBench:true}];
  const tool=new TrainerCard('TOOL');tool.attacks=[{name:'Shared Attack'}];
  player.active.tools.push(tool);
  const enumerator=createKnownCapFreeActionEnumerator({native,enginePin:EXPECTED_ENGINE_PIN});
  const actions=enumerator.attackActions(state,player);
  assert.equal(actions.length,1);
  assert.equal(actions[0].name,'Shared Attack');
  assert.equal(actions[0].__agent3AttackSource.sourceKind,'active-pokemon');
  player.active.getPokemonCard().attacks=[];
  const benchPriority=enumerator.attackActions(state,player);
  assert.equal(benchPriority.length,1);
  assert.equal(benchPriority[0].__agent3AttackSource.sourceKind,'bench-pokemon');
  player.bench[1].getPokemonCard().attacks=[];
  const toolPriority=enumerator.attackActions(state,player);
  assert.equal(toolPriority.length,1);
  assert.equal(toolPriority[0].__agent3AttackSource.sourceKind,'active-tool');
});

test('full enumerate preserves non-enumerable attack-source metadata and first-match deduplication', () => {
  const state = makeState();
  const player = state.players[0];
  const enumerator = createKnownCapFreeActionEnumerator({ native, enginePin: EXPECTED_ENGINE_PIN });
  let latestAttackActions = null;
  const originalAttackActions = enumerator.attackActions.bind(enumerator);
  enumerator.attackActions = (...args) => {
    latestAttackActions = originalAttackActions(...args);
    return latestAttackActions;
  };
  const tool = new TrainerCard('TOOL');
  tool.attacks = [{ name: 'Shared Attack' }];

  const cases = [
    {
      expected: 'active-pokemon',
      setup() {
        player.active.getPokemonCard().attacks = [{ name: 'Shared Attack' }];
        player.bench[1].getPokemonCard().attacks = [{ name: 'Shared Attack', useOnBench: true }];
        player.active.tools.push(tool);
      }
    },
    {
      expected: 'bench-pokemon',
      setup() {
        player.bench[1].getPokemonCard().attacks = [{ name: 'Shared Attack', useOnBench: true }];
        player.active.tools.push(tool);
      }
    },
    {
      expected: 'active-tool',
      setup() {
        player.active.tools.push(tool);
      }
    }
  ];

  for (const scenario of cases) {
    player.active.getPokemonCard().attacks = [];
    player.bench[1].getPokemonCard().attacks = [];
    player.active.tools.length = 0;
    scenario.setup();

    latestAttackActions = null;
    const actions = enumerator.enumerate(state, player, 'p0');
    const attacks = actions.filter(action => action instanceof AttackAction);
    assert.equal(attacks.length, 1, 'full enumerate must retain native first-match deduplication');
    assert.ok(Array.isArray(latestAttackActions) && latestAttackActions.length === 1);
    assert.strictEqual(attacks[0], latestAttackActions[0],
      'full enumerate must preserve the original AttackAction object reference');

    const action = attacks[0];
    const descriptor = Object.getOwnPropertyDescriptor(action, '__agent3AttackSource');
    assert.ok(descriptor, 'full enumerate must retain the source marker');
    assert.equal(descriptor.enumerable, false);
    assert.equal(descriptor.writable, false);
    assert.equal(descriptor.configurable, false);
    assert.equal(action.__agent3AttackSource.sourceKind, scenario.expected);
    assert.equal(Object.keys(action).includes('__agent3AttackSource'), false,
      'research metadata must remain outside the native enumerable action payload');
  }
});
