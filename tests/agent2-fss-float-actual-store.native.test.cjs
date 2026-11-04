'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {withStoneVRecipient}=
  require('../simulation/twinleaf/forest-stone-v-recipient-policy.cjs');
const {withFloatStoneAfterFssHold,FLOAT}=
  require('../simulation/twinleaf/agent2-fss-held-try-float-owner.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} filename @returns {object} */
const native=filename=>require(path.join(output,filename));
const {Store}=native('game/store/store');
const {State,GamePhase}=native('game/store/state/state');
const {Player}=native('game/store/state/player');
const {PokemonCardList}=native('game/store/state/pokemon-card-list');
const {CardList}=native('game/store/state/card-list');
const {GameSettings}=native('game/core/game-settings');
const {Format}=native('game/store/card/card-types');
const {AttachToolTactic}=
  native('simple-bot/simple-tactics/attach-tool-tactic');
const {PlayCardAction}=native('game/store/actions/play-card-action');
const {RetreatAction}=native('game/store/actions/game-actions');
const {CheckRetreatCostEffect}=native('game/store/effects/check-effects');

/**
 * A complete two-seat native Store fixture using rank3's original registered
 * printings: Snorlax PGO, Galarian Stunfisk SSH, FSS SIT and Float Stone BKT.
 * Constructed hand deliberately tests a specific choice-set conflict. It is
 * not a sampled Aichi game or a naturally selected deal.
 * @param {0|1} seat
 * @param {boolean} [vBench]
 */
function stage(seat,vBench=false){
  const manager=initializeCards();
  let id=25000000+seat*100000;
  /** @param {string} name @returns {object} */
  function card(name){
    const c=manager.getCardByName(name);
    assert.ok(c,'Missing pinned native printing '+name);
    c.id=id++;return c;
  }
  const owner=new Player(),foe=new Player();
  owner.id=seat===0?101:202;
  foe.id=seat===0?202:101;
  const starter=card('Snorlax PGO');
  const benched=card(vBench?'Rotom V LOR':'Galarian Stunfisk SSH');
  owner.active.cards.push(starter);
  owner.bench=Array.from({length:5},()=>new PokemonCardList());
  owner.bench[0].cards.push(benched);
  const heldStone=card('Forest Seal Stone SIT');
  const heldFloat=card(FLOAT);
  owner.hand.cards.push(heldStone,heldFloat);
  foe.active.cards.push(card('Mew V FST'));
  foe.bench=Array.from({length:5},()=>new PokemonCardList());
  for(const p of [owner,foe]){
    for(let i=0;i<10;i++)p.deck.cards.push(card('Psychic Energy MEE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();prize.cards.push(card('Psychic Energy MEE'));
      p.prizes.push(prize);
    }
  }
  const state=new State(),settings=new GameSettings();
  settings.format=Format.EXPANDED;
  state.gameSettings=settings;
  state.rules=settings.rules;
  state.turn=5;
  state.phase=GamePhase.PLAYER_TURN;
  state.activePlayer=seat;
  state.players=seat===0?[owner,foe]:[foe,owner];
  const store=new Store({onStateChange(){}});
  store.state=state;
  const input=JSON.stringify({
    ownerHand:owner.hand.cards.map(x=>x.fullName),
    ownerActive:starter.fullName,bench:benched.fullName,
    seat,turn:state.turn,usedVSTAR:owner.usedVSTAR
  });
  const physicalStateFingerprint=createHash('sha256').update(input).digest('hex');
  return {seat,owner,foe,store,state,heldStone,heldFloat,
    starter,benched,physicalStateFingerprint};
}

/** @param {object} s @returns {object} */
function chooseBaseline(s){
  return withStoneVRecipient(s.seat,()=>{
    return AttachToolTactic.prototype.useTactic.call({},s.state,s.owner);
  });
}

/** @param {object} s @returns {object} */
function chooseSelected(s){
  return withStoneVRecipient(s.seat,()=>{
    return withFloatStoneAfterFssHold(s.seat,()=>{
      return AttachToolTactic.prototype.useTactic.call({},s.state,s.owner);
    });
  });
}
for(const seat of [0,1]){
  test('authentic rank3 print, real Store FSS-first Float recovery seat '+seat,()=>{
    const baseline=stage(seat);
    const beforePrototype=AttachToolTactic.prototype.useTactic;
    const untreatedRetreatCost=new CheckRetreatCostEffect(baseline.owner);
    baseline.store.reduceEffect(baseline.state,untreatedRetreatCost);
    assert.equal(untreatedRetreatCost.cost.length,4,
      'Printed Snorlax PGO has four retreat units and no Skyliner source');
    const control=chooseBaseline(baseline);
    assert.equal(control.result,undefined);
    assert.equal(control.audit.events[0].kind,'hold');
    assert.strictEqual(AttachToolTactic.prototype.useTactic,beforePrototype);

    const treatment=stage(seat);
    assert.equal(treatment.physicalStateFingerprint,
      baseline.physicalStateFingerprint);
    const selected=chooseSelected(treatment);
    assert.strictEqual(AttachToolTactic.prototype.useTactic,beforePrototype);
    const action=selected.result.result;
    assert.ok(action instanceof PlayCardAction);
    assert.equal(action.handIndex,1);
    assert.equal(selected.audit.events.length,0,
      'outer Stone wrapper must be bypassed by inner action');
    assert.equal(selected.result.audit.events.length,1);
    assert.equal(selected.result.audit.events[0].reason,'no-free-v-recipient');
    const beforeEnergy=treatment.owner.active.energies.cards.length;
    treatment.store.dispatch(action);
    assert.equal(treatment.owner.hand.cards.length,1);
    assert.equal(treatment.owner.hand.cards[0],treatment.heldStone);
    assert.equal(treatment.owner.active.tools[0],treatment.heldFloat);
    const cost=new CheckRetreatCostEffect(treatment.owner);
    treatment.store.reduceEffect(treatment.state,cost);
    assert.equal(cost.cost.length,0);
    treatment.store.dispatch(new RetreatAction(treatment.owner.id,0));
    assert.equal(treatment.owner.active.getPokemonCard(),treatment.benched);
    assert.equal(treatment.owner.bench[0].getPokemonCard(),treatment.starter);
    assert.equal(treatment.owner.bench[0].tools[0],treatment.heldFloat);
    assert.equal(treatment.owner.bench[0].energies.cards.length,beforeEnergy);
    console.log('AGENT2_FSS_FLOAT_NATIVE',JSON.stringify({
      seat,sourceOriginalRank:3,physicalStateFingerprint:
        treatment.physicalStateFingerprint,
      control:'FSS-first-hold',selected:'Float Stone BKT attach',
      actualNativeStoreAcceptance:true,
      untreatedRetreatCost:untreatedRetreatCost.cost.length,
      treatedRetreatCost:cost.cost.length,
      switchAccepted:true,remainingHandStone:true,
      competitiveQualifiedGames:0
    }));
  });

  test('original rank3 V Bench preserves held Stone when unspent seat '+seat,()=>{
    const s=stage(seat,true);
    const answer=chooseSelected(s);
    assert.equal(answer.result.result.constructor.name,'PlayCardAction');
    assert.equal(answer.result.result.handIndex,0);
    assert.equal(answer.audit.events[0].kind,'attach');
    assert.equal(answer.result.audit.events.length,0);
    assert.equal(s.owner.hand.cards[0].fullName,'Forest Seal Stone SIT');
  });
}


/**
 * Rank-3 original-printing continuation with actual colored/colorless
 * payment. The three Capture Energy RCL copies are exactly the three in
 * that registered original sixty: two on Snorlax, one on Bunnelby.
 * A baseline FSS-first HOLD strands the funded Burrow attacker behind a
 * retreat-4 Snorlax. The alternative Float Stone removes the printed Retreat Cost,
 * conserving both active Capture Energy cards and enabling one real Burrow.
 * This is a constructed same-physical-state paper opportunity witness,
 * not a randomized game, opponent-policy verdict or win estimate.
 *
 * @param {0|1} seat Physical owner seat.
 */
function stageFundedRank3Bunnelby(seat){
  const s=stage(seat);
  const manager=initializeCards();
  let id=29030000+seat*1000;
  /** @param {string} printing */
  const card=printing=>{
    const c=manager.getCardByName(printing);
    assert.ok(c,'Missing registered rank3 printing '+printing);
    c.id=id++;
    return c;
  };
  const bunnelby=card('Bunnelby PRC');
  s.owner.bench[0].cards.splice(0);
  s.owner.bench[0].cards.push(bunnelby);
  s.benched=bunnelby;
  const attach=(slot,count)=>{
    for(let k=0;k<count;k++){
      const energy=card('Capture Energy RCL');
      slot.cards.push(energy);
      slot.energies.cards.push(energy);
    }
  };
  attach(s.owner.active,2);
  attach(s.owner.bench[0],1);
  const physical={
    originalSourceRank:3,
    seat,
    active:s.owner.active.getPokemonCard().fullName,
    activeEnergy:s.owner.active.energies.cards.map(c=>c.fullName),
    bench:s.owner.bench[0].getPokemonCard().fullName,
    benchEnergy:s.owner.bench[0].energies.cards.map(c=>c.fullName),
    hand:s.owner.hand.cards.map(c=>c.fullName),
    opposingActive:s.foe.active.getPokemonCard().fullName,
    opposingDeck:s.foe.deck.cards.map(c=>c.fullName)
  };
  s.fullPhysicalFingerprint=createHash('sha256')
    .update(JSON.stringify(physical)).digest('hex');
  return s;
}
const {AttackAction}=native('game/store/actions/game-actions');
const {ResolvePromptAction}=
  native('game/store/actions/resolve-prompt-action');

for(const seat of [0,1]){
  test('rank3 funded Bunnelby genuinely mills only after FSS-first Float recovery seat '+seat,()=>{
    const control=stageFundedRank3Bunnelby(seat);
    const initialCost=new CheckRetreatCostEffect(control.owner);
    control.store.reduceEffect(control.state,initialCost);
    assert.equal(initialCost.cost.length,4);
    assert.equal(control.owner.active.energies.cards.length,2);
    assert.equal(control.owner.bench[0].energies.cards.length,1);
    const untouched=chooseBaseline(control);
    assert.equal(untouched.result,undefined);
    assert.equal(untouched.audit.events[0].reason,'no-free-v-recipient');
    assert.equal(control.owner.active.getPokemonCard().fullName,'Snorlax PGO');
    assert.equal(control.foe.deck.cards.length,10);

    const trial=stageFundedRank3Bunnelby(seat);
    assert.equal(trial.fullPhysicalFingerprint,control.fullPhysicalFingerprint);
    const treated=chooseSelected(trial);
    const action=treated.result.result;
    assert.ok(action instanceof PlayCardAction);
    assert.equal(action.handIndex,1);
    trial.store.dispatch(action);
    assert.equal(trial.owner.hand.cards.length,1);
    assert.equal(trial.owner.hand.cards[0],trial.heldStone);
    assert.equal(trial.owner.active.tools[0],trial.heldFloat);
    const reducedCost=new CheckRetreatCostEffect(trial.owner);
    trial.store.reduceEffect(trial.state,reducedCost);
    assert.equal(reducedCost.cost.length,0);
    trial.store.dispatch(new RetreatAction(trial.owner.id,0));
    assert.equal(trial.owner.active.getPokemonCard(),trial.benched);
    assert.equal(trial.owner.active.energies.cards.length,1);
    assert.equal(trial.owner.bench[0].energies.cards.length,2);
    assert.equal(trial.owner.discard.cards.filter(
      c=>c.fullName==='Capture Energy RCL').length,0);

    const deckBefore=trial.foe.deck.cards.length;
    trial.store.dispatch(new AttackAction(trial.owner.id,'Burrow'));
    // Native Bunnelby PRC implements Ancient Trait Omega Barrage as an
    // optional second attack. The first Burrow's deck movement precedes its
    // ConfirmPrompt. Decline only that documented optional second attack.
    // This avoids an invented owner choice and preserves a one-Burrow receipt.
    assert.equal(trial.foe.deck.cards.length,deckBefore-1);
    const acknowledged=[];
    const chronology=[{step:'after-Burrow-Store',deck:trial.foe.deck.cards.length,
      discard:trial.foe.discard.cards.length,phase:trial.state.phase}];
    for(let j=0;j<8;j++){
      const prompt=trial.state.prompts.find(p=>p.result===undefined);
      if(!prompt)break;
      const kind=prompt.constructor.name;
      assert.ok(kind==='WaitPrompt'||kind==='ConfirmPrompt',
        'Unexpected nontrivial Burrow/Omega Barrage prompt '+kind);
      if(kind==='ConfirmPrompt'){
        const {GameMessage}=native('game/game-message');
        assert.equal(prompt.playerId,trial.owner.id);
        assert.equal(prompt.message,GameMessage.WANT_TO_USE_ABILITY,
          'Only the printed optional Omega Barrage second attack is declined');
      }
      acknowledged.push(kind);
      chronology.push({step:'before-'+kind,
        deck:trial.foe.deck.cards.length,discard:trial.foe.discard.cards.length,
        phase:trial.state.phase});
      trial.store.dispatch(new ResolvePromptAction(prompt.id,
        kind==='ConfirmPrompt'?false:null));
      chronology.push({step:'after-'+kind,
        deck:trial.foe.deck.cards.length,discard:trial.foe.discard.cards.length,
        phase:trial.state.phase});
    }
    console.log('AGENT2_RANK3_BURROW_NATIVE_CHRONOLOGY',
      JSON.stringify({seat,deckBefore,chronology}));
    assert.equal(trial.store.hasPrompts(),false);
    // The first minus-one is Burrow's discard. The subsequent minus-one
    // occurs at the opponent's ordinary next-turn draw. The complete zone
    // accounting must distinguish those two unrelated transitions.
    assert.equal(trial.foe.discard.cards.length,1);
    assert.equal(trial.foe.hand.cards.length,1);
    assert.equal(trial.foe.deck.cards.length,deckBefore-2);
    console.log('AGENT2_RANK3_NECESSARY_FLOAT_BURROW',JSON.stringify({
      rank:3,seat,fullPhysicalFingerprint:trial.fullPhysicalFingerprint,
      sourcePrinting:['Snorlax PGO','Bunnelby PRC',
        'Capture Energy RCL','Float Stone BKT','Forest Seal Stone SIT'],
      baselineAction:'FSS-first-HOLD',baselineFreeRetreat:false,
      baselineActiveRetreatUnits:4,baselineAttachedRetreatEnergy:2,
      proposedAction:'attach-second-held-Float',
      actualStoreFloatAccepted:true,actualFreeRetreatAccepted:true,
      discardedCaptureEnergy:0,retainedCaptureEnergyOnSnorlax:2,
      settledAttack:'Burrow',
      actualOpponentDeckCardsDiscarded:trial.foe.discard.cards.length,
      ordinaryOpponentTurnDrawnCards:trial.foe.hand.cards.length,
      totalOpponentDeckDecrease:deckBefore-trial.foe.deck.cards.length,
      acknowledgements:acknowledged,qualifyingGames:0,
      resultKind:'constructed-native-tactical-counterfactual'
    }));
  });
}

// Bunnelby's printed Omega Barrage Ancient Trait can execute a second Burrow.
// This separate consent-positive continuation exercises the genuine source
// owner ChooseAttackPrompt, without peeking into the opponent's deck.
for(const seat of [0,1]){
  test('rank3 recovered Float permits two native Omega Barrage Burrows seat '+seat,()=>{
    const s=stageFundedRank3Bunnelby(seat);
    const tool=chooseSelected(s).result.result;
    assert.ok(tool instanceof PlayCardAction);
    assert.equal(tool.handIndex,1);
    s.store.dispatch(tool);
    const retreatCost=new CheckRetreatCostEffect(s.owner);
    s.store.reduceEffect(s.state,retreatCost);
    assert.equal(retreatCost.cost.length,0);
    s.store.dispatch(new RetreatAction(s.owner.id,0));
    assert.equal(s.owner.active.getPokemonCard(),s.benched);
    const deckBefore=s.foe.deck.cards.length;
    s.store.dispatch(new AttackAction(s.owner.id,'Burrow'));
    assert.equal(s.foe.discard.cards.length,1);
    assert.equal(s.foe.deck.cards.length,deckBefore-1);
    const promptsSeen=[];
    const {GameMessage}=native('game/game-message');
    for(let n=0;n<12;n++){
      const p=s.state.prompts.find(x=>x.result===undefined);
      if(!p)break;
      const kind=p.constructor.name;
      promptsSeen.push(kind);
      if(kind==='WaitPrompt'){
        s.store.dispatch(new ResolvePromptAction(p.id,null));
      }else if(kind==='ConfirmPrompt'){
        assert.equal(p.playerId,s.owner.id);
        assert.equal(p.message,GameMessage.WANT_TO_USE_ABILITY);
        assert.equal(promptsSeen.filter(x=>x==='ConfirmPrompt').length,1);
        s.store.dispatch(new ResolvePromptAction(p.id,true));
      }else if(kind==='ChooseAttackPrompt'){
        assert.equal(p.playerId,s.owner.id);
        assert.equal(p.message,GameMessage.CHOOSE_ATTACK_TO_COPY);
        assert.equal(p.cards[0].fullName,'Bunnelby PRC');
        // Store takes the *decoded Attack object*, unlike the serialized
        // remote-client {index, attack} answer accepted by prompt.decode.
        const selected=p.cards[0].attacks.find(a=>a.name==='Burrow');
        assert.ok(selected);
        assert.equal(p.validate(selected),true);
        s.store.dispatch(new ResolvePromptAction(p.id,selected));
      }else{
        assert.fail('Unknown source-owner Omega Barrage prompt '+kind);
      }
    }
    assert.equal(s.store.hasPrompts(),false);
    assert.equal(promptsSeen.filter(x=>x==='ChooseAttackPrompt').length,1);
    assert.equal(s.foe.discard.cards.length,2,
      'Two completed Burrow attacks must move exactly two real cards');
    assert.equal(s.foe.hand.cards.length,1,
      'Normal next-turn draw is separate from both Burrow discard effects');
    assert.equal(s.foe.deck.cards.length,deckBefore-3);
    console.log('AGENT2_RANK3_DOUBLE_BURROW_NATIVE',JSON.stringify({
      rank:3,seat,physicalInput:s.fullPhysicalFingerprint,
      firstHeldTool:'Forest Seal Stone SIT',
      secondHeldTool:'Float Stone BKT',
      selectedAttack:'Burrow',omegaBarrageUsed:true,
      acceptedNativeBurrowAttacks:2,opponentDiscardIncrease:2,
      opponentOrdinaryNextTurnDraw:1,
      remainingAttachedCaptureEnergyOnSnorlax:2,
      promptsSeen,competitiveGamesQualified:0
    }));
  });
}

// Source-compatible rank3 subset, synthetic two-card opposing deck.
// The treatment now has a direct native terminal consequence from the
// printed double-Burrow line. The original 60s and the opponent's earlier
// play history are intentionally NOT claimed to be reconstructed.
const {GameWinner}=native('game/store/state/state');
const {PassTurnAction}=native('game/store/actions/game-actions');
const {actorObservation}=
  require('../simulation/twinleaf/actor-observation-contract.cjs');
const {publicCatalog}=
  require('../simulation/twinleaf/agent43-guzma-prompt-continuation.cjs');
const {chooseBunnelbyImminentDeckoutFloat}=
  require('../simulation/twinleaf/agent2-bunnelby-deckout-float-frontier.cjs');
const {chooseGenericFundedFloatStone}=
  require('../simulation/twinleaf/agent14-generic-funded-floatstone-frontier.cjs');

/** @param {0|1} seat */
function stagedOpposingTwoCardDeck(seat){
  const s=stageFundedRank3Bunnelby(seat);
  while(s.foe.deck.cards.length>2){
    const c=s.foe.deck.cards[0];
    s.foe.deck.moveCardTo(c,s.foe.discard);
  }
  assert.equal(s.foe.deck.cards.length,2);
  assert.equal(s.foe.discard.cards.length,8);
  return s;
}
/** @param {object} s */
function settleSimpleWaits(s){
  const types=[];
  for(let i=0;i<12;i++){
    const p=s.state.prompts.find(x=>x.result===undefined);
    if(!p)break;
    assert.equal(p.constructor.name,'WaitPrompt',
      'Unexpected owner choice in deterministic native phase transition');
    types.push(p.constructor.name);
    s.store.dispatch(new ResolvePromptAction(p.id,null));
  }
  assert.equal(s.store.hasPrompts(),false);
  return types;
}

for(const seat of [0,1]){
  test('rank3 Float double Burrow produces real two-card deckout terminal seat '+seat,()=>{
    const control=stagedOpposingTwoCardDeck(seat);
    const trial=stagedOpposingTwoCardDeck(seat);
    assert.equal(control.fullPhysicalFingerprint,trial.fullPhysicalFingerprint);
    assert.deepEqual(control.foe.deck.cards.map(c=>c.fullName),
      trial.foe.deck.cards.map(c=>c.fullName));
    assert.equal(chooseBaseline(control).result,undefined);
    const catalog=publicCatalog();
    const view=actorObservation(trial.state,seat);
    assert.equal(view.opponentPublic.deckCount,2);
    const deckoutIntent=chooseBunnelbyImminentDeckoutFloat(view,catalog);
    assert.ok(deckoutIntent,'Visible printed two-Burrow terminal must be proposed');
    assert.equal(deckoutIntent.kind,'attach-emergency-floatstone');
    assert.equal(deckoutIntent.handIndex,1);
    assert.equal(deckoutIntent.targetAttackName,'Burrow');
    const generic=chooseGenericFundedFloatStone(view,catalog);
    assert.equal(generic,null,
      'Existing damage-gated mobility planner omits this zero-damage attack');

    // Control stays on the unfunded-retreat Snorlax. Passing the turn
    // cannot cause two Burrow discards and lets the opponent draw one.
    control.store.dispatch(new PassTurnAction(control.owner.id));
    const controlWaits=settleSimpleWaits(control);
    assert.equal(control.state.winner,GameWinner.NONE);
    assert.equal(control.foe.deck.cards.length,1);
    assert.equal(control.foe.discard.cards.length,8);
    assert.equal(control.foe.hand.cards.length,1);

    const action=chooseSelected(trial).result.result;
    assert.ok(action instanceof PlayCardAction);
    assert.equal(action.handIndex,deckoutIntent.handIndex);
    trial.store.dispatch(action);
    const freeCost=new CheckRetreatCostEffect(trial.owner);
    trial.store.reduceEffect(trial.state,freeCost);
    assert.equal(freeCost.cost.length,0);
    trial.store.dispatch(new RetreatAction(trial.owner.id,0));
    assert.equal(trial.owner.active.getPokemonCard().fullName,'Bunnelby PRC');
    trial.store.dispatch(new AttackAction(trial.owner.id,'Burrow'));
    assert.equal(trial.foe.discard.cards.length,9);

    const nativeChoices=[];
    const {GameMessage}=native('game/game-message');
    for(let j=0;j<15;j++){
      const p=trial.state.prompts.find(x=>x.result===undefined);
      if(!p)break;
      const name=p.constructor.name;
      nativeChoices.push(name);
      if(name==='WaitPrompt'){
        trial.store.dispatch(new ResolvePromptAction(p.id,null));
      }else if(name==='ConfirmPrompt'){
        assert.equal(p.playerId,trial.owner.id);
        assert.equal(p.message,GameMessage.WANT_TO_USE_ABILITY);
        trial.store.dispatch(new ResolvePromptAction(p.id,true));
      }else if(name==='ChooseAttackPrompt'){
        assert.equal(p.playerId,trial.owner.id);
        assert.equal(p.cards[0].fullName,'Bunnelby PRC');
        const chosen=p.cards[0].attacks.find(a=>a.name==='Burrow');
        assert.equal(p.validate(chosen),true);
        trial.store.dispatch(new ResolvePromptAction(p.id,chosen));
      }else{
        assert.fail('Unrecognized native terminal prompt '+name);
      }
    }
    assert.equal(trial.store.hasPrompts(),false);
    assert.equal(trial.foe.discard.cards.length,10);
    assert.equal(trial.foe.deck.cards.length,0);
    assert.equal(trial.state.phase,GamePhase.FINISHED);
    assert.equal(trial.state.winner,seat);
    assert.equal(nativeChoices.filter(x=>x==='ChooseAttackPrompt').length,1);
    assert.equal(nativeChoices.filter(x=>x==='ConfirmPrompt').length,1);
    console.log('AGENT2_RANK3_FLOAT_DOUBLE_BURROW_TERMINAL',JSON.stringify({
      physicalSeat:seat,
      inputFingerprint:trial.fullPhysicalFingerprint,
      opponentDeckAtBranch:2,
      controlKind:'FSS-first-HOLD-then-PassTurn',
      controlRemainingDeck:control.foe.deck.cards.length,
      controlWinner:control.state.winner,
      controlNormalDraw:control.foe.hand.cards.length,
      treatment:'Float free retreat, Burrow, Omega Barrage Burrow',
      cardsGenuinelyDiscardedByBurrow:2,
      opponentDeckAtTerminal:trial.foe.deck.cards.length,
      nativeTerminalWinner:trial.state.winner,
      nativeFinishedPhase:trial.state.phase,
      rootIntent:deckoutIntent.kind,
      damageOnlyMobilityIntent:generic,
      controlWaits,nativeChoices,
      originalFullSixtyReconstructed:false,
      competitiveGamesQualified:0
    }));
  });
}
