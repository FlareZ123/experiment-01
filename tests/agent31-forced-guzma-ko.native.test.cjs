'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=require(
  '../simulation/twinleaf/actor-observation-contract.cjs');
const {chooseForcedGuzmaNominalKo}=require(
  '../simulation/twinleaf/agent31-forced-guzma-ko-frontier.cjs');
const {publicCatalog}=require(
  '../simulation/twinleaf/agent43-guzma-prompt-continuation.cjs');
const {nativeSinglePokemonChoices}=require(
  '../simulation/twinleaf/agent8-actor-only-choose-pokemon.cjs');

const base=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=relative=>require(path.join(base,relative));
const {Store}=native('game/store/store');
const {State,GamePhase}=native('game/store/state/state');
const {Player}=native('game/store/state/player');
const {CardList}=native('game/store/state/card-list');
const {PokemonCardList}=native('game/store/state/pokemon-card-list');
const {PlayCardAction,PlayerType,SlotType}=
  native('game/store/actions/play-card-action');
const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
const {AttackAction}=native('game/store/actions/game-actions');
const {Format}=native('game/store/card/card-types');

/**
 * Stage only real pinned printed cards in a genuine Store. This avoids
 * substituting simulated damage and permits both physical owner seats.
 * @param {0|1} seat
 * @returns {object}
 */
function staged(seat) {
  const manager=initializeCards();
  let id=531000+seat*1000;
  const card=printing=>{
    const physical=manager.getCardByName(printing);
    assert.ok(physical,'Missing pinned printing '+printing);
    physical.id=id++;
    return physical;
  };
  const owner=new Player(),opponent=new Player();
  owner.id=101;opponent.id=202;
  owner.name='Owner';opponent.name='Opponent';
  owner.supporterTurn=0;
  owner.active.cards.push(card('Lunatone OBF'));
  opponent.active.cards.push(card('Galarian Articuno V CRE'));
  for(const player of [owner,opponent]){
    for(let n=0;n<5;n++)player.bench.push(new PokemonCardList());
    for(let n=0;n<15;n++)player.deck.cards.push(card('Psychic Energy MEE'));
    for(let n=0;n<6;n++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy MEE'));
      player.prizes.push(prize);
    }
  }
  owner.bench[0].cards.push(card('Lunatone OBF'));
  for(let n=0;n<3;n++)owner.bench[0].energies.cards.push(
    card('Psychic Energy MEE'));
  opponent.bench[0].cards.push(card('Lunatone OBF'));
  owner.hand.cards.push(card('Guzma BUS'));
  const sourceTargetId=opponent.bench[0].getPokemonCard().id;
  const sourceAttackerId=owner.bench[0].getPokemonCard().id;
  const state=new State();
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.phase=GamePhase.PLAYER_TURN;
  state.activePlayer=seat;
  state.turn=5;
  state.gameSettings.format=Format.EXPANDED;
  const store=new Store({onStateChange(){}});
  store.state=state;
  return {store,state,owner,opponent,sourceTargetId,sourceAttackerId};
}

function resolveUniqueSwitch(store,state,expectedSeat,expectedIndex) {
  const pending=state.prompts.find(p=>p.result===undefined);
  assert.equal(pending?.constructor?.name,'ChoosePokemonPrompt');
  const offered=nativeSinglePokemonChoices(state,pending);
  assert.equal(offered.length,1,'Both Guzma destinations must be forced');
  assert.equal(offered[0].seat,expectedSeat);
  assert.equal(offered[0].index,expectedIndex);
  store.dispatch(new ResolvePromptAction(pending.id,[offered[0].physical]));
}

function settleKoPrompts(store,state) {
  for(let step=0;step<24;step++){
    const pending=state.prompts.find(p=>p.result===undefined);
    if(!pending)return;
    if(pending.constructor.name==='WaitPrompt'){
      store.dispatch(new ResolvePromptAction(pending.id,null));
    }else if(pending.constructor.name==='ChoosePokemonPrompt'){
      const offered=nativeSinglePokemonChoices(state,pending);
      assert.ok(offered.length>0);
      store.dispatch(new ResolvePromptAction(pending.id,[offered[0].physical]));
    }else if(pending.constructor.name==='ChoosePrizePrompt'){
      const viewer=state.players.find(p=>p.id===
        pending.getPerspectivePlayerId());
      assert.ok(viewer);
      const side=pending.options.useOpponentPrizes?
        state.players.find(p=>p!==viewer):viewer;
      const slots=side.prizes.filter(p=>p.cards.length>0)
        .slice(0,pending.options.count);
      assert.equal(pending.validate(slots,state),true);
      store.dispatch(new ResolvePromptAction(pending.id,slots));
    }else{
      assert.fail('Unexpected real KO prompt '+pending.constructor.name);
    }
  }
  assert.fail('Pinned Store never completed the terminal KO prompts');
}

