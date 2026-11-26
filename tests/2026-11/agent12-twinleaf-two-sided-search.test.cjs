'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const runner=require('../../simulation/evaluation/2026-11/agent36-v3-runner.cjs');
const actionEnumeratorModule=require('../../simulation/evaluation/2026-11/agent3-known-cap-free-action-enumerator.cjs');
const {
  createValidationRandomScope,seededRandom,createStoreStateSnapshotter
}=require('../../simulation/evaluation/2026-11/agent49-native-fixture-game.cjs');

const compiledActionEnumerator=path.join(
  __dirname,'../../vendor/twinleaf/ptcg-server/output/advanced-bot/action-enumerator.js'
);
const {observationSha256}=require('../../simulation/twinleaf/2026-11/agent5-information-set-mcts.cjs');
const {createTwinleafTwoSidedSearch,createNativeTwinleafPromptCallbacks}=require('../../simulation/twinleaf/2026-11/agent12-twinleaf-two-sided-search.cjs');
const GENERIC_SEARCH_ENGINE_PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const NATIVE_PROMPT_DDE = 'Double Dragon Energy ROS';
const NATIVE_PROMPT_REGIDRAGO = 'Regidrago V SIT';
const NATIVE_PROMPT_KECLEON = 'Kecleon PLF';
const NATIVE_PROMPT_DEDENNE = 'Dedenne GX UNB';
const NATIVE_PROMPT_TAPU_LELE = 'Tapu Lele-GX GRI';
const snapshotRootState=createStoreStateSnapshotter();

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
      this.store={state:cloneNativeTestValue(state),promptItems:[]};
      this.store.hasPrompts=()=>Boolean((this.store.state.prompts??[]).some(prompt=>prompt.result===undefined)||this.store.promptItems.length);
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
    promptSubPolicyId:'agent12-generic-test-prompt-policy-v1',
    resolvePlayerPrompt:()=>{throw new Error('Unexpected player prompt in generic frontier test');},
    terminalOutcomeProtocolId:'agent12-generic-test-terminal-outcome-v1',
    terminalOutcome:state=>{
      if(state.winner===0)return {kind:'seat-win',winnerSeat:0};
      if(state.winner===1)return {kind:'seat-win',winnerSeat:1};
      if(state.terminalClass==='adjudicated-draw')return {
        kind:'adjudicated-draw',ruleId:'agent12-test-draw-rule-v1',
        reason:'Explicit synthetic test adjudication',evidenceId:'agent12-test-draw-evidence-v1'
      };
      throw new Error('Terminal state lacks an explicit typed adjudication');
    },
    evaluateObservationValues:(observation)=>{
      assert.match(observation.actorHistorySha256,/^[a-f0-9]{64}$/);
      assert.ok(Array.isArray(observation.actorOwnDecisionHistory));
      assert.ok(Array.isArray(observation.actorVisibleHistory));
      return [0.5,0.5];
    }
  };
  return {
    deps,
    state:{
      activePlayer:0,turn:1,phase:'PLAYER_TURN',prompts:[],logs:[],
      players:[{id:'seat-0',bench:[]},{id:'seat-1',bench:[]}],winner:null
    }
  };
}

test('two-sided search fails closed when the root decision-history prefix is unattested',()=>{
  const harness=makeGenericTwoSidedSearchHarness();
  const search=createTwinleafTwoSidedSearch(harness.deps,{iterations:1,maxPlies:1});
  assert.throws(()=>search.search(harness.state,0),
    /Complete perfect-recall history was required but root prefixes are unattested\/incomplete/);
});

test('two-sided search accepts an explicitly attested complete root history',()=>{
  const harness=makeGenericTwoSidedSearchHarness();
  harness.deps.rootHistoryAttestation={
    schema:'agent12-actor-history-attestation-v1',
    verified:true,
    sourceId:'agent12-test-start-of-game-history-v1',
    rootStateDigest:observationSha256(snapshotRootState(harness.state)),
    completeBySeat:[true,true]
  };
  const search=createTwinleafTwoSidedSearch(harness.deps,{iterations:2,maxPlies:1});
  const result=search.search(harness.state,0);
  assert.deepEqual(result.audit.twinleafAdapter.historyCompleteBySeat,[true,true]);
  assert.deepEqual(result.audit.twinleafAdapter.historySourceBySeat,[
    'agent12-test-start-of-game-history-v1',
    'agent12-test-start-of-game-history-v1'
  ]);
});

test('complete per-seat decision histories survive actor-relative redeterminization',()=>{
  const harness=makeGenericTwoSidedSearchHarness();
  harness.deps.rootHistoryPrefixBySeat=[
    [{schema:'agent12-own-decision-history-event-v1',kind:'native-action',
      actorSeat:0,actionKey:'prior-seat-0'}],
    [{schema:'agent12-own-decision-history-event-v1',kind:'native-action',
      actorSeat:1,actionKey:'prior-seat-1'}]
  ];
  harness.deps.rootHistoryAttestation={
    schema:'agent12-actor-history-attestation-v1',
    verified:true,
    sourceId:'agent12-test-complete-root-history-v1',
    rootStateDigest:observationSha256(snapshotRootState(harness.state)),
    completeBySeat:[true,true]
  };
  const seen=[];
  const evaluate=harness.deps.evaluateObservationValues;
  harness.deps.evaluateObservationValues=(observation,seat)=>{
    seen.push({
      seat,
      history:observation.actorOwnDecisionHistory.map(event=>({...event}))
    });
    return evaluate(observation,seat);
  };
  const search=createTwinleafTwoSidedSearch(harness.deps,{
    iterations:2,maxPlies:2,seed:20261126,requireCompleteHistory:true
  });
  const result=search.search(harness.state,0);
  assert.ok(seen.some(item=>item.seat===0 &&
    item.history.length===1 && item.history[0].actorSeat===0 &&
    item.history[0].actionKey==='prior-seat-0'));
  assert.ok(seen.some(item=>item.seat===1 &&
    item.history.length===1 && item.history[0].actorSeat===1 &&
    item.history[0].actionKey==='prior-seat-1'));
  assert.deepEqual(result.audit.twinleafAdapter.historyEventCountsBySeat,[2,1]);
  assert.deepEqual(result.audit.twinleafAdapter.historyCompleteBySeat,[true,true]);
});

