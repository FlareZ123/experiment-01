'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  seededRandom,deckPermutation,projectActionPayload,selectedCardIdentity,
  publicStateSnapshot,runNativeFixtureGame,runNativeFixtureGameAsync,normalizeSeed32
}=require('../../simulation/evaluation/2026-11/agent49-native-fixture-game.cjs');

const GamePhase=Object.freeze({
  SETUP:'setup',PLAYER_TURN:'player-turn',FINISHED:'finished'
});
const Format=Object.freeze({EXPANDED:'expanded'});

class GameSettings {
  constructor(){this.rules={};}
}
class AddPlayerAction {
  constructor(id,name,deck){Object.assign(this,{id,name,deck});}
}
class ResolvePromptAction {
  constructor(id,result){Object.assign(this,{id,result});}
}
class ShuffleDeckPrompt {
  constructor(id,playerId){Object.assign(this,{id,playerId,result:undefined});}
  getPerspectivePlayerId(){return this.playerId;}
}
class CoinFlipPrompt {
  constructor(id,playerId){Object.assign(this,{id,playerId,result:undefined});}
}
class WaitPrompt {
  constructor(id,playerId){Object.assign(this,{id,playerId,result:undefined});}
}
class TestPrompt {
  constructor(id,playerId,message,options){
    Object.assign(this,{id,playerId,message,options,result:undefined});
  }
}
class RootAction {
  constructor(seat){this.seat=seat;this.type='ROOT';}
}
class PlayCardAction {
  constructor(id,handIndex,target){Object.assign(this,{id,handIndex,target});}
}
let lastStore=null;
let failNextPlayCardDispatch=false;
let failNextDecode=false;
let failNextPromptDecode=false;
let insertWaitPrompt=false;
let mutateBeforeDecodeFailure=false;
let policyRandomDraws=[];
let decodeCalls=0;
class Store {
  constructor(options){
    this.options=options;
    this.rootActions=0;
    this.state={
      phase:GamePhase.SETUP,turn:0,activePlayer:null,
      players:[],prompts:[],winner:null
    };
    lastStore=this;
  }
  dispatch(action){
    if(action instanceof AddPlayerAction){
      this.state.players.push({
        id:action.id,name:action.name,
        deck:{cards:action.deck.map(fullName=>({fullName}))},
        hand:{cards:[{fullName:action.deck[0]}]},prizes:[],discard:[],
        active:{getPokemonCard:()=>null},bench:[]
      });
      if(this.state.players.length===2){
        this.state.prompts=[
          new ShuffleDeckPrompt(1,101),
          new CoinFlipPrompt(2,202),
          ...(insertWaitPrompt?[new WaitPrompt(4,101)]:[])
        ];
      }
      return;
    }
    if(action instanceof ResolvePromptAction){
      const prompt=this.state.prompts.find(item=>item.id===action.id);
      assert.ok(prompt,'resolved prompt must exist');
      prompt.result=action.result;
      if(this.state.prompts.every(item=>item.result!==undefined)){
        this.state.phase=GamePhase.PLAYER_TURN;
        this.state.activePlayer=0;
        this.state.turn=1;
        if(failNextPromptDecode)
          this.state.prompts.push(new TestPrompt(3,101,'Choose a card',['A card 0','A card 1']));
      }
      return;
    }
    if(action instanceof PlayCardAction){
      if(failNextPlayCardDispatch){
        failNextPlayCardDispatch=false;
        throw new Error('simulated native dispatch failure');
      }
      const owner=this.state.players.find(player=>player.id===action.id);
      assert.ok(owner,'PlayCardAction owner must exist');
      const card=owner.hand.cards.splice(action.handIndex,1)[0];
      assert.ok(card,'PlayCardAction must remove its selected physical card');
      this.rootActions++;
      if(this.rootActions===1){
        this.state.activePlayer=1;
        this.state.turn=2;
      }else{
        this.state.phase=GamePhase.FINISHED;
        this.state.winner=101;
      }
      return;
    }
    if(action instanceof RootAction){
      this.rootActions++;
      if(this.rootActions===1){
        this.state.activePlayer=1;
        this.state.turn=2;
      }else{
        this.state.phase=GamePhase.FINISHED;
        this.state.winner=101;
      }
      return;
    }
    throw new Error('unexpected action '+action?.constructor?.name);
  }
}
class SimpleTacticsAi {
  constructor(identity,options,deck){
    this.id=identity.id;
    this.options=options;
    this.deck=deck;
  }
  decodeNextAction(){
    decodeCalls++;
    if(this.options?.capturePolicyRandom===true)
      policyRandomDraws.push({id:this.id,draw:Math.random()});
    if(failNextPromptDecode&&this.id===101){
      failNextPromptDecode=false;
      throw new Error('simulated owner-prompt decode failure');
    }
    if(failNextDecode&&this.id===101){
      failNextDecode=false;
      if(mutateBeforeDecodeFailure){
        mutateBeforeDecodeFailure=false;
        lastStore.state.players[0].discard.push({fullName:'mutation-before-decode-error'});
      }
      throw new Error('simulated policy decode failure');
    }
    return this.id===101?
      new PlayCardAction(this.id,0,{slot:'fixture'}):
      new RootAction(1);
  }
}

