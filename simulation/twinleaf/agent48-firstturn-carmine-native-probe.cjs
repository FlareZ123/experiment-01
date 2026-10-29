'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {runWithResearchProfile,EXPANDED_SOURCE_PROFILE}=
  require('./policy-profiles.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {CARMINE}=require('./agent48-conservative-first-carmine.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const SEEDS=Object.freeze(Array.from({length:24},(_,i)=>2026102901+i));
const MAX_ACTIONS=48;

/**
 * Visible before-root owner/board packet without read access to opponent
 * private hand, unsearched deck identities, or hidden Prize identities.
 * @param {object} state Genuine pinned native Store State.
 * @returns {object}
 */
function visibleFirstRoot(state){
  const owner=state.players[state.activePlayer];
  return {
    turn:state.turn,ownerSeat:state.activePlayer,
    actorId:owner.id,
    ownerHand:owner.hand.cards.map(card=>card.fullName),
    ownerActive:owner.active.getPokemonCard()?.fullName??null,
    ownerBench:owner.bench.map(x=>x.getPokemonCard()?.fullName??null),
    ownerDiscard:owner.discard.cards.map(card=>card.fullName),
    ownerSupporterTurn:owner.supporterTurn,
    ownerDeckCount:owner.deck.cards.length,
    ownerPrizeCount:owner.prizes.filter(p=>p.cards.length>0).length,
    opponentHandCount:state.players[1-state.activePlayer].hand.cards.length,
    opponentActive:state.players[1-state.activePlayer].active
      .getPokemonCard()?.fullName??null
  };
}

/**
 * One 48-root bounded real Store execution of untouched original source decks.
 * No mutation of decks, shuffled private zones or card implementation.
 * Intervention only forces the genuinely held original Carmine at the first
 * original first-player root, if its native canPlay reports legal. Full field
 * win estimates are never produced by these short source-only probes.
 *
 * @param {{deckA:string[],deckB:string[],seed:number}} setup
 * @param {boolean} force
 * @returns {object}
 */
function scenario(setup,force){
  const native=name=>require(path.join(OUTPUT,name));
  const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
  const {Store}=native('game/store/store');
  const {GamePhase}=native('game/store/state/state');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const bot=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const store=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof bot?.value,'function');
  assert.equal(typeof store?.value,'function');

  let liveStore=null,firstOwner=null,forcedAction=null,settlement=null;
  let firstBotAction=null;
  function rootChoice(state){
    if(state!==liveStore?.state)return bot.value.call(this,state);
    const owner=state.players?.[state.activePlayer];
    if(firstOwner!==null||state.turn!==1||
       state.phase!==GamePhase.PLAYER_TURN||
       state.prompts.some(p=>p.result===undefined)||
       this.client?.id!==owner?.id)return bot.value.call(this,state);
    firstOwner=visibleFirstRoot(state);
    const nativeChoice=bot.value.call(this,state);
    firstBotAction={
      name:nativeChoice?.constructor?.name??null,
      handIndex:nativeChoice?.handIndex??null,
      printing:nativeChoice?.constructor?.name==='PlayCardAction'?
        owner.hand.cards[nativeChoice.handIndex]?.fullName??null:null
    };
    const idx=owner.hand.cards.findIndex(c=>c.fullName===CARMINE);
    const card=owner.hand.cards[idx]??null;
    const nativeCanPlay=card!==null&&card.canPlay(null,state,owner)===true;
    firstOwner={...firstOwner,heldCarmine:idx>=0,
      nativeCanPlay,forcedOpportunity:idx>=0&&nativeCanPlay};
    if(!force||!nativeCanPlay)return nativeChoice;
    forcedAction=new PlayCardAction(owner.id,idx,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    });
    return forcedAction;
  }
  function observedDispatch(...args){
    const action=args[0];
    if(liveStore===null&&action?.constructor?.name==='AddPlayerAction')
      liveStore=this;
    if(this!==liveStore||action!==forcedAction)
      return store.value.apply(this,args);
    assert.equal(settlement,null);
    const before=visibleFirstRoot(this.state);
    const playedPhysicalCard=this.state.players[before.ownerSeat]
      .hand.cards[action.handIndex];
    assert.equal(playedPhysicalCard?.fullName,CARMINE);
    const logCount=this.state.logs.length;
    try{
      const response=store.value.apply(this,args);
      const after=visibleFirstRoot(this.state);
      settlement={status:'accepted',
        before,after,playedPhysicalCardStillInHand:
          this.state.players[before.ownerSeat].hand.cards.includes(
            playedPhysicalCard),
        ownerDeckCardsDrawn:before.ownerDeckCount-after.ownerDeckCount,
        supporterQuotaChange:
          after.ownerSupporterTurn-before.ownerSupporterTurn,
        logEvents:this.state.logs.slice(logCount).map(x=>({
          message:x.message,params:x.params
        }))};
      return response;
    }catch(error){
      const after=visibleFirstRoot(this.state);
      settlement={status:'rejected',before,after,
        message:String(error?.message??error),
        logEventDelta:this.state.logs.length-logCount};
      throw error;
    }
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...bot,value:rootChoice});
  Object.defineProperty(Store.prototype,'dispatch',{...store,value:observedDispatch});

  let game=null,error=null;
  try{
    try{
      game=runWithResearchProfile({
        deckA:setup.deckA,deckB:setup.deckB,
        seed:setup.seed,maxActions:MAX_ACTIONS,
        strictPromptValidation:true,grandTreeFirstTurnCorrection:true,
        captureDecisionTrace:true,
        label:'Bounded exact original-source Carmine first-turn native rule control'
      },EXPANDED_SOURCE_PROFILE);
    }catch(failure){
      error={name:failure?.name??null,message:String(failure?.message??failure)};
    }
    return {
      seed:setup.seed,force,firstOwner,firstBotAction,settlement,error,
      game:game===null?null:{
        firstTurnSlot:game.firstTurnSlot,
        deckHashes:game.deckHashes,
        verifiedByDrawLog:game.verifiedByDrawLog,
        actions:game.actions,finished:game.finished,
        initialOwnerRoot:game.rootActionLedger.find(x=>
          x.turnBefore===1&&x.playerSlot===game.firstTurnSlot&&
          x.action!=='ResolvePromptAction')??null
      }
    };
  }finally{
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',bot);
    Object.defineProperty(Store.prototype,'dispatch',store);
  }
}

