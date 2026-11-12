'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {evidenceBundleSha256}=require('../agent45-independent-competitive-admission.cjs');

const PLAYER_IDS=Object.freeze([101,202]);
const POLICY_SEED_XORS=Object.freeze([0x6a09e667,0xbb67ae85]);
const SCHEMA='aichi-native-fixture-game-v1';

function normalizeSeed32(seed) {
  if (Number.isInteger(seed) && seed >= 0 && seed <= 0xffffffff) return seed >>> 0;
  assert.ok(typeof seed === 'string' && seed.trim().length > 0,
    'fixture seed must be an unsigned 32-bit integer or a non-empty stable string');
  const digest = createHash('sha256').update(seed, 'utf8').digest();
  return digest.readUInt32LE(0);
}

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
  return evidenceBundleSha256(value);
}

function actionName(action) {
  return action?.constructor?.name??action?.type??'UnknownAction';
}

function projectJsonSafe(value,seen=new WeakSet(),depth=0) {
  if(value===null || typeof value==='string' || typeof value==='boolean') return value;
  if(typeof value==='number') return Number.isFinite(value)?value:String(value);
  if(typeof value==='undefined') return null;
  if(typeof value==='bigint') return value.toString();
  if(typeof value==='function') return {functionName:value.name||'anonymous'};
  if(depth>16) return {truncated:'max-depth',type:value?.constructor?.name??'Object'};
  if(value instanceof Date) return value.toISOString();
  if(value instanceof RegExp) return String(value);
  if(Array.isArray(value)) {
    if(seen.has(value)) return {cycle:true,type:'Array'};
    seen.add(value);
    const projected=value.slice(0,512).map(item=>projectJsonSafe(item,seen,depth+1));
    seen.delete(value);
    return projected;
  }
  if(value instanceof Map) {
    if(seen.has(value)) return {cycle:true,type:'Map'};
    seen.add(value);
    const projected=[...value.entries()].slice(0,512).map(([key,item])=>[
      projectJsonSafe(key,seen,depth+1),projectJsonSafe(item,seen,depth+1)
    ]);
    seen.delete(value);
    return projected;
  }
  if(value instanceof Set) {
    if(seen.has(value)) return {cycle:true,type:'Set'};
    seen.add(value);
    const projected=[...value.values()].slice(0,512)
      .map(item=>projectJsonSafe(item,seen,depth+1));
    seen.delete(value);
    return projected;
  }
  if(typeof value==='object') {
    if(seen.has(value)) return {cycle:true,type:value.constructor?.name??'Object'};
    seen.add(value);
    const projected={type:value.constructor?.name??'Object'};
    const keys=new Set(Object.keys(value));
    for(const key of [
      'fullName','name','set','setId','number','cardType','cardId',
      'id','playerId','target','cardIndex','index','result','cards',
      'pokemon','energy','tool','zone','slot','type'
    ]) {
      try {
        if(!keys.has(key) && value[key]!==undefined) keys.add(key);
      } catch {}
    }
    for(const key of [...keys].sort().slice(0,512)) {
      try {
        projected[key]=projectJsonSafe(value[key],seen,depth+1);
      } catch(error) {
        projected[key]={unreadable:true,errorName:error?.name??'Error'};
      }
    }
    seen.delete(value);
    return projected;
  }
  return String(value);
}

function projectActionPayload(action) {
  return {
    actionName:actionName(action),
    fields:projectJsonSafe(action)
  };
}

/**
 * Resolve the actual card selected from the acting player's private hand
 * before Store.dispatch mutates that hand. This identity is trace-only: it is
 * never included in publicStateSnapshot or passed to a policy.
 */