function native(){
  return {
    Store,GameSettings,SimpleTacticsAi,AddPlayerAction,ResolvePromptAction,
    ShuffleDeckPrompt,CoinFlipPrompt,WaitPrompt,GamePhase,Format,
    cardActions:{PlayCardAction},
    observe:(state,seat)=>({
      actorSeat:seat,
      ownHand:state.players[seat].hand.cards.map(card=>card.fullName),
      opponentHandCount:state.players[1-seat].hand.cards.length
    })
  };
}
function deck(prefix){
  return Array.from({length:60},(_,i)=>prefix+' card '+i);
}
function input(overrides={}){
  return {
    native:native(),
    deckA:deck('A'),
    deckB:deck('B'),
    botOptionsBySeat:[{},{}],
    seed:0x12345678,
    policySeedBySeat:[0x243f6a88,0x85a308d3],
    candidateSeat:0,
    originalSourceSeat:1,
    ...overrides
  };
}

function fixtureDiagnosticSnapshot(state,context){
  return {
    schema:'twinleaf-full-state-diagnostic-v1',
    visibility:'private-offline-diagnostic-only',
    context,
    players:state.players.map(player=>({
      hand:player.hand.cards.map(card=>card.fullName),
      deck:player.deck.cards.map(card=>card.fullName),
      discard:player.discard.map(card=>card.fullName)
    })),
    prompts:state.prompts.map(prompt=>({
      id:prompt.id,
      type:prompt.constructor.name,
      playerId:prompt.playerId??null,
      fields:{message:prompt.message??null,options:prompt.options??null}
    }))
  };
}


test('async fixture generator delegates strategic prompts and roots without policy seeds or SimpleTacticsAi fallback', async () => {
  failNextPromptDecode=true;
  decodeCalls=0;
  const args=input();
  delete args.policySeedBySeat;
  const requests=[];
  try {
    const result=await runNativeFixtureGameAsync(args,async request=>{
      requests.push({
        decisionKind:request.decisionKind,
        actorSeat:request.actorSeat,
        hasPrompt:Boolean(request.prompt),
        hasLegacyRandomSource:request.legacyRandomSource!==null
      });
      if(request.decisionKind==='owner-prompt')
        return new ResolvePromptAction(request.prompt.id,'A card 0');
      return request.actorSeat===0?
        new PlayCardAction(101,0,{slot:'worker'}):
        new RootAction(1);
    });
    assert.equal(result.finished,true);
    assert.equal(result.endReason,'engine-game-end');
    assert.equal(decodeCalls,0,'async worker path must never call SimpleTacticsAi.decodeNextAction');
    assert.deepEqual(requests.map(row=>row.decisionKind),
      ['owner-prompt','owner-root','owner-root']);
    assert.equal(requests.every(row=>!row.hasLegacyRandomSource),true,
      'async worker requests must not receive policy RNG sources');
    assert.equal(result.decisionTrace.length,3);
  } finally {
    failNextPromptDecode=false;
    decodeCalls=0;
  }
});

