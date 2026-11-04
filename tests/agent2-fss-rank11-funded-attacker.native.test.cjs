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

const OUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} filename */
const engine=filename=>require(path.join(OUT,filename));
const {Store}=engine('game/store/store');
const {Player}=engine('game/store/state/player');
const {State,GamePhase}=engine('game/store/state/state');
const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
const {CardList}=engine('game/store/state/card-list');
const {GameSettings}=engine('game/core/game-settings');
const {Format}=engine('game/store/card/card-types');
const {AttachToolTactic}=
  engine('simple-bot/simple-tactics/attach-tool-tactic');
const {RetreatAction,AttackAction}=engine('game/store/actions/game-actions');
const {PlayCardAction}=engine('game/store/actions/play-card-action');
const {CheckRetreatCostEffect}=engine('game/store/effects/check-effects');
const {ResolvePromptAction}=
  engine('game/store/actions/resolve-prompt-action');

/**
 * Constructed native tactical state from original rank 11 source printings.
 * Bench Mega Absol ex has a payable 200-damage Claw of Darkness; active
 * Latias ex holds one Darkness Energy, which cannot fund Eon Blade.
 * @param {0|1} seat
 * @returns {object}
 */
function constructedRank11(seat){
  const manager=initializeCards();
  let id=2711000+seat*1000;
  /** @param {string} printing */
  function card(printing){
    const c=manager.getCardByName(printing);
    assert.ok(c,'Unknown pinned printing '+printing);
    c.id=id++;return c;
  }
  const owner=new Player(),foe=new Player();
  owner.id=seat===0?101:202;
  foe.id=seat===0?202:101;
  owner.active.cards.push(card('Latias ex SSP'));
  owner.bench=Array.from({length:5},()=>new PokemonCardList());
  const benchedAttacker=card('Mega Absol ex M1L');
  owner.bench[0].cards.push(benchedAttacker);
  const energy=(slot,n)=>{
    for(let j=0;j<n;j++){
      const e=card('Darkness Energy MEE');
      slot.cards.push(e);slot.energies.cards.push(e);
    }
  };
  energy(owner.active,1);
  energy(owner.bench[0],3);
  const stone=card('Forest Seal Stone SIT');
  const float=card(FLOAT);
  owner.hand.cards.push(stone,float);
  foe.active.cards.push(card('Mega Absol ex M1L'));
  foe.bench=Array.from({length:5},()=>new PokemonCardList());
  foe.bench[0].cards.push(card('Oranguru V ASR'));
  for(const p of [owner,foe]){
    for(let j=0;j<8;j++)p.deck.cards.push(card('Darkness Energy MEE'));
    for(let j=0;j<6;j++){
      const prize=new CardList();
      prize.cards.push(card('Darkness Energy MEE'));
      p.prizes.push(prize);
    }
  }
  const settings=new GameSettings(),state=new State();
  settings.format=Format.EXPANDED;
  state.rules=settings.rules;
  state.gameSettings=settings;
  state.turn=7;state.phase=GamePhase.PLAYER_TURN;
  state.activePlayer=seat;
  state.players=seat===0?[owner,foe]:[foe,owner];
  const store=new Store({onStateChange(){}});
  store.state=state;
  const sourceFacts={
    seat,turn:state.turn,
    active:owner.active.getPokemonCard().fullName,
    activeEnergy:owner.active.energies.cards.map(c=>c.fullName),
    bench:benchedAttacker.fullName,
    benchEnergy:owner.bench[0].energies.cards.map(c=>c.fullName),
    hand:owner.hand.cards.map(c=>c.fullName),
    foeActive:foe.active.getPokemonCard().fullName
  };
  const identity=createHash('sha256').update(JSON.stringify(sourceFacts))
    .digest('hex');
  return {seat,owner,foe,state,store,stone,float,
    benchedAttacker,sourceFacts,identity};
}

/** @param {object} s */
function decide(s,allowFloat){
  return withStoneVRecipient(s.seat,()=>{
    const choose=()=>AttachToolTactic.prototype.useTactic
      .call({},s.state,s.owner);
    return allowFloat?
      withFloatStoneAfterFssHold(s.seat,choose):choose();
  });
}
for(const seat of [0,1]){
  test('rank11 pinned Store FSS-first mobility restores paid attacker seat '+seat,()=>{
    const control=constructedRank11(seat);
    const original=AttachToolTactic.prototype.useTactic;
    const old=decide(control,false);
    assert.equal(old.result,undefined);
    assert.equal(old.audit.events[0].kind,'hold');
    assert.strictEqual(AttachToolTactic.prototype.useTactic,original);
    const trial=constructedRank11(seat);
    assert.equal(trial.identity,control.identity);
    const observed=decide(trial,true);
    assert.strictEqual(AttachToolTactic.prototype.useTactic,original);
    const proposed=observed.result.result;
    assert.ok(proposed instanceof PlayCardAction);
    assert.equal(proposed.handIndex,1);
    assert.equal(observed.audit.events.length,0);
    const first=trial.owner.active.getPokemonCard();
    const retained=trial.owner.active.energies.cards[0];
    trial.store.dispatch(proposed);
    assert.deepEqual(trial.owner.hand.cards,[trial.stone]);
    assert.equal(trial.owner.active.tools[0],trial.float);
    const checked=new CheckRetreatCostEffect(trial.owner);
    trial.store.reduceEffect(trial.state,checked);
    assert.deepEqual(checked.cost,[]);
    trial.store.dispatch(new RetreatAction(trial.owner.id,0));
    assert.equal(trial.owner.active.getPokemonCard(),trial.benchedAttacker);
    assert.equal(trial.owner.bench[0].getPokemonCard(),first);
    assert.equal(trial.owner.bench[0].energies.cards[0],retained);
    const foeDamageBefore=trial.foe.active.damage;
    trial.store.dispatch(new AttackAction(trial.owner.id,'Claw of Darkness'));
    const pending=[];
    for(let j=0;j<6;j++){
      const prompt=trial.state.prompts.find(p=>p.result===undefined);
      if(!prompt)break;
      pending.push(prompt.constructor.name);
      assert.equal(prompt.constructor.name,'WaitPrompt',
        'Unresolved tactical prompt, no fabricated continuation');
      trial.store.dispatch(new ResolvePromptAction(prompt.id,null));
    }
    assert.equal(trial.store.hasPrompts(),false);
    const dealt=trial.foe.active.damage-foeDamageBefore;
    assert.ok(dealt>=200);
    console.log('AGENT2_RANK11_FSS_FLOAT_CLAW_STORE',JSON.stringify({
      rank:11,seat,identity:trial.identity,kind:'constructed-source-print-stage',
      baseline:'FSS-first-HOLD',intervention:'Float Stone BKT',
      floatAccepted:true,retreatAccepted:true,attacker:trial.benchedAttacker.fullName,
      selectedAttack:'Claw of Darkness',actualDamage:dealt,
      pendingPrompts:pending,consequentialPaidAttack:true,
      paperWinnerQualified:false,competitiveGamesQualified:0
    }));
  });
}
