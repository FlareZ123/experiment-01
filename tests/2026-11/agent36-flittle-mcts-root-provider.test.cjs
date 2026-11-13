'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const provider=require('../../simulation/twinleaf/2026-11/agent36-flittle-mcts-root-provider.cjs');

const {FLITTLE,PSYCHIC}=provider;
const native={
  GamePhase:{PLAYER_TURN:2},
  EnergyType:{BASIC:0}
};

class EnergyCard {
  constructor(){
    this.fullName=PSYCHIC;
    this.energyType=native.EnergyType.BASIC;
  }
}

class PlayCardAction {
  constructor(handIndex,target){
    this.handIndex=handIndex;
    this.target=target;
  }
}
class AttackAction {
  constructor(name){this.name=name;}
}
class PassTurnAction {}

const PlayerType={BOTTOM_PLAYER:2};
const SlotType={ACTIVE:1};

function makePlayer(seat,{energyCount=1,energyPlayedTurn=2,damage=0}={}) {
  const pokemon={
    fullName:FLITTLE,
    powers:[],
    attacks:[{name:'Ram',text:'',cost:['Psychic'],damage:10}],
    retreat:[]
  };
  const energies=Array.from({length:energyCount},()=>new EnergyCard());
  const active={
    cards:[pokemon,...energies],
    energies:{cards:energies},
    tools:[],
    specialConditions:[],
    damage,
    attacksThisTurn:0,
    getPokemonCard(){return pokemon;}
  };
  return {
    id:seat,
    active,
    bench:[],
    hand:{cards:Array.from({length:4},()=>new EnergyCard())},
    prizes:Array.from({length:6},()=>({cards:[new EnergyCard()]})),
    energyPlayedTurn
  };
}

function publicPokemon(player) {
  const energies=player.active.energies.cards.length;
  return {
    printing:FLITTLE,
    evolutionPrintings:[FLITTLE,...Array(energies).fill(PSYCHIC)],
    energies:Array(energies).fill(PSYCHIC),
    tools:[],
    hp:30,
    damage:player.active.damage,
    specialConditions:[],
    attacks:[{name:'Ram',cost:['Psychic'],damage:10}],
    publicRestrictions:{
      cannotAttackNextTurn:false,
      cannotUseAttacksNextTurn:[],
      blockedAttackNameNextTurn:null,
      blockedAttackNameUntilLeavesActive:null,
      onlyAllowedAttackNameNextTurn:null,
      attackCostIncreaseNextTurn:0,
      attackCostIncreaseWhileActive:0
    }
  };
}

function publicPlayer(player) {
  return {
    active:publicPokemon(player),
    bench:Array(5).fill(null),
    stadium:[],
    discard:[],
    lostZone:[],
    resolvingSupporter:[],
    publicTurnRestrictions:{
      gxUsed:false,
      vstarUsed:false,
      attackLockTurnsRemaining:0,
      attackMaxEnergy:null,
      attackMaxEnergyTurnsRemaining:0,
      ignoreAttackCostCardTypes:[],
      ignoreAttackCostTurnsRemaining:0,
      cannotUseGXAttacks:false,
      pokemonPlayLocked:false,
      abilityPokemonPlayLocked:false,
      evolutionPlayLocked:false,
      itemPlayLocked:false,
      supporterPlayLocked:false,
      stadiumPlayLocked:false,
      toolPlayLocked:false,
      energyPlayLocked:false,
      specialEnergyPlayLocked:false
    },
    handCount:player.hand.cards.length,
    deckCount:53,
    prizeCount:6
  };
}

function makeState({
  activePlayer=0,
  turn=3,
  energyCounts=[1,1],
  energyPlayedTurns=[2,2],
  damage=[0,0]
}={}) {
  const players=[
    makePlayer(0,{
      energyCount:energyCounts[0],
      energyPlayedTurn:energyPlayedTurns[0],
      damage:damage[0]
    }),
    makePlayer(1,{
      energyCount:energyCounts[1],
      energyPlayedTurn:energyPlayedTurns[1],
      damage:damage[1]
    })
  ];
  return {
    players,
    activePlayer,
    turn,
    phase:native.GamePhase.PLAYER_TURN,
    prompts:[],
    rules:{
      attackFirstTurn:false,
      unlimitedEnergyAttachments:false,
      firstTurnDrawCard:true
    }
  };
}