test('engine WaitPrompt is acknowledged without consulting either policy', () => {
  insertWaitPrompt=true;
  try {
    const result=runNativeFixtureGame({
      deckA:Array(60).fill('Card A'),
      deckB:Array(60).fill('Card B'),
      candidateSeat:0,
      originalSourceSeat:1,
      seed:77,
      policySeedBySeat:[0x243f6a88,0x85a308d3],
      native:native(),
      botOptionsBySeat:[{},{}],
    });
    const wait=result.decisionTrace.find(row=>row.pendingPromptType==='WaitPrompt');
    assert.equal(result.finished,true);
    assert.equal(wait.policyInputKind,'engine-wait-prompt');
    assert.deepEqual(wait.promptResolution,{kind:'engine-wait',ownerSeat:0});
    assert.equal(wait.actionPayload.fields.result,null);
  } finally {
    insertWaitPrompt=false;
  }
});

test('action payload projection distinguishes same-class decisions and terminates cycles',()=>{
  const first=projectActionPayload(new RootAction(0));
  const second=projectActionPayload(new RootAction(1));
  assert.equal(first.actionName,'RootAction');
  assert.equal(first.fields.seat,0);
  assert.equal(second.fields.seat,1);
  assert.notDeepEqual(first,second);

  const cyclic={};
  cyclic.self=cyclic;
  const projected=projectActionPayload({type:'TEST',payload:cyclic});
  assert.equal(projected.fields.payload.self.cycle,true);
});

test('selected physical card identity is read from the acting hand before dispatch',()=>{
  const state={players:[
    {id:101,hand:{cards:[{
      fullName:'A physical Trainer (SET 1)',name:'A physical Trainer',
      set:'SET 1',setNumber:'123',number:'123',language:'en'
    }]}},
    {id:202,hand:{cards:[]}}
  ]};
  assert.deepEqual(selectedCardIdentity(
    new PlayCardAction(101,0,{slot:'active'}),state,0,{PlayCardAction}
  ),{
    playerId:101,handIndex:0,fullName:'A physical Trainer (SET 1)',
    name:'A physical Trainer',set:'SET 1',setNumber:'123',number:'123',language:'en'
  });
  assert.equal(selectedCardIdentity(new RootAction(0),state,0,{PlayCardAction}),null);
  assert.throws(()=>selectedCardIdentity(
    new PlayCardAction(202,0,{}),state,0,{PlayCardAction}
  ),/does not match the acting physical seat/);
  assert.throws(()=>selectedCardIdentity(
    new PlayCardAction(101,2,{}),state,0,{PlayCardAction}
  ),/no resolved fullName/);
});

test('fixture PRNG and deck permutation are deterministic and complete',()=>{
  const a=seededRandom(123),b=seededRandom(123);
  assert.deepEqual(Array.from({length:8},()=>a()),
    Array.from({length:8},()=>b()));
  const p=deckPermutation(60,seededRandom(456));
  assert.equal(p.length,60);
  assert.deepEqual([...p].sort((x,y)=>x-y),Array.from({length:60},(_,i)=>i));
});

