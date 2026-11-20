'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {evidenceBundleSha256}=require('../agent45-independent-competitive-admission.cjs');

const PLAYER_IDS=Object.freeze([101,202]);
const SCHEMA='aichi-native-fixture-game-v1';

/**
 * Capture every own property and object identity in the live Store state without
 * invoking getters or serializing private card data to an artifact. IDs persist
 * across snapshots, so replacement of an otherwise equal nested object is also
 * detected. Unsupported weak collections fail closed.
 */
function createStoreStateSnapshotter(){
  const objectIds=new WeakMap();
  const symbolIds=new Map();
  let nextObjectId=1;
  let nextSymbolId=1;
  const objectId=value=>{
    let id=objectIds.get(value);
    if(id===undefined){id=nextObjectId++;objectIds.set(value,id);}
    return id;
  };
  const symbolId=value=>{
    let id=symbolIds.get(value);
    if(id===undefined){id=nextSymbolId++;symbolIds.set(value,id);}
    return id;
  };
  function snapshot(value,seen=new WeakSet()){
    const type=typeof value;
    if(value===null)return ['null'];
    if(type==='undefined')return ['undefined'];
    if(type==='symbol')return ['symbol',symbolId(value),Symbol.keyFor(value)??value.description??null];
    if(type==='bigint')return ['bigint',value.toString()];
    if(type==='number'){
      if(Number.isNaN(value))return ['number','NaN'];
      if(Object.is(value,-0))return ['number','-0'];
      if(!Number.isFinite(value))return ['number',String(value)];
      return ['number',value];
    }
    if(type==='string'||type==='boolean')return [type,value];
    if(type!=='object'&&type!=='function')return [type,String(value)];
    const id=objectId(value);
    if(seen.has(value))return ['reference',id];
    seen.add(value);
    if(type==='function')return ['function',id,value.name,value.length];
    if(value instanceof WeakMap||value instanceof WeakSet)
      throw new Error('full Store-state equality cannot inspect a weak collection');
    let special=null;
    if(Buffer.isBuffer(value))special=['buffer',value.toString('hex')];
    else if(ArrayBuffer.isView(value))
      special=[value.constructor?.name??'typed-array',
        Buffer.from(value.buffer,value.byteOffset,value.byteLength).toString('hex')];
    else if(value instanceof ArrayBuffer)
      special=['array-buffer',Buffer.from(value).toString('hex')];
    else if(value instanceof Date)special=['date',value.getTime()];
    else if(value instanceof RegExp)special=['regexp',value.source,value.flags,value.lastIndex];
    else if(value instanceof Map)
      special=['map',[...value.entries()].map(([key,item])=>[snapshot(key,seen),snapshot(item,seen)])];
    else if(value instanceof Set)
      special=['set',[...value.values()].map(item=>snapshot(item,seen))];
    const prototype=Object.getPrototypeOf(value);
    const properties=Reflect.ownKeys(value).map(key=>{
      const descriptor=Object.getOwnPropertyDescriptor(value,key);
      const keySnapshot=typeof key==='symbol'?
        ['symbol-key',symbolId(key),Symbol.keyFor(key)??key.description??null]:
        ['string-key',key];
      const valueSnapshot=Object.hasOwn(descriptor,'value')?
        ['data',descriptor.writable,snapshot(descriptor.value,seen)]:
        ['accessor',descriptor.get?objectId(descriptor.get):null,
          descriptor.set?objectId(descriptor.set):null];
      return [keySnapshot,descriptor.enumerable,descriptor.configurable,valueSnapshot];
    }).sort((a,b)=>JSON.stringify(a[0]).localeCompare(JSON.stringify(b[0])));
    return ['object',id,prototype?objectId(prototype):null,special,properties];
  }
  return value=>snapshot(value);
}

let activeNativeFixtureProcessLock=null;
function acquireNativeFixtureProcessLock(owner='native-fixture') {
  assert.ok(typeof owner==='string'&&owner.length>0);
  if(activeNativeFixtureProcessLock!==null) {
    const error=new Error('another native fixture already owns process-global engine hooks');
    error.code='FIXTURE_PROCESS_OVERLAP';
    throw error;
  }
  const token=Object.freeze({owner,nonce:Symbol(owner)});
  activeNativeFixtureProcessLock=token;
  return token;
}
function releaseNativeFixtureProcessLock(token) {
  assert.ok(token&&activeNativeFixtureProcessLock===token,
    'only the current native fixture lock owner may release the process lock');
  activeNativeFixtureProcessLock=null;
  return true;
}
function assertNativeFixtureProcessLock(token) {
  assert.ok(token&&activeNativeFixtureProcessLock===token,
    'native fixture process lock token is not active');
  return true;
}

function normalizeSeed32(seed) {
  if (Number.isInteger(seed) && seed >= 0 && seed <= 0xffffffff) return seed >>> 0;
  assert.ok(typeof seed === 'string' && seed.trim().length > 0,
    'fixture seed must be an unsigned 32-bit integer or a non-empty stable string');
  const digest = createHash('sha256').update(seed, 'utf8').digest();
  return digest.readUInt32LE(0);
}

/**
 * Policy RNG seeds are explicit per-seat inputs. Never derive them from the
 * physical shuffle seed: actor-visible random output must reveal nothing
 * about physical randomization.
 */