/** @returns {object} */
function runAudit(){
  const file=path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json');
  const corpus=resolveManifestFile(file,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const rank=n=>corpus.decks.find(d=>d.rank===n);
  const one=rank(1),eleven=rank(11);
  assert.ok(one?.playableUnderEngine&&eleven?.playableUnderEngine);
  assert.equal(one.cardIds.length,60);
  assert.equal(eleven.cardIds.length,60);
  const attempts=[];
  for(const seed of SEEDS){
    const setup={deckA:one.cardIds,deckB:eleven.cardIds,seed};
    const natural=scenario(setup,false);
    const forced=scenario(setup,true);
    const sameBefore=JSON.stringify(natural.firstOwner)===
      JSON.stringify(forced.firstOwner);
    if(natural.firstOwner&&forced.firstOwner){
      assert.ok(sameBefore,
        'Original full source deal and owner-view root changed before fork');
      assert.deepEqual(natural.firstBotAction,forced.firstBotAction);
    }
    if(natural.game&&forced.game){
      assert.deepEqual(natural.game.deckHashes,forced.game.deckHashes);
      assert.equal(natural.game.firstTurnSlot,forced.game.firstTurnSlot);
      assert.equal(natural.game.verifiedByDrawLog,true);
      assert.equal(forced.game.verifiedByDrawLog,true);
    }
    if(natural.firstOwner?.forcedOpportunity===true){
      assert.ok(forced.settlement,
        'Native legal first-turn Carmine opportunity was never dispatched');
      assert.equal(forced.settlement.status,'accepted',
        'Pinned Store rejected printed first-player first-turn Carmine');
      assert.equal(forced.settlement.supporterQuotaChange,1);
      assert.equal(forced.settlement.playedPhysicalCardStillInHand,false);
      assert.equal(forced.settlement.ownerDeckCardsDrawn,5);
      assert.equal(forced.settlement.after.ownerHand.length,5);
    }else assert.equal(forced.settlement,null,
      'No source-held native Carmine opportunity may be forced');
    attempts.push({seed,originalSourceRanks:[1,11],
      sameOwnerBefore:sameBefore,natural,forced});
  }
  return {
    schema:'agent48-24-deal-native-first-player-carmine-control-v1',
    originalRanks:[1,11],seeds:[...SEEDS],maxActions:MAX_ACTIONS,
    supportedRulesOnly:true,policyWinEvidenceQualified:false,
    totalAttempts:attempts.length,
    naturalFirstTurnHeld:attempts.filter(x=>
      x.natural.firstOwner?.heldCarmine===true).length,
    nativeCanPlay:attempts.filter(x=>
      x.natural.firstOwner?.nativeCanPlay===true).length,
    nativeAccepted:attempts.filter(x=>
      x.forced.settlement?.status==='accepted').length,
    failedRuns:attempts.filter(x=>
      x.natural.error||x.forced.error).length,
    attempts,
    limitation:'Two exact original printed 60s under real Store, 24 preregistered seeds, only one forced first-turn card root per eligible deal; no native owner decision-policy competence or competitive game outcome.'
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(runAudit(),null,2)+'\n');

module.exports={SEEDS,MAX_ACTIONS,visibleFirstRoot,scenario,runAudit};