function makeView(state,seat) {
  const own=state.players[seat];
  const opponent=state.players[1-seat];
  return {
    actorSeat:seat,
    globalTurn:state.turn,
    phase:state.phase,
    decisionKind:'owner-root',
    ownHand:own.hand.cards.map(card=>card.fullName),
    ownPublic:publicPlayer(own),
    opponentPublic:publicPlayer(opponent),
    ownTurnResources:{
      energyPlayedTurn:own.energyPlayedTurn,
      energyPlayLocked:false
    },
    ownerK1:provider.knowledgeBySeat(state,seat).ownerK1Snapshot
  };
}

test('root and post-action envelopes are distinct and preserve the native energy-stack projection',()=>{
  const root=makeState();
  assert.equal(provider.assertFlittleRootEnvelope(
    root,0,makeView(root,0),native),true);

  const afterAttach=makeState({
    energyCounts:[2,1],
    energyPlayedTurns:[3,2]
  });
  assert.equal(provider.assertFlittleStateEnvelope(
    afterAttach,0,makeView(afterAttach,0),native),true);
  assert.throws(()=>provider.assertFlittleRootEnvelope(
    afterAttach,0,makeView(afterAttach,0),native));

  const afterRam=makeState({
    activePlayer:1,
    turn:4,
    energyCounts:[1,1],
    energyPlayedTurns:[2,2],
    damage:[0,10]
  });
  assert.equal(provider.assertFlittleStateEnvelope(
    afterRam,1,makeView(afterRam,1),native),true);
  assert.throws(()=>provider.assertFlittleRootEnvelope(
    afterRam,1,makeView(afterRam,1),native));

  const afterPass=makeState({
    activePlayer:1,
    turn:4,
    energyCounts:[1,1],
    energyPlayedTurns:[2,2]
  });
  assert.equal(provider.assertFlittleStateEnvelope(
    afterPass,1,makeView(afterPass,1),native),true);
});

test('root envelope rejects opening-turn and non-fixture states',()=>{
  const opening=makeState({
    turn:2,
    energyPlayedTurns:[1,1]
  });
  assert.throws(()=>provider.assertFlittleRootEnvelope(
    opening,0,makeView(opening,0),native));

  const damaged=makeState({damage:[0,10]});
  assert.throws(()=>provider.assertFlittleRootEnvelope(
    damaged,0,makeView(damaged,0),native));

  const wrongSeat=makeState();
  assert.throws(()=>provider.assertFlittleStateEnvelope(
    wrongSeat,1,makeView(wrongSeat,1),native));
});

test('certified action frontier uses the adapter canonical action keys',()=>{
  const state=makeState();
  const view=makeView(state,0);
  const deps={
    PlayCardAction,AttackAction,PassTurnAction,
    PlayerType,SlotType
  };
  const actions=[
    new PlayCardAction(0,{
      player:PlayerType.BOTTOM_PLAYER,
      slot:SlotType.ACTIVE,
      index:0
    }),
    new AttackAction('Ram'),
    new PassTurnAction()
  ];
  assert.deepEqual(provider.assertFlittleActionFrontier(
    actions,state,0,view,deps
  ),[
    'ATTACK_ACTION:Ram',
    'PASS_TURN',
    'PLAY_CARD_ACTION:0:2:1:0'
  ]);
});

test('native intent translation preserves only the bounded Flittle action vocabulary',()=>{
  const state=makeState();
  const deps={
    EnergyCard,EnergyType:native.EnergyType,
    PlayCardAction,AttackAction,PassTurnAction,
    PlayerType,SlotType
  };
  const attach=new PlayCardAction(0,{
    player:PlayerType.BOTTOM_PLAYER,
    slot:SlotType.ACTIVE,
    index:0
  });
  assert.deepEqual(provider.mapActionToIntent(attach,state,0,deps),{
    kind:'attach-basic-energy',
    handIndex:0,
    slot:'active',
    index:0,
    source:'agent5-flittle-basic-psychic-v1'
  });
  assert.deepEqual(provider.mapActionToIntent(
    new AttackAction('Ram'),state,0,deps
  ),{
    kind:'attack',
    attackName:'Ram',
    source:'agent5-flittle-basic-psychic-v1'
  });
  assert.deepEqual(provider.mapActionToIntent(
    new PassTurnAction(),state,0,deps
  ),{
    kind:'pass',
    reason:'mcts-root-pass',
    source:'agent5-flittle-basic-psychic-v1'
  });
});