test('public state snapshot counts Prize cards across slots rather than counting Prize slots',()=>{
  const sparse=Array.from({length:6},()=>({cards:[]}));
  sparse[1].cards.push({fullName:'private prize A'});
  sparse[4].cards.push({fullName:'private prize B'});
  const state={players:[{
    id:101,hand:{cards:[]},deck:{cards:[]},prizes:sparse,discard:[],
    active:{getPokemonCard:()=>null},bench:[]
  }]};
  assert.equal(publicStateSnapshot(state).players[0].prizeCount,2);
  const full=Array.from({length:6},()=>({cards:[{}]}));
  state.players[0].prizes=full;
  assert.equal(publicStateSnapshot(state).players[0].prizeCount,6);
  state.players[0].prizes=[{cards:[]},{notACardList:true}];
  assert.equal(publicStateSnapshot(state).players[0].prizeCount,null);
});

test('policy RNG streams are independent of the physical shuffle seed',()=>{
  const policySeeds=[0x243f6a88,0x85a308d3];
  const botOptionsBySeat=[{capturePolicyRandom:true},{capturePolicyRandom:true}];
  policyRandomDraws=[];
  const first=runNativeFixtureGame(input({
    seed:0x11111111,policySeedBySeat:policySeeds,botOptionsBySeat
  }));
  const firstDraws=policyRandomDraws.map(row=>({...row}));
  policyRandomDraws=[];
  const second=runNativeFixtureGame(input({
    seed:0x22222222,policySeedBySeat:policySeeds,botOptionsBySeat
  }));
  const secondDraws=policyRandomDraws.map(row=>({...row}));
  assert.notEqual(first.seed32,second.seed32);
  assert.deepEqual(first.policySeedBySeat,second.policySeedBySeat);
  assert.deepEqual(firstDraws,secondDraws);
  assert.deepEqual(firstDraws.map(row=>row.id),[101,202]);
});

test('policy RNG requires distinct explicit seeds that do not reuse the physical seed',()=>{
  assert.throws(()=>runNativeFixtureGame(input({policySeedBySeat:undefined})),
    /two explicit per-seat policy RNG seeds/);
  assert.throws(()=>runNativeFixtureGame(input({
    policySeedBySeat:[0x12345678,0x12345678]
  })),/distinct policy RNG seed/);
  assert.throws(()=>runNativeFixtureGame(input({
    seed:77,policySeedBySeat:[77,88]
  })),/must not reuse the physical shuffle seed/);
});