test('two-sided search rejects a complete-history attestation for a different root State',()=>{
  const harness=makeGenericTwoSidedSearchHarness();
  harness.deps.rootHistoryAttestation={
    schema:'agent12-actor-history-attestation-v1',
    verified:true,
    sourceId:'agent12-test-stale-root-history-v1',
    rootStateDigest:'a'.repeat(64),
    completeBySeat:[true,true]
  };
  const search=createTwinleafTwoSidedSearch(harness.deps,{iterations:1,maxPlies:1});
  assert.throws(()=>search.search(harness.state,0),
    /Root history attestation is not bound to the actual root State snapshot/);
});

test('generic Twinleaf search uses the uncapped native frontier and searches both physical seats',()=>{
  const harness=makeGenericTwoSidedSearchHarness();
  const search=createTwinleafTwoSidedSearch(harness.deps,{
    iterations:12,maxPlies:3,seed:20261128,requireCompleteHistory:false
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
    if(!Array.isArray(rootState.logs))rootState.logs=[];
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
    const selectedPromptTokens=[];
    let sawSettledSuccessor=false;
    let sawOwnHistory=false;
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
        assert.match(actorView.actorHistorySha256,/^[a-f0-9]{64}$/);
        assert.ok(actorView.actorOwnDecisionHistory.some(event=>event.kind==='native-action'),
          'prompt owner must remember the native action that registered this prompt');
        const choice=promptProjection.choices.find(item=>
          item.printing===NATIVE_PROMPT_DEDENNE);
        assert.ok(choice,'Switch prompt projection must expose the actor-owned Bench Dedenne');
        selectedPromptTokens.push(choice.token);
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
      terminalOutcomeProtocolId:'agent12-switch-prompt-test-terminal-outcome-v1',
      terminalOutcome:()=>{throw new Error('Unexpected terminal outcome in nonterminal Switch prompt test');},
      evaluateObservationValues:(observation,seat)=>{
        assert.match(observation.actorHistorySha256,/^[a-f0-9]{64}$/);
        assert.ok(Array.isArray(observation.actorOwnDecisionHistory));
        if(seat===switcherSeat &&
          observation.actorOwnDecisionHistory.some(event=>event.kind==='native-action') &&
          observation.actorOwnDecisionHistory.some(event=>event.kind==='player-prompt')) {
          sawOwnHistory=true;
        }
        return [0.5,0.5];
      }
    },{
      iterations:4,maxPlies:2,seed:0x420100+kecleonSeat,requireCompleteHistory:false
    });
    const result=search.search(rootState,switcherSeat);
    assert.equal(result.action.actorPrinting,'Switch BLW');
    assert.ok(promptCalls>0,'MCTS transition must invoke the synchronous prompt sub-policy');
    assert.equal(selectedPromptTokens.length,promptCalls);
    assert.ok(sawSettledSuccessor,
      'the stable successor after prompt continuation must be observed by MCTS');
    assert.ok(sawOwnHistory,
      'a later actor observation must include the actor\'s prior native action and prompt decision');
    const audit=result.audit.twinleafAdapter;
    assert.equal(audit.promptResolutionMode,'same-store-subcall');
    assert.equal(audit.promptSubPolicyId,'switch-bench-choice-test-v1');
    assert.equal(audit.promptDecisionProtocol,
      'same-store-player-prompt-subpolicy-plus-host-chance-resolution-v2');
    assert.equal(audit.historyProtocolId,'agent12-actor-visible-own-decision-history-v1');
    assert.deepEqual(audit.historyCompleteBySeat,[false,false],
      'mid-game fixture prefix must remain explicitly incomplete without attestation');
    assert.equal(audit.promptFrontiers,0,
      'native player prompts are subcalls, not MCTS action frontiers');
    assert.equal(audit.promptTransitions,0);
    assert.ok(audit.playerPromptSubcalls>0);
    assert.ok(audit.promptEventsRecorded>0);
    const promptEvents=result.audit.rolloutPaths.flatMap(path=>path.promptEvents);
    assert.ok(promptEvents.length>0,'per-iteration rollout receipts must contain the resolved prompt event');
    assert.equal(audit.promptEventsRecorded,promptEvents.length);
    for(const event of promptEvents) {
      assert.equal(event.transitionActorSeat,switcherSeat);
      assert.equal(event.actorSeat,switcherSeat);
      assert.equal(event.promptType,'ChoosePokemonPrompt');
      assert.equal(event.promptPolicyId,'switch-bench-choice-test-v1');
      assert.equal(event.nativeValidationSucceeded,true);
      assert.ok(event.selectedTokens.every(token=>selectedPromptTokens.includes(token)));
      assert.match(event.actorObservationDigest,/^[a-f0-9]{64}$/);
      assert.match(event.promptProjectionDigest,/^[a-f0-9]{64}$/);
      assert.match(event.stableSuccessorDigest,/^[a-f0-9]{64}$/);
    }
  }
});
