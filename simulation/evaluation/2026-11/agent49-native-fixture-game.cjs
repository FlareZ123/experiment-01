'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');

const PLAYER_IDS=Object.freeze([101,202]);
const POLICY_SEED_XORS=Object.freeze([0x6a09e667,0xbb67ae85]);
const SCHEMA='aichi-native-fixture-game-v1';

function seededRandom(seed) {
  let state=seed>>>0;
  if(state===0) state=0x9e3779b9;
  return function random() {
    state^=state<<13;
    state^=state>>>17;
    state^=state<<5;
    return (state>>>0)/0x100000000;
  };
}

function deckPermutation(length,random) {
  const order=Array.from({length},(_,index)=>index);
  for(let i=length-1;i>0;i--) {
    const j=Math.floor(random()*(i+1));
    const tmp=order[i];
    order[i]=order[j];
    order[j]=tmp;
  }
  return order;
}

function decodeWithPolicyRandom(bot,state,randomSource) {
  const previous=Math.random;
  Math.random=randomSource;
  try {
    return bot.decodeNextAction(state);
  } finally {
    Math.random=previous;
  }
}

function zoneCount(zone) {
  if(Array.isArray(zone)) return zone.length;
  if(Array.isArray(zone?.cards)) return zone.cards.length;
  return null;
}

function publicStateSnapshot(state) {
  return {
    phase:state?.phase??null,
    turn:state?.turn??null,
    activePlayer:Number.isInteger(state?.activePlayer)?state.activePlayer:null,
    pendingPrompts:(Array.isArray(state?.prompts)?state.prompts:[])
      .filter(prompt=>prompt?.result===undefined)
      .map(prompt=>prompt?.constructor?.name??'UnknownPrompt'),
    players:(Array.isArray(state?.players)?state.players:[]).map((player,seat)=>({
      seat,id:player?.id??null,
      handCount:zoneCount(player?.hand),
      deckCount:zoneCount(player?.deck),
      prizeCount:zoneCount(player?.prizes),
      discardCount:zoneCount(player?.discard),
      active:player?.active?.getPokemonCard?.()?.fullName??null,
      bench:(Array.isArray(player?.bench)?player.bench:[])
        .map(slot=>slot?.getPokemonCard?.()?.fullName??null)
    }))
  };
}

function sha256Json(value) {
  return crypto.createHash('sha256')
    .update(JSON.stringify(value),'utf8').digest('hex');
}

function actionName(action) {
  return action?.constructor?.name??action?.type??'UnknownAction';
}

function validateInputs(input) {
  assert.ok(input&&typeof input==='object','fixture match input is required');
  const native=input.native;
  for(const name of ['Store','GameSettings','SimpleTacticsAi','AddPlayerAction',
    'ResolvePromptAction','ShuffleDeckPrompt','CoinFlipPrompt']) {
    assert.equal(typeof native?.[name],'function','missing native dependency: '+name);
  }
  assert.ok(native.GamePhase&&native.GamePhase.FINISHED!==undefined &&
    native.GamePhase.PLAYER_TURN!==undefined,'missing native GamePhase constants');
  assert.ok(native.Format&&native.Format.EXPANDED!==undefined,
    'missing native Expanded format constant');
  for(const [name,deck] of [['deckA',input.deckA],['deckB',input.deckB]]) {
    assert.ok(Array.isArray(deck)&&deck.length===60,
      name+' must contain exactly 60 resolved Twinleaf fullName strings');
    assert.ok(deck.every(card=>typeof card==='string'&&card.trim()),
      name+' contains an empty or unresolved card name');
  }
  assert.ok(Array.isArray(input.botOptionsBySeat)&&input.botOptionsBySeat.length===2,
    'two seat-ordered SimpleTacticsAi option objects are required');
  assert.ok(Number.isInteger(input.seed)&&input.seed>=0&&input.seed<=0xffffffff,
    'fixture seed must be an unsigned 32-bit integer');
  assert.ok(input.candidateSeat===0||input.candidateSeat===1,
    'candidateSeat must be physical seat 0 or 1');
  assert.equal(input.originalSourceSeat,1-input.candidateSeat,
    'candidate and original-source seats must be opposite');
  const maxActions=input.maxActions===undefined?3000:input.maxActions;
  assert.ok(Number.isInteger(maxActions)&&maxActions>0,
    'maxActions must be a positive integer');
  return {native,maxActions};
}

