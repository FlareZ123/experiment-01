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

test('opponent-concealed hand and deck swap cannot change the owner Star-search ranking',()=>{
  const cards=initializeCards();
  const {State}=engine('game/store/state/state');
  const {Player}=engine('game/store/state/player');
  const {ChooseCardsPrompt}=engine('game/store/prompts/choose-cards-prompt');
  const {ChooseCardsPromptResolver}=
    engine('simple-bot/prompt-resolver/choose-cards-prompt-resolver');
  const {defaultStateScores}=
    engine('simple-bot/simple-bot-definitions');
  const {GameMessage}=engine('game/game-message');

  /** @param {string} opposingHandName @param {string} opposingDeckName */
  function world(opposingHandName,opposingDeckName){
    const owner=new Player();
    owner.id=101;
    owner.supporterTurn=1;
    owner.deck.cards=[
      cards.getCardByName('Acerola BUS'),
      cards.getCardByName('Psychic Energy MEE')
    ];
    const opponent=new Player();
    opponent.id=202;
    opponent.hand.cards=[cards.getCardByName(opposingHandName)];
    opponent.deck.cards=[cards.getCardByName(opposingDeckName)];
    assert.ok([...owner.deck.cards,...opponent.hand.cards,
      ...opponent.deck.cards].every(Boolean));
    const state=new State();
    state.turn=16;
    state.players=[owner,opponent];
    const prompt=new ChooseCardsPrompt(owner,
      GameMessage.CHOOSE_CARD_TO_HAND,owner.deck,{},
      {min:1,max:1,allowCancel:false});
    return {state,prompt,owner,opponent};
  }

  // The acting player sees the same own deck at this legitimate search.
  // Only the two opponent cards' hidden positions have exchanged.
  const a=world('Battle VIP Pass FST','Psychic Energy MEE');
  const b=world('Psychic Energy MEE','Battle VIP Pass FST');
  assert.deepEqual(a.owner.deck.cards.map(c=>c.fullName),
    b.owner.deck.cards.map(c=>c.fullName));
  assert.deepEqual([a.opponent.hand.cards.length,a.opponent.deck.cards.length],
    [b.opponent.hand.cards.length,b.opponent.deck.cards.length]);
  assert.notEqual(a.opponent.hand.cards[0].fullName,
    b.opponent.hand.cards[0].fullName);

  const original=ChooseCardsPromptResolver.prototype.buildCardsToChoose;
  const resolved=withSpentSupporterSearch(0,()=>{
    const resolver=new ChooseCardsPromptResolver({scores:defaultStateScores});
    return [a,b].map(({state,prompt})=>
      resolver.buildCardsToChoose(state,prompt).map(card=>card.fullName));
  });
  assert.deepEqual(resolved.result,[
    ['Psychic Energy MEE','Acerola BUS'],
    ['Psychic Energy MEE','Acerola BUS']
  ]);
  assert.equal(resolved.audit.events.length,2);
  assert.equal(ChooseCardsPromptResolver.prototype.buildCardsToChoose,
    original);
  for(const {owner,opponent} of [a,b]){
    assert.equal(owner.hand.cards.length,0);
    assert.equal(owner.deck.cards.length,2);
    assert.equal(opponent.hand.cards.length,1);
    assert.equal(opponent.deck.cards.length,1);
  }
});
