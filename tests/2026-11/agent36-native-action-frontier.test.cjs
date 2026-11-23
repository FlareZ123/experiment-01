'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const {createValidationRandomScope,seededRandom}=require('../../simulation/evaluation/2026-11/agent49-native-fixture-game.cjs');
const {
  buildNativeActionFrontier,
  selectedNativeAction,
  dispatchSelectedNativeAction
} = require('../../simulation/evaluation/2026-11/agent36-native-action-frontier.cjs');

class GameError { constructor(message){this.message=message;this.name='GameError';} }
class WaitPrompt { constructor(id){this.id=id;this.result=undefined;} }
class ResolvePromptAction {
  constructor(id,result){this.id=id;this.result=result;this.type='RESOLVE_PROMPT_ACTION';}
}
const GameCoreError = Object.freeze({
  ERROR_INVALID_STATE: 'ERROR_INVALID_STATE',
  ERROR_SIMULATOR_NOT_STABLE: 'ERROR_SIMULATOR_NOT_STABLE'
});

class Card {}
class PokemonCard extends Card {
  constructor(fullName) { super(); this.fullName = fullName; this.name = fullName; }
}
class TrainerCard extends Card {
  constructor(fullName) { super(); this.fullName = fullName; this.name = fullName; }
}
class EnergyCard extends Card {
  constructor(fullName) { super(); this.fullName = fullName; this.name = fullName; }
}

function slot(card = null) {
  const cards = card ? [card] : [];
  return {
    cards,
    getPokemonCard() { return this.cards[0] ?? null; }
  };
}

function cloneState(value,seen=new Map(),ignoredClasses=[]){
  if(value===null||typeof value!=='object')return value;
  if(ignoredClasses.some(Type=>value instanceof Type))return value;
  if(seen.has(value))return seen.get(value);
  if(Array.isArray(value)){
    const copy=[];seen.set(value,copy);
    for(const item of value)copy.push(cloneState(item,seen,ignoredClasses));
    return copy;
  }
  const copy=Object.create(Object.getPrototypeOf(value));
  seen.set(value,copy);
  for(const key of Reflect.ownKeys(value)){
    const descriptor=Object.getOwnPropertyDescriptor(value,key);
    if(descriptor&&Object.hasOwn(descriptor,'value'))
      descriptor.value=cloneState(descriptor.value,seen,ignoredClasses);
    Object.defineProperty(copy,key,descriptor);
  }
  return copy;
}

// Mirrors the pinned Twinleaf deepClone implementation: cloned objects use
// the source instance as their prototype, while ignored Card instances are kept
// by reference by Simulator. This is intentionally not a safe validation clone.
function twinleafDeepClone(source,ignores=[],refMap=[]){
  if(source===null)return null;
  if(typeof source==='function')return source;
  if(Array.isArray(source))
    return source.map(item=>twinleafDeepClone(item,ignores,refMap));
  if(source instanceof Object){
    if(ignores.some(ignore=>source instanceof ignore))return source;
    const ref=refMap.find(item=>item.s===source);
    if(ref!==undefined)return ref.d;
    const dest=Object.create(source);
    refMap.push({s:source,d:dest});
    for(const key in source){
      if(Object.prototype.hasOwnProperty.call(source,key))
        dest[key]=twinleafDeepClone(source[key],ignores,refMap);
    }
    return dest;
  }
  return source;
}

function fakeNative({onDispatch=()=>{},actions:providedActions=null,rejectActionTypes=['ATTACK_ACTION'],cloneCardsByReference=false,deepCloneImpl=state=>cloneState(state),actorSeat=0}={}) {
  const actions = providedActions ?? [
    {
      type: 'PLAY_CARD_ACTION',
      id: 'p0',
      handIndex: 0,
      target: { player: 1, slot: 2, index: 0 }
    },
    {
      type: 'ATTACK_ACTION',
      clientId: 'p0',
      name: 'Unavailable Attack'
    },
    {
      type: 'USE_ABILITY_ACTION',
      clientId: 'p0',
      name: 'Opponent Hand Targeting Ability',
      target: { player: 2, slot: 3, index: 0 }
    },
    {
      type: 'PASS_TURN',
      clientId: 'p0'
    }
  ];
  class ActionEnumerator {
    enumerate(state, player, clientId) {
      assert.equal(state.players[actorSeat], player);
      assert.equal(clientId, player.id);
      return actions;
    }
  }
  class Simulator {
    constructor(state) {
      this.store = {
        state:cloneState(state,new Map(),cloneCardsByReference?[Card]:[]),
        dispatch(action) {
          onDispatch(action,this.state);
          if (rejectActionTypes.includes(action.type)) throw new GameError('NOT_ENOUGH_ENERGY');
          return { accepted: action.type };
        }
      };
    }
  }
  return {
    ActionEnumerator,
    Simulator,
    deepClone:deepCloneImpl,
    Card,
    GameError,
    WaitPrompt,
    ResolvePromptAction,
    PokemonCard,
    TrainerCard,
    EnergyCard,
    PlayerType: { BOTTOM_PLAYER: 1, TOP_PLAYER: 2, ANY: 3 },
    SlotType: { BENCH: 2, ACTIVE: 1, BOARD: 9, HAND: 3, DECK: 4, DISCARD: 5 },
    TrainerType: { ITEM: 1, SUPPORTER: 2, STADIUM: 3, TOOL: 4 }
  };
}

