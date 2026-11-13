'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  FLITTLE_ENVELOPE_ID,createTwinleafInformationSetSearch,createTwinleafMcts,
  flittleActionKey,flittleNativeActionToIntent
}=require('../../simulation/twinleaf/2026-11/agent5-twinleaf-mcts-adapter.cjs');
const {observationSha256}=require('../../simulation/twinleaf/2026-11/agent5-information-set-mcts.cjs');

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
  sampleDeterminization.refreshMetadata=(fromState,toState)=>{
    const metadata=metadataByState.get(fromState);
    if(!metadata)return false;
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
  return {deps,state,knowledgeBySeat,setLedger:value=>{ledger=value;},metadataByState};
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
    ...h.deps.knowledgeBySeat(h.state,0),
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