test('native fixture loop resolves setup prompts, records exact owner views and offline full state',()=>{
  const originalRandom=Math.random;
  let agentsCreated=0;
  const diagnosticCalls=[];
  const result=runNativeFixtureGame(input({
    requireFullStateDiagnostics:true,
    trialId:'fixture-helper-test-01',
    diagnosticSnapshot:(state,context)=>{
      diagnosticCalls.push(context);
      return {
        schema:'twinleaf-full-state-diagnostic-v1',
        visibility:'private-offline-diagnostic-only',
        context,
        players:state.players.map(player=>({
          hand:player.hand.cards.map(card=>card.fullName),
          deck:player.deck.cards.map(card=>card.fullName)
        })),
        prompts:state.prompts.map(prompt=>({
          id:prompt.id,type:prompt.constructor.name,playerId:prompt.playerId,
          fields:prompt instanceof ShuffleDeckPrompt?
            {message:'Shuffle the deck',options:['shuffle']}:
            {message:'Flip a coin',choices:[true,false]}
        }))
      };
    },
    onRootAgentsCreated:seats=>{agentsCreated=seats.length;}
  }));

  assert.equal(Math.random,originalRandom);
  assert.equal(agentsCreated,2);
  assert.equal(result.schema,'aichi-native-fixture-game-v1');
  assert.equal(result.seed,0x12345678);
  assert.equal(result.randomizationProtocol,'xorshift32-physical-plus-independent-policy-streams-v2');
  assert.equal(result.policySeedProtocol,'explicit-per-seat-seeds-independent-of-physical-seed-v1');
  assert.deepEqual(result.policySeedBySeat,[0x243f6a88,0x85a308d3]);
  assert.equal(result.fixtureOnly,true);
  assert.equal(result.admissionEligible,false);
  assert.equal(result.competitiveGameQualified,false);
  assert.equal(result.finished,true);
  assert.equal(result.endReason,'engine-game-end');
  assert.equal(result.actualFirstPlayerSeat,0);
  assert.equal(result.candidateSeat,0);
  assert.equal(result.originalSourceSeat,1);
  assert.equal(result.winner,101);
  assert.equal(result.winnerSeat,0);
  assert.equal(result.actions,4);
  assert.deepEqual(result.actionCountsBySeat,[2,2]);
  assert.equal(result.decisionTrace.length,4);
  assert.equal(result.rootActionLedger.length,4);
  assert.equal(result.fullStateDiagnosticsEnabled,true);
  assert.equal(result.diagnosticVisibility,'private-offline-diagnostic-only');
  assert.equal(diagnosticCalls.length,8);
  assert.equal(diagnosticCalls[0].stage,'before');
  assert.equal(diagnosticCalls[1].stage,'after');
  assert.equal(diagnosticCalls[0].trialId,'fixture-helper-test-01');
  assert.equal(result.decisionTrace[2].fullStateBefore.visibility,
    'private-offline-diagnostic-only');
  assert.equal(result.decisionTrace[2].fullStateAfter.visibility,
    'private-offline-diagnostic-only');
  assert.deepEqual(result.decisionTrace[2].fullStateBefore.players[1].hand,
    ['B card 0']);
  assert.deepEqual(result.decisionTrace[2].actorObservationBefore.ownHand,
    ['A card 0']);
  assert.equal(JSON.stringify(result.decisionTrace[2].actorObservationBefore)
    .includes('B card 0'),false);
  assert.match(result.decisionTrace[2].actorObservationSha256,/^[a-f0-9]{64}$/);
  assert.deepEqual(result.decisionTrace[3].actorObservationBefore.ownHand,
    ['B card 0']);
  assert.equal(result.decisionTrace[0].promptResolverContext.resolver,
    'physical-randomization');
  assert.equal(result.decisionTrace[0].promptResolverContext.promptSnapshot.type,
    'ShuffleDeckPrompt');
  assert.equal(result.decisionTrace[0].promptResolverContext.message,'Shuffle the deck');
  assert.deepEqual(result.decisionTrace[0].promptResolverContext.availableOptions.options,
    ['shuffle']);
  assert.equal(result.decisionTrace[1].promptResolverContext.promptSnapshot.type,
    'CoinFlipPrompt');
  assert.equal(result.decisionTrace[1].promptResolverContext.message,'Flip a coin');
  assert.deepEqual(result.decisionTrace[1].promptResolverContext.availableOptions.choices,
    [true,false]);
  assert.deepEqual(result.decisionTrace[2].selectedCardIdentity,{
    playerId:101,handIndex:0,fullName:'A card 0'
  });
  assert.equal(result.decisionTrace[2].publicStateBefore.players[0].handCount,1);
  assert.equal(result.decisionTrace[2].publicStateAfter.players[0].handCount,0);
  assert.equal(Object.hasOwn(result.decisionTrace[2].publicStateBefore.players[0],
    'handIdentity'),false);
  assert.equal(result.decisionTrace[0].pendingPromptType,'ShuffleDeckPrompt');
  assert.equal(result.decisionTrace[0].actionName,'ResolvePromptAction');
  assert.equal(result.decisionTrace[0].actionPayload.fields.result.length,60);
  assert.equal(typeof result.decisionTrace[1].actionPayload.fields.result,'boolean');
  assert.notEqual(result.decisionTrace[2].actionPayloadSha256,
    result.decisionTrace[3].actionPayloadSha256);
  assert.equal(result.rootActionLedger[0].actionPayloadSha256,
    result.decisionTrace[0].actionPayloadSha256);
  assert.equal(result.decisionTrace[0].promptResolution.kind,'shuffle');
  assert.equal(result.decisionTrace[0].promptResolution.ownerSeat,0);
  assert.equal(result.decisionTrace[0].promptResolution.cardCount,60);
  assert.match(result.decisionTrace[0].promptResolution.permutationSha256,/^[a-f0-9]{64}$/);
  assert.equal(result.decisionTrace[1].promptResolution.kind,'coin-flip');
  assert.equal(typeof result.decisionTrace[1].promptResolution.result,'boolean');
  assert.equal(result.decisionTrace[0].publicStateAfter.pendingPrompts.length,1);
  assert.equal(result.decisionTrace[1].pendingPromptType,'CoinFlipPrompt');
  assert.equal(result.decisionTrace[1].publicStateAfter.phase,GamePhase.PLAYER_TURN);
  assert.equal(result.rootActionLedger[0].playerSlot,0);
  assert.equal(result.rootActionLedger[0].pendingPrompt,'ShuffleDeckPrompt');
  assert.equal(result.rootActionLedger[1].playerSlot,1);
  assert.equal(result.rootActionLedger[1].pendingPrompt,'CoinFlipPrompt');
  assert.equal(result.rootActionLedger[2].isRootDecision,true);
  assert.equal(result.rootActionLedger[3].isRootDecision,true);
  assert.match(result.decisionTraceSha256,/^[a-f0-9]{64}$/);
  assert.match(result.rootActionLedgerSha256,/^[a-f0-9]{64}$/);
  assert.match(result.finalPublicStateSha256,/^[a-f0-9]{64}$/);
  assert.equal(lastStore.state.gameSettings.format,Format.EXPANDED);
  assert.equal(lastStore.state.gameSettings.recordingEnabled,false);
  assert.equal(lastStore.state.rules.firstTurnDrawCard,true);
  assert.equal(lastStore.state.rules.firstTurnUseSupporter,false);
  assert.equal(lastStore.state.rules.attackFirstTurn,false);
  const shuffle=result.decisionTrace[0].publicStateAfter;
  assert.equal(shuffle.players[0].deckCount,60);
  assert.deepEqual([...lastStore.state.prompts[0].result].sort((a,b)=>a-b),
    Array.from({length:60},(_,i)=>i));
  assert.equal(typeof lastStore.state.prompts[1].result,'boolean');
});