/**
 * Drive one complete native Twinleaf Store game. The caller must wrap this
 * function with runCandidateOpponentPolicyRoles() and the fixture-scoped
 * runtime pin. All engine classes are injected from the pinned vendor tree.
 *
 * The returned record is deliberately non-admitting: it proves only that the
 * pinned engine completed one fixture game under the supplied role wrapper.
 * It does not prove paper legality, competitive strength or full process
 * closure.
 */
function runNativeFixtureGame(input) {
  const {native,maxActions}=validateInputs(input);
  const {
    Store,GameSettings,SimpleTacticsAi,AddPlayerAction,ResolvePromptAction,
    ShuffleDeckPrompt,CoinFlipPrompt,GamePhase,Format
  }=native;
  const settings=new GameSettings();
  settings.format=Format.EXPANDED;
  settings.recordingEnabled=false;
  settings.rules={
    ...(settings.rules??{}),
    firstTurnDrawCard:true,
    firstTurnUseSupporter:false,
    attackFirstTurn:false
  };

  const store=new Store({onStateChange:()=>{}});
  store.state.gameSettings=settings;
  store.state.rules=settings.rules;

  const seats=[
    new SimpleTacticsAi({id:PLAYER_IDS[0]},input.botOptionsBySeat[0],input.deckA),
    new SimpleTacticsAi({id:PLAYER_IDS[1]},input.botOptionsBySeat[1],input.deckB)
  ];
  input.onAgentsCreated?.(seats);

  const previousRandom=Math.random;
  const physicalRandom=seededRandom(input.seed);
  const policyRandom=POLICY_SEED_XORS.map(xor=>
    seededRandom((input.seed^xor)>>>0));
  const decisionTrace=[];
  const rootActionLedger=[];
  const actionCountsBySeat=[0,0];
  let actions=0;
  let actualFirstPlayerSeat=null;

  try {
    Math.random=physicalRandom;
    store.dispatch(new AddPlayerAction(PLAYER_IDS[0],
      input.playerNames?.[0]??'fixture-candidate-seat-0',input.deckA));
    if(store.state.phase===GamePhase.FINISHED)
      throw new Error('Twinleaf rejected fixture deck A during player registration');
    store.dispatch(new AddPlayerAction(PLAYER_IDS[1],
      input.playerNames?.[1]??'fixture-opponent-seat-1',input.deckB));
    if(store.state.phase===GamePhase.FINISHED)
      throw new Error('Twinleaf rejected fixture deck B during player registration');

    while(store.state.phase!==GamePhase.FINISHED && actions<maxActions) {
      const state=store.state;
      assert.ok(Array.isArray(state.prompts),'Twinleaf state.prompts is not an array');
      const pending=state.prompts.find(prompt=>prompt.result===undefined)??null;
      if(!pending && state.phase===GamePhase.PLAYER_TURN &&
          actualFirstPlayerSeat===null) {
        assert.ok(state.activePlayer===0||state.activePlayer===1,
          'Twinleaf did not expose the actual first-player seat');
        actualFirstPlayerSeat=state.activePlayer;
      }

      let action;
      let actingSeat=null;
      let isRootDecision=false;
      if(pending instanceof ShuffleDeckPrompt) {
        const ownerId=pending.getPerspectivePlayerId();
        const owner=state.players.find(player=>player.id===ownerId);
        if(!owner) throw new Error('Twinleaf shuffle prompt has no deck owner');
        actingSeat=state.players.indexOf(owner);
        if(actingSeat!==0&&actingSeat!==1)
          throw new Error('Twinleaf shuffle prompt owner is outside the two seats');
        action=new ResolvePromptAction(pending.id,
          deckPermutation(owner.deck.cards.length,physicalRandom));
      } else if(pending instanceof CoinFlipPrompt) {
        if(pending.playerId!==undefined) {
          const seat=state.players.findIndex(player=>player.id===pending.playerId);
          actingSeat=seat===-1?null:seat;
        }
        action=new ResolvePromptAction(pending.id,physicalRandom()<0.5);
      } else if(pending) {
        actingSeat=state.players.findIndex(player=>player.id===pending.playerId);
        if(actingSeat!==0&&actingSeat!==1)
          throw new Error('Unknown Twinleaf prompt player: '+pending.playerId);
        action=decodeWithPolicyRandom(seats[actingSeat],state,policyRandom[actingSeat]);
      } else {
        if(state.phase!==GamePhase.PLAYER_TURN)
          throw new Error('Unhandled Twinleaf game phase: '+state.phase);
        actingSeat=state.activePlayer;
        if(actingSeat!==0&&actingSeat!==1)
          throw new Error('Twinleaf activePlayer is outside the two seats');
        isRootDecision=true;
        action=decodeWithPolicyRandom(seats[actingSeat],state,policyRandom[actingSeat]);
      }

      if(!action)
        throw new Error('Native fixture policy failed to produce an action');
      const before=publicStateSnapshot(state);
      const record={
        actionOrdinal:actions,
        actingSeat,
        actingPlayerId:actingSeat===null?null:PLAYER_IDS[actingSeat],
        phaseBefore:state.phase,
        turnBefore:state.turn,
        activePlayerBefore:state.activePlayer??null,
        pendingPromptType:pending?.constructor?.name??null,
        pendingPromptId:pending?.id??null,
        isRootDecision,
        actionName:actionName(action),
        actionType:action.type??null,
        publicStateBefore:before
      };
      try {
        store.dispatch(action);
      } catch(error) {
        const digest=sha256Json({
          name:error?.name??'Error',
          message:String(error?.message??'native dispatch failed')
        });
        const failure=new Error('Native fixture Store.dispatch failed at action '+actions);
        failure.cause=error;
        failure.nativeFixtureFailure={
          actionOrdinal:actions,actingSeat,phaseBefore:state.phase,
          turnBefore:state.turn,pendingPromptType:record.pendingPromptType,
          actionName:record.actionName,redactedErrorDigest:digest
        };
        throw failure;
      }
      actions++;
      if(actingSeat===0||actingSeat===1) actionCountsBySeat[actingSeat]++;
      const completed={
        ...record,
        publicStateAfter:publicStateSnapshot(store.state)
      };
      decisionTrace.push(completed);
      if(isRootDecision) rootActionLedger.push(completed);
      input.onAction?.(completed);
    }

    if(store.state.phase!==GamePhase.FINISHED) {
      const failure=new Error('Native fixture game exceeded maxActions without a natural terminal state');
      failure.nativeFixtureFailure={
        actions,turn:store.state.turn,phase:store.state.phase,maxActions,
        actualFirstPlayerSeat
      };
      throw failure;
    }
    if(actualFirstPlayerSeat!==0&&actualFirstPlayerSeat!==1)
      throw new Error('Native fixture game finished without a captured first-player seat');

    const finalState=publicStateSnapshot(store.state);
    const rawWinner=store.state.winner??null;
    const winnerPlayerId=rawWinner&&typeof rawWinner==='object'?
      (rawWinner.id??null):rawWinner;
    const winnerSeat=store.state.players.findIndex(player=>
      player.id===winnerPlayerId);
    const winner=rawWinner&&typeof rawWinner==='object'?
      {playerId:winnerPlayerId}:rawWinner;

    const result={
      schema:SCHEMA,
      fixtureOnly:true,
      admissionEligible:false,
      competitiveGameQualified:false,
      seed:input.seed,
      candidateSeat:input.candidateSeat,
      originalSourceSeat:input.originalSourceSeat,
      actualFirstPlayerSeat,
      actions,
      turns:store.state.turn,
      finished:true,
      endReason:'engine-game-end',
      winner,
      winnerSeat:winnerSeat===-1?null:winnerSeat,
      actionCountsBySeat,
      decisionTrace,
      rootActionLedger,
      decisionTraceSha256:sha256Json(decisionTrace),
      rootActionLedgerSha256:sha256Json(rootActionLedger),
      finalPublicState:finalState,
      finalPublicStateSha256:sha256Json(finalState)
    };
    return result;
  } finally {
    Math.random=previousRandom;
  }
}

module.exports={
  SCHEMA,
  seededRandom,
  deckPermutation,
  publicStateSnapshot,
  runNativeFixtureGame
};
