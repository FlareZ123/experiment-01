'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=require(
  '../simulation/twinleaf/actor-observation-contract.cjs');
const {chooseFinalPrizeGuzma}=require(
  '../simulation/twinleaf/agent31-final-prize-guzma-frontier.cjs');
const {withGuzmaOwnerPromptContinuation,publicCatalog}=require(
  '../simulation/twinleaf/agent43-guzma-prompt-continuation.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=module=>require(path.join(output,module));
const {Store}=native('game/store/store');
const {State,GamePhase}=native('game/store/state/state');
const {Player}=native('game/store/state/player');
const {CardList}=native('game/store/state/card-list');
const {PokemonCardList}=native('game/store/state/pokemon-card-list');
const {PlayCardAction,PlayerType,SlotType}=
  native('game/store/actions/play-card-action');
const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
const {AttackAction}=native('game/store/actions/game-actions');
const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
const {Format}=native('game/store/card/card-types');
const {nativeSinglePokemonChoices}=require(
  '../simulation/twinleaf/agent8-actor-only-choose-pokemon.cjs');

function fixture(seat,ownerPrizeCount=1){
  const manager=initializeCards();
  let id=632000+seat*1000;
  const card=printing=>{
    const physical=manager.getCardByName(printing);
    assert.ok(physical,'Unknown native printing '+printing);
    physical.id=id++;
    return physical;
  };
  const owner=new Player(),foe=new Player();
  owner.id=401;foe.id=502;
  owner.name='FinalPrizeOwner';foe.name='Foe';
  owner.supporterTurn=0;
  owner.active.cards.push(card('Lunatone OBF'));
  foe.active.cards.push(card('Galarian Articuno V CRE'));
  for(const p of [owner,foe]){
    for(let n=0;n<5;n++)p.bench.push(new PokemonCardList());
    for(let n=0;n<12;n++)p.deck.cards.push(card('Psychic Energy MEE'));
    for(let n=0;n<(p===owner?ownerPrizeCount:6);n++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy MEE'));
      p.prizes.push(prize);
    }
  }
  owner.bench[0].cards.push(card('Crobat V DAA'));
  owner.bench[1].cards.push(card('Lunatone OBF'));
  for(let n=0;n<3;n++)owner.bench[1].energies.cards.push(
    card('Psychic Energy MEE'));
  foe.bench[0].cards.push(card('Oranguru V ASR'));
  foe.bench[1].cards.push(card('Lunatone OBF'));
  owner.hand.cards.push(card('Guzma BUS'));
  const ownAttacker=owner.bench[1].getPokemonCard().id;
  const target=foe.bench[1].getPokemonCard().id;
  const state=new State();
  state.players=seat===0?[owner,foe]:[foe,owner];
  state.turn=9;
  state.phase=GamePhase.PLAYER_TURN;
  state.activePlayer=seat;
  state.gameSettings.format=Format.EXPANDED;
  const store=new Store({onStateChange(){}});
  store.state=state;
  return {store,state,owner,foe,ownAttacker,target};
}

function completeAttackPrompts(store,state){
  for(let n=0;n<24;n++){
    const pending=state.prompts.find(p=>p.result===undefined);
    if(!pending)return;
    if(pending.constructor.name==='WaitPrompt'){
      store.dispatch(new ResolvePromptAction(pending.id,null));
    }else if(pending.constructor.name==='ChoosePokemonPrompt'){
      const choices=nativeSinglePokemonChoices(state,pending);
      assert.ok(choices.length>0);
      store.dispatch(new ResolvePromptAction(pending.id,[choices[0].physical]));
    }else if(pending.constructor.name==='ChoosePrizePrompt'){
      const actor=state.players.find(p=>p.id===
        pending.getPerspectivePlayerId());
      assert.ok(actor);
      const other=state.players.find(p=>p!==actor);
      const prizePlayer=pending.options.useOpponentPrizes?other:actor;
      const chosen=prizePlayer.prizes.filter(slot=>slot.cards.length>0)
        .slice(0,pending.options.count);
      assert.equal(pending.validate(chosen,state),true);
      store.dispatch(new ResolvePromptAction(pending.id,chosen));
    }else{
      assert.fail('Unexpected original Store attack prompt '+
        pending.constructor.name);
    }
  }
  assert.fail('Native Store final-Prize prompt did not close');
}

test('final Prize Guzma picks nonfirst opposing and own Bench through real native prompts in both seats',()=>{
  for(const seat of [0,1]){
    const x=fixture(seat);
    const view=actorObservation(x.state,seat);
    const plan=chooseFinalPrizeGuzma(view,publicCatalog());
    assert.equal(plan?.kind,'play-guzma-forced-nominal-ko');
    assert.equal(plan?.planFamily,'last-prize-multi-bench-nominal-gust');
    assert.equal(plan?.benchIndex,1);
    assert.equal(plan?.opponentBenchIndex,1);
    assert.equal(plan?.finalPrizeBeforeRoot,1);
    const definitions=native('simple-bot/simple-bot-definitions');
    const bot=new SimpleTacticsAi({id:x.owner.id},{
      tactics:definitions.allSimpleTactics,
      promptResolvers:definitions.allPromptResolvers,
      scores:definitions.defaultStateScores,
      arbiter:definitions.defaultArbiterOptions
    },null);
    const botDescriptor=SimpleTacticsAi.prototype.decodeNextAction;
    const storeDescriptor=Store.prototype.dispatch;
    const observed=withGuzmaOwnerPromptContinuation(()=>{
      x.store.dispatch(new PlayCardAction(x.owner.id,plan.handIndex,{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0
      }));
      for(let i=0;i<2;i++){
        const pending=x.state.prompts.find(p=>p.result===undefined);
        assert.equal(pending?.constructor?.name,'ChoosePokemonPrompt');
        const offered=nativeSinglePokemonChoices(x.state,pending);
        assert.equal(offered.filter(c=>c.zone==='bench').length,2);
        const action=bot.decodeNextAction(x.state);
        assert.ok(action instanceof ResolvePromptAction);
        assert.equal(action.id,pending.id);
        const chosen=offered.find(c=>c.index===1 &&
          c.physical===action.result?.[0]);
        assert.ok(chosen,'Exact second Bench physical option required');
        x.store.dispatch(action);
      }
      return {
        opponentActiveId:x.foe.active.getPokemonCard()?.id,
        ownActiveId:x.owner.active.getPokemonCard()?.id
      };
    },{initialLiveStore:x.store,finalPrizeGuzma:true});
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,
      botDescriptor);
    assert.strictEqual(Store.prototype.dispatch,storeDescriptor);
    assert.equal(observed.result.opponentActiveId,x.target);
    assert.equal(observed.result.ownActiveId,x.ownAttacker);
    assert.equal(observed.audit.matchedFinalPrizePlans,1);
    assert.equal(observed.audit.guzmaHandConsumptionConfirmed,1);
    assert.equal(observed.audit.gustTargetPhysicalConfirmations,1);
    assert.equal(observed.audit.ownTargetPhysicalConfirmations,1);
    const beforePrize=x.owner.prizes.reduce((n,p)=>n+p.cards.length,0);
    assert.equal(beforePrize,1);
    x.store.dispatch(new AttackAction(x.owner.id,plan.attackName));
    completeAttackPrompts(x.store,x.state);
    assert.ok(x.foe.discard.cards.some(c=>c.id===x.target),
      'Real native Store must KO the chosen opponent second Bench target');
    const afterPrize=x.owner.prizes.reduce((n,p)=>n+p.cards.length,0);
    assert.equal(afterPrize,0,'Real final Prize must be physically collected');
    console.log('AGENT31_FINAL_PRIZE_GUZMA_NATIVE',JSON.stringify({
      seat,attack:plan.attackName,
      chosenOpponentBenchIndex:plan.opponentBenchIndex,
      chosenOwnBenchIndex:plan.benchIndex,
      beforePrize,afterPrize,
      gamePhase:x.state.phase,
      competitivelyQualified:false
    }));
  }
});

