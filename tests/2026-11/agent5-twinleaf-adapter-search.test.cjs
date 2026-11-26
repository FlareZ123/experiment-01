'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const runner=require('../../simulation/evaluation/2026-11/agent36-v3-runner.cjs');
const actionEnumeratorModule=require('../../simulation/evaluation/2026-11/agent3-known-cap-free-action-enumerator.cjs');
const {
  createValidationRandomScope,seededRandom
}=require('../../simulation/evaluation/2026-11/agent49-native-fixture-game.cjs');

const compiledActionEnumerator=path.join(
  __dirname,'../../vendor/twinleaf/ptcg-server/output/advanced-bot/action-enumerator.js'
);
const {
  FLITTLE_ENVELOPE_ID,createTwinleafInformationSetSearch,createTwinleafMcts,
  flittleActionKey,flittleNativeActionToIntent
}=require('../../simulation/twinleaf/2026-11/agent5-twinleaf-mcts-adapter.cjs');
const {observationSha256}=require('../../simulation/twinleaf/2026-11/agent5-information-set-mcts.cjs');
const {createTwinleafTwoSidedSearch,createNativeTwinleafPromptCallbacks}=require('../../simulation/twinleaf/2026-11/agent12-twinleaf-two-sided-search.cjs');

class WaitPrompt {
  constructor(id,playerId,stage=0) {
    this.id=id;this.playerId=playerId;this.stage=stage;this.result=undefined;
  }
}
class ResolvePromptAction {
  constructor(id,result) {this.id=id;this.result=result;}
}
class GameError {
  constructor(message) {this.message=message;}
}
class PlayCardAction {
  constructor(id,handIndex,target) {
    this.type='PLAY_CARD_ACTION';this.id=id;this.handIndex=handIndex;this.target=target;
  }
}
class AttackAction {
  constructor(clientId,name) {this.type='ATTACK_ACTION';this.clientId=clientId;this.name=name;}
}
class PassTurnAction {
  constructor(clientId) {this.type='PASS_TURN';this.clientId=clientId;}
}
class NoopAction {}

class EnergyCard {
  constructor(fullName='Psychic Energy SVE') {
    this.fullName=fullName;this.energyType='BASIC';
  }
}

function clone(value) {return JSON.parse(JSON.stringify(value));}
function endTurn(state,player) {
  state.phase='BETWEEN_TURNS';
  state.prompts.push(new WaitPrompt(500+state.turn,player.id,0));
  return state;
}

