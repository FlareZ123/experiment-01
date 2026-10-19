'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {withSpentSupporterSearch}=
  require('../simulation/twinleaf/spent-supporter-search-policy.cjs');
const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const engine=name=>require(path.join(output,name));

test('pinned native hand scoring prefers spent-turn Acerola over the sole Psychic Energy',()=>{
  const cards=initializeCards();
  const acerola=cards.getCardByName('Acerola BUS');
  const psychic=cards.getCardByName('Psychic Energy MEE');
  assert.ok(acerola && psychic);
  const {State}=engine('game/store/state/state');
  const {Player}=engine('game/store/state/player');
  const {ChooseCardsPrompt}=engine('game/store/prompts/choose-cards-prompt');
  const {ChooseCardsPromptResolver}=
    engine('simple-bot/prompt-resolver/choose-cards-prompt-resolver');
  const {defaultStateScores}=
    engine('simple-bot/simple-bot-definitions');
  const {GameMessage}=engine('game/game-message');
  const {TrainerType}=engine('game/store/card/card-types');
  const player=new Player();
  player.id=101;
  player.supporterTurn=16;
  player.energyPlayedTurn=16;
  player.deck.cards=[psychic,acerola];
  const state=new State();
  state.turn=16;
  state.players=[player];
  const prompt=new ChooseCardsPrompt(player,
    GameMessage.CHOOSE_CARD_TO_HAND,player.deck,{},
    {min:1,max:1,allowCancel:false});
  const options={scores:defaultStateScores};
  const original=ChooseCardsPromptResolver.prototype.buildCardsToChoose;
  const resolver=new ChooseCardsPromptResolver(options);
  const native=resolver.buildCardsToChoose(state,prompt);
  assert.equal(native[0].fullName,'Acerola BUS');
  assert.equal(native[1].fullName,'Psychic Energy MEE');
  const out=withSpentSupporterSearch(0,()=>({
    chosen:resolver.buildCardsToChoose(state,prompt),
    wasEligible:player.supporterTurn>0
  }));
  assert.equal(out.result.chosen[0].fullName,'Psychic Energy MEE');
  assert.equal(out.result.chosen[1].fullName,'Acerola BUS');
  assert.equal(out.audit.events[0].firstSupporterBonusRemoved,
    defaultStateScores.hand.hasSupporter);
  assert.equal(out.audit.events.length,1);
  assert.equal(ChooseCardsPromptResolver.prototype.buildCardsToChoose,original);
  assert.equal(player.hand.cards.length,0);
  assert.equal(player.deck.cards.length,2);
  assert.equal(acerola.trainerType,TrainerType.SUPPORTER);
  assert.equal(prompt.validate([out.result.chosen[0]]),true);
});