function selectedCardIdentity(action,state,actingSeat,cardActions) {
  const PlayCardAction=cardActions?.PlayCardAction;
  assert.equal(typeof PlayCardAction,'function',
    'native PlayCardAction class is required for trace identity');
  if(!(action instanceof PlayCardAction)) return null;
  assert.ok(actingSeat===0||actingSeat===1,
    'PlayCardAction must be attributed to a physical acting seat');
  const owner=state?.players?.[actingSeat];
  assert.ok(owner,'PlayCardAction owner is missing from the native state');
  assert.equal(owner.id,action.id,
    'PlayCardAction player id does not match the acting physical seat');
  const handIndex=action.handIndex;
  assert.ok(Number.isInteger(handIndex)&&handIndex>=0,
    'PlayCardAction has no valid physical hand index');
  const handCards=owner.hand?.cards;
  assert.ok(Array.isArray(handCards),
    'PlayCardAction owner hand is not an array-backed native zone');
  const card=handCards[handIndex];
  assert.ok(card&&typeof card.fullName==='string'&&card.fullName.trim().length>0,
    'PlayCardAction selected physical card has no resolved fullName');
  const identity={
    playerId:owner.id,
    handIndex,
    fullName:card.fullName
  };
  for(const key of ['name','set','setNumber','number','language']) {
    const value=card[key];
    if(typeof value==='string' || (typeof value==='number' && Number.isFinite(value)))
      identity[key]=value;
  }
  return identity;
}