function fixtureState() {
  return {
    activePlayer: 0,
    phase: 2,
    turn: 7,
    prompts: [],
    players: [
      {
        id: 'p0',
        hand: { cards: [new TrainerCard('Test Item')] },
        active: slot(new PokemonCard('Own Active Pokemon')),
        bench: [slot(new PokemonCard('Own Bench Pokemon'))],
        discard: { cards: [] },
        stadium: { cards: [] },
        stadiumAndToolHaveNoEffectTurnsRemaining: 0,
        lostzone: { cards: [] },
        supporter: { cards: [] },
        prizes: []
      },
      {
        id: 'p1',
        hand: { isPublic: false, cards: [{ fullName: 'HIDDEN_OPPONENT_HAND_SENTINEL' }] },
        active: slot(new PokemonCard('Opponent Active Pokemon')),
        bench: [slot()],
        discard: { cards: [] },
        stadium: { cards: [] },
        stadiumAndToolHaveNoEffectTurnsRemaining: 0,
        lostzone: { cards: [] },
        supporter: { cards: [] },
        prizes: []
      }
    ]
  };
}

test('frontier is Simulator-validated, actor-visible, and opaque-token mapped', () => {
  const state = fixtureState();
  const ownHandPokemon = new PokemonCard('Own Hand Pokemon');
  ownHandPokemon.powers = [{ name: 'Own Hand Ability', useFromHand: true }];
  state.players[0].hand.cards = [ownHandPokemon, new TrainerCard('Test Item')];
  const native = fakeNative({
    actions: [
      {
        type: 'PLAY_CARD_ACTION',
        id: 'p0',
        handIndex: 1,
        target: { player: 1, slot: 2, index: 0 }
      },
      {
        type: 'ATTACK_ACTION',
        clientId: 'p0',
        name: 'Unavailable Attack'
      },
      {
        type: 'USE_ABILITY_ACTION',
        clientId: 'p0',
        name: 'Own Hand Ability',
        target: { player: 1, slot: 3, index: 0 }
      },
      { type: 'PASS_TURN', clientId: 'p0' }
    ]
  });
  const built = buildNativeActionFrontier({ state, actorSeat: 0, native });
  assert.equal(built.diagnostics.enumeratedCount, 4);
  assert.equal(built.diagnostics.validatedCount, 3);
  assert.equal(built.diagnostics.rejectedCount, 1);
  assert.equal(built.diagnostics.unsupportedCount, 0);
  assert.equal(built.actionFrontier.schema, protocol.FRONTIER_SCHEMA);
  assert.deepEqual(built.actionFrontier.items.map(item => item.kind), ['play-card', 'use-ability', 'pass']);
  assert.equal(built.actionFrontier.items[0].actorPrinting, 'Test Item');
  assert.equal(built.actionFrontier.items[0].targetPrinting, 'Own Bench Pokemon');
  assert.deepEqual(built.actionFrontier.items[0].publicMetadata, {
    cardType: 'trainer',
    handIndex: 1,
    targetSeat: 'actor',
    targetZone: 'bench',
    targetIndex: 0,
    isOwnerVisible: true
  });
  assert.equal(built.actionFrontier.items[1].actorPrinting, 'Own Hand Pokemon');
  assert.deepEqual(built.actionFrontier.items[1].publicMetadata, {
    abilityName: 'Own Hand Ability',
    sourceZone: 'hand',
    sourceSeat: 'actor',
    sourceIndex: 0
  });
  assert.equal(built.actionFrontier.items[1].publicMetadata.sourceIndex, 0);
  assert.equal(Object.hasOwn(built.actionFrontier.items[1].publicMetadata, 'targetIndex'), false);
  protocol.validateFrontier(built.actionFrontier);
  const serialized = JSON.stringify(built.actionFrontier);
  assert.equal(serialized.includes('HIDDEN_OPPONENT_HAND_SENTINEL'), false);
  assert.equal(serialized.includes('clientId'), false);
  assert.equal(serialized.includes('handIndex":1'), true);
  assert.equal(selectedNativeAction(built, 'act-0').type, 'PLAY_CARD_ACTION');
  assert.throws(() => selectedNativeAction(built, 'unknown-token'),
    /unknown or stale native action token/);

  let dispatched = 0;
  const store = {
    state,
    dispatch(action) {
      dispatched += 1;
      assert.equal(action.type, 'PLAY_CARD_ACTION');
      return { dispatched: true };
    }
  };
  const result = dispatchSelectedNativeAction({
    store,
    frontier: built,
    token: 'act-0',
    state,
    actorSeat: 0,
    native,
    withValidationRandom:fn=>fn()
  });
  assert.deepEqual(result, { dispatched: true });
  assert.equal(dispatched, 1);
});