test('search dependency builder supplies the exact pinned adapter contract and one shared K1 provider',()=>{
  const sample=()=>({});
  const ledgerProvider=()=>({});
  sample.knowledgeBySeat=ledgerProvider;
  sample.metadataByState=new WeakMap();
  const bindings={
    ActionEnumerator:class ActionEnumerator{},
    Simulator:class Simulator{},
    WaitPrompt:class WaitPrompt{},
    ResolvePromptAction:class ResolvePromptAction{},
    GameError:class GameError{},
    GamePhase:native.GamePhase,
    BotFlipMode:{RANDOM:'random'},
    BotShuffleMode:{RANDOM:'random'},
    PlayCardAction,AttackAction,PassTurnAction,
    PlayerType,SlotType,EnergyCard,EnergyType:native.EnergyType
  };
  const applicability=()=>true;
  const deps=provider.buildFlittleSearchDependencies({
    bindings,
    actorSeat:1,
    ownDecklistId:'candidate-fixture-registered-60',
    simulatorOptions:{flipMode:'random',shuffleMode:'random'},
    sampleDeterminization:sample,
    assertApplicabilityEnvelope:applicability,
    rulesProfileId:'twinleaf-default-rules-flittle-v1-test-pin'
  });
  for(const key of [
    'WaitPrompt','ResolvePromptAction','GameError','PlayCardAction',
    'AttackAction','PassTurnAction','EnergyCard','EnergyType',
    'assertApplicabilityEnvelope','applicabilityEnvelopeId','rulesProfileId'
  ]) assert.ok(deps[key]!==undefined,key+' must be bound');
  assert.equal(deps.sampleDeterminization.knowledgeBySeat,ledgerProvider);
  assert.equal(deps.metadataByState,sample.metadataByState);
  assert.equal(deps.assertApplicabilityEnvelope,applicability);
  assert.equal(deps.applicabilityEnvelopeId,provider.ENVELOPE_ID);
  assert.equal(Object.hasOwn(deps,'knowledgeSnapshot'),false);
  assert.equal(Object.hasOwn(deps,'promptOwnerSeat'),false);
});

test('registered candidate and opponent lists must both equal the exact 60-card fixture',()=>{
  const candidate={id:'candidate-registered',cards:provider.TEST_DECKLIST.cards.slice()};
  const opponent={id:'opponent-registered',cards:provider.TEST_DECKLIST.cards.slice()};
  assert.deepEqual(provider.assertRegisteredFlittleDecklist(candidate,'candidate'),candidate);
  assert.deepEqual(provider.assertRegisteredFlittleDecklist(opponent,'opponent'),opponent);
  assert.throws(()=>provider.assertRegisteredFlittleDecklist({
    id:'wrong-opponent',cards:['Flittle SVI',...Array(58).fill(PSYCHIC),'Quick Ball']
  },'opponent'));
  assert.throws(()=>provider.assertRegisteredFlittleDecklist({
    id:'short-list',cards:provider.TEST_DECKLIST.cards.slice(1)
  },'opponent'));
});

test('pilot budget is explicitly a 250ms one-action dispatch smoke test, not a strategic rollout',()=>{
  assert.equal(provider.PILOT_BUDGET.iterations,16);
  assert.equal(provider.PILOT_BUDGET.maxPlies,1);
  assert.equal(provider.PILOT_BUDGET.maxDecisionMs,250);
  assert.equal(provider.sameBudget(provider.PILOT_BUDGET),true);
  assert.equal(provider.sameBudget({
    ...provider.PILOT_BUDGET,maxDecisionMs:10000
  }),false);
});