test('nonfinal 6-to-5 Prize trade also uses authentic nonfirst Guzma targets in both seats',()=>{
  const {choosePrizeTradeGuzma}=require(
    '../simulation/twinleaf/agent31-final-prize-guzma-frontier.cjs');
  const definitions=native('simple-bot/simple-bot-definitions');
  for(const seat of [0,1]){
    const x=fixture(seat,6);
    const plan=choosePrizeTradeGuzma(
      actorObservation(x.state,seat),publicCatalog());
    assert.equal(plan?.planFamily,'nonfinal-prize-trade-nominal-gust');
    assert.equal(plan?.benchIndex,1);
    assert.equal(plan?.opponentBenchIndex,1);
    const bot=new SimpleTacticsAi({id:x.owner.id},{
      tactics:definitions.allSimpleTactics,
      promptResolvers:definitions.allPromptResolvers,
      scores:definitions.defaultStateScores,
      arbiter:definitions.defaultArbiterOptions
    },null);
    const observed=withGuzmaOwnerPromptContinuation(()=>{
      x.store.dispatch(new PlayCardAction(x.owner.id,plan.handIndex,{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0
      }));
      for(let i=0;i<2;i++){
        const pending=x.state.prompts.find(p=>p.result===undefined);
        assert.equal(pending?.constructor?.name,'ChoosePokemonPrompt');
        const offered=nativeSinglePokemonChoices(x.state,pending);
        const action=bot.decodeNextAction(x.state);
        assert.ok(action instanceof ResolvePromptAction);
        const physical=offered.find(c=>c.index===1)?.physical;
        assert.ok(physical);
        assert.equal(action.result?.[0],physical);
        x.store.dispatch(action);
      }
      return {
        opponent:x.foe.active.getPokemonCard()?.id,
        owner:x.owner.active.getPokemonCard()?.id
      };
    },{initialLiveStore:x.store,prizeTradeGuzma:true});
    assert.equal(observed.result.opponent,x.target);
    assert.equal(observed.result.owner,x.ownAttacker);
    assert.equal(observed.audit.matchedNonfinalPrizeTradePlans,1);
    assert.equal(observed.audit.gustTargetPhysicalConfirmations,1);
    assert.equal(observed.audit.ownTargetPhysicalConfirmations,1);
    assert.equal(observed.audit.competitiveGameQualified,false);
    assert.equal(x.owner.prizes.reduce((n,p)=>n+p.cards.length,0),6);
    x.store.dispatch(new AttackAction(x.owner.id,plan.attackName));
    completeAttackPrompts(x.store,x.state);
    assert.ok(x.foe.discard.cards.some(c=>c.id===x.target));
    assert.equal(x.owner.prizes.reduce((n,p)=>n+p.cards.length,0),5);
  }
});