test('native fixture loop rejects incomplete decks and restores Math.random on failure',()=>{
  const originalRandom=Math.random;
  assert.throws(()=>runNativeFixtureGame(input({deckA:deck('A').slice(1)})),
    /deckA must contain exactly 60/);
  assert.equal(Math.random,originalRandom);
});

test('native fixture loop refuses to treat an action cap as a natural game end and preserves the prefix',()=>{
  const originalRandom=Math.random;
  let failure;
  try { runNativeFixtureGame(input({maxActions:1})); }
  catch(error) { failure=error; }
  assert.ok(failure);
  assert.match(failure.message,/exceeded maxActions without a natural terminal state/);
  assert.equal(Math.random,originalRandom);
  assert.equal(failure.fixtureGamePartial.acceptedActions,1);
  assert.equal(failure.fixtureGamePartial.attemptedActions,1);
  assert.equal(failure.fixtureGamePartial.failure.stage,'action-cap');
  assert.equal(failure.fixtureGamePartial.failedAction,null);
});

test('stable string seeds map to the same uint32 value', () => {
  const seed = 'agent36-v3-fixture-hood-rank1-20261112-01';
  assert.equal(normalizeSeed32(seed), normalizeSeed32(seed));
  assert.notEqual(normalizeSeed32(seed), 0);
});