function makeHarness(options={}) {
  class ActionEnumerator {
    enumerate(state,player) {
      const actions=[];
      const energyIndex=player.hand.cards.findIndex(
        card=>card.fullName==='Psychic Energy SVE');
      if(energyIndex>=0&&player.energyPlayedTurn<state.turn) {
        actions.push(new PlayCardAction(player.id,energyIndex,{
          player:2,slot:1,index:0
        }));
      }
      // Deliberately legal-ish: raw Ram is emitted even when unpaid or on turn 1.
      actions.push(new AttackAction(player.id,'Ram'));
      actions.push(new PassTurnAction(player.id));
      if(options.includeNoop)actions.push(new NoopAction());
      return actions;
    }
  }
  class Simulator {
    constructor(state) {this.store={state:clone(state)};}
    dispatch(action) {
      const state=this.store.state;
      if(action instanceof ResolvePromptAction) {
        const index=state.prompts.findIndex(prompt=>prompt.id===action.id);
        if(index<0)throw new GameError('missing prompt');
        const prompt=state.prompts[index];
        prompt.result=action.result;
        state.prompts.splice(index,1);
        if(prompt.stage===0) {
          state.activePlayer=1-state.activePlayer;
          state.turn++;
          const next=state.players[state.activePlayer];
          next.active.attacksThisTurn=0;
          if(next.deck.cards.length)next.hand.cards.push(next.deck.cards.pop());
          state.phase='DRAW';
          state.prompts.push(new WaitPrompt(prompt.id+1,next.id,1));
        } else {
          state.phase='PLAYER_TURN';
        }
        return state;
      }
      if(action instanceof PlayCardAction) {
        const player=state.players.find(item=>item.id===action.id);
        if(state.phase!=='PLAYER_TURN'||player.energyPlayedTurn>=state.turn)
          throw new GameError('energy attachment is not legal');
        const card=player.hand.cards[action.handIndex];
        if(!card||card.fullName!=='Psychic Energy SVE')
          throw new GameError('not a Psychic Energy');
        player.hand.cards.splice(action.handIndex,1);
        player.active.cards.push(card);
        player.active.energies.push(card);
        player.energyPlayedTurn=state.turn;
        return state;
      }
      if(action instanceof AttackAction) {
        const player=state.players.find(item=>item.id===action.clientId);
        if(state.phase!=='PLAYER_TURN'||state.turn===1||
           !player.active.energies.some(card=>card.fullName==='Psychic Energy SVE')||
           player.active.attacksThisTurn>0)
          throw new GameError('attack is not legal');
        if(options.unsupportedPromptOnAttack) {
          state.prompts.push({id:901,playerId:player.id,result:undefined,
            constructor:{name:'ChooseCardsPrompt'}});
          return state;
        }
        player.active.damage+=10;
        player.active.attacksThisTurn++;
        return endTurn(state,player);
      }
      if(action instanceof PassTurnAction) {
        const player=state.players.find(item=>item.id===action.clientId);
        return endTurn(state,player);
      }
      if(action instanceof NoopAction)return state;
      throw new Error('unknown action');
    }
  }

  const makePlayer=(id)=> {
    const attached=new EnergyCard();
    return {
      id,
      hand:{cards:[new EnergyCard(),new EnergyCard()]},
      deck:{cards:Array.from({length:20},()=>new EnergyCard())},
      prizes:Array.from({length:6},()=>({cards:[new EnergyCard()],faceUpPrize:false})),
      active:{
        cards:[{fullName:'Flittle SVI'},attached],
        energies:[attached],tools:[],damage:0,specialConditions:[],
        attacksThisTurn:0
      },
      bench:[],stadium:{cards:[]},discard:{cards:[]},lostzone:{cards:[]},
      supporter:{cards:[]},energyPlayedTurn:2
    };
  };
  const state={
    activePlayer:0,turn:3,phase:'PLAYER_TURN',prompts:[],
    rules:{attackFirstTurn:false,unlimitedEnergyAttachments:false,
      firstTurnDrawCard:true},
    players:[makePlayer(11),makePlayer(22)]
  };
  const snapshot=()=>({
    epoch:0,exactMembershipKnown:true,
    knownPrintings:[{printing:'Psychic Energy SVE',copies:6}]
  });
  let ledger=options.knowledge??{
    verified:true,mode:'K1',knownPrizePrintings:[{printing:'Psychic Energy SVE',copies:6}],
    knownTopDeck:[],knownBottomDeck:[],knownBottomDeckOrder:false,
    ownerK1Snapshot:snapshot()
  };
  const metadataByState=new WeakMap();
  const knowledgeBySeat=(source,seat,context={})=>{
    const metadata=metadataByState.get(source);
    if(metadata)return metadata.knowledgeBySeat[seat];
    assert.equal(context.rootSeat,seat,
      'Undeterminized root State cannot expose the opponent private ledger');
    return ledger;
  };
  const sampleDeterminization=(source)=>{
    const sampled=clone(source);
    metadataByState.set(sampled,{
      decklistIds:['flittle','flittle'],knowledgeBySeat:[ledger,ledger]
    });
    return sampled;
  };
  sampleDeterminization.knowledgeBySeat=knowledgeBySeat;
  let metadataRefreshes=0;
  sampleDeterminization.refreshMetadata=(fromState,toState)=>{
    const metadata=metadataByState.get(fromState);
    if(!metadata)return false;
    metadataRefreshes++;
    metadataByState.set(toState,{...metadata,knowledgeBySeat:[ledger,ledger]});
    return true;
  };
  sampleDeterminization.metadataByState=metadataByState;

  function actorObservation(source,seat,{ownerK1Snapshot}) {
    const own=source.players[seat],opponent=source.players[1-seat];
    const publicPlayer=player=>({
      active:{
        printing:'Flittle SVI',
        energies:player.active.energies.map(card=>card.fullName),
        attacks:[{name:'Ram'}],
        specialConditions:[],
        publicRestrictions:{
          cannotAttackNextTurn:false,cannotUseAttacksNextTurn:[],
          blockedAttackNameNextTurn:null,blockedAttackNameUntilLeavesActive:null,
          onlyAllowedAttackNameNextTurn:null
        }
      },
      bench:[],stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
      publicTurnRestrictions:{
        attackLockTurnsRemaining:0,attackMaxEnergy:null,
        energyPlayLocked:false
      },
      handCount:player.hand.cards.length,deckCount:player.deck.cards.length,
      prizeCount:player.prizes.reduce((sum,slot)=>sum+slot.cards.length,0)
    });
    return {
      actorSeat:seat,globalTurn:source.turn,phase:source.phase,
      decisionKind:'owner-root',
      ownHand:own.hand.cards.map(card=>card.fullName),
      ownPublic:publicPlayer(own),opponentPublic:publicPlayer(opponent),
      ownTurnResources:{energyPlayedTurn:own.energyPlayedTurn,energyPlayLocked:false},
      ownerK1:ownerK1Snapshot
    };
  }
  const assertApplicabilityEnvelope=(source)=>{
    assert.equal(source.phase,'PLAYER_TURN');
    assert.ok(source.turn>=1);
    assert.equal(source.rules.attackFirstTurn,false);
    assert.equal(source.rules.unlimitedEnergyAttachments,false);
    assert.equal(source.rules.firstTurnDrawCard,true);
    for(const player of source.players) {
      assert.equal(player.active.cards[0].fullName,'Flittle SVI');
      assert.ok(player.active.energies.length<=2);
      assert.ok(player.active.damage<=20);
      assert.deepEqual(player.active.specialConditions,[]);
      assert.deepEqual(player.active.tools,[]);
      assert.deepEqual(player.bench,[]);
    }
    return true;
  };
  const deps={
    ActionEnumerator,Simulator,WaitPrompt,ResolvePromptAction,GameError,
    actorObservation,GamePhase:{PLAYER_TURN:'PLAYER_TURN',FINISHED:'FINISHED'},
    BotFlipMode:{RANDOM:'random'},BotShuffleMode:{RANDOM:'random'},
    simulatorOptions:{flipMode:'random',shuffleMode:'random'},
    sampleDeterminization,evaluateObservation:()=>0,winnerSeat:()=>null,
    PlayCardAction,AttackAction,PassTurnAction,PlayerType:{BOTTOM_PLAYER:2},
    SlotType:{ACTIVE:1},EnergyCard,EnergyType:{BASIC:'BASIC'},
    knowledgeBySeat,metadataByState,ownDecklistSeat:0,ownDecklistId:'flittle',
    applicabilityEnvelopeId:FLITTLE_ENVELOPE_ID,
    assertApplicabilityEnvelope,rulesProfileId:'twinleaf-standard-flittle-v1'
  };
  if(options.actionKey)deps.actionKey=options.actionKey;
  if(options.expectedActionKeys)deps.expectedActionKeys=options.expectedActionKeys;
  if(options.assertApplicabilityEnvelope)
    deps.assertApplicabilityEnvelope=options.assertApplicabilityEnvelope;
  return {
    deps,state,knowledgeBySeat,setLedger:value=>{ledger=value;},metadataByState,
    get metadataRefreshes(){return metadataRefreshes;}
  };
}

