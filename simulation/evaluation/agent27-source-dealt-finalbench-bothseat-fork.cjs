'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {planAichi}=require('./aichi-pilot.cjs');
const {initializeCards,runMatch}=require('../twinleaf/headless.cjs');
const {actorObservation}=require('../twinleaf/actor-observation-contract.cjs');
const {buildActorCardCatalog,chooseActorRootIntent,
  withActorOnlyRootPolicy}=require('../twinleaf/agent34-actor-only-root-policy.cjs');
const {lastBenchBasicConflict}=require(
  '../twinleaf/agent27-owner-lastbench-basic-conflict.cjs');
const {rootPhysicalSnapshot,rootPhysicalWitness}=require(
  '../twinleaf/agent5-owner-root-slice.cjs');
const {withPaperCelestialRoarEnergy}=require(
  '../twinleaf/agent47-celestial-roar-paper-energy-hook.cjs');
const native=name=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',name));
const sha=value=>createHash('sha256').update(JSON.stringify(value))
  .digest('hex');
const SEED=20261102;
const TURN=41;
const SEAT=1;
const ALTERNATIVES=Object.freeze([
  null,'Squawkabilly ex PAL','Dedenne GX UNB','Regidrago V SIT'
]);

/**
 * Change one actor-visible native root on the unchanged, genuinely dealt
 * original rank1/rank10 game. The hook has no direct access to the opponent's
 * private hand or deck and requires that the policy already proposed Budew.
 * @template T
 * @param {()=>T} execute Full synchronous original Store match.
 * @param {object} catalog Public card metadata catalog.
 * @param {string|null} chosenPrinting Null is the untouched control.
 * @returns {{result:T,receipt:object}}
 */
function withExactOwnerBenchFork(execute,catalog,chosenPrinting){
  const Store=native('game/store/store').Store;
  const Bot=native('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const GamePhase=native('game/store/state/state').GamePhase;
  const oldStore=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const oldBot=Object.getOwnPropertyDescriptor(Bot.prototype,'decodeNextAction');
  assert.equal(typeof oldStore?.value,'function');
  assert.equal(typeof oldBot?.value,'function');
  let liveStore=null,selectedNative=null,intent=null;
  const receipt={
    chosenPrinting,matchedOwnerRootCount:0,selectedActionIssued:false,
    accepted:false,physicalEffect:null,requestedTurn:TURN,
    ownerSeat:SEAT,baselinePrinting:null,availableAlternatives:[],
    handIndex:null,benchIndex:null,originalActionName:null,
    observedSourceOnly:true,ownerObservationSha256:null,
    ownerHandSizeAtFork:null,ownerDeckCountAtFork:null
  };
  function patchedBot(state){
    const original=oldBot.value.call(this,state);
    if(receipt.matchedOwnerRootCount>0||receipt.selectedActionIssued||
       state!==liveStore?.state||state.turn!==TURN||
       state.activePlayer!==SEAT||state.phase!==GamePhase.PLAYER_TURN||
       state.prompts?.some(p=>p.result===undefined))return original;
    const id=this.client?.id;
    if(state.players?.[SEAT]?.id!==id)return original;
    const view=actorObservation(state,SEAT);
    const baseline=chooseActorRootIntent(view,catalog,{});
    if(baseline.kind!=='bench-basic'||baseline.printing!=='Budew ASC'||
       original?.constructor?.name!=='PlayCardAction'||
       original.handIndex!==baseline.handIndex)return original;
    const conflict=lastBenchBasicConflict(view,catalog,baseline);
    if(!conflict)return original;
    receipt.matchedOwnerRootCount++;
    receipt.baselinePrinting=baseline.printing;
    receipt.ownerObservationSha256=sha(view);
    receipt.ownerHandSizeAtFork=view.ownHand.length;
    receipt.ownerDeckCountAtFork=view.ownPublic?.deckCount??null;
    receipt.availableAlternatives=conflict.omitted.map(x=>({
      printing:x.printing,handIndex:x.handIndex}));
    if(chosenPrinting===null)return original;
    const other=conflict.omitted.find(x=>x.printing===chosenPrinting);
    if(!other)return original;
    intent={kind:'bench-basic',printing:other.printing,
      handIndex:other.handIndex,benchIndex:conflict.benchIndex,
      benchSlot:conflict.benchIndex};
    selectedNative=new PlayCardAction(id,other.handIndex,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,
      index:conflict.benchIndex});
    receipt.selectedActionIssued=true;
    receipt.handIndex=other.handIndex;
    receipt.benchIndex=conflict.benchIndex;
    receipt.originalActionName=original.constructor.name;
    return selectedNative;
  }
  function patchedStore(action,...args){
    if(liveStore===null&&action?.constructor?.name==='AddPlayerAction')
      liveStore=this;
    if(this!==liveStore||action!==selectedNative)
      return oldStore.value.apply(this,[action,...args]);
    const before=rootPhysicalSnapshot(this.state,SEAT,intent);
    try{
      const value=oldStore.value.apply(this,[action,...args]);
      const after=rootPhysicalSnapshot(this.state,SEAT,intent);
      receipt.physicalEffect=rootPhysicalWitness(intent,before,after,GamePhase);
      receipt.accepted=receipt.physicalEffect==='confirmed-public-effect';
      return value;
    }catch(error){
      receipt.storeRejection=String(error);
      throw error;
    }
  }
  Object.defineProperty(Store.prototype,'dispatch',{...oldStore,value:patchedStore});
  Object.defineProperty(Bot.prototype,'decodeNextAction',
    {...oldBot,value:patchedBot});
  try{return {result:execute(),receipt};}
  catch(error){error.agent27ForkReceipt=receipt;throw error;}
  finally{
    assert.strictEqual(Store.prototype.dispatch,patchedStore);
    assert.strictEqual(Bot.prototype.decodeNextAction,patchedBot);
    Object.defineProperty(Bot.prototype,'decodeNextAction',oldBot);
    Object.defineProperty(Store.prototype,'dispatch',oldStore);
  }
}