test('frontier mutation guard accepts independent deep-cloned Card instances',()=>{
  const state=fixtureState();
  const liveCard=state.players[0].active.cards[0];
  const action={type:'PASS_TURN',clientId:'p0'};
  const native=fakeNative({
    actions:[action],rejectActionTypes:[],
    onDispatch(_action,validationState){
      const validationCard=validationState.players[0].active.cards[0];
      assert.notStrictEqual(validationCard,liveCard,
        'ordinary deep-clone fixture must detach Card instances');
      validationCard._runtimeTags=['validation-only'];
    }
  });
  const built=buildNativeActionFrontier({state,actorSeat:0,native});
  assert.equal(built.diagnostics.validatedCount,1);
  assert.equal(liveCard._runtimeTags,undefined,
    'mutating a detached validation Card must not mutate the live Card');
});

test('frontier detaches Cards from Twinleaf deepClone prototype aliases before Simulator preserves them by reference',()=>{
  const state=fixtureState();
  const liveCard=state.players[0].active.cards[0];
  const runtimeTag=Symbol('runtime-tag');
  liveCard[runtimeTag]={nested:'before'};
  const action={type:'PASS_TURN',clientId:'p0'};
  const native=fakeNative({
    actions:[action],rejectActionTypes:[],cloneCardsByReference:true,
    deepCloneImpl:state=>twinleafDeepClone(state),
    onDispatch(_action,validationState){
      const validationCard=validationState.players[0].active.cards[0];
      assert.notStrictEqual(validationCard,liveCard,
        'adapter must detach Cards before Twinleaf Simulator preserves them by reference');
      assert.strictEqual(Object.getPrototypeOf(validationCard),Object.getPrototypeOf(liveCard),
        'detached Cards must retain the class prototype, not inherit from the live Card');
      assert.notStrictEqual(validationCard[runtimeTag],liveCard[runtimeTag],
        'symbol-keyed nested Card state must be detached before validation');
      validationCard._runtimeTags=['mutated-during-validation'];
      validationCard[runtimeTag].nested='after';
    }
  });
  const built=buildNativeActionFrontier({state,actorSeat:0,native});
  assert.equal(built.diagnostics.validatedCount,1);
  assert.equal(liveCard._runtimeTags,undefined);
  assert.equal(liveCard[runtimeTag].nested,'before',
    'validation mutations must remain isolated from the live Card graph');
});

test('frontier simulation draws are deterministic and cannot advance the physical shuffle stream',()=>{
  const ambientRandom=Math.random;
  const physicalSeed=0x12345678;
  const physicalRandom=seededRandom(physicalSeed);
  const physicalControl=seededRandom(physicalSeed);
  const expectedNextPhysicalDraw=physicalControl();
  const withValidationRandom=createValidationRandomScope({
    ambientRandom,physicalRandom
  });
  const runFrontier=()=>{
    const validationDraws=[];
    const native=fakeNative({onDispatch:()=>validationDraws.push(Math.random())});
    const built=withValidationRandom(()=>buildNativeActionFrontier({
      state:fixtureState(),actorSeat:0,native
    }));
    assert.ok(built.diagnostics.enumeratedCount>0);
    assert.ok(validationDraws.length>0,'simulator probes must consume the validation stream');
    assert.strictEqual(Math.random,ambientRandom);
    return validationDraws;
  };
  const first=runFrontier();
  const second=runFrontier();
  assert.deepEqual(second,first,'validation probes must replay the same deterministic stream');
  assert.equal(physicalRandom(),expectedNextPhysicalDraw,
    'the next physical RNG value must be identical to a run without frontier construction');
});

test('selected-action clone revalidation cannot advance the physical RNG before real dispatch',()=>{
  const state=fixtureState();
  const action={type:'PASS_TURN',clientId:'p0'};
  const built=buildNativeActionFrontier({
    state,actorSeat:0,native:fakeNative({actions:[action],rejectActionTypes:[]})
  });
  const native=fakeNative({
    actions:[action],rejectActionTypes:[],onDispatch:()=>Math.random()
  });
  const ambientRandom=Math.random;
  let physicalDraws=0,validationDraws=0;
  Math.random=()=>{physicalDraws++;return 0.75;};
  const withValidationRandom=fn=>{
    const physical=Math.random;
    Math.random=()=>{validationDraws++;return 0.25;};
    try{return fn();}finally{Math.random=physical;}
  };
  const store={
    state,
    dispatch(){
      assert.equal(physicalDraws,0,
        'clone validation must not consume the physical stream before real dispatch');
      Math.random();
      return {dispatched:true};
    }
  };
  try{
    const result=dispatchSelectedNativeAction({
      store,frontier:built,token:'act-0',state,actorSeat:0,native,
      withValidationRandom
    });
    assert.deepEqual(result,{dispatched:true});
    assert.equal(validationDraws,1);
    assert.equal(physicalDraws,1);
  }finally{
    Math.random=ambientRandom;
  }
});

test('selected-action revalidation detaches Cards before pinned shared-Card validation',()=>{
  const state=fixtureState();
  const liveCard=state.players[0].active.cards[0];
  const action={type:'PASS_TURN',clientId:'p0'};
  const frontierNative=fakeNative({
    actions:[action],rejectActionTypes:[],cloneCardsByReference:true
  });
  const built=buildNativeActionFrontier({
    state,actorSeat:0,native:frontierNative
  });
  const validationNative=fakeNative({
    actions:[action],rejectActionTypes:[],cloneCardsByReference:true,
    onDispatch(_action,validationState){
      const validationCard=validationState.players[0].active.cards[0];
      assert.notStrictEqual(validationCard,liveCard);
      validationCard._runtimeTags=['selected-action-validation-mutation'];
    }
  });
  let liveDispatches=0;
  const store={state,dispatch(){liveDispatches++;return {dispatched:true};}};
  const result=dispatchSelectedNativeAction({
    store,frontier:built,token:'act-0',state,actorSeat:0,native:validationNative,
    withValidationRandom:fn=>fn()
  });
  assert.deepEqual(result,{dispatched:true});
  assert.equal(liveCard._runtimeTags,undefined);
  assert.equal(liveDispatches,1,
    'isolated validation must permit the selected action to reach the shared game loop');
});