test('bounded native MCTS filters the frontier, resolves only neutral WaitPrompts and audits its budget',()=>{
  let time=0;
  const h=makeHarness();
  const mcts=createTwinleafMcts(h.deps,{
    iterations:8,maxPlies:4,maxDecisionMs:250,seed:9,now:()=>time+=0.01
  });
  const result=mcts.search(h.state,0);
  assert.equal(result.audit.rootActionCount,3);
  assert.equal(result.audit.frontierComplete,true);
  assert.equal(result.audit.bothSeatKnowledgeLedgersVerified,true);
  assert.equal(result.audit.rootLedgerPreserved,true);
  assert.equal(result.audit.ownerLedgerInInformationSetKey,true);
  assert.equal(result.audit.promptResolutionActorScoped,true);
  assert.equal(result.audit.applicabilityEnvelopeId,FLITTLE_ENVELOPE_ID);
  assert.equal(result.audit.iterations,8);
  assert.equal(result.audit.completedIterations,8);
  assert.equal(result.audit.maxPlies,4);
  assert.equal(result.audit.cPuct,1.4);
  assert.equal(result.audit.timeoutStatus,'completed');
  assert.equal(result.audit.seed,9);
  assert.ok(result.audit.elapsedMs>=0&&result.audit.elapsedMs<250);
  assert.ok(result.audit.maxActionTransitions<=4);
  assert.deepEqual(result.audit.seatActionTransitions.length,2);
  assert.equal(result.audit.rolloutPaths.length,8);
  assert.ok(result.audit.rolloutPaths.some(path=>
    path.actions.some(action=>action.seat===1)),
    'four-ply rollouts must actually traverse the opponent seat');
  assert.ok(result.audit.waitPromptResolutions>0);
  assert.ok(h.metadataRefreshes>0,
    'Sampled-state transitions must refresh per-seat private ledgers');
});

test('native Simulator filter rejects unpaid turn-one Ram and no-op candidates',()=>{
  const actionKey=action=>{
    if(action instanceof PlayCardAction)return flittleActionKey(action,{
      PlayCardAction,AttackAction,PassTurnAction
    });
    if(action instanceof AttackAction)return 'ATTACK_ACTION:'+action.name;
    if(action instanceof PassTurnAction)return 'PASS_TURN';
    return 'NOOP';
  };
  const h=makeHarness({
    includeNoop:true,
    actionKey,
    assertApplicabilityEnvelope:()=>true
  });
  h.state.turn=1;
  h.state.players[0].active.energies=[];
  h.state.players[1].active.energies=[];
  h.state.players[0].active.cards=[{fullName:'Flittle SVI'}];
  h.state.players[1].active.cards=[{fullName:'Flittle SVI'}];
  h.state.players[0].hand.cards=[];
  h.state.players[1].hand.cards=[];
  h.state.players[0].energyPlayedTurn=1;
  h.state.players[1].energyPlayedTurn=1;
  const adapter=createTwinleafInformationSetSearch(h.deps);
  const actions=adapter.enumerateActions(h.state,0,{rootSeat:0});
  assert.deepEqual(actions.map(actionKey),['PASS_TURN']);
});

test('unsupported card-effect prompts abort instead of reaching a policy resolver',()=>{
  const h=makeHarness({unsupportedPromptOnAttack:true});
  const mcts=createTwinleafMcts(h.deps,{
    iterations:1,maxPlies:2,maxDecisionMs:250,seed:9
  });
  assert.throws(()=>mcts.search(h.state,0),error=>
    error.code==='MCTS_UNSUPPORTED_PROMPT');
});

test('full owner ledger changes produce distinct actor information-set hashes',()=>{
  const h=makeHarness();
  const adapter=createTwinleafInformationSetSearch(h.deps);
  const first=observationSha256(adapter.observe(h.state,0,{rootSeat:0}));
  const nextLedger={
    ...h.deps.knowledgeBySeat(h.state,0,{rootSeat:0}),
    ownerK1Snapshot:{
      epoch:1,exactMembershipKnown:true,
      knownPrintings:[{printing:'Psychic Energy SVE',copies:6}]
    }
  };
  h.setLedger(nextLedger);
  const second=observationSha256(adapter.observe(h.state,0,{rootSeat:0}));
  assert.notEqual(first,second,'K1 epoch must be part of the information-set key');
});

test('known top-deck and bottom-deck knowledge also participates in the node key',()=>{
  const h=makeHarness({knowledge:{
    verified:true,mode:'PARTIAL',knownTopDeck:['Psychic Energy SVE'],
    knownBottomDeck:['Psychic Energy SVE'],knownBottomDeckOrder:false,
    knownPrizePrintings:[],ownerK1Snapshot:null
  }});
  const adapter=createTwinleafInformationSetSearch(h.deps);
  const first=observationSha256(adapter.observe(h.state,0,{rootSeat:0}));
  h.setLedger({
    verified:true,mode:'PARTIAL',knownTopDeck:['Psychic Energy SVE','Psychic Energy SVE'],
    knownBottomDeck:['Psychic Energy SVE'],knownBottomDeckOrder:false,
    knownPrizePrintings:[],ownerK1Snapshot:null
  });
  const second=observationSha256(adapter.observe(h.state,0,{rootSeat:0}));
  assert.notEqual(first,second,'known top-deck prefix must be part of the information-set key');
});