/** @returns {object} Four on-deal original native experiments, failures retained. */
function run(){
  const p={allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true};
  const decks=[1,10].map(rank=>planAichi(rank,p).candidate.cards);
  initializeCards();
  const manager=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/cards/card-manager'))
    .CardManager.getInstance();
  const catalog=buildActorCardCatalog(manager.getAllCards(),{
    PokemonCard:native('game/store/card/pokemon-card').PokemonCard,
    EnergyCard:native('game/store/card/energy-card').EnergyCard,
    TrainerCard:native('game/store/card/trainer-card').TrainerCard,
    ...native('game/store/card/card-types'),
    PowerType:native('game/store/card/pokemon-types').PowerType});
  const flags=require('../../results/aichi-2026/registrations/agent41-crossrank-r6-r11-v1-20261019.json').frozenFlags;
  const arms=[];
  for(const choice of ALTERNATIVES){
    let observed=null,result=null,error=null;
    let receipt={chosenPrinting:choice,observed:false};
    try{
      const staged=withPaperCelestialRoarEnergy(()=>withActorOnlyRootPolicy(
        ()=>withExactOwnerBenchFork(()=>runMatch({
          deckA:decks[0],deckB:decks[1],seed:SEED,maxActions:240,...flags,
          capturePublicAttackTransitions:true,captureDecisionTrace:true,
          captureInitialFullPhysicalDeal:true,
          capturePhysicalZoneIntegrity:true,
          enforceSettledPhysicalZoneIntegrity:true,
          enforceVisiblePlayLockBothSeats:true
        }),catalog,choice),{getCatalog:()=>catalog}));
      observed=staged;
      result=staged.result.result.result;
      receipt=staged.result.result.receipt;
    }catch(e){
      receipt=e.agent27ForkReceipt??receipt;
      error={name:e.name??'Error',code:e.code??null,
        message:String(e.message??e).slice(0,500)};
    }
    const roots=result?.rootActionLedger??[];
    arms.push({
      chosenPrinting:choice,receipt,failed:error,
      engineOutcome:result?{
        finished:result.finished,winner:result.finished?result.winner:null,
        actions:result.actions,turns:result.turns,
        endReason:result.endReason,
        prizesRemaining:result.prizesRemaining,
        physicalZoneSettledAnomalies:
          result.physicalZoneIntegrity?.settledRootsWithAnomaly??null
      }:null,
      identicalOriginalSource60s:result?.deckHashes??null,
      initialFullDealFingerprint:
        result?.initialFullPhysicalDealFingerprint?.digestSha256??null,
      rootCount:roots.length,rootTraceSha256:roots.length?sha(roots):null,
      // Native actual action records are returned for independent comparison.
      // Control and changed arms share a physical deal only if this succeeds.
      roots:roots.map(r=>({
        actionOrdinal:r.actionOrdinal,playerSlot:r.playerSlot,
        turnBefore:r.turnBefore,action:r.action,card:r.card??null,
        attack:r.attack??null
      }))
    });
  }
  const baseline=arms[0];
  const paired=arms.slice(1).map(arm=>{
    const a=baseline.roots,b=arm.roots;
    let n=0;
    while(n<Math.min(a.length,b.length)&&
      JSON.stringify(a[n])===JSON.stringify(b[n]))n++;
    return {
      printing:arm.chosenPrinting,
      equalInitialFullDeal:baseline.initialFullDealFingerprint!==null&&
        baseline.initialFullDealFingerprint===arm.initialFullDealFingerprint,
      equalOriginalSixties:JSON.stringify(baseline.identicalOriginalSource60s)===
        JSON.stringify(arm.identicalOriginalSource60s),
      identicalRootPrefixLength:n,
      firstControlRoot:a[n]??null,firstForkRoot:b[n]??null,
      matchedOwnerObservation:baseline.receipt.ownerObservationSha256!==null&&
        baseline.receipt.ownerObservationSha256===
          arm.receipt.ownerObservationSha256,
      genuineNextOpponentNativeRoot:b.slice(n+1).find(x=>
        x.playerSlot===0)??null,
      genuinelyAcceptedAlternative:arm.receipt.accepted===true,
      paperPromptOrOpponentReplyCertified:false
    };
  });
  return {
    schema:'agent27-source-dealt-finalbench-physical-fork-v1',
    mode:'retrospective-selected-seed-not-performance-sample',
    seed:SEED,originalSourceRanks:[1,10],sourceSeat:SEAT,
    requestedGlobalTurn:TURN,pinnedEngine:
      'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    pinnedSourceInventoryHashes:decks.map(sha),
    policy:'agent34-both-seat-owner-first-return-with-one-optional-native-fork',
    alternatives:ALTERNATIVES,
    summary:paired,
    arms:arms.map(({roots,...other})=>other),
    completeNativeMatchComparison:false,
    qualifiedCompetitiveGames:0,
    winRateCertified:false
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={SEED,TURN,SEAT,ALTERNATIVES,run,withExactOwnerBenchFork};