test('worker action preparation revalidates without dispatching before the shared game loop', () => {
  const state=fixtureState();
  const native=fakeNative();
  const built=buildNativeActionFrontier({state,actorSeat:0,native});
  let dispatched=0;
  const store={state,dispatch(){dispatched++;return {dispatched:true};}};
  const validationEvidence={};
  const action=dispatchSelectedNativeAction({
    store,frontier:built,token:'act-0',state,actorSeat:0,native,
    withValidationRandom:fn=>fn(),dispatch:false,validationEvidence
  });
  assert.equal(action.type,'PLAY_CARD_ACTION');
  assert.equal(validationEvidence.nativeValidationStoreMode,'cloned-store');
  assert.equal(dispatched,0);
});

test('selected-action owner validation uses native PlayCardAction.id for physical seat one',()=>{
  const state=fixtureState();
  state.activePlayer=1;
  state.players[1].hand.cards=[new TrainerCard('Actor Seat One Item')];
  const action={
    type:'PLAY_CARD_ACTION',
    id:'p1',
    handIndex:0,
    target:{player:3,slot:9,index:0}
  };
  let validationDispatches=0;
  const native=fakeNative({
    actorSeat:1,
    actions:[action],
    rejectActionTypes:[],
    onDispatch(candidate){
      if(candidate===action)validationDispatches++;
    }
  });
  const built=buildNativeActionFrontier({state,actorSeat:1,native});
  assert.equal(built.actionFrontier.items[0].kind,'play-card');
  const store={state,dispatch(){throw new Error('live Store must not be dispatched in witness mode');}};
  const validationEvidence={};
  const selected=dispatchSelectedNativeAction({
    store,frontier:built,token:'act-0',state,actorSeat:1,native,
    withValidationRandom:fn=>fn(),dispatch:false,validationEvidence
  });
  assert.strictEqual(selected,action);
  assert.equal(action.id,state.players[1].id);
  assert.equal(Object.hasOwn(action,'clientId'),false);
  assert.equal(validationEvidence.nativeValidationStoreMode,'cloned-store');
  assert.equal(validationDispatches,2);
});

test('dispatch rejects a stale Store state and a token owned by another seat', () => {
  const state = fixtureState();
  const native = fakeNative();
  const built = buildNativeActionFrontier({ state, actorSeat: 0, native });
  const staleStore = { state: { ...state }, dispatch() { throw new Error('must not dispatch'); } };
  assert.throws(() => dispatchSelectedNativeAction({
    store: staleStore,
    frontier: built,
    token: 'act-0',
    state,
    actorSeat: 0,
    native,
    withValidationRandom:fn=>fn()
  }), /state changed/);

  const wrongSeat = {
    ...state,
    players: [
      { ...state.players[0], id: 'different-player' },
      state.players[1]
    ]
  };
  const wrongStore = { state: wrongSeat, dispatch() { throw new Error('must not dispatch'); } };
  assert.throws(() => dispatchSelectedNativeAction({
    store: wrongStore,
    frontier: built,
    token: 'act-0',
    state: wrongSeat,
    actorSeat: 0,
    native,
    withValidationRandom:fn=>fn()
  }), /different physical seat|state changed/);
});