test('same-seed trace digest changes when the selected physical card changes but the action payload does not',()=>{
  const observe=(state,seat)=>({
    actorSeat:seat,
    ownHandCount:state.players[seat].hand.cards.length,
    opponentHandCount:state.players[1-seat].hand.cards.length
  });
  const firstInput=input();
  firstInput.native.observe=observe;
  const first=runNativeFixtureGame(firstInput);
  const secondInput=input();
  secondInput.deckA[0]='A alternate physical Trainer (SET 2)';
  secondInput.native.observe=observe;
  const second=runNativeFixtureGame(secondInput);

  assert.deepEqual(first.decisionTrace[2].actionPayload,
    second.decisionTrace[2].actionPayload);
  assert.equal(first.decisionTrace[2].actionPayloadSha256,
    second.decisionTrace[2].actionPayloadSha256);
  assert.notEqual(first.decisionTrace[2].selectedCardIdentity.fullName,
    second.decisionTrace[2].selectedCardIdentity.fullName);
  assert.notEqual(first.decisionTraceSha256,second.decisionTraceSha256);
});

test('native fixture preserves accepted prefix and failed attempted action with offline snapshots',()=>{
  const originalRandom=Math.random;
  failNextPlayCardDispatch=true;
  let failure;
  try {
    runNativeFixtureGame(input({
      requireFullStateDiagnostics:true,
      diagnosticSnapshot:(state,context)=>({
        schema:'twinleaf-full-state-diagnostic-v1',
        visibility:'private-offline-diagnostic-only',
        context,
        players:state.players.map(player=>({
          hand:player.hand.cards.map(card=>card.fullName),
          deck:player.deck.cards.map(card=>card.fullName)
        }))
      })
    }));
  } catch(error) {
    failure=error;
  } finally {
    failNextPlayCardDispatch=false;
  }

  assert.ok(failure);
  assert.match(failure.message,/simulated native dispatch failure/);
  assert.equal(Math.random,originalRandom);
  const partial=failure.fixtureGamePartial;
  assert.equal(partial.schema,'aichi-native-fixture-game-partial-v1');
  assert.equal(partial.fixtureOnly,true);
  assert.equal(partial.competitiveGameQualified,false);
  assert.equal(partial.acceptedActions,2);
  assert.equal(partial.attemptedActions,3);
  assert.equal(partial.decisionTrace.length,3);
  assert.equal(partial.rootActionLedger.length,3);
  const failed=partial.decisionTrace[2];
  assert.equal(failed.dispatchStatus,'failed');
  assert.equal(failed.actionName,'PlayCardAction');
  assert.equal(failed.selectedCardIdentity.fullName,'A card 0');
  assert.equal(failed.fullStateBefore.visibility,'private-offline-diagnostic-only');
  assert.equal(failed.fullStateAfter.visibility,'private-offline-diagnostic-only');
  assert.equal(partial.rootActionLedger[2].dispatchStatus,'failed');
  assert.equal(partial.failure.stage,'dispatch');
  assert.equal(partial.failure.actionOrdinal,2);
  assert.equal(partial.failure.actionPayloadSha256,failed.actionPayloadSha256);
  assert.equal(partial.failedAction.actionOrdinal,2);
  assert.match(partial.decisionTraceSha256,/^[a-f0-9]{64}$/);
  assert.match(partial.rootActionLedgerSha256,/^[a-f0-9]{64}$/);
});


