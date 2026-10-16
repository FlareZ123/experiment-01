'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {withActiveOpeningPivot}=require('./active-opening-pivot.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const engine=name=>require(path.join(output,name));

/**
 * A controlled *actual Store setup*, with source-legal 60-card decks and a
 * deliberately constructed opening seven for rank1 champion. This checks
 * response to an eligible prompt, not opening-hand probability or win rate.
 *
 * @param {boolean} enabled Enable the research-owned pivot
 * @returns {object} Setup transcript and physically placed board
 */
function runEligibleSetup(enabled) {
  initializeCards();
  const field=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
      allowEquivalentBasicEnergies:true, allowJapanesePromoHooks:true
    });
  const deckA=field.decks.find(d=>d.rank===1);
  const deckB=field.decks.find(d=>d.rank===10);
  assert.ok(deckA?.playableUnderEngine && deckB?.playableUnderEngine,
    'Both exact registered source decks must be playable under pinned engine');

  const {Store}=engine('game/store/store');
  const {AddPlayerAction}=engine('game/store/actions/add-player-action');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {CoinFlipPrompt}=engine('game/store/prompts/coin-flip-prompt');
  const {ConfirmPrompt}=engine('game/store/prompts/confirm-prompt');
  const {ShuffleDeckPrompt}=engine('game/store/prompts/shuffle-prompt');
  const {ChooseCardsPrompt}=engine('game/store/prompts/choose-cards-prompt');
  const {GameMessage}=engine('game/game-message');
  const {GamePhase}=engine('game/store/state/state');
  const {Format}=engine('game/store/card/card-types');
  const {GameSettings}=engine('game/core/game-settings');
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const definitions=engine('simple-bot/simple-bot-definitions');
  const {ChooseCardsPromptResolver}=engine(
    'simple-bot/prompt-resolver/choose-cards-prompt-resolver');

  const base={
    tactics:definitions.allSimpleTactics,
    promptResolvers:definitions.allPromptResolvers,
    scores:definitions.defaultStateScores,
    arbiter:definitions.defaultArbiterOptions
  };
  const pivot=withActiveOpeningPivot(base,{
    ChooseCardsPromptResolver,ChooseCardsPrompt,ResolvePromptAction,GameMessage
  });
  const botA=new SimpleTacticsAi({id:101},enabled?pivot:base,deckA.cardIds);
  const botB=new SimpleTacticsAi({id:202},base,deckB.cardIds);
  const store=new Store({onStateChange(){}});
  const settings=new GameSettings();
  settings.format=Format.EXPANDED;
  settings.rules.firstTurnUseSupporter=false;
  store.state.gameSettings=settings;
  store.state.rules=settings.rules;
  store.dispatch(new AddPlayerAction(101,'Champion',deckA.cardIds));
  store.dispatch(new AddPlayerAction(202,'Regidrago',deckB.cardIds));
  assert.equal(store.state.phase,GamePhase.SETUP);

  const requested=[
    'Latias ex SSP','Shadow Rider Calyrex V CRE',
    'Trevenant & Dusknoir-GX SMP'
  ];
  const firstShuffles=new Set();
  const events=[];
  let candidateStarting=null;
  let candidateSeven=null;
  for(let n=0;n<100 && store.state.phase===GamePhase.SETUP;n++){
    const prompt=store.state.prompts.find(p=>p.result===undefined);
    assert.ok(prompt,'Setup must have one pending prompt');
    let action;
    if(prompt instanceof ShuffleDeckPrompt){
      const id=prompt.getPerspectivePlayerId();
      const player=store.state.players.find(p=>p.id===id);
      assert.ok(player);
      let order=player.deck.cards.map((card,index)=>index);
      if(id===101 && !firstShuffles.has(id)){
        const priority=requested.map(name=>{
          const index=player.deck.cards.findIndex(card=>card.fullName===name);
          assert.ok(index>=0,'Required pinned printing absent: '+name);
          return index;
        });
        const filler=order.filter(index=>
          !priority.includes(index) &&
          player.deck.cards[index].superType!==
            engine('game/store/card/card-types').SuperType.POKEMON).slice(0,4);
        assert.equal(filler.length,4);
        const firstSeven=[...priority,...filler];
        order=[...firstSeven,...order.filter(i=>!firstSeven.includes(i))];
      }
      firstShuffles.add(id);
      action=new ResolvePromptAction(prompt.id,order);
    }else if(prompt instanceof CoinFlipPrompt ||
      prompt instanceof ConfirmPrompt){
      action=new ResolvePromptAction(prompt.id,true);
    }else{
      if(prompt instanceof ChooseCardsPrompt &&
        prompt.message===GameMessage.CHOOSE_STARTING_POKEMONS &&
        prompt.playerId===101){
        candidateSeven=store.state.players[0].hand.cards.map(card=>card.fullName);
      }
      const bot=prompt.playerId===101?botA:botB;
      action=bot.decodeNextAction(store.state);
      assert.ok(action,'Bot must answer all setup prompts');
      if(prompt instanceof ChooseCardsPrompt &&
        prompt.message===GameMessage.CHOOSE_STARTING_POKEMONS &&
        prompt.playerId===101){
        assert.equal(prompt.validate(action.result),true);
        candidateStarting=action.result.map(card=>card.fullName);
        assert.ok(requested.every(name=>candidateStarting.includes(name)),
          'Both Latias and Shadow Rider must be eligible and selected');
      }
    }
    events.push({kind:prompt.constructor.name,
      player:prompt.playerId,
      message:String(prompt.message||'')});
    store.dispatch(action);
  }
  assert.equal(store.state.phase,GamePhase.PLAYER_TURN,
    'Complete ordinary rule-driven setup must finish');
  const player=store.state.players[0];
  const result={
    enabled,sourceRanks:[1,10],
    constructedSeven:candidateSeven,
    chosenStarting: candidateStarting,
    physicallyPlacedActive:player.active.getPokemonCard()?.fullName,
    physicallyPlacedBench:player.bench.map(p=>p.getPokemonCard()?.fullName)
      .filter(Boolean),
    setupEvents:events.length,
    evidenceType:'controlled pinned-Store complete setup, not sampled random deal'
  };
  assert.equal(candidateStarting[0],result.physicallyPlacedActive);
  if(enabled){
    assert.equal(result.physicallyPlacedActive,'Shadow Rider Calyrex V CRE');
  }
  return result;
}

/** @returns {object} */
function runControlledContrast(){
  const baseline=runEligibleSetup(false);
  const pivot=runEligibleSetup(true);
  assert.deepEqual([...baseline.chosenStarting].sort(),[...pivot.chosenStarting].sort(),
    'Only the choice of Active may change in the controlled setup');
  assert.deepEqual([...baseline.constructedSeven].sort(),
    [...pivot.constructedSeven].sort(),'Same exact source seven');
  return {baseline,pivot,
    promotedActiveChanged:baseline.physicallyPlacedActive!==pivot.physicallyPlacedActive,
    caveat:'Constructed opening hand and immediate rule-driven setup only. No gameplay win evidence.'};
}

if(require.main===module){
  process.stdout.write(JSON.stringify(runControlledContrast(),null,2)+'\n');
}
module.exports={runEligibleSetup,runControlledContrast};