test('frontier only suppresses explicitly allowlisted GameError action-family rejections',()=>{
  const cases=[
    ...['CANNOT_ATTACK_ON_FIRST_TURN','BLOCKED_BY_SPECIAL_CONDITION','BLOCKED_BY_EFFECT',
      'CANNOT_USE_ATTACK','LEEK_SLAP_CANNOT_BE_USED_AGAIN','NOT_ENOUGH_ENERGY','LABEL_GX_USED']
      .map(message=>({type:'ATTACK_ACTION',message})),
    ...['USE_ABILITY_ACTION','USE_TRAINER_ABILITY_ACTION','USE_ENERGY_ABILITY_ACTION']
      .map(type=>({type,message:'CANNOT_USE_POWER'})),
    {type:'USE_ABILITY_ACTION',message:'BLOCKED_BY_EFFECT'},
    {type:'USE_ABILITY_ACTION',message:'POWER_ALREADY_USED'},
    {type:'USE_ABILITY_ACTION',message:'LABEL_VSTAR_USED'},
    ...['BLOCKED_BY_EFFECT','BLOCKED_BY_SPECIAL_CONDITION','NOT_ENOUGH_ENERGY']
      .map(message=>({type:'RETREAT_ACTION',message})),
    {type:'USE_STADIUM_ACTION',message:'STADIUM_ALREADY_USED'},
    {type:'USE_STADIUM_ACTION',message:'BLOCKED_BY_EFFECT'},
    {type:'USE_STADIUM_ACTION',message:'CANNOT_USE_STADIUM'},
    {type:'PLAY_CARD_ACTION',family:'ITEM',message:'BLOCKED_BY_EFFECT'},
    {type:'PLAY_CARD_ACTION',family:'SUPPORTER',message:'CANNOT_PLAY_THIS_CARD'},
    {type:'PLAY_CARD_ACTION',family:'SUPPORTER',message:'SUPPORTER_ALREADY_PLAYED'},
    {type:'PLAY_CARD_ACTION',family:'SUPPORTER',message:'BLOCKED_BY_EFFECT'},
    {type:'PLAY_CARD_ACTION',family:'STADIUM',message:'STADIUM_ALREADY_PLAYED'},
    {type:'PLAY_CARD_ACTION',family:'STADIUM',message:'SAME_STADIUM_ALREADY_IN_PLAY'},
    {type:'PLAY_CARD_ACTION',family:'STADIUM',message:'BLOCKED_BY_EFFECT'},
    {type:'PLAY_CARD_ACTION',family:'ENERGY',message:'ENERGY_ALREADY_ATTACHED'},
    {type:'PLAY_CARD_ACTION',family:'ENERGY',message:'BLOCKED_BY_EFFECT'},
    {type:'PLAY_CARD_ACTION',family:'TOOL',message:'BLOCKED_BY_EFFECT'},
    {type:'PLAY_CARD_ACTION',family:'TOOL',message:'POKEMON_TOOL_ALREADY_ATTACHED'},
    {type:'PLAY_CARD_ACTION',family:'POKEMON',message:'BLOCKED_BY_EFFECT'},
    {type:'PLAY_CARD_ACTION',family:'POKEMON',message:'CANNOT_EVOLVE_ON_YOUR_FIRST_TURN'},
    {type:'PLAY_CARD_ACTION',family:'POKEMON',message:'POKEMON_CANT_EVOLVE_THIS_TURN'}
  ];
  for(const entry of cases){
    const state=fixtureState();
    const trainerTypeByFamily={ITEM:1,SUPPORTER:2,STADIUM:3,TOOL:4};
    if(Object.hasOwn(trainerTypeByFamily,entry.family)){
      state.players[0].hand.cards[0].trainerType=trainerTypeByFamily[entry.family];
    }else if(entry.family==='ENERGY'){
      state.players[0].hand.cards[0]=new EnergyCard('Psychic Energy');
    }else if(entry.family==='POKEMON'){
      state.players[0].hand.cards[0]=new PokemonCard('Test Basic');
    }
    const action={type:entry.type,clientId:'p0',handIndex:0,name:'Expected rejection'};
    const pass={type:'PASS_TURN',clientId:'p0'};
    const native=fakeNative({
      actions:[action,pass],rejectActionTypes:[],
      onDispatch(candidate){
        if(candidate===action)throw new GameError(entry.message);
      }
    });
    const built=buildNativeActionFrontier({state,actorSeat:0,native});
    assert.equal(built.diagnostics.rejectedCount,1,entry.type+' '+(entry.family??'')+' '+entry.message);
    assert.deepEqual(built.actionFrontier.items.map(item=>item.kind),['pass']);
  }
});


test('stadium action tokens require confirmed live effect and suppressed use preserves later actions',()=>{
  const liveState=fixtureState();
  liveState.players[0].stadium.cards=[new TrainerCard('Test Stadium')];
  const stadiumAction={type:'USE_STADIUM_ACTION',clientId:'p0'};
  const pass={type:'PASS_TURN',clientId:'p0'};
  const liveNative=fakeNative({actions:[stadiumAction,pass],rejectActionTypes:[]});
  const live=buildNativeActionFrontier({state:liveState,actorSeat:0,native:liveNative});
  const liveStadium=live.actionFrontier.items.find(item=>item.kind==='use-stadium');
  assert.ok(liveStadium);
  assert.equal(liveStadium.publicMetadata.stadiumEffectLive,true);

  const suppressedState=fixtureState();
  suppressedState.players[1].stadium.cards=[new TrainerCard('Test Stadium')];
  suppressedState.players[1].stadiumAndToolHaveNoEffectTurnsRemaining=1;
  const suppressedNative=fakeNative({
    actions:[stadiumAction,pass],rejectActionTypes:[],
    onDispatch(action){
      if(action===stadiumAction)throw new GameError('BLOCKED_BY_EFFECT');
    }
  });
  const suppressed=buildNativeActionFrontier({
    state:suppressedState,actorSeat:0,native:suppressedNative
  });
  assert.deepEqual(suppressed.actionFrontier.items.map(item=>item.kind),['pass']);
  assert.equal(suppressed.diagnostics.rejectedCount,1);
});

test('pinned passive Dimension Valley UseStadium rejection preserves other legal actions',()=>{
  const state=fixtureState();
  state.players[0].stadium.cards=[new TrainerCard('Dimension Valley PHF')];
  const stadiumAction={type:'USE_STADIUM_ACTION',clientId:'p0'};
  const pass={type:'PASS_TURN',clientId:'p0'};
  const native=fakeNative({
    actions:[stadiumAction,pass],rejectActionTypes:[],
    onDispatch:action=>{
      if(action===stadiumAction)throw new GameError('CANNOT_USE_STADIUM');
    }
  });
  const built=buildNativeActionFrontier({state,actorSeat:0,native});
  assert.equal(built.diagnostics.rejectedCount,1);
  assert.equal(built.diagnostics.validatedCount,1);
  assert.deepEqual(built.actionFrontier.items.map(item=>item.kind),['pass']);
});