test('both physical owner seats: new forced Guzma plan resolves native KO and Prize',()=>{
  for(const seat of [0,1]){
    const x=staged(seat);
    const view=actorObservation(x.state,seat);
    const plan=chooseForcedGuzmaNominalKo(view,publicCatalog());
    assert.equal(plan?.kind,'play-guzma-forced-nominal-ko',
      'Printed native observation must pass the conservative root screen');
    assert.equal(plan?.opponentBenchIndex,0);
    assert.equal(plan?.benchIndex,0);
    const oldPrizeCount=x.owner.prizes.filter(p=>p.cards.length>0).length;
    const oldHandCard=x.owner.hand.cards[plan.handIndex];
    x.store.dispatch(new PlayCardAction(x.owner.id,plan.handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    resolveUniqueSwitch(x.store,x.state,1-seat,plan.opponentBenchIndex);
    assert.equal(x.opponent.active.getPokemonCard()?.id,x.sourceTargetId);
    resolveUniqueSwitch(x.store,x.state,seat,plan.benchIndex);
    assert.equal(x.owner.active.getPokemonCard()?.id,x.sourceAttackerId);
    assert.equal(x.owner.hand.cards.includes(oldHandCard),false);
    x.store.dispatch(new AttackAction(x.owner.id,plan.attackName));
    settleKoPrompts(x.store,x.state);
    assert.ok(x.opponent.discard.cards.some(c=>c.id===x.sourceTargetId),
      'Forced gust target must be genuinely Knocked Out');
    const now=x.owner.prizes.filter(p=>p.cards.length>0).length;
    assert.equal(now,oldPrizeCount-1,
      'Actual Store must settle exactly one earned Prize');
    console.log('AGENT31_NATIVE_FORCED_GUZMA',JSON.stringify({
      seat,attackName:plan.attackName,target:plan.targetRemainingHp,
      nominalDamage:plan.nominalDamage,
      originalPrizeCount:oldPrizeCount,afterPrizeCount:now,
      competitiveQualified:false
    }));
  }
});

test('both seats: default-off bridge explicitly opts into forced Guzma native prompt custody',()=>{
  const {withGuzmaOwnerPromptContinuation}=require(
    '../simulation/twinleaf/agent43-guzma-prompt-continuation.cjs');
  const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
  const definitions=native('simple-bot/simple-bot-definitions');
  const botOptions={
    tactics:definitions.allSimpleTactics,
    promptResolvers:definitions.allPromptResolvers,
    scores:definitions.defaultStateScores,
    arbiter:definitions.defaultArbiterOptions
  };
  for(const seat of [0,1]){
    const x=staged(seat);
    // A funded Active is deliberately not the existing mobility policy's
    // case: it can attack for 100, but not Knock Out the 210-HP defender.
    // The newly proposed forced gust can take the 90-HP Bench target.
    let id=534000+seat*500;
    const manager=initializeCards();
    for(let n=0;n<3;n++){
      const energy=manager.getCardByName('Psychic Energy MEE');
      assert.ok(energy);
      energy.id=id++;
      x.owner.active.energies.cards.push(energy);
    }
    const observation=actorObservation(x.state,seat);
    assert.equal(chooseForcedGuzmaNominalKo(
      observation,publicCatalog())?.kind,'play-guzma-forced-nominal-ko');
    const bot=new SimpleTacticsAi({id:x.owner.id},botOptions,null);
    const originalBot=SimpleTacticsAi.prototype.decodeNextAction;
    const originalDispatch=Store.prototype.dispatch;
    const observed=withGuzmaOwnerPromptContinuation(()=>{
      x.store.dispatch(new PlayCardAction(x.owner.id,0,{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0
      }));
      for(let n=0;n<2;n++){
        const pending=x.state.prompts.find(p=>p.result===undefined);
        assert.equal(pending?.constructor?.name,'ChoosePokemonPrompt');
        const reply=bot.decodeNextAction(x.state);
        assert.ok(reply instanceof ResolvePromptAction);
        assert.equal(reply.id,pending.id);
        x.store.dispatch(reply);
      }
      return {
        ownActive:x.owner.active.getPokemonCard()?.id,
        opposingActive:x.opponent.active.getPokemonCard()?.id
      };
    },{initialLiveStore:x.store,forcedGuzmaNominalKo:true});
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,originalBot);
    assert.strictEqual(Store.prototype.dispatch,originalDispatch);
    assert.equal(observed.result.ownActive,x.sourceAttackerId);
    assert.equal(observed.result.opposingActive,x.sourceTargetId);
    assert.equal(observed.audit.acceptedGuzmaRoots,1);
    assert.equal(observed.audit.matchedForcedNominalKoPlans,1);
    assert.equal(observed.audit.guzmaHandConsumptionConfirmed,1);
    assert.equal(observed.audit.ownTargetPhysicalConfirmations,1);
    assert.equal(observed.audit.ownTargetPhysicalMismatches,0);
    assert.equal(observed.audit.competitiveGameQualified,false);
  }
});