test('native fixture policy-decode failure retains the attempted decision, pre-state and fresh failure snapshot',()=>{
  const originalRandom=Math.random;
  failNextDecode=true;
  mutateBeforeDecodeFailure=true;
  let failure;
  try {
    runNativeFixtureGame(input({
      requireFullStateDiagnostics:true,
      diagnosticSnapshot:fixtureDiagnosticSnapshot
    }));
  }
  catch(error) { failure=error; }
  finally {
    failNextDecode=false;
    mutateBeforeDecodeFailure=false;
  }

  assert.ok(failure);
  assert.match(failure.message,/simulated policy decode failure/);
  assert.equal(Math.random,originalRandom);
  const partial=failure.fixtureGamePartial;
  assert.equal(partial.acceptedActions,2);
  assert.equal(partial.attemptedActions,3);
  assert.equal(partial.decisionTrace.length,3);
  assert.equal(partial.rootActionLedger.length,3);
  const failed=partial.decisionTrace[2];
  assert.equal(failed.dispatchStatus,'not-dispatched');
  assert.equal(failed.actionName,null);
  assert.equal(failed.actionPayloadSha256,null);
  assert.equal(failed.policyInputKind,'actor-observation');
  assert.equal(failed.failureSnapshotStage,'failure-final');
  assert.equal(failed.actorObservationBefore.actorSeat,0);
  assert.deepEqual(failed.actorObservationBefore.ownHand,['A card 0']);
  assert.match(failed.actorObservationSha256,/^[a-f0-9]{64}$/);
  assert.equal(failed.fullStateBefore.visibility,'private-offline-diagnostic-only');
  assert.deepEqual(failed.fullStateBefore.players[0].hand,['A card 0']);
  assert.deepEqual(failed.fullStateBefore.players[0].discard,[]);
  assert.deepEqual(failed.fullStateAfter.players[0].discard,
    ['mutation-before-decode-error']);
  assert.deepEqual(partial.finalFullState.players[0].discard,
    ['mutation-before-decode-error']);
  assert.notDeepEqual(failed.fullStateBefore,partial.finalFullState);
  assert.equal(partial.failure.stage,'policy-decode');
  assert.equal(partial.failure.actionOrdinal,2);
  assert.equal(partial.failure.actingSeat,0);
  assert.equal(partial.failure.actingPlayerId,101);
  assert.equal(partial.failure.phaseBefore,GamePhase.PLAYER_TURN);
  assert.equal(partial.failure.turnBefore,1);
  assert.equal(partial.failure.pendingPromptType,null);
  assert.equal(partial.failedAction,null);
  assert.equal(partial.rootActionLedger[2].dispatchStatus,'not-dispatched');
  assert.equal(partial.rootActionLedger[2].action,null);
  assert.equal(partial.rootActionLedger[2].actorObservationSha256,
    failed.actorObservationSha256);
});

test('native owner-prompt decode failure preserves prompt options before decode',()=>{
  failNextPromptDecode=true;
  let failure;
  try {
    runNativeFixtureGame(input({
      requireFullStateDiagnostics:true,
      diagnosticSnapshot:fixtureDiagnosticSnapshot
    }));
  }
  catch(error) { failure=error; }
  finally { failNextPromptDecode=false; }

  assert.ok(failure);
  assert.match(failure.message,/simulated owner-prompt decode failure/);
  const partial=failure.fixtureGamePartial;
  assert.equal(partial.acceptedActions,2);
  assert.equal(partial.attemptedActions,3);
  assert.equal(partial.decisionTrace.length,3);
  assert.equal(partial.rootActionLedger.length,3);
  const failed=partial.decisionTrace[2];
  assert.equal(partial.decisionTrace.filter(row=>row.actionOrdinal===2).length,1);
  const ledgerRows=partial.rootActionLedger.filter(row=>row.actionOrdinal===2);
  assert.equal(ledgerRows.length,1);
  assert.equal(ledgerRows[0].dispatchStatus,'not-dispatched');
  assert.equal(ledgerRows[0].action,null);
  assert.deepEqual(ledgerRows[0].promptResolverContext,failed.promptResolverContext);
  assert.equal(failed.dispatchStatus,'not-dispatched');
  assert.equal(failed.actionName,null);
  assert.equal(failed.policyInputKind,'native-owner-prompt');
  assert.equal(failed.promptResolverContext.promptType,'TestPrompt');
  assert.equal(failed.promptResolverContext.message,'Choose a card');
  assert.deepEqual(failed.promptResolverContext.availableOptions.options,
    ['A card 0','A card 1']);
  assert.equal(failed.fullStateBefore.prompts.find(prompt=>prompt.id===3).fields.message,
    'Choose a card');
  assert.equal(partial.failure.stage,'prompt-resolver-decode');
  assert.equal(partial.failedAction,null);
});