test('pinned Underworld Door excludes deferred no-Bench and no-Energy roots without weakening other abilities',()=>{
  const ability={type:'USE_ABILITY_ACTION',clientId:'p0',name:'Underworld Door',
    target:{player:1,slot:1,index:0}};
  const pass={type:'PASS_TURN',clientId:'p0'};
  const native=fakeNative({actions:[ability,pass],rejectActionTypes:[]});
  native.CardType={PSYCHIC:6};
  native.EnergyType={BASIC:1,SPECIAL:2};
  function createCase({bench,energy,source}){
    const state=fixtureState();
    state.players[0].active=slot(new PokemonCard(source??'Shadow Rider Calyrex VMAX CRE'));
    state.players[0].bench=[slot(bench?new PokemonCard('Shadow Rider Calyrex V CRE'):null)];
    const basic=new EnergyCard('Psychic Energy SVE');
    basic.name='Psychic Energy';
    basic.energyType=native.EnergyType.BASIC;
    basic.provides=[native.CardType.PSYCHIC];
    state.players[0].hand.cards=energy?[basic]:[];
    const seen=[];
    const testNative={...native,Simulator:class extends native.Simulator{
      constructor(seed){
        super(seed);
        const priorDispatch=this.store.dispatch.bind(this.store);
        this.store.dispatch=action=>{
          seen.push(action.type);
          return priorDispatch(action);
        };
      }
    }};
    const before=JSON.stringify(state);
    const result=buildNativeActionFrontier({state,actorSeat:0,native:testNative});
    assert.equal(JSON.stringify(state),before,'live Store must remain unchanged');
    return {result,seen};
  }
  for(const options of [{bench:false,energy:true},{bench:true,energy:false}]){
    const {result,seen}=createCase(options);
    assert.equal(result.diagnostics.preflightRejectedCount,1);
    assert.deepEqual(result.actionFrontier.items.map(item=>item.kind),['pass']);
    assert.deepEqual(seen,['PASS_TURN']);
  }
  const ready=createCase({bench:true,energy:true});
  assert.equal(ready.result.diagnostics.preflightRejectedCount,0);
  assert.deepEqual(ready.result.actionFrontier.items.map(item=>item.kind),['use-ability','pass']);
  assert.deepEqual(ready.seen,['USE_ABILITY_ACTION','PASS_TURN']);
  const unrelated=createCase({bench:false,energy:false,source:'Other Pokemon'});
  assert.equal(unrelated.result.diagnostics.preflightRejectedCount,0);
  assert.equal(unrelated.result.actionFrontier.items[0].kind,'use-ability');
});

test('frontier propagates unknown, impossible, invalid-target, non-allowlisted native GameError and arbitrary Error failures',()=>{
  const cases=[
    {type:'ATTACK_ACTION',message:'UNKNOWN_ATTACK',ErrorType:GameError},
    {type:'USE_ABILITY_ACTION',message:'UNKNOWN_POWER',ErrorType:GameError},
    {type:'USE_STADIUM_ACTION',message:'NO_STADIUM_IN_PLAY',ErrorType:GameError},
    {type:'PLAY_CARD_ACTION',message:'INVALID_TARGET',ErrorType:GameError,family:'SUPPORTER'},
    {type:'PLAY_CARD_ACTION',message:'CANNOT_PLAY_THIS_CARD',ErrorType:GameError,family:'ITEM'},
    {type:'ATTACK_ACTION',message:'NOT_YOUR_TURN',ErrorType:GameError},
    {type:'ATTACK_ACTION',message:GameCoreError.ERROR_SIMULATOR_NOT_STABLE,ErrorType:GameError},
    {type:'ATTACK_ACTION',message:'ARBITRARY_FAILURE',ErrorType:Error}
  ];
  for(const entry of cases){
    const state=fixtureState();
    if(entry.family){
      state.players[0].hand.cards[0].trainerType=
        entry.family==='SUPPORTER'?2:1;
    }
    const action={type:entry.type,clientId:'p0',handIndex:0,name:'Fatal candidate'};
    const pass={type:'PASS_TURN',clientId:'p0'};
    const native=fakeNative({
      actions:[action,pass],rejectActionTypes:[],
      onDispatch(candidate){
        if(candidate===action)throw new entry.ErrorType(entry.message);
      }
    });
    assert.throws(()=>buildNativeActionFrontier({state,actorSeat:0,native}),
      error=>error.message===entry.message);
  }
});