test('the native action translator emits only the bounded neutral intent vocabulary',()=>{
  const h=makeHarness();
  const attach=new PlayCardAction(11,0,{player:2,slot:1,index:0});
  assert.deepEqual(flittleNativeActionToIntent(attach,h.state,0,h.deps),{
    kind:'attach-basic-energy',handIndex:0,slot:'active',index:0,
    source:'agent5-flittle-basic-psychic-v1'
  });
  assert.deepEqual(flittleNativeActionToIntent(new AttackAction(11,'Ram'),h.state,0,h.deps),{
    kind:'attack',attackName:'Ram',source:'agent5-flittle-basic-psychic-v1'
  });
  assert.deepEqual(flittleNativeActionToIntent(new PassTurnAction(11),h.state,0,h.deps),{
    kind:'pass',reason:'mcts-root-pass',source:'agent5-flittle-basic-psychic-v1'
  });
});

test('monotonic decision deadline aborts without returning a partial selection',()=>{
  let time=0;
  const h=makeHarness();
  const mcts=createTwinleafMcts(h.deps,{
    iterations:2,maxPlies:4,maxDecisionMs:20,seed:9,now:()=>time+=10
  });
  assert.throws(()=>mcts.search(h.state,0),error=>
    error.code==='MCTS_BUDGET_EXCEEDED');
});

test('Twinleaf adapter forwards a fixed actor-observation opponent policy into the core',()=>{
  let time=0;
  const h=makeHarness();
  const policyCalls=[];
  const mcts=createTwinleafMcts(h.deps,{
    iterations:8,maxPlies:2,maxDecisionMs:250,seed:9,now:()=>time+=0.01,
    opponentPolicyId:'test-fixed-opponent-v1',
    opponentActionPolicy:(observation,actionKeys,seat,random,context)=>{
      assert.equal(context,undefined,
        'The adapter must not expose live timing/deadline context to an opponent policy');
      assert.equal(typeof random,'function');
      assert.equal(observation.actorSeat,seat);
      assert.deepEqual(actionKeys,[...actionKeys].sort());
      assert.equal(Object.hasOwn(observation,'nativeState'),false);
      policyCalls.push({seat,actionKeys});
      return actionKeys.includes('PASS_TURN')?'PASS_TURN':actionKeys[0];
    }
  });
  const result=mcts.search(h.state,0);
  assert.equal(result.audit.opponentModel,'fixed-actor-observation-policy');
  assert.equal(result.audit.opponentPolicyId,'test-fixed-opponent-v1');
  assert.equal(result.audit.opponentPolicyRngProtocol,'mcts-opponent-policy-rng-v2');
  assert.equal(result.audit.opponentPolicyContextProtocol,'no-context-v1');
  assert.ok(result.audit.opponentPolicyCalls>0);
  assert.equal(result.audit.opponentPolicyCalls,policyCalls.length);
  assert.ok(result.audit.opponentInformationSetCount>0);
  assert.ok(policyCalls.every(call=>call.seat===1&&call.actionKeys.includes('PASS_TURN')));
  assert.ok(result.audit.seatActionTransitions[1]>0);
});


const GENERIC_SEARCH_ENGINE_PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

function cloneNativeTestValue(value,seen=new WeakMap()) {
  if(Array.isArray(value)) {
    if(seen.has(value))return seen.get(value);
    const clone=[];
    seen.set(value,clone);
    for(const item of value)clone.push(cloneNativeTestValue(item,seen));
    return clone;
  }
  if(!value||typeof value!=='object')return value;
  if(seen.has(value))return seen.get(value);
  const clone=Object.create(Object.getPrototypeOf(value));
  seen.set(value,clone);
  for(const key of Object.keys(value))clone[key]=cloneNativeTestValue(value[key],seen);
  return clone;
}