function normalizePolicySeedBySeat(policySeedBySeat,physicalSeed32) {
  assert.ok(Array.isArray(policySeedBySeat)&&policySeedBySeat.length===PLAYER_IDS.length,
    'two explicit per-seat policy RNG seeds are required');
  const normalized=policySeedBySeat.map(seed=>normalizeSeed32(seed));
  assert.notEqual(normalized[0],normalized[1],
    'each physical seat must have a distinct policy RNG seed');
  for(let seat=0;seat<normalized.length;seat++) {
    assert.notEqual(normalized[seat],physicalSeed32,
      'policy RNG seed for seat '+seat+' must not reuse the physical shuffle seed');
  }
  return normalized;
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

function createValidationRandomScope({ambientRandom,physicalRandom,seed=0x6d2b79f5}={}) {
  assert.equal(typeof ambientRandom,'function',
    'validation random scope requires the original ambient Math.random');
  assert.equal(typeof physicalRandom,'function',
    'validation random scope requires the independent physical RNG closure');
  const validationSeed=normalizeSeed32(seed);
  return function withValidationRandom(callback) {
    assert.equal(typeof callback,'function');
    assert.strictEqual(Math.random,ambientRandom,
      'validation random scope must begin with ambient Math.random restored');
    const validationRandom=seededRandom(validationSeed);
    assert.notStrictEqual(validationRandom,physicalRandom,
      'validation random stream must be independent of physical shuffle RNG');
    Math.random=validationRandom;
    try {
      const value=callback();
      assert.ok(!value||typeof value.then!=='function',
        'validation random scope must contain synchronous simulator probes only');
      return value;
    } finally {
      Math.random=ambientRandom;
    }
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

function prizeCount(zone) {
  if(!Array.isArray(zone)) return null;
  let total=0;
  for(const slot of zone) {
    if(!Array.isArray(slot?.cards)) return null;
    total+=slot.cards.length;
  }
  return total;
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
      prizeCount:prizeCount(player?.prizes),
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

function validateInputs(input,{requirePolicySeeds=true}={}) {
  assert.ok(input&&typeof input==='object','fixture match input is required');
  const native=input.native;
  for(const name of ['Store','GameSettings','SimpleTacticsAi','AddPlayerAction',
    'ResolvePromptAction','ShuffleDeckPrompt','CoinFlipPrompt','WaitPrompt']) {
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
  const seed32=normalizeSeed32(input.seed);
  const policySeedBySeat=input.policySeedBySeat===undefined&&!requirePolicySeeds?
    null:normalizePolicySeedBySeat(input.policySeedBySeat,seed32);
  assert.ok(input.candidateSeat===0||input.candidateSeat===1,
    'candidateSeat must be physical seat 0 or 1');
  assert.equal(input.originalSourceSeat,1-input.candidateSeat,
    'candidate and original-source seats must be opposite');
  const maxActions=input.maxActions===undefined?3000:input.maxActions;
  assert.ok(maxActions===null || (Number.isInteger(maxActions)&&maxActions>0),
    'maxActions must be null or a positive integer');
  if(input.stopBeforeLiveDispatch===true){
    assert.ok(input.expectedActorSeat===0||input.expectedActorSeat===1,
      'no-game witness requires an expected physical actor seat');
    assert.equal(maxActions,null,
      'no-game witness must not use a game-action cap');
  }
  return {native,maxActions,seed32,policySeedBySeat};
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
function* runNativeFixtureGameSteps(input,{requirePolicySeeds=true}={}) {
  const {native,maxActions,seed32,policySeedBySeat}=validateInputs(input,{requirePolicySeeds});
  const {
    Store,GameSettings,SimpleTacticsAi,AddPlayerAction,ResolvePromptAction,
    ShuffleDeckPrompt,CoinFlipPrompt,WaitPrompt,GamePhase,Format
  }=native;
  const previousRandom=Math.random;
  const physicalRandom=seededRandom(seed32);
  const withPhysicalRandom=callback=>{
    assert.strictEqual(Math.random,previousRandom,
      'physical random scope must begin with ambient Math.random restored');
    Math.random=physicalRandom;
    try {
      const value=callback();
      assert.ok(!value||typeof value.then!=='function',
        'physical random scope must contain synchronous engine operations only');
      return value;
    } finally {
      Math.random=previousRandom;
    }
  };
  const withValidationRandom=createValidationRandomScope({
    ambientRandom:previousRandom,physicalRandom
  });
  const policyRandom=policySeedBySeat?.map(seed=>seededRandom(seed))??null;
  const decisionTrace=[];
  const rootActionLedger=[];
  const actionCountsBySeat=[0,0];
  let actions=0;
  let actualFirstPlayerSeat=null;
  let nativeStoreCreated=false;
  let bothPlayersRegistered=false;
  let store;
  let seats;
  let storeHook=null;
  let storeHookRestored=false;
  let completedResult=null;
  let failureContext=null;
  let primaryFailureSummary=null;
  const snapshotStoreState=input.stopBeforeLiveDispatch===true?
    createStoreStateSnapshotter():null;

  const projectSafeStackSite=error=>{
    const stack=typeof error?.stack==='string'?error.stack:'';
    for(const frame of stack.split('\n').slice(1)){
      const match=frame.match(/\(([^()\n]+):(\d+):(\d+)\)$/)||
        frame.match(/^\s*at ([^()\s]+):(\d+):(\d+)$/);
      if(!match)continue;
      const rawPath=match[1].trim().replace(/\\/g,'/');
      const marker='/experiment-01/';
      const markerIndex=rawPath.lastIndexOf(marker);
      const file=markerIndex>=0?rawPath.slice(markerIndex+marker.length):rawPath;
      if(!/^(?:simulation|vendor\/twinleaf)\/[A-Za-z0-9_.\/-]{1,240}$/.test(file)||
          file.split('/').includes('..'))continue;
      const line=Number(match[2]),column=Number(match[3]);
      if(!Number.isSafeInteger(line)||line<1||
          !Number.isSafeInteger(column)||column<1)continue;
      return {file,line,column};
    }
    return null;
  };
  const redactError=error=>{
    const message=String(error?.message??error??'native fixture failure');
    const stackSite=projectSafeStackSite(error);
    return {
      name:error?.name??'Error',
      messageSha256:sha256Json({message}),
      messageLength:message.length,
      ...(stackSite?{stackSite}:{})
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
  const buildPromptResolverContext=(pending,fullStateBefore,actingSeat)=>{
    if(!pending) return null;
    const promptSnapshot=fullStateBefore?.prompts?.find(prompt=>
      prompt.id===pending.id)??projectJsonSafe(pending);
    const promptFields=promptSnapshot?.fields??promptSnapshot??{};
    return {
      promptId:pending.id??null,
      promptType:pending.constructor?.name??'UnknownPrompt',
      playerId:pending.playerId??null,
      perspectivePlayerId:promptSnapshot?.perspectivePlayerId??
        (pending instanceof ShuffleDeckPrompt?
          (actingSeat===null?null:PLAYER_IDS[actingSeat]):pending.playerId??null),
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
        eligibleCards:promptFields.eligibleCards??null,
        selectedCards:promptFields.selectedCards??null,
        min:promptFields.min??null,
        max:promptFields.max??null,
        minCards:promptFields.minCards??null,
        maxCards:promptFields.maxCards??null,
        allowCancel:promptFields.allowCancel??null
      },
      promptSnapshot
    };
  };
  const buildPartial=(error,context)=>{
    const state=store?.state??null;
    const failedRecord=context?.record??null;
    const cause=error?.cause??error;
    const failedWorkerDecisionTrace=error?.workerDecisionTrace??cause?.workerDecisionTrace??null;
    const failedWorkerDecisionTraceSha256=failedWorkerDecisionTrace===null?null:
      sha256Json(failedWorkerDecisionTrace);
    const failedWorkerValidationReceipt=failedWorkerDecisionTrace?.validationReceipt??null;
    const failedWorkerValidationReceiptSha256=failedWorkerValidationReceipt===null?null:
      sha256Json(failedWorkerValidationReceipt);
    if(failedRecord&&failedWorkerDecisionTrace){
      failedRecord.workerDecisionTrace=failedWorkerDecisionTrace;
      failedRecord.workerDecisionTraceSha256=failedWorkerDecisionTraceSha256;
      failedRecord.validationReceipt=failedWorkerValidationReceipt;
      failedRecord.validationReceiptSha256=failedWorkerValidationReceiptSha256;
    }
    const finalPublicState=safePublicSnapshot(state);
    let finalFullState=null;
    let finalDiagnosticFailure=null;
    if(state&&typeof input.diagnosticSnapshot==='function') {
      try {
        const pending=Array.isArray(state.prompts)?
          state.prompts.find(prompt=>prompt.result===undefined)??null:null;
        finalFullState=captureDiagnostic(state,{
          stage:'failure-final',
          actionOrdinal:failedRecord?.actionOrdinal??decisionTrace.length,
          actingSeat:failedRecord?.actingSeat??inferredPromptSeat(state,pending),
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

    if(failedRecord) {
      const failureSummary=redactError(cause);
      if(!decisionTrace.includes(failedRecord)) {
        failedRecord.dispatchStatus=failedRecord.dispatchStatus??'not-dispatched';
        failedRecord.failure=failureSummary;
        if(failedRecord.publicStateAfter===undefined)
          failedRecord.publicStateAfter=finalPublicState;
        if(failedRecord.fullStateAfter===undefined)
          failedRecord.fullStateAfter=finalFullState;
        failedRecord.failureSnapshotStage='failure-final';
        decisionTrace.push(failedRecord);
      } else if(failedRecord.dispatchStatus==='pending') {
        failedRecord.dispatchStatus='not-dispatched';
        failedRecord.failure=failureSummary;
        if(failedRecord.publicStateAfter===undefined)
          failedRecord.publicStateAfter=finalPublicState;
        if(failedRecord.fullStateAfter===undefined)
          failedRecord.fullStateAfter=finalFullState;
        failedRecord.failureSnapshotStage='failure-final';
      } else if(failedRecord.dispatchStatus!=='succeeded'&&!failedRecord.failure) {
        failedRecord.failure=failureSummary;
      }

      if(!rootActionLedger.some(row=>row.actionOrdinal===failedRecord.actionOrdinal)) {
        rootActionLedger.push({
          actionOrdinal:failedRecord.actionOrdinal,
          turnBefore:failedRecord.turnBefore??null,
          turnAfter:state?.turn??null,
          playerSlot:failedRecord.actingSeat??null,
          action:failedRecord.actionName??null,
          actionPayloadSha256:failedRecord.actionPayloadSha256??null,
          pendingPrompt:failedRecord.pendingPromptType??null,
          isRootDecision:failedRecord.isRootDecision===true,
          promptResolution:failedRecord.promptResolution??null,
          selectedCardIdentity:failedRecord.selectedCardIdentity??null,
          targetProjection:failedRecord.targetProjection??null,
          policyInputKind:failedRecord.policyInputKind??null,
          actorObservationSha256:failedRecord.actorObservationSha256??null,
          workerDecisionTraceSha256:failedRecord.workerDecisionTraceSha256??null,
          validationReceiptSha256:failedRecord.validationReceiptSha256??null,
          promptResolverContext:failedRecord.promptResolverContext??null,
          dispatchStatus:failedRecord.dispatchStatus??'not-dispatched',
          failure:failedRecord.failure??failureSummary
        });
      }
    }

    const failure={
      stage:context?.stage??'game-loop',
      code:typeof cause?.code==='string'&&/^[A-Z0-9_]{1,64}$/.test(cause.code)?
        cause.code:'NATIVE_FIXTURE_FAILURE',
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
      randomizationProtocol:'xorshift32-physical-plus-independent-policy-streams-v2',
      policySeedProtocol:'explicit-per-seat-seeds-independent-of-physical-seed-v1',
      policySeedBySeat,
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
      failedWorkerDecision:failedWorkerDecisionTrace===null?null:{
        actionOrdinal:failedWorkerDecisionTrace.actionOrdinal??failedRecord?.actionOrdinal??null,
        workerDecisionTrace:failedWorkerDecisionTrace,
        workerDecisionTraceSha256:failedWorkerDecisionTraceSha256,
        validationReceipt:failedWorkerValidationReceipt,
        validationReceiptSha256:failedWorkerValidationReceiptSha256
      },
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
    wrapped.code=partial.failure.code;
    const seedProbeReason=error?.seedProbeReason;
    if([
      'mulliganPromptShape','startingPokemonPromptShape','startingPokemonBounds',
      'startingPokemonInsufficientChoices','opponentActiveStateMismatch',
      'startingPokemonMinimumUnmet','unsupportedOwnerPrompt','otherSetupIncompatible'
    ].includes(seedProbeReason))wrapped.seedProbeReason=seedProbeReason;
    wrapped.cause=error;
    wrapped.fixtureGamePartial=partial;
    wrapped.nativeFixtureFailure=partial.failure;
    return wrapped;
  };
  const projectFailureSummary=(failure,includePrimary=true)=>{
    if(!failure||typeof failure!=='object')return null;
    const summary={};
    for(const key of ['stage','code','actionOrdinal','actingSeat','phaseBefore',
      'turnBefore','pendingPromptType','actionName','actionPayloadSha256',
      'name','messageSha256','messageLength','stackSite']){
      const value=failure[key];
      if(value===undefined||value===null)continue;
      if(key==='stage'&&typeof value==='string'&&/^[a-z0-9-]{1,64}$/.test(value))summary[key]=value;
      else if(key==='code'&&typeof value==='string'&&/^[A-Z0-9_]{1,64}$/.test(value))summary[key]=value;
      else if(['actionOrdinal','turnBefore','messageLength'].includes(key)&&
        Number.isSafeInteger(value)&&value>=0)summary[key]=value;
      else if(key==='actingSeat'&&(value===0||value===1))summary[key]=value;
      else if(['phaseBefore','pendingPromptType','actionName'].includes(key)&&
        typeof value==='string'&&/^[A-Za-z0-9_.:-]{1,128}$/.test(value))summary[key]=value;
      else if(['actionPayloadSha256','messageSha256'].includes(key)&&
        typeof value==='string'&&/^[0-9a-f]{64}$/i.test(value))summary[key]=value;
      else if(key==='name'&&typeof value==='string'&&/^[A-Za-z0-9_.-]{1,64}$/.test(value))summary[key]=value;
      else if(key==='stackSite'&&value&&typeof value==='object'&&
        typeof value.file==='string'&&
        /^(?:simulation|vendor\/twinleaf)\/[A-Za-z0-9_.\/-]{1,240}$/.test(value.file)&&
        !value.file.split('/').includes('..')&&
        Number.isSafeInteger(value.line)&&value.line>0&&
        Number.isSafeInteger(value.column)&&value.column>0)
        summary.stackSite={file:value.file,line:value.line,column:value.column};
    }
    if(includePrimary&&failure.primaryFailure){
      const primary=projectFailureSummary(failure.primaryFailure,false);
      if(primary)summary.primaryFailure=primary;
    }
    return summary;
  };

  const ownsProcessLock=input.processLockToken===undefined;
  const processLockToken=ownsProcessLock?
    acquireNativeFixtureProcessLock('native-fixture-game'):input.processLockToken;
  assertNativeFixtureProcessLock(processLockToken);

  try {
    const settings=withPhysicalRandom(()=>new GameSettings());
    settings.format=Format.EXPANDED;
    settings.recordingEnabled=false;
    assert.ok(settings.rules&&typeof settings.rules==='object',
      'Twinleaf GameSettings did not expose mutable rules');
    settings.rules.firstTurnDrawCard=true;
    settings.rules.firstTurnUseSupporter=false;
    settings.rules.attackFirstTurn=false;

    store=withPhysicalRandom(()=>new Store({onStateChange:()=>{}}));
    nativeStoreCreated=store instanceof Store&&typeof store.dispatch==='function'&&
      store.state!==null&&typeof store.state==='object';
    assert.equal(nativeStoreCreated,true,
      'native no-game witness requires an actually constructed Twinleaf Store');
    if(typeof input.onStoreCreated==='function') {
      storeHook=input.onStoreCreated(store);
      assert.ok(storeHook&&typeof storeHook.restore==='function',
        'onStoreCreated must return a prompt-provenance hook with restore()');
    }
    store.state.gameSettings=settings;
    store.state.rules=settings.rules;

    seats=withPhysicalRandom(()=>[
      new SimpleTacticsAi({id:PLAYER_IDS[0]},input.botOptionsBySeat[0],input.deckA),
      new SimpleTacticsAi({id:PLAYER_IDS[1]},input.botOptionsBySeat[1],input.deckB)
    ]);
    (input.onRootAgentsCreated??input.onAgentsCreated)?.(seats);

    withPhysicalRandom(()=>store.dispatch(new AddPlayerAction(PLAYER_IDS[0],
      input.playerNames?.[0]??'fixture-seat-0',input.deckA)));
    if(store.state.phase===GamePhase.FINISHED)
      throw new Error('Twinleaf rejected fixture deck A during player registration');
    withPhysicalRandom(()=>store.dispatch(new AddPlayerAction(PLAYER_IDS[1],
      input.playerNames?.[1]??'fixture-seat-1',input.deckB)));
    if(store.state.phase===GamePhase.FINISHED)
      throw new Error('Twinleaf rejected fixture deck B during player registration');
    const registeredPlayers=store.state.players;
    bothPlayersRegistered=Array.isArray(registeredPlayers)&&registeredPlayers.length===2&&
      registeredPlayers[0]?.id===PLAYER_IDS[0]&&registeredPlayers[1]?.id===PLAYER_IDS[1];
    assert.equal(bothPlayersRegistered,true,
      'native no-game witness requires both physical players registered in the original Store');

    // Host-only diagnostic observers receive the original live Store only after
    // both players are registered and before the first decision/prompt dispatch.
    if(input.onGameReady) {
      failureContext={stage:'on-game-ready-callback',record:null};
      input.onGameReady({store,state:store.state});
      failureContext=null;
    }

    while(store.state.phase!==GamePhase.FINISHED &&
        (maxActions===null || actions<maxActions)) {
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
      const attemptRecord={
        actionOrdinal,
        actingSeat:diagnosticSeat,
        actingPlayerId:diagnosticSeat===null?null:PLAYER_IDS[diagnosticSeat],
        phaseBefore,
        turnBefore,
        activePlayerBefore,
        pendingPromptType,
        pendingPromptId,
        promptResolution:null,
        isRootDecision:false,
        policyInputKind:pending?'native-prompt':'actor-observation',
        actorObservationBefore:null,
        actorObservationSha256:null,
        promptResolverContext:null,
        workerDecisionTrace:null,
        workerDecisionTraceSha256:null,
        validationReceipt:null,
        validationReceiptSha256:null,
        actionName:null,
        actionType:null,
        actionPayload:null,
        actionPayloadSha256:null,
        selectedCardIdentity:null,
        targetProjection:null,
        publicStateBefore:null,
        fullStateBefore:null,
        dispatchStatus:'not-dispatched',
        failure:null
      };
      failureContext={stage:'pre-action-snapshot',record:attemptRecord};
      if(!pending && state.phase===GamePhase.PLAYER_TURN &&
          actualFirstPlayerSeat===null) {
        assert.ok(state.activePlayer===0||state.activePlayer===1,
          'Twinleaf did not expose the actual first-player seat');
        actualFirstPlayerSeat=state.activePlayer;
      }
      const publicBefore=publicStateSnapshot(state);
      attemptRecord.publicStateBefore=publicBefore;
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
      attemptRecord.fullStateBefore=fullStateBefore;

      let action;
      let actingSeat=diagnosticSeat;
      let isRootDecision=false;
      let promptResolution=null;
      let actorObservationBefore=null;
      let promptResolverContext=null;
      let policyInputKind='native-prompt';
      let originalStoreStateBeforeDecision=null;
      let workerDecisionTrace=null;
      let validationReceipt=null;
      if(pending instanceof ShuffleDeckPrompt) {
        failureContext.stage='physical-prompt-resolution';
        policyInputKind='physical-randomization-prompt';
        attemptRecord.policyInputKind=policyInputKind;
        const ownerId=pending.getPerspectivePlayerId();
        const owner=state.players.find(player=>player.id===ownerId);
        if(!owner) throw new Error('Twinleaf shuffle prompt has no deck owner');
        actingSeat=state.players.indexOf(owner);
        if(actingSeat!==0&&actingSeat!==1)
          throw new Error('Twinleaf shuffle prompt owner is outside the two seats');
        attemptRecord.actingSeat=actingSeat;
        attemptRecord.actingPlayerId=PLAYER_IDS[actingSeat];
        promptResolverContext=buildPromptResolverContext(pending,fullStateBefore,actingSeat);
        attemptRecord.promptResolverContext=promptResolverContext;
        const permutation=deckPermutation(owner.deck.cards.length,physicalRandom);
        action=new ResolvePromptAction(pending.id,permutation);
        promptResolution={
          kind:'shuffle',ownerSeat:actingSeat,cardCount:permutation.length,
          permutationSha256:sha256Json(permutation)
        };
        policyInputKind='physical-randomization-prompt';
      } else if(pending instanceof CoinFlipPrompt) {
        failureContext.stage='physical-prompt-resolution';
        policyInputKind='physical-randomization-prompt';
        attemptRecord.policyInputKind=policyInputKind;
        if(pending.playerId!==undefined) {
          const seat=state.players.findIndex(player=>player.id===pending.playerId);
          actingSeat=seat===-1?null:seat;
        }
        attemptRecord.actingSeat=actingSeat;
        attemptRecord.actingPlayerId=actingSeat===null?null:PLAYER_IDS[actingSeat];
        promptResolverContext=buildPromptResolverContext(pending,fullStateBefore,actingSeat);
        attemptRecord.promptResolverContext=promptResolverContext;
        const result=physicalRandom()<0.5;
        action=new ResolvePromptAction(pending.id,result);
        promptResolution={kind:'coin-flip',result};
        policyInputKind='physical-randomization-prompt';
      } else if(pending instanceof WaitPrompt) {
        failureContext.stage='engine-wait-prompt-resolution';
        policyInputKind='engine-wait-prompt';
        attemptRecord.policyInputKind=policyInputKind;
        if(actingSeat!==0&&actingSeat!==1)
          throw new Error('Twinleaf wait prompt has no known player');
        action=new ResolvePromptAction(pending.id,null);
        promptResolution={kind:'engine-wait',ownerSeat:actingSeat};
      } else if(pending) {
        actingSeat=state.players.findIndex(player=>player.id===pending.playerId);
        if(actingSeat!==0&&actingSeat!==1)
          throw new Error('Unknown Twinleaf prompt player: '+pending.playerId);
        attemptRecord.actingSeat=actingSeat;
        attemptRecord.actingPlayerId=PLAYER_IDS[actingSeat];
        promptResolverContext=buildPromptResolverContext(pending,fullStateBefore,actingSeat);
        attemptRecord.promptResolverContext=promptResolverContext;
        failureContext.stage='prompt-resolver-decode';
        policyInputKind='native-owner-prompt';
        attemptRecord.policyInputKind=policyInputKind;
        const resolution=yield {
          kind:'native-fixture-decision',decisionKind:'owner-prompt',
          actionOrdinal,
          state,store,prompt:pending,actorSeat:actingSeat,native,physicalRandom,withPhysicalRandom,withValidationRandom,
          ...(policyRandom?{
            legacyBot:seats[actingSeat],
            legacyRandomSource:policyRandom[actingSeat]
          }:{})
        };
        action=resolution?.__nativeFixtureDecisionResolution===true?
          resolution.action:resolution;
        if(resolution?.__nativeFixtureDecisionResolution===true){
          workerDecisionTrace=resolution.decisionTrace??null;
          validationReceipt=resolution.validationReceipt??null;
          if(resolution.promptResolution)promptResolution=resolution.promptResolution;
        }
      } else {
        if(state.phase!==GamePhase.PLAYER_TURN)
          throw new Error('Unhandled Twinleaf game phase: '+state.phase);
        actingSeat=state.activePlayer;
        if(actingSeat!==0&&actingSeat!==1)
          throw new Error('Twinleaf activePlayer is outside the two seats');
        isRootDecision=true;
        attemptRecord.actingSeat=actingSeat;
        attemptRecord.actingPlayerId=PLAYER_IDS[actingSeat];
        attemptRecord.isRootDecision=true;
        originalStoreStateBeforeDecision=snapshotStoreState?
          snapshotStoreState(store.state):null;
        failureContext.stage='actor-observation';
        if(typeof native.observe==='function')
          actorObservationBefore=projectJsonSafe(native.observe(state,actingSeat));
        attemptRecord.actorObservationBefore=actorObservationBefore;
        attemptRecord.actorObservationSha256=actorObservationBefore===null?
          null:sha256Json(actorObservationBefore);
        failureContext.stage='policy-decode';
        policyInputKind='actor-observation';
        attemptRecord.policyInputKind=policyInputKind;
        const resolution=yield {
          kind:'native-fixture-decision',decisionKind:'owner-root',
          actionOrdinal,
          state,store,prompt:null,actorSeat:actingSeat,native,physicalRandom,withPhysicalRandom,withValidationRandom,
          ...(policyRandom?{
            legacyBot:seats[actingSeat],
            legacyRandomSource:policyRandom[actingSeat]
          }:{})
        };
        validationReceipt=resolution?.validationReceipt??null;
        workerDecisionTrace=resolution?.decisionTrace??null;
        action=resolution?.__nativeFixtureDecisionResolution===true?
          resolution.action:resolution;
        if(resolution?.__nativeFixtureDecisionResolution===true&&
            resolution.promptResolution) promptResolution=resolution.promptResolution;
        policyInputKind='actor-observation';
      }
      if(!action)
        throw new Error('Native fixture policy failed to produce an action');
      failureContext.stage='trace-prepare';
      const actionPayload=projectActionPayload(action);
      const actionPayloadSha256=sha256Json(actionPayload);
      attemptRecord.actionName=actionName(action);
      attemptRecord.actionType=action.type??null;
      attemptRecord.actionPayload=actionPayload;
      attemptRecord.actionPayloadSha256=actionPayloadSha256;
      const selectedIdentity=selectedCardIdentity(action,state,actingSeat,native.cardActions);
      const targetProjection=action instanceof native.cardActions.PlayCardAction?
        projectJsonSafe(action.target??null):null;
      attemptRecord.selectedCardIdentity=selectedIdentity;
      attemptRecord.targetProjection=targetProjection;
      attemptRecord.actingSeat=actingSeat;
      attemptRecord.actingPlayerId=actingSeat===null?null:PLAYER_IDS[actingSeat];
      attemptRecord.promptResolution=promptResolution;
      attemptRecord.isRootDecision=isRootDecision;
      attemptRecord.policyInputKind=policyInputKind;
      attemptRecord.actorObservationBefore=actorObservationBefore;
      attemptRecord.actorObservationSha256=actorObservationBefore===null?
        null:sha256Json(actorObservationBefore);
      attemptRecord.promptResolverContext=promptResolverContext;
      if(workerDecisionTrace!==null){
        assert.equal(workerDecisionTrace.schema,'agent6-worker-decision-trace-v1',
          'worker decision trace must use the versioned Agent6 schema');
        assert.equal(workerDecisionTrace.actionOrdinal,actionOrdinal,
          'worker decision trace must bind the exact zero-based native action ordinal');
      }
      attemptRecord.workerDecisionTrace=workerDecisionTrace;
      attemptRecord.workerDecisionTraceSha256=workerDecisionTrace===null?null:
        sha256Json(workerDecisionTrace);
      attemptRecord.validationReceipt=validationReceipt;
      attemptRecord.validationReceiptSha256=validationReceipt===null?null:
        sha256Json(validationReceipt);
      if(workerDecisionTrace&&Object.hasOwn(workerDecisionTrace,'validationReceiptSha256'))
        assert.equal(workerDecisionTrace.validationReceiptSha256,
          attemptRecord.validationReceiptSha256,
          'worker decision trace and driver validation receipt digests must agree');
      attemptRecord.dispatchStatus='pending';
      const record=attemptRecord;
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
        policyInputKind:record.policyInputKind,
        actorObservationSha256:record.actorObservationSha256,
        workerDecisionTraceSha256:record.workerDecisionTraceSha256,
        validationReceiptSha256:record.validationReceiptSha256,
        promptResolverContext:record.promptResolverContext,
        dispatchStatus:'pending',
        failure:null
      };
      rootActionLedger.push(ledgerRecord);
      failureContext=null;

      if(input.stopBeforeLiveDispatch===true&&isRootDecision){
        assert.equal(isRootDecision,true,
          'no-game witness may stop only after a native root decision');
        assert.equal(actingSeat,input.expectedActorSeat,
          'no-game witness reached the wrong physical actor seat');
        assert.ok(validationReceipt&&validationReceipt.selectedActionValidated===true,
          'no-game witness requires a worker-selected native action validated on a cloned Store');
        assert.equal(nativeStoreCreated,true,
          'no-game witness requires an observed native Store construction');
        assert.equal(bothPlayersRegistered,true,
          'no-game witness requires both players registered before the first root');
        assert.equal(validationReceipt.nativeActionFrontierUsed,true,
          'no-game witness requires the worker decision to use the native action frontier');
        assert.equal(validationReceipt.nativeValidationStoreMode,'cloned-store',
          'no-game witness requires selected-action validation on a cloned native Store');
        assert.equal(validationReceipt.actorSeat,actingSeat,
          'native validation receipt belongs to a different physical seat');
        const originalStoreStateAfterDecision=snapshotStoreState(store.state);
        assert.deepStrictEqual(originalStoreStateAfterDecision,originalStoreStateBeforeDecision,
          'full original-Store state changed during observation, frontier construction, worker decision, or cloned native validation');
        record.dispatchStatus='not-dispatched';
        ledgerRecord.dispatchStatus='not-dispatched';
        completedResult={
          schema:'agent49-native-no-game-witness-v1',
          fixtureOnly:true,
          gameExecuted:false,
          candidateSeat:input.candidateSeat,
          opponentSeat:input.originalSourceSeat,
          actorSeat:actingSeat,
          actualFirstPlayerSeat,
          seed:input.seed,
          seed32,
          actorObservationUsed:actorObservationBefore!==null,
          selectedActionValidated:true,
          nativeStoreCreated,
          bothPlayersRegistered,
          nativeActionFrontierUsed:validationReceipt.nativeActionFrontierUsed,
          nativeValidationStoreMode:validationReceipt.nativeValidationStoreMode,
          hostStoppedBeforeLiveDispatch:true,
          validationActionKind:validationReceipt.actionKind??null,
          actionFrontierItemCount:validationReceipt.frontierItemCount,
          fullOriginalStoreStateUnchanged:true,
          liveActionDispatched:false,
          acceptedRootActions:0,
          rootDecisionCount:1,
          decisionTrace:decisionTrace.slice(),
          rootActionLedger:rootActionLedger.slice(),
          decisionTraceSha256:sha256Json(decisionTrace),
          rootActionLedgerSha256:sha256Json(rootActionLedger)
        };
        return completedResult;
      }

      try {
        withPhysicalRandom(()=>store.dispatch(action));
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
        input.onAction(record,{
          store,
          state:store.state,
          action,
          pendingPrompt:pending
        });
        failureContext=null;
      }
    }

    if(store.state.phase!==GamePhase.FINISHED) {
      assert.ok(maxActions!==null && actions>=maxActions,
        'native fixture loop stopped before a natural terminal state without reaching a finite cap');
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
      randomizationProtocol:'xorshift32-physical-plus-independent-policy-streams-v2',
      policySeedProtocol:'explicit-per-seat-seeds-independent-of-physical-seed-v1',
      policySeedBySeat,
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
    completedResult=result;
    return result;
  } catch(error) {
    const wrapped=error?.fixtureGamePartial?error:
      wrapFailure(error,failureContext??{stage:'game-loop',record:null});
    primaryFailureSummary=projectFailureSummary(
      wrapped.nativeFixtureFailure??wrapped.fixtureGamePartial?.failure
    );
    throw wrapped;
  } finally {
    let cleanupError=null;
    try {
      if(storeHook) {
        assert.equal(typeof storeHook.activeEffectDepth,'number',
          'prompt-provenance hook must expose activeEffectDepth');
        assert.equal(storeHook.activeEffectDepth,0,
          'prompt-provenance effect stack must be empty before restoration');
        storeHook.restore();
        assert.equal(storeHook.restored,true,
          'prompt-provenance hook restoration was not verified');
        storeHookRestored=true;
      }
    } catch(error) { cleanupError=error; }
    try {
      assert.strictEqual(Math.random,previousRandom,
        'ambient Math.random must be restored after every native fixture step');
    } catch(error) { cleanupError??=error; }
    if(completedResult) completedResult.promptProvenanceHook={
      installed:storeHook!==null,restored:storeHookRestored,
      activeEffectDepth:typeof storeHook?.activeEffectDepth==='number'?storeHook.activeEffectDepth:null
    };
    if(ownsProcessLock) {
      try { releaseNativeFixtureProcessLock(processLockToken); }
      catch(error) { cleanupError??=error; }
    }
    if(cleanupError) {
      const wrapped=wrapFailure(cleanupError,{stage:'cleanup',record:null});
      const cleanupFailure={
        ...(projectFailureSummary(wrapped.nativeFixtureFailure,false)??{}),
        stage:'cleanup',
        code:'NATIVE_FIXTURE_CLEANUP_FAILURE'
      };
      if(primaryFailureSummary)cleanupFailure.primaryFailure=primaryFailureSummary;
      wrapped.code=cleanupFailure.code;
      wrapped.nativeFixtureFailure=cleanupFailure;
      wrapped.fixtureGamePartial.failure=cleanupFailure;
      throw wrapped;
    }
  }
}


function driveNativeFixtureGameSync(iterator,resolveDecision) {
  assert.ok(iterator&&typeof iterator.next==='function'&&
    typeof iterator.throw==='function');
  assert.equal(typeof resolveDecision,'function');
  let step=iterator.next();
  while(!step.done) {
    try {
      step=iterator.next(resolveDecision(step.value));
    } catch(error) {
      step=iterator.throw(error);
    }
  }
  return step.value;
}

async function driveNativeFixtureGameAsync(iterator,resolveDecision) {
  assert.ok(iterator&&typeof iterator.next==='function'&&
    typeof iterator.throw==='function');
  assert.equal(typeof resolveDecision,'function');
  let step=iterator.next();
  while(!step.done) {
    try {
      step=iterator.next(await resolveDecision(step.value));
    } catch(error) {
      step=iterator.throw(error);
    }
  }
  return step.value;
}

/** Historical synchronous compatibility API for explicit legacy callers. */
function runNativeFixtureGame(input) {
  return driveNativeFixtureGameSync(
    runNativeFixtureGameSteps(input,{requirePolicySeeds:true}),
    request=>decodeWithPolicyRandom(
      request.legacyBot,request.state,request.legacyRandomSource
    )
  );
}

/**
 * V3 async API. Strategic root and owner-prompt decisions are delegated to an
 * awaited resolver. Physical randomization remains host-side. No policy RNG
 * seed or SimpleTacticsAi strategic fallback is available on this path.
 */
async function runNativeFixtureGameAsync(input,resolveDecision) {
  assert.equal(typeof resolveDecision,'function',
    'an explicit awaited worker decision resolver is required');
  return driveNativeFixtureGameAsync(
    runNativeFixtureGameSteps(input,{requirePolicySeeds:false}),
    resolveDecision
  );
}

module.exports={
  SCHEMA,
  seededRandom,
  createValidationRandomScope,
  deckPermutation,
  publicStateSnapshot,
  projectActionPayload,
  selectedCardIdentity,
  runNativeFixtureGame,
  runNativeFixtureGameAsync,
  normalizeSeed32,
  createStoreStateSnapshotter,
  normalizePolicySeedBySeat,
  acquireNativeFixtureProcessLock,
  releaseNativeFixtureProcessLock,
  assertNativeFixtureProcessLock
};