test('frontier preserves typed active, bench, and tool attack sources', () => {
  const sources = [
    {
      sourceKind: 'active-pokemon', sourceSlot: 'ACTIVE', sourceIndex: 0,
      sourceCardName: 'Own Active Pokemon', sourceCardFullName: 'Own Active Pokemon SMP',
      attackName: 'Active Attack'
    },
    {
      sourceKind: 'bench-pokemon', sourceSlot: 'BENCH', sourceIndex: 0,
      sourceCardName: 'Own Bench Pokemon', sourceCardFullName: 'Own Bench Pokemon SMP',
      attackName: 'Bench Attack'
    },
    {
      sourceKind: 'active-tool', sourceSlot: 'ACTIVE_TOOL', sourceIndex: 0,
      sourceCardName: 'Forest Seal Stone', sourceCardFullName: 'Forest Seal Stone SWSH12',
      attackName: 'Tool Attack'
    }
  ];
  const actions = sources.map(source => {
    const action = {
      type: 'ATTACK_ACTION',
      clientId: 'p0',
      name: source.attackName
    };
    Object.defineProperty(action, '__agent3AttackSource', {
      value: Object.freeze({ ...source }),
      writable: false,
      configurable: false,
      enumerable: false
    });
    return action;
  });
  const state = fixtureState();
  const native = fakeNative({ actions, rejectActionTypes: [] });
  const built = buildNativeActionFrontier({ state, actorSeat: 0, native });
  assert.equal(built.diagnostics.enumeratedCount, 3);
  assert.equal(built.diagnostics.validatedCount, 3);
  assert.equal(built.diagnostics.unsupportedCount, 0);
  assert.deepEqual(built.actionFrontier.items.map(item => item.actorPrinting),
    sources.map(source => source.sourceCardFullName));
  assert.deepEqual(built.actionFrontier.items.map(item => item.publicMetadata.attackSource),
    sources);
  protocol.validateFrontier(built.actionFrontier);

  const invalid = structuredClone(built.actionFrontier);
  invalid.items[0].publicMetadata.attackSource.sourceSlot = 'BENCH';
  assert.throws(() => protocol.validateFrontier(invalid),
    error => error.code === 'BAD_ATTACK_SOURCE_METADATA');
});

test('frontier projects Trainer and Energy ability actions from hand and discard', () => {
  const state = fixtureState();
  state.players[0].discard.cards = [new EnergyCard('Discard Energy')];
  const actions = [
    {
      type: 'USE_TRAINER_ABILITY_ACTION',
      clientId: 'p0',
      name: 'Hand Trainer Ability',
      target: { player: 1, slot: 3, index: 0 }
    },
    {
      type: 'USE_ENERGY_ABILITY_ACTION',
      clientId: 'p0',
      name: 'Discard Energy Ability',
      target: { player: 1, slot: 5, index: 0 }
    }
  ];
  const native = fakeNative({ actions, rejectActionTypes: [] });
  const built = buildNativeActionFrontier({ state, actorSeat: 0, native });
  assert.equal(built.diagnostics.validatedCount, 2);
  assert.equal(built.diagnostics.unsupportedCount, 0);
  assert.deepEqual(built.actionFrontier.items.map(item => item.kind),
    ['use-ability', 'use-ability']);
  assert.deepEqual(built.actionFrontier.items.map(item => item.publicMetadata), [
    {
      abilityName: 'Hand Trainer Ability',
      sourceZone: 'hand',
      sourceSeat: 'actor',
      sourceIndex: 0
    },
    {
      abilityName: 'Discard Energy Ability',
      sourceZone: 'discard',
      sourceSeat: 'actor',
      sourceIndex: 0
    }
  ]);
  protocol.validateFrontier(built.actionFrontier);
});


test('a name-spoofed Error is not accepted as a pinned native GameError rejection',()=>{
  const state=fixtureState();
  const spoofed=new Error('NOT_ENOUGH_ENERGY');
  spoofed.name='GameError';
  const action={type:'ATTACK_ACTION',clientId:'p0',name:'Spoofed attack'};
  const native=fakeNative({
    actions:[action],
    rejectActionTypes:[],
    onDispatch(){throw spoofed;}
  });
  assert.throws(()=>buildNativeActionFrontier({state,actorSeat:0,native}),
    error=>error===spoofed);
});


test('pinned five-item exact-print canPlay tri-state rejects only false and delegates true or undefined to native validation',()=>{
  const printings=[
    {name:'Battle VIP Pass',fullName:'Battle VIP Pass FST 225',set:'FST',number:'225'},
    {name:'VS Seeker',fullName:'VS Seeker PHF 109',set:'PHF',number:'109'},
    {name:'Unfair Stamp',fullName:'Unfair Stamp TWM 165',set:'TWM',number:'165'},
    {name:'Field Blower',fullName:'Field Blower GRI 125',set:'GRI',number:'125'},
    {name:'Night Stretcher',fullName:'Night Stretcher SFA 61',set:'SFA',number:'61'}
  ];
  for(const printing of printings){
    for(const predicateResult of [false,true,undefined]){
      const state=fixtureState();
      const item=state.players[0].hand.cards[0];
      Object.assign(item,printing,{setNumber:printing.number,trainerType:1});
      let predicateCalls=0;
      item.canPlay=()=>{predicateCalls++;return predicateResult;};
      const itemAction={type:'PLAY_CARD_ACTION',id:'p0',handIndex:0};
      const pass={type:'PASS_TURN',clientId:'p0'};
      const native=fakeNative({
        actions:[itemAction,pass],rejectActionTypes:[],
        onDispatch:action=>{if(action===itemAction){}}
      });
      const built=buildNativeActionFrontier({state,actorSeat:0,native});
      assert.equal(predicateCalls,1,printing.name+' should use its exact-printing preflight');
      if(predicateResult===false){
        assert.equal(built.diagnostics.preflightRejectedCount,1);
        assert.deepEqual(built.actionFrontier.items.map(item=>item.kind),['pass']);
      }else{
        assert.equal(built.diagnostics.preflightRejectedCount,0);
        assert.deepEqual(built.actionFrontier.items.map(item=>item.kind),['play-card','pass']);
      }
    }
  }
});