function makeGenericTwoSidedSearchHarness() {
  class ResolvePromptAction {
    constructor(id,result) {
      this.type='RESOLVE_PROMPT';
      this.id=id;
      this.result=result;
    }
  }
  class CoinFlipPrompt {
    constructor(id,playerId) {
      this.id=id;this.playerId=playerId;this.result=undefined;
    }
    getPerspectivePlayerId(){return this.playerId;}
  }
  class Simulator {
    constructor(state) {
      this.store={state:cloneNativeTestValue(state)};
      this.store.dispatch=action=>this.dispatch(action);
    }
    dispatch(action) {
      const state=this.store.state;
      if(action.type==='PASS_TURN') {
        const seat=state.activePlayer;
        assert.equal(action.clientId,state.players[seat].id);
        state.activePlayer=1-seat;
        state.turn++;
        if(state.triggerCoinFlip===true&&!state.coinFlipTriggered) {
          state.coinFlipTriggered=true;
          state.prompts.push(new CoinFlipPrompt(99,state.players[state.activePlayer].id));
        }
        return state;
      }
      if(action.type==='RESOLVE_PROMPT') {
        const index=state.prompts.findIndex(prompt=>prompt.id===action.id);
        assert.notEqual(index,-1);
        const prompt=state.prompts[index];
        prompt.result=action.result;
        state.prompts.splice(index,1);
        state.choice=action.result;
        if(prompt.constructor.name==='CoinFlipPrompt')state.coinFlipResult=action.result;
        state.activePlayer=state.players.findIndex(player=>
          player.id===prompt.playerId);
        return state;
      }
      throw new Error('Unexpected native action: '+action.type);
    }
  }
  const enumerator={
    enumerate(state,player) {
      return [{type:'PASS_TURN',clientId:player.id}];
    }
  };
  Object.defineProperty(enumerator,'__agent3UncappedAdapter',{
    value:Object.freeze({
      schema:'agent3-known-cap-free-action-enumerator-v1',
      enginePin:GENERIC_SEARCH_ENGINE_PIN,
      removedPerFamilyCap:8,
      includesAttachedToolPowers:true,
      includesToolAndBenchAttacks:true,
      includesHandAbilities:true,
      includesTrainerEnergyDiscardAbilities:true
    }),
    writable:false,configurable:false,enumerable:false
  });
  const native={
    Simulator,
    ActionEnumerator:class ActionEnumerator{},
    ResolvePromptAction,
    CoinFlipPrompt,
    GamePhase:{FINISHED:'FINISHED'}
  };
  const ledger={
    verified:true,mode:'K1',
    ownerK1Snapshot:{
      epoch:0,exactMembershipKnown:true,knownPrintings:[],
      invalidationReason:null
    }
  };
  const metadataByState=new WeakMap();
  const redeterminize=(state,seat,random)=>{
    const sampled={...cloneNativeTestValue(state),hiddenDraw:random()};
    metadataByState.set(sampled,{
      knowledgeBySeat:[ledger,ledger],decklistIds:['deck-0','deck-1']
    });
    return sampled;
  };
  redeterminize.metadataByState=metadataByState;
  redeterminize.knowledgeBySeat=(state,seat,context={})=>{
    const metadata=metadataByState.get(state);
    if(metadata)return metadata.knowledgeBySeat[seat];
    assert.equal(context.rootSeat,seat);
    return ledger;
  };
  redeterminize.refreshMetadata=(fromState,toState)=>{
    const metadata=metadataByState.get(fromState);
    if(!metadata)return false;
    metadataByState.set(toState,metadata);
    return true;
  };
  const deps={
    native,
    enginePin:GENERIC_SEARCH_ENGINE_PIN,
    enumerator,
    simulatorOptions:{},
    rulesProfileId:'twinleaf-standard-generic-search-test-v1',
    ownDecklistSeat:0,
    ownDecklistId:'deck-0',
    redeterminize,
    actorObservation:(state,seat,{ownerK1Snapshot})=>({
      actorSeat:seat,turn:state.turn,phase:state.phase,
      choice:state.choice??null,ownerK1:ownerK1Snapshot
    }),
    projectPrompt:(state,prompt,seat)=>({
      type:'choice',
      options:['left','right']
    }),
    enumeratePromptChoices:()=>[
      {key:'left',label:'Choose left',result:'left'},
      {key:'right',label:'Choose right',result:'right'}
    ],
    isAutomaticPrompt:prompt=>prompt.kind==='automatic',
    resolveAutomaticPrompt:()=>null,
    terminalValues:state=>{
      if(state.winner===0)return [1,0];
      if(state.winner===1)return [0,1];
      if(state.terminalClass==='adjudicated-draw')return [0,0];
      throw new Error('Terminal state lacks an explicit adjudication class');
    },
    evaluateObservationValues:()=>[0.5,0.5]
  };
  return {
    deps,
    state:{
      activePlayer:0,turn:1,phase:'PLAYER_TURN',prompts:[],
      players:[{id:'seat-0',bench:[]},{id:'seat-1',bench:[]}],winner:null
    }
  };
}

test('generic Twinleaf search uses the uncapped native frontier and searches both physical seats',()=>{
  const harness=makeGenericTwoSidedSearchHarness();
  const search=createTwinleafTwoSidedSearch(harness.deps,{
    iterations:12,maxPlies:3,seed:20261128
  });
  const result=search.search(harness.state,0);
  assert.equal(result.action.kind,'pass');
  assert.equal(result.audit.valueMode,'seat-win-probability');
  assert.equal(result.audit.objectiveProtocol,
    'each-seat-maximizes-own-win-probability-adjudicated-draws-zero-v1');
  assert.equal(result.audit.twinleafAdapter.enginePin,GENERIC_SEARCH_ENGINE_PIN);
  assert.equal(result.audit.twinleafAdapter.rulesProfileId,
    'twinleaf-standard-generic-search-test-v1');
  assert.equal(result.audit.twinleafAdapter.candidateDecklistId,'deck-0');
  assert.equal(result.audit.twinleafAdapter.candidateSeat,0);
  assert.equal(result.audit.twinleafAdapter.maxNativeFrontier,256);
  assert.ok(result.audit.twinleafAdapter.nativeFrontiers>1);
  assert.equal(result.audit.twinleafAdapter.unsupportedNativeActions,0);
  assert.equal(result.audit.twinleafAdapter.truncatedNativeFrontiers,0);
  assert.ok(result.audit.seatActionTransitions[0]>0);
  assert.ok(result.audit.seatActionTransitions[1]>0);
});

test('generic Twinleaf search treats actor-owned prompts as search decisions',()=>{
  const harness=makeGenericTwoSidedSearchHarness();
  harness.deps.ownDecklistSeat=1;
  harness.deps.ownDecklistId='deck-1';
  harness.state.prompts=[{
    id:71,playerId:'seat-1',kind:'choice',result:undefined
  }];
  const search=createTwinleafTwoSidedSearch(harness.deps,{
    iterations:4,maxPlies:1,seed:20261129
  });
  const result=search.search(harness.state,1);
  assert.equal(result.action.kind,'prompt');
  assert.equal(result.action.promptType,'choice');
  assert.ok(['left','right'].includes(result.action.choiceKey));
  assert.equal(result.audit.twinleafAdapter.promptFrontiers,5);
  assert.equal(result.audit.twinleafAdapter.promptTransitions,4);
  assert.equal(result.audit.twinleafAdapter.nativeFrontiers,0);
});


