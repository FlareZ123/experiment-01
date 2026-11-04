'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHmac,randomBytes}=require('node:crypto');

const VERSION='agent1-actual-native-owner-prechoice-private-fingerprint-v1';
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
// Process-private key: v8 policy A/B must run in one Node process to compare.
// A public, unkeyed hash of a seven-card hand is brute-force recoverable.
const processSecret=randomBytes(32);
const processSessionId=randomBytes(16).toString('hex');
const privateFingerprint=bytes=>createHmac('sha256',processSecret)
  .update(bytes).digest('hex');

/**
 * Read a physical owner's *pre-setup-choice* private randomized positions at
 * their first genuine CHOOSE_STARTING_POKEMONS prompt. This differs from the
 * later post-policy first-stable-turn-1 digest: selecting different Active and
 * Benched cards is the treatment, so a post-treatment fingerprint MUST differ
 * when the opening policy actually changes a setup placement.
 *
 * The only persistent output is a process-keyed HMAC of own hand/deck/Prize positions;
 * all raw card printings are immediately discarded. Never use this observer
 * for a gameplay choice, retrospective seed selection or prize inference.
 *
 * @template T
 * @param {()=>T} run Synchronous pinned native Store experiment.
 * @param {{engine?:(s:string)=>object,maxEvents?:number,
 *   headless?:object,expectedTrialIds?:string[]}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withSetupPrechoicePrivateFingerprint(run,deps={}){
  assert.equal(typeof run,'function');
  const load=deps.engine??(file=>require(path.join(root,file)));
  const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
  const {Store}=load('game/store/store');
  const {AddPlayerAction}=load('game/store/actions/add-player-action');
  const {ChooseCardsPrompt}=load('game/store/prompts/choose-cards-prompt');
  const {GameMessage}=load('game/game-message');
  const {GamePhase}=load('game/store/state/state');
  const priorBot=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const priorStore=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof priorBot?.value,'function');
  assert.equal(typeof priorStore?.value,'function');
  assert.equal(priorBot.configurable,true);
  assert.equal(priorStore.configurable,true);
  const maxEvents=deps.maxEvents??40;
  const exactTrialIds=deps.expectedTrialIds??null;
  const idSet=exactTrialIds?new Set(exactTrialIds):null;
  assert.ok(idSet===null||(idSet.size===exactTrialIds.length&&
    exactTrialIds.every(id=>typeof id==='string'&&id.length>0)));
  const headless=idSet?(deps.headless??require('./headless.cjs')):null;
  const priorRun=headless?Object.getOwnPropertyDescriptor(headless,'runMatch'):null;
  if(headless)assert.equal(typeof priorRun?.value,'function');
  let activeTrialId=null;
  let activePreRunRequestHmac=null;
  let activeNativeRun=false;
  const labelPrefix='agent41-bilateral-v2-common-policy-development-';
  function observeHeadlessMatch(options,...args){
    assert.equal(activeNativeRun,false,'Nested Store invocation lacks unique trial');
    assert.ok(options&&typeof options.label==='string');
    assert.ok(options.label.startsWith(labelPrefix));
    const id=options.label.slice(labelPrefix.length);
    assert.ok(idSet.has(id),'Native Store label is not a registered trial');
    assert.ok(Array.isArray(options.deckA)&&options.deckA.length===60);
    assert.ok(Array.isArray(options.deckB)&&options.deckB.length===60);
    assert.ok(Number.isSafeInteger(options.seed)&&options.seed>=0&&
      options.seed<=0xffffffff);
    const serializedRequest=JSON.stringify(options);
    assert.equal(typeof serializedRequest,'string');
    activeTrialId=id;
    activePreRunRequestHmac=privateFingerprint(serializedRequest);
    activeNativeRun=true;
    try{return priorRun.value.apply(this,[options,...args]);}
    finally{
      activeNativeRun=false;
      activeTrialId=null;
      activePreRunRequestHmac=null;
    }
  }
  assert.ok(Number.isSafeInteger(maxEvents)&&maxEvents>=16);
  const stores=new WeakMap();
  let lastRealStore=null;
  let storeCount=0;
  const audit={
    version:VERSION,
    exactNativeStoreRootsRecorded:0,
    firstOwnerSetupInputsObserved:0,
    duplicateOwnerPromptsOmitted:0,
    events:[],
    eventLimit:maxEvents,
    privateFingerprintSessionId:processSessionId,
    registeredNativeTrialLabelWitnessSelected:idSet!==null,
    preRunRequestScope:'HMAC of own public runMatch request, including registered seed, deck A/B native printings and all JSON-serializable research options',
    hiddenCardNamesOrOrderPublished:false,
    fingerprintScheme:'HMAC-SHA256; secret unique to process, never serialized',
    comparableOnlyInsideOneNodeProcess:true,
    fingerprintSecretPublished:false,
    policyChoiceActionsIssued:0,
    qualifiesFullPaperRandomness:false,
    qualifiesMatchedCompetitiveGames:false
  };
  const names=zone=>{
    assert.ok(Array.isArray(zone?.cards),
      'Pre-choice private zone must have physical cards array');
    return zone.cards.map(card=>{
      assert.equal(typeof card?.fullName,'string');
      return card.fullName;
    });
  };
  function dispatch(action,...args){
    if(action instanceof AddPlayerAction&&!stores.has(this)){
      const info={ordinal:++storeCount,seenSeats:new Set(),
        trialId:activeTrialId,preRunRequestHmac:activePreRunRequestHmac};
      stores.set(this,info);
      audit.exactNativeStoreRootsRecorded=storeCount;
    }
    if(action instanceof AddPlayerAction)lastRealStore=this;
    return priorStore.value.apply(this,[action,...args]);
  }
  function decode(state){
    const real=lastRealStore;
    const info=real?stores.get(real):null;
    if(info&&state===real.state&&state.turn===0&&
       state.phase===GamePhase.SETUP){
      const ownerSeat=state.players?.findIndex(p=>
        p.id===this.client?.id)??-1;
      const owner=(ownerSeat===0||ownerSeat===1)?
        state.players[ownerSeat]:null;
      const prompt=state.prompts?.find(p=>
        p.result===undefined&&p.playerId===owner?.id)??null;
      if(owner&&prompt instanceof ChooseCardsPrompt&&
        prompt.message===GameMessage.CHOOSE_STARTING_POKEMONS&&
        prompt.cards===owner.hand&&prompt.options?.min===1){
        if(info.seenSeats.has(ownerSeat)){
          audit.duplicateOwnerPromptsOmitted++;
        }else{
          info.seenSeats.add(ownerSeat);
          const hand=names(owner.hand);
          const deck=names(owner.deck);
          const prizes=owner.prizes.map(slot=>names(slot));
          const physicalPositions=JSON.stringify({
            hand,deck,prizes
          });
          audit.firstOwnerSetupInputsObserved++;
          if(audit.events.length<maxEvents)audit.events.push({
            nativeStoreOrdinal:info.ordinal,
            registeredNativeTrialId:info.trialId,
            opaquePreRunRequestHmacSha256:info.preRunRequestHmac,
            physicalOwnerSeat:ownerSeat,
            firstBeforeAnyOwnerSetupChoice:true,
            ownerHandCount:hand.length,
            ownerDeckCount:deck.length,
            ownerPrizeCount:prizes.reduce((sum,slot)=>sum+slot.length,0),
            opaquePhysicalPrechoiceInputHmacSha256:privateFingerprint(physicalPositions),
            globalTurnAtCapture:state.turn,
            noPolicyChoiceOrHiddenNamesPublished:true
          });
        }
      }
    }
    return priorBot.value.call(this,state);
  }
  if(headless)Object.defineProperty(headless,'runMatch',{
    ...priorRun,value:observeHeadlessMatch
  });
  Object.defineProperty(Store.prototype,'dispatch',{
    ...priorStore,value:dispatch
  });
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...priorBot,value:decode
  });
  try{
    const result=run();
    return {result,audit};
  }catch(error){
    if(error&&typeof error==='object')
      error.setupPrechoiceFingerprintAudit={
        ...audit,events:audit.events.map(event=>({...event})),
        aborted:true
      };
    throw error;
  }finally{
    if(headless){
      assert.strictEqual(headless.runMatch,observeHeadlessMatch);
      Object.defineProperty(headless,'runMatch',priorRun);
    }
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decode);
    Object.defineProperty(SimpleTacticsAi.prototype,
      'decodeNextAction',priorBot);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',priorStore);
  }
}

module.exports={VERSION,withSetupPrechoicePrivateFingerprint};
