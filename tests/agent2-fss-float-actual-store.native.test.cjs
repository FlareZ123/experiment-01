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
      actualNativeStoreAcceptance:true,paidRetreatCost:cost.cost.length,
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