test('native prompt projection and host-only resolver plug into the generic search adapter',()=>{
  class ConfirmPrompt {
    constructor(id,playerId) {
      this.id=id;this.playerId=playerId;this.result=undefined;
      this.message='GO_FIRST';this.options={};
    }
    getPerspectivePlayerId(){return this.playerId;}
    decode(value){return value;}
    validate(value){return typeof value==='boolean';}
  }
  const harness=makeGenericTwoSidedSearchHarness();
  harness.deps.ownDecklistSeat=1;
  harness.deps.ownDecklistId='deck-1';
  delete harness.deps.enumeratePromptChoices;
  Object.assign(harness.deps,createNativeTwinleafPromptCallbacks({
    native:harness.deps.native,
    mode:'synthetic-search-node'
  }));
  harness.state.phase=1;
  harness.state.prompts=[new ConfirmPrompt(81,'seat-1')];
  const search=createTwinleafTwoSidedSearch(harness.deps,{
    iterations:4,maxPlies:1,seed:20261130
  });
  const result=search.search(harness.state,1);
  assert.equal(result.action.kind,'prompt');
  assert.equal(result.action.promptType,'ConfirmPrompt');
  assert.ok(['prompt-0','prompt-1'].includes(result.action.choiceKey));
  assert.equal(result.audit.twinleafAdapter.promptTransitions,4);
  assert.equal(result.audit.twinleafAdapter.promptFrontiers,5);
  assert.equal(result.audit.twinleafAdapter.candidateDecklistId,'deck-1');
  assert.equal(result.audit.twinleafAdapter.candidateSeat,1);
});

test('native host-only coin-flip prompts are resolved by the explicit physical RNG callback',()=>{
  const harness=makeGenericTwoSidedSearchHarness();
  Object.assign(harness.deps,createNativeTwinleafPromptCallbacks({
    native:harness.deps.native,
    mode:'synthetic-search-node'
  }));
  harness.state.triggerCoinFlip=true;
  const search=createTwinleafTwoSidedSearch(harness.deps,{
    iterations:4,maxPlies:1,seed:20261131
  });
  const result=search.search(harness.state,0);
  assert.equal(result.action.kind,'pass');
  assert.equal(result.audit.twinleafAdapter.nativeTransitions,4);
  assert.equal(result.audit.twinleafAdapter.automaticPromptResolutions,4);
});


test('card-effect prompt provenance maps its source into the exact projected cloned Store',()=>{
  class ChooseCardsPrompt {
    constructor(id,playerId,cards) {
      this.id=id;this.playerId=playerId;this.cards=cards;
      this.options={min:1,max:1,blocked:[],allowCancel:false,isSecret:true};
      this.result=undefined;
    }
    getPerspectivePlayerId(){return this.playerId;}
    decode(result){return result===null?null:result.map(index=>this.cards.cards[index]);}
    validate(decoded) {
      return decoded===null?false:
        decoded.length===1&&decoded.every(card=>this.cards.cards.includes(card));
    }
  }
  const harness=makeGenericTwoSidedSearchHarness();
  harness.deps.ownDecklistSeat=1;
  harness.deps.ownDecklistId='deck-1';
  const sourceCard={fullName:'Quick Ball',name:'Quick Ball',set:'SWSH',setNumber:'179'};
  harness.state.players[1].discard={cards:[]};
  harness.state.players[1].deck={cards:[]};
  harness.state.players[1].discard.cards.push(sourceCard);
  harness.state.players[1].deck.cards.push(
    {fullName:'Deck Card A',name:'Deck Card A'},
    {fullName:'Deck Card B',name:'Deck Card B'}
  );
  const prompt=new ChooseCardsPrompt(82,'seat-1',harness.state.players[1].deck);
  harness.state.prompts=[prompt];
  delete harness.deps.enumeratePromptChoices;
  Object.assign(harness.deps,createNativeTwinleafPromptCallbacks({
    native:harness.deps.native,
    mode:'synthetic-search-node',
    provenanceForPrompt:(state,currentPrompt)=>currentPrompt.id===82?(()=>{
      const currentSourceCard=state.players[1].discard.cards.find(card=>
        card.fullName==='Quick Ball');
      assert.ok(currentSourceCard,
        'sampled state must preserve the public Quick Ball source in the actor discard');
      return {
        sourceKind:'card-effect',sourceCard:currentSourceCard,
        effectName:'Quick Ball',effectType:'ItemEffect'
      };
    })():null,
    mapSourceCard:(_state,clonedState,sourceCard,actorSeat)=>{
      const owner=clonedState.players[actorSeat];
      const matches=owner.discard.cards.filter(card=>card.id===sourceCard.id);
      assert.equal(matches.length,1,'cloned prompt Store must preserve the exact public source-card instance');
      return matches[0];
    }
  }));
  const search=createTwinleafTwoSidedSearch(harness.deps,{
    iterations:4,maxPlies:1,seed:20261202
  });
  const result=search.search(harness.state,1);
  assert.equal(result.action.kind,'prompt');
  assert.equal(result.action.promptType,'ChooseCardsPrompt');
  assert.ok(['prompt-0','prompt-1'].includes(result.action.choiceKey));
  assert.equal(result.audit.twinleafAdapter.promptTransitions,4);
});