function validateInputs(input) {
  assert.ok(input&&typeof input==='object','fixture match input is required');
  const native=input.native;
  for(const name of ['Store','GameSettings','SimpleTacticsAi','AddPlayerAction',
    'ResolvePromptAction','ShuffleDeckPrompt','CoinFlipPrompt']) {
    assert.equal(typeof native?.[name],'function','missing native dependency: '+name);
  }
  assert.equal(typeof native?.cardActions?.PlayCardAction,'function',
    'missing native dependency: PlayCardAction');
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
  if(input.diagnosticSnapshot!==undefined)
    assert.equal(typeof input.diagnosticSnapshot,'function',
      'diagnosticSnapshot must be an injected outer-runner callback');
  if(input.requireFullStateDiagnostics===true) {
    assert.equal(typeof input.diagnosticSnapshot,'function',
      'full-state diagnostics are required for this fixture');
    assert.equal(typeof native.observe,'function',
      'the exact actor-observation function is required for this fixture');
  }
  normalizeSeed32(input.seed);
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
  const seed32=normalizeSeed32(input.seed);
  const {
    Store,GameSettings,SimpleTacticsAi,AddPlayerAction,ResolvePromptAction,
    ShuffleDeckPrompt,CoinFlipPrompt,GamePhase,Format
  }=native;
  const previousRandom=Math.random;
  const physicalRandom=seededRandom(seed32);
  const policyRandom=POLICY_SEED_XORS.map(xor=>
    seededRandom((seed32^xor)>>>0));
  const decisionTrace=[];
  const rootActionLedger=[];
  const actionCountsBySeat=[0,0];
  let actions=0;
  let actualFirstPlayerSeat=null;
  let store;
  let seats;
  let failureContext=null;

  const redactError=error=>{
    const message=String(error?.message??error??'native fixture failure');
    return {
      name:error?.name??'Error',
      messageSha256:sha256Json({message}),
      messageLength:message.length
    };
  };
  const captureDiagnostic=(state,context)=>{
    if(typeof input.diagnosticSnapshot!=='function') return null;
    const snapshot=input.diagnosticSnapshot(state,{
      trialId:input.trialId??null,
      ...context
    });
    assert.ok(snapshot&&typeof snapshot==='object'&&!Array.isArray(snapshot),
      'diagnosticSnapshot must return a detached object');
    if(input.requireFullStateDiagnostics===true) {
      assert.equal(snapshot.schema,'twinleaf-full-state-diagnostic-v1',
        'full-state diagnostic schema is not the pinned fixture schema');
      assert.equal(snapshot.visibility,'private-offline-diagnostic-only',
        'full-state diagnostic must retain its private offline marker');
    }
    return projectJsonSafe(snapshot);
  };
  const safePublicSnapshot=state=>{
    try { return state?publicStateSnapshot(state):null; }
    catch(error) { return {snapshotFailure:redactError(error)}; }
  };
  const inferredPromptSeat=(state,pending)=>{
    if(!pending) return state.activePlayer===0||state.activePlayer===1?
      state.activePlayer:null;
    if(pending instanceof ShuffleDeckPrompt) {
      const ownerId=pending.getPerspectivePlayerId();
      const seat=state.players.findIndex(player=>player.id===ownerId);
      return seat===-1?null:seat;
    }
    if(pending.playerId===undefined) return null;
    const seat=state.players.findIndex(player=>player.id===pending.playerId);
    return seat===-1?null:seat;
  };
  const buildPartial=(error,context)=>{
    const state=store?.state??null;
    const last=decisionTrace[decisionTrace.length-1]??null;
    const finalPublicState=safePublicSnapshot(state);
    let finalFullState=last?.fullStateAfter??null;
    let finalDiagnosticFailure=null;
    if(!finalFullState&&state&&typeof input.diagnosticSnapshot==='function') {
      try {
        const pending=Array.isArray(state.prompts)?
          state.prompts.find(prompt=>prompt.result===undefined)??null:null;
        finalFullState=captureDiagnostic(state,{
          stage:'failure-final',
          actionOrdinal:decisionTrace.length,
          actingSeat:inferredPromptSeat(state,pending),
          turn:state.turn??null,
          phase:state.phase??null,
          pendingPromptType:pending?.constructor?.name??null,
          pendingPromptId:pending?.id??null,
          actualFirstPlayerSeat
        });
      } catch(diagnosticError) {
        finalDiagnosticFailure=redactError(diagnosticError);
      }
    }
    const failedRecord=context?.record??null;
    const cause=error?.cause??error;
    const failure={
      stage:context?.stage??'game-loop',
      actionOrdinal:failedRecord?.actionOrdinal??actions,
      actingSeat:failedRecord?.actingSeat??null,
      actingPlayerId:failedRecord?.actingPlayerId??null,
      phaseBefore:failedRecord?.phaseBefore??state?.phase??null,
      turnBefore:failedRecord?.turnBefore??state?.turn??null,
      pendingPromptType:failedRecord?.pendingPromptType??null,
      pendingPromptId:failedRecord?.pendingPromptId??null,
      actionName:failedRecord?.actionName??null,
      actionPayloadSha256:failedRecord?.actionPayloadSha256??null,
      ...redactError(cause)
    };
    const partial={
      schema:'aichi-native-fixture-game-partial-v1',
      fixtureOnly:true,
      admissionEligible:false,
      competitiveGameQualified:false,
      seed:input.seed,
      seed32,
      seedDerivation:typeof input.seed==='string'?'sha256-first-u32le':'identity-uint32',
      randomizationProtocol:'xorshift32-physical-and-seat-policy-streams-v1',
      policySeedBySeat:POLICY_SEED_XORS.map(xor=>(seed32^xor)>>>0),
      candidateSeat:input.candidateSeat,
      originalSourceSeat:input.originalSourceSeat,
      actualFirstPlayerSeat,
      acceptedActions:actions,
      attemptedActions:decisionTrace.length,
      turns:state?.turn??null,
      finished:false,
      endReason:'fixture-execution-failed',
      actionCountsBySeat:[...actionCountsBySeat],
      decisionTrace,
      rootActionLedger,
      decisionTraceSha256:sha256Json(decisionTrace),
      rootActionLedgerSha256:sha256Json(rootActionLedger),
      failedAction:failedRecord&&failedRecord.dispatchStatus!=='succeeded'&&
        failedRecord.actionName?failedRecord:null,
      finalPublicState,
      finalPublicStateSha256:finalPublicState===null?null:sha256Json(finalPublicState),
      finalFullState,
      finalFullStateSha256:finalFullState===null?null:sha256Json(finalFullState),
      finalDiagnosticFailure,
      failure
    };
    return partial;
  };
  const wrapFailure=(error,context)=>{
    const partial=buildPartial(error,context);
    const wrapped=new Error(String(error?.message??error??'native fixture failure'));
    wrapped.name=error?.name??'Error';
    wrapped.cause=error;
    wrapped.fixtureGamePartial=partial;
    wrapped.nativeFixtureFailure=partial.failure;
    return wrapped;
  };

  try {
    Math.random=physicalRandom;
    const settings=new GameSettings();
    settings.format=Format.EXPANDED;
    settings.recordingEnabled=false;
    assert.ok(settings.rules&&typeof settings.rules==='object',
      'Twinleaf GameSettings did not expose mutable rules');
    settings.rules.firstTurnDrawCard=true;
    settings.rules.firstTurnUseSupporter=false;
    settings.rules.attackFirstTurn=false;

    store=new Store({onStateChange:()=>{}});
    store.state.gameSettings=settings;
    store.state.rules=settings.rules;

    seats=[
      new SimpleTacticsAi({id:PLAYER_IDS[0]},input.botOptionsBySeat[0],input.deckA),
      new SimpleTacticsAi({id:PLAYER_IDS[1]},input.botOptionsBySeat[1],input.deckB)
    ];
    (input.onRootAgentsCreated??input.onAgentsCreated)?.(seats);

    store.dispatch(new AddPlayerAction(PLAYER_IDS[0],
      input.playerNames?.[0]??'fixture-seat-0',input.deckA));
    if(store.state.phase===GamePhase.FINISHED)
      throw new Error('Twinleaf rejected fixture deck A during player registration');
    store.dispatch(new AddPlayerAction(PLAYER_IDS[1],
      input.playerNames?.[1]??'fixture-seat-1',input.deckB));
    if(store.state.phase===GamePhase.FINISHED)
      throw new Error('Twinleaf rejected fixture deck B during player registration');

    while(store.state.phase!==GamePhase.FINISHED && actions<maxActions) {
      const state=store.state;
      assert.ok(Array.isArray(state.prompts),'Twinleaf state.prompts is not an array');
      const pending=state.prompts.find(prompt=>prompt.result===undefined)??null;
      const actionOrdinal=actions;
      const pendingPromptType=pending?.constructor?.name??null;
      const pendingPromptId=pending?.id??null;
      const phaseBefore=state.phase;
      const turnBefore=state.turn;
      const activePlayerBefore=state.activePlayer??null;
      const diagnosticSeat=inferredPromptSeat(state,pending);
      failureContext={
        stage:'pre-action-snapshot',
        record:{
          actionOrdinal,actingSeat:diagnosticSeat,
          actingPlayerId:diagnosticSeat===null?null:PLAYER_IDS[diagnosticSeat],
          phaseBefore,turnBefore,pendingPromptType,pendingPromptId,
          actionName:null,actionPayloadSha256:null,dispatchStatus:'not-dispatched'
        }
      };
      if(!pending && state.phase===GamePhase.PLAYER_TURN &&
          actualFirstPlayerSeat===null) {
        assert.ok(state.activePlayer===0||state.activePlayer===1,
          'Twinleaf did not expose the actual first-player seat');
        actualFirstPlayerSeat=state.activePlayer;
      }
      const publicBefore=publicStateSnapshot(state);
      const fullStateBefore=captureDiagnostic(state,{
        stage:'before',
        actionOrdinal,
        actingSeat:diagnosticSeat,
        turn:turnBefore,
        phase:phaseBefore,
        pendingPromptType,
        pendingPromptId,
        actualFirstPlayerSeat
      });

      let action;
      let actingSeat=null;
      let isRootDecision=false;
      let promptResolution=null;
      let actorObservationBefore=null;
      let promptResolverContext=null;
      let policyInputKind='native-prompt';
      if(pending instanceof ShuffleDeckPrompt) {
        failureContext={
          stage:'physical-prompt-resolution',
          record:{
            actionOrdinal,actingSeat:inferredPromptSeat(state,pending),
            actingPlayerId:inferredPromptSeat(state,pending)===null?null:
              PLAYER_IDS[inferredPromptSeat(state,pending)],
            phaseBefore,turnBefore,pendingPromptType,pendingPromptId,
            actionName:null,actionPayloadSha256:null,dispatchStatus:'not-dispatched'
          }
        };
        const ownerId=pending.getPerspectivePlayerId();
        const owner=state.players.find(player=>player.id===ownerId);
        if(!owner) throw new Error('Twinleaf shuffle prompt has no deck owner');
        actingSeat=state.players.indexOf(owner);
        if(actingSeat!==0&&actingSeat!==1)
          throw new Error('Twinleaf shuffle prompt owner is outside the two seats');
        const permutation=deckPermutation(owner.deck.cards.length,physicalRandom);
        action=new ResolvePromptAction(pending.id,permutation);
        promptResolution={
          kind:'shuffle',ownerSeat:actingSeat,cardCount:permutation.length,
          permutationSha256:sha256Json(permutation)
        };
        policyInputKind='physical-randomization-prompt';
      } else if(pending instanceof CoinFlipPrompt) {
        failureContext={
          stage:'physical-prompt-resolution',
          record:{
            actionOrdinal,actingSeat:inferredPromptSeat(state,pending),
            actingPlayerId:inferredPromptSeat(state,pending)===null?null:
              PLAYER_IDS[inferredPromptSeat(state,pending)],
            phaseBefore,turnBefore,pendingPromptType,pendingPromptId,
            actionName:null,actionPayloadSha256:null,dispatchStatus:'not-dispatched'
          }
        };
        if(pending.playerId!==undefined) {
          const seat=state.players.findIndex(player=>player.id===pending.playerId);
          actingSeat=seat===-1?null:seat;
        }
        const result=physicalRandom()<0.5;
        action=new ResolvePromptAction(pending.id,result);
        promptResolution={kind:'coin-flip',result};
        policyInputKind='physical-randomization-prompt';
      } else if(pending) {
        actingSeat=state.players.findIndex(player=>player.id===pending.playerId);
        if(actingSeat!==0&&actingSeat!==1)
          throw new Error('Unknown Twinleaf prompt player: '+pending.playerId);
        failureContext={
          stage:'prompt-resolver-decode',
          record:{
            actionOrdinal,actingSeat,actingPlayerId:PLAYER_IDS[actingSeat],
            phaseBefore,turnBefore,pendingPromptType,pendingPromptId,
            actionName:null,actionPayloadSha256:null,dispatchStatus:'not-dispatched'
          }
        };
        policyInputKind='native-owner-prompt';
        action=decodeWithPolicyRandom(seats[actingSeat],state,policyRandom[actingSeat]);
      } else {
        if(state.phase!==GamePhase.PLAYER_TURN)
          throw new Error('Unhandled Twinleaf game phase: '+state.phase);
        actingSeat=state.activePlayer;
        if(actingSeat!==0&&actingSeat!==1)
          throw new Error('Twinleaf activePlayer is outside the two seats');
        isRootDecision=true;
        failureContext={
          stage:'policy-decode',
          record:{
            actionOrdinal,actingSeat,actingPlayerId:PLAYER_IDS[actingSeat],
            phaseBefore,turnBefore,pendingPromptType,pendingPromptId,
            actionName:null,actionPayloadSha256:null,dispatchStatus:'not-dispatched'
          }
        };
        if(typeof native.observe==='function')
          actorObservationBefore=projectJsonSafe(native.observe(state,actingSeat));
        action=decodeWithPolicyRandom(seats[actingSeat],state,policyRandom[actingSeat]);
        policyInputKind='actor-observation';
      }

      if(!action)
        throw new Error('Native fixture policy failed to produce an action');
      failureContext={
        stage:'trace-prepare',
        record:{
          actionOrdinal,actingSeat,
          actingPlayerId:actingSeat===null?null:PLAYER_IDS[actingSeat],
          phaseBefore,turnBefore,pendingPromptType,pendingPromptId,
          actionName:actionName(action),actionPayloadSha256:null,
          dispatchStatus:'not-dispatched'
        }
      };
      const actionPayload=projectActionPayload(action);
      const actionPayloadSha256=sha256Json(actionPayload);
      failureContext.record.actionPayloadSha256=actionPayloadSha256;
      const selectedIdentity=selectedCardIdentity(action,state,actingSeat,native.cardActions);
      const targetProjection=action instanceof native.cardActions.PlayCardAction?
        projectJsonSafe(action.target??null):null;
      if(pending) {
        const promptSnapshot=fullStateBefore?.prompts?.find(prompt=>
          prompt.id===pendingPromptId)??projectJsonSafe(pending);
        const promptFields=promptSnapshot?.fields??promptSnapshot??{};
        promptResolverContext={
          promptId:pendingPromptId,
          promptType:pendingPromptType,
          playerId:pending.playerId??null,
          perspectivePlayerId:promptSnapshot?.perspectivePlayerId??
            (typeof pending.getPerspectivePlayerId==='function'?
              pending.getPerspectivePlayerId():pending.playerId??null),
          actingSeat,
          resolver:pending instanceof ShuffleDeckPrompt||pending instanceof CoinFlipPrompt?
            'physical-randomization':'native-prompt-resolver',
          message:promptFields.message??promptFields.text??null,
          availableOptions:{
            cards:promptFields.cards??null,
            options:promptFields.options??null,
            choices:promptFields.choices??null,
            targets:promptFields.targets??null,
            availableCards:promptFields.availableCards??null,
            eligibleCards:promptFields.eligibleCards??null
          },
          promptSnapshot
        };
      }
      const actorObservationSha256=actorObservationBefore===null?
        null:sha256Json(actorObservationBefore);
      const record={
        actionOrdinal,
        actingSeat,
        actingPlayerId:actingSeat===null?null:PLAYER_IDS[actingSeat],
        phaseBefore,
        turnBefore,
        activePlayerBefore,
        pendingPromptType,
        pendingPromptId,
        promptResolution,
        isRootDecision,
        policyInputKind,
        actorObservationBefore,
        actorObservationSha256,
        promptResolverContext,
        actionName:actionName(action),
        actionType:action.type??null,
        actionPayload,
        actionPayloadSha256,
        selectedCardIdentity:selectedIdentity,
        targetProjection,
        publicStateBefore:publicBefore,
        fullStateBefore,
        dispatchStatus:'pending'
      };
      decisionTrace.push(record);
      const ledgerRecord={
        actionOrdinal:record.actionOrdinal,
        turnBefore:record.turnBefore,
        turnAfter:null,
        playerSlot:actingSeat,
        action:record.actionName,
        actionPayloadSha256:record.actionPayloadSha256,
        pendingPrompt:record.pendingPromptType,
        isRootDecision,
        promptResolution,
        selectedCardIdentity:selectedIdentity,
        targetProjection,
        policyInputKind,
        actorObservationSha256,
        promptResolverContext,
        dispatchStatus:'pending',
        failure:null
      };
      rootActionLedger.push(ledgerRecord);
      failureContext=null;

      try {
        store.dispatch(action);
      } catch(error) {
        record.dispatchStatus='failed';
        record.failure=redactError(error);
        try { record.publicStateAfter=publicStateSnapshot(store.state); }
        catch(snapshotError) { record.publicStateAfterFailure=redactError(snapshotError); }
        try {
          record.fullStateAfter=captureDiagnostic(store.state,{
            stage:'after-failed-dispatch',
            actionOrdinal,
            actingSeat,
            turn:store.state.turn??null,
            phase:store.state.phase??null,
            pendingPromptType,
            pendingPromptId,
            actualFirstPlayerSeat
          });
        } catch(diagnosticError) {
          record.diagnosticSnapshotFailure=redactError(diagnosticError);
        }
        ledgerRecord.turnAfter=store.state.turn??null;
        ledgerRecord.dispatchStatus='failed';
        ledgerRecord.failure=record.failure;
        failureContext={stage:'dispatch',record};
        throw error;
      }

      actions++;
      if(actingSeat===0||actingSeat===1) actionCountsBySeat[actingSeat]++;
      record.dispatchStatus='succeeded';
      try { record.publicStateAfter=publicStateSnapshot(store.state); }
      catch(snapshotError) {
        record.publicStateAfterFailure=redactError(snapshotError);
        failureContext={stage:'post-dispatch-public-snapshot',record};
        throw snapshotError;
      }
      try {
        record.fullStateAfter=captureDiagnostic(store.state,{
          stage:'after',
          actionOrdinal,
          actingSeat,
          turn:store.state.turn??null,
          phase:store.state.phase??null,
          pendingPromptType,
          pendingPromptId,
          actualFirstPlayerSeat
        });
      } catch(diagnosticError) {
        record.diagnosticSnapshotFailure=redactError(diagnosticError);
        failureContext={stage:'post-dispatch-full-state-snapshot',record};
        throw diagnosticError;
      }
      ledgerRecord.turnAfter=store.state.turn;
      ledgerRecord.dispatchStatus='succeeded';
      if(input.onAction) {
        failureContext={stage:'on-action-callback',record};
        input.onAction(record);
        failureContext=null;
      }
    }

    if(store.state.phase!==GamePhase.FINISHED) {
      const failure=new Error('Native fixture game exceeded maxActions without a natural terminal state');
      failureContext={stage:'action-cap',record:null};
      throw failure;
    }
    if(actualFirstPlayerSeat!==0&&actualFirstPlayerSeat!==1)
      throw new Error('Native fixture game finished without a captured first-player seat');

    const finalState=publicStateSnapshot(store.state);
    const rawWinner=store.state.winner??null;
    const winnerPlayerId=rawWinner&&typeof rawWinner==='object'?
      (rawWinner.id??null):rawWinner;
    let winnerSeat=store.state.players.findIndex(player=>
      player.id===winnerPlayerId);
    if(winnerSeat===-1 && (rawWinner===0 || rawWinner===1))
      winnerSeat=rawWinner;
    const winner=rawWinner&&typeof rawWinner==='object'?
      {playerId:winnerPlayerId}:rawWinner;

    const result={
      schema:SCHEMA,
      fixtureOnly:true,
      admissionEligible:false,
      competitiveGameQualified:false,
      seed:input.seed,
      seed32,
      seedDerivation:typeof input.seed==='string'?'sha256-first-u32le':'identity-uint32',
      randomizationProtocol:'xorshift32-physical-and-seat-policy-streams-v1',
      policySeedBySeat:POLICY_SEED_XORS.map(xor=>(seed32^xor)>>>0),
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
      fullStateDiagnosticsEnabled:typeof input.diagnosticSnapshot==='function',
      diagnosticVisibility:typeof input.diagnosticSnapshot==='function'?
        'private-offline-diagnostic-only':null,
      decisionTrace,
      rootActionLedger,
      decisionTraceSha256:sha256Json(decisionTrace),
      rootActionLedgerSha256:sha256Json(rootActionLedger),
      finalPublicState:finalState,
      finalPublicStateSha256:sha256Json(finalState)
    };
    return result;
  } catch(error) {
    if(error?.fixtureGamePartial) throw error;
    throw wrapFailure(error,failureContext??{stage:'game-loop',record:null});
  } finally {
    Math.random=previousRandom;
  }
}

module.exports={
  SCHEMA,
  seededRandom,
  deckPermutation,
  publicStateSnapshot,
  projectActionPayload,
  selectedCardIdentity,
  runNativeFixtureGame,
  normalizeSeed32
};