test('generic Item canPlay predicates are not promoted into a broad preflight',()=>{
  const state=fixtureState();
  const item=state.players[0].hand.cards[0];
  Object.assign(item,{name:'Generic Item',set:'PHF',number:'109',setNumber:'109',trainerType:1});
  let predicateCalls=0;
  item.canPlay=()=>{predicateCalls++;return false;};
  const itemAction={type:'PLAY_CARD_ACTION',id:'p0',handIndex:0};
  const native=fakeNative({actions:[itemAction,{type:'PASS_TURN',clientId:'p0'}],rejectActionTypes:[]});
  const built=buildNativeActionFrontier({state,actorSeat:0,native});
  assert.equal(predicateCalls,0);
  assert.equal(built.diagnostics.preflightRejectedCount,0);
  assert.deepEqual(built.actionFrontier.items.map(row=>row.kind),['play-card','pass']);
});


test('pinned Underworld Door spent per-Pokemon marker excludes deferred repeated activation',()=>{
  for(const used of [false,true]){
    const state=fixtureState();
    const vmax=new PokemonCard('Shadow Rider Calyrex VMAX CRE');
    vmax.UNDERWORLD_DOOR_MARKER='UNDERWORLD_DOOR_MARKER';
    const psychic=new EnergyCard('Psychic Energy SVE');
    psychic.energyType=1;psychic.provides=[5];
    state.players[0].active=slot(vmax);
    state.players[0].hand.cards=[psychic];
    let markerChecks=0;
    state.players[0].marker={hasMarker(marker,source){
      markerChecks++;
      assert.equal(marker,'UNDERWORLD_DOOR_MARKER');
      assert.equal(source.fullName,'Shadow Rider Calyrex VMAX CRE');
      return used;
    }};
    const native=fakeNative({
      actions:[
        {type:'USE_ABILITY_ACTION',clientId:'p0',name:'Underworld Door',
          target:{player:1,slot:1,index:0}},
        {type:'PASS_TURN',clientId:'p0'}
      ],rejectActionTypes:[]
    });
    native.EnergyType={BASIC:1};
    native.CardType={PSYCHIC:5};
    const result=buildNativeActionFrontier({state,actorSeat:0,native});
    assert.equal(markerChecks,1);
    assert.equal(result.diagnostics.preflightRejectedCount,used?1:0);
    assert.deepEqual(result.actionFrontier.items.map(x=>x.kind),
      used?['pass']:['use-ability','pass']);
  }
});


test('frontier resolves one deferred ability WaitPrompt and rejects a spent VSTAR use',()=>{
  const ability={
    type:'USE_ABILITY_ACTION',clientId:'p0',name:'Star Alchemy',
    target:{player:1,slot:2,index:0}
  };
  let resolved=0;
  const native=fakeNative({
    actions:[ability,{type:'PASS_TURN',clientId:'p0'}],
    rejectActionTypes:[],
    onDispatch(action,validationState){
      if(action.type==='USE_ABILITY_ACTION')
        validationState.prompts.push(new WaitPrompt('spent-vstar-wait'));
      if(action instanceof ResolvePromptAction){
        resolved++;
        throw new GameError('LABEL_VSTAR_USED');
      }
    }
  });
  const built=buildNativeActionFrontier({state:fixtureState(),actorSeat:0,native});
  assert.equal(resolved,1,'the clone must settle exactly the first deferred WaitPrompt');
  assert.equal(built.diagnostics.rejectedCount,1,
    'the deferred native VSTAR rejection must be classified as an illegal ability action');
  assert.equal([...built.actionByToken.values()].some(action=>action===ability),false,
    'a spent VSTAR ability must not enter the worker frontier');
});

test('frontier preserves an unspent ability and stops after its first WaitPrompt',()=>{
  const ability={
    type:'USE_ABILITY_ACTION',clientId:'p0',name:'Star Alchemy',
    target:{player:1,slot:2,index:0}
  };
  let resolved=0;
  const native=fakeNative({
    actions:[ability,{type:'PASS_TURN',clientId:'p0'}],
    rejectActionTypes:[],
    onDispatch(action,validationState){
      if(action.type==='USE_ABILITY_ACTION')
        validationState.prompts.push(new WaitPrompt('unspent-vstar-wait'));
      if(action instanceof ResolvePromptAction){
        resolved++;
        const pending=validationState.prompts.find(prompt=>prompt.id===action.id);
        pending.result=action.result;
        validationState.prompts.push({kind:'ChooseCardsPrompt',result:undefined});
      }
    }
  });
  const built=buildNativeActionFrontier({state:fixtureState(),actorSeat:0,native});
  assert.equal(resolved,1,'the clone must resolve one WaitPrompt and no card-choice prompt');
  assert.equal([...built.actionByToken.values()].some(action=>action===ability),true,
    'the first legal Star Alchemy use must remain available');
});