const NATIVE_PROMPT_DDE='Double Dragon Energy ROS';
const NATIVE_PROMPT_REGIDRAGO='Regidrago V SIT';
const NATIVE_PROMPT_KECLEON='Kecleon PLF';
const NATIVE_PROMPT_DEDENNE='Dedenne GX UNB';
const NATIVE_PROMPT_TAPU_LELE='Tapu Lele-GX GRI';

function makeNativePromptPokemonList(native,card=null) {
  const list=new native.PokemonCardList();
  list.cards=card?[card]:[];
  list.hp=card?.hp??0;
  list.damage=0;
  list.energies.cards=[];
  list.tools=[];
  list.specialConditions=[];
  return list;
}

function makeNativePromptPlayer(native,id,activeCard,cloneCard) {
  const player=new native.Player();
  player.id=id;
  player.active=makeNativePromptPokemonList(native,activeCard);
  player.bench=Array.from({length:5},()=>makeNativePromptPokemonList(native));
  player.prizes=Array.from({length:6},()=>{
    const prize=new native.CardList();
    prize.cards=[cloneCard(NATIVE_PROMPT_REGIDRAGO)];
    return prize;
  });
  player.deck.cards=Array.from({length:30},()=>cloneCard(NATIVE_PROMPT_REGIDRAGO));
  player.hand.cards=[];
  player.discard.cards=[];
  player.stadium.cards=[];
  player.lostzone.cards=[];
  player.supporter.cards=[];
  player.playableCardIds=[];
  player.playableHandAbilityCardIds=[];
  player.energyPlayedTurn=0;
  player.supporterTurn=0;
  player.canEvolve=false;
  player.stadiumAndToolHaveNoEffectTurnsRemaining=0;
  return player;
}

test('pinned Twinleaf MCTS settles Switch ChoosePokemonPrompt on its registering Store before searching the stable successor in both physical seats',{
  skip:!fs.existsSync(compiledActionEnumerator),
  timeout:30000
},()=>{
  const enginePin=runner.V3_FIXTURE.engineCommit;
  const native=runner.loadNativeRoleDependencies({enginePin});
  const manager=native.CardManager.getInstance();
  let nextCardId=980000;

  for(const kecleonSeat of [0,1]) {
    const switcherSeat=1-kecleonSeat;
    const withValidationRandom=createValidationRandomScope({
      ambientRandom:Math.random,
      physicalRandom:seededRandom(0x420000+kecleonSeat)
    });
    function cloneCard(fullName) {
      const card=manager.getCardByName(fullName);
      assert.ok(card,'CardManager must resolve '+fullName);
      card.id=nextCardId++;
      return card;
    }

    const candidate=makeNativePromptPlayer(
      native,kecleonSeat,cloneCard(NATIVE_PROMPT_KECLEON),cloneCard);
    candidate.bench[0]=makeNativePromptPokemonList(
      native,cloneCard(NATIVE_PROMPT_DEDENNE));
    candidate.bench[1]=makeNativePromptPokemonList(
      native,cloneCard(NATIVE_PROMPT_TAPU_LELE));
    const dde=cloneCard(NATIVE_PROMPT_DDE);
    candidate.hand.cards=[dde];
    candidate.playableCardIds=[dde.id];

    const switcher=makeNativePromptPlayer(
      native,switcherSeat,cloneCard(NATIVE_PROMPT_REGIDRAGO),cloneCard);
    switcher.bench[0]=makeNativePromptPokemonList(
      native,cloneCard(NATIVE_PROMPT_DEDENNE));
    const switchCard=cloneCard('Switch BLW');
    switcher.hand.cards=[switchCard];
    switcher.playableCardIds=[switchCard.id];

    const initialState=new native.State();
    initialState.players=kecleonSeat===0?[candidate,switcher]:[switcher,candidate];
    initialState.activePlayer=kecleonSeat;
    initialState.phase=native.GamePhase.PLAYER_TURN;
    initialState.turn=3;
    initialState.prompts=[];
    initialState.gameSettings.format=native.Format.EXPANDED;
    initialState.gameSettings.sandboxMode=false;

    const store=withValidationRandom(()=>new native.Simulator(initialState)).store;
    const owner=store.state.players[kecleonSeat];
    const ddeId=owner.hand.cards[0].id;
    const enumerator=actionEnumeratorModule.createKnownCapFreeActionEnumerator({
      native,enginePin
    });
    const attachAction=enumerator.attachEnergyActions(store.state,owner).find(action=>
      action.target.slot===native.SlotType.ACTIVE);
    assert.ok(attachAction,'DDE must attach to the Active Kecleon while Regidrago is Active');
    withValidationRandom(()=>store.dispatch(attachAction));
    withValidationRandom(()=>store.dispatch(new native.gameActions.PassTurnAction(owner.id)));
    let waitPromptCount=0;
    while(true) {
      const waitPrompt=store.state.prompts.find(prompt=>prompt.result===undefined);
      if(!waitPrompt)break;
      assert.equal(waitPrompt.constructor.name,'WaitPrompt');
      withValidationRandom(()=>store.dispatch(
        new native.ResolvePromptAction(waitPrompt.id,null)));
      waitPromptCount++;
      assert.ok(waitPromptCount<=4,'fixture setup must settle bounded WaitPrompts');
    }

    const rootState=store.state;
    assert.equal(rootState.activePlayer,switcherSeat);
    assert.equal(rootState.phase,native.GamePhase.PLAYER_TURN);
    const switcherAtRoot=rootState.players[switcherSeat];
    const switchIndex=switcherAtRoot.hand.cards.findIndex(card=>
      card.fullName==='Switch BLW');
    assert.ok(switchIndex>=0,'Switcher must hold Switch at the search root');
    switcherAtRoot.playableCardIds=[switcherAtRoot.hand.cards[switchIndex].id];
    const nativeActions=enumerator.enumerate(rootState,switcherAtRoot);
    assert.ok(nativeActions.some(action=>
      action.type==='PLAY_CARD_ACTION' &&
      rootState.players[switcherSeat].hand.cards[action.handIndex]?.fullName==='Switch BLW'),
    'the uncapped native frontier must include Switch');

    const metadataByState=new WeakMap();
    const decklistIds=[];
    decklistIds[kecleonSeat]='kecleon-deck';
    decklistIds[switcherSeat]='switcher-deck';
    metadataByState.set(rootState,{decklistIds});
    const refreshMetadata=(fromState,toState)=>{
      const metadata=metadataByState.get(fromState);
      if(!metadata)return false;
      metadataByState.set(toState,metadata);
      return true;
    };
    const knowledgeBySeat=()=>({
      verified:true,mode:'K0',ownerK1Snapshot:null
    });
    const redeterminize=(state)=>{
      const sampled=withValidationRandom(()=>new native.Simulator(state)).store.state;
      const metadata=metadataByState.get(state);
      if(metadata)metadataByState.set(sampled,metadata);
      return sampled;
    };

    let promptCalls=0;
    let sawSettledSuccessor=false;
    const promptCallbacks=createNativeTwinleafPromptCallbacks({
      native,
      promptSubPolicyId:'switch-bench-choice-test-v1',
      withValidationRandom,
      provenanceForPrompt:(state,prompt,actorSeat)=>{
        if(actorSeat!==0&&actorSeat!==1)return null;
        const zones=[
          ...(state.players[actorSeat].discard?.cards??[]),
          ...(state.players[actorSeat].hand?.cards??[])
        ];
        const sourceCard=zones.find(card=>card.fullName==='Switch BLW');
        assert.ok(sourceCard,'Switch source must remain in an actor-visible zone while its prompt is pending');
        return {sourceKind:'card-effect',sourceCard,effectName:'Switch'};
      },
      decidePrompt:({actorSeat,actorView,promptProjection})=>{
        promptCalls++;
        assert.equal(actorSeat,switcherSeat);
        assert.equal(actorView.actorSeat,switcherSeat);
        const choice=promptProjection.choices.find(item=>
          item.printing===NATIVE_PROMPT_DEDENNE);
        assert.ok(choice,'Switch prompt projection must expose the actor-owned Bench Dedenne');
        return {kind:'select-choice',token:choice.token};
      }
    });

    const actorObservation=(state,seat,{ownerK1Snapshot})=>{
      const ddeDiscarded=state.players[kecleonSeat].discard.cards.some(card=>
        card.id===ddeId);
      if(ddeDiscarded) {
        assert.equal(state.prompts.filter(prompt=>prompt.result===undefined).length,0,
          'MCTS must not observe an unresolved continuation');
        assert.ok(state.players[switcherSeat].active.cards.some(card=>
          card.fullName===NATIVE_PROMPT_DEDENNE),
        'Switch continuation must promote Dedenne before the successor enters search');
        sawSettledSuccessor=true;
      }
      return {
        actorSeat:seat,
        turn:state.turn,
        phase:state.phase,
        ownerK1:ownerK1Snapshot??null,
        ownHand:state.players[seat].hand.cards.map(card=>card.fullName),
        publicActives:state.players.map(player=>
          player.active.cards.map(card=>card.fullName)),
        publicBenches:state.players.map(player=>
          player.bench.map(slot=>slot.cards.map(card=>card.fullName)))
      };
    };

    const search=createTwinleafTwoSidedSearch({
      ...promptCallbacks,
      native,
      enginePin,
      rulesProfileId:'pinned-paper-expanded-switch-prompt-test-v1',
      enumerator,
      simulatorOptions:{},
      ownDecklistSeat:switcherSeat,
      ownDecklistId:'switcher-deck',
      metadataByState,
      refreshMetadata,
      knowledgeBySeat,
      redeterminize,
      actorObservation,
      actionPrior:publicAction=>
        publicAction.actorPrinting==='Switch BLW'?1:0,
      isTerminal:state=>state.phase===native.GamePhase.FINISHED,
      terminalValues:()=>[0.5,0.5],
      evaluateObservationValues:()=>[0.5,0.5]
    },{
      iterations:4,maxPlies:1,seed:0x420100+kecleonSeat
    });
    const result=search.search(rootState,switcherSeat);
    assert.equal(result.action.actorPrinting,'Switch BLW');
    assert.ok(promptCalls>0,'MCTS transition must invoke the synchronous prompt sub-policy');
    assert.ok(sawSettledSuccessor,
      'the stable successor after prompt continuation must be observed by MCTS');
    const audit=result.audit.twinleafAdapter;
    assert.equal(audit.promptResolutionMode,'same-store-subcall');
    assert.equal(audit.promptSubPolicyId,'switch-bench-choice-test-v1');
    assert.equal(audit.promptDecisionProtocol,
      'same-store-player-prompt-subpolicy-plus-host-chance-resolution-v1');
    assert.equal(audit.promptFrontiers,0,
      'native player prompts are subcalls, not MCTS action frontiers');
    assert.equal(audit.promptTransitions,0);
    assert.ok(audit.playerPromptSubcalls>0);
  }
});
