'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { planAichi } = require('../evaluation/aichi-pilot.cjs');
const { stagedRaichu } = require('./temple-raichu-board.cjs');
const { installSupporterDecisionHook } =
  require('./supporter-decision-hook.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} relativePath */
function engine(relativePath) {
  return require(path.join(output, relativePath));
}

/**
 * Preserve an actual published rank-10 60-card multiset in a prepared game
 * state. All cards are accounted for across Active, hand, deck, six Prizes,
 * and discard. Only the unseen physical draw order changes between variants.
 * This is an artificial turn-four board, not a claim that it arose in play.
 *
 * @param {boolean} pokemonTop
 * @param {number} [deckSize] Number of unseen cards remaining, including both seven-card groups.
 */
function sourceState(pokemonTop, deckSize = 34) {
  assert.ok(deckSize === 14 || deckSize === 34);
  const plan = planAichi(10, {
    allowEquivalentBasicEnergies: true,
    allowBasicEnergyMirrorPrintings: true,
    allowJapanesePromoHooks: true
  });
  assert.equal(plan.candidate.cards.length, 60);
  const remaining = [...plan.candidate.cards];
  /** @param {string} name @param {number} count */
  function take(name, count) {
    const selected = [];
    for (let n = 0; n < count; n += 1) {
      const index = remaining.findIndex(card => card.startsWith(name + ' '));
      assert.ok(index >= 0, 'Source rank 10 lacks ' + name);
      selected.push(remaining.splice(index, 1)[0]);
    }
    return selected;
  }
  const active = take('Budew', 1);
  const hand = take("Professor's Research", 1);
  const productive = [
    ...take('Regidrago V', 4),
    ...take('Regidrago VSTAR', 3)
  ];
  const unproductive = [
    ...take('Double Dragon Energy', 4),
    ...take('Battle VIP Pass', 3)
  ];
  const prizes = remaining.splice(0, 6);
  const discard = remaining.splice(0, 52 - deckSize - 0);
  const filler = remaining;
  const deck = pokemonTop ?
    [...productive, ...unproductive, ...filler] :
    [...unproductive, ...productive, ...filler];
  const inventory = [...active, ...hand, ...prizes, ...discard, ...deck].sort();
  assert.deepEqual(inventory, [...plan.candidate.cards].sort(),
    'All 60 source-list card copies must be accounted for exactly');

  const f = stagedRaichu([], null);
  const {CardList} = engine('game/store/state/card-list');
  /** @param {string} name */
  const card = name => f.card(name);
  f.state.turn = 4;
  f.a.supporterTurn = 0;
  f.a.active.cards = active.map(card);
  f.a.hand.cards = hand.map(card);
  f.a.deck.cards = deck.map(card);
  f.a.discard.cards = discard.map(card);
  f.a.prizes = prizes.map(name => {
    const pile = new CardList();
    pile.cards.push(card(name));
    return pile;
  });
  // Opponent board is outside the source-rank-10 multiset under test.
  f.b.deck.cards.push(card('Shadow Rider Calyrex V CRE'));
  f.b.prizes = Array.from({length: 6}, () => {
    const pile = new CardList();
    pile.cards.push(card('Shadow Rider Calyrex V CRE'));
    return pile;
  });
  let id = 1;
  for (const player of [f.a, f.b]) {
    for (const zone of [player.active, player.hand, player.deck, player.discard,
      player.stadium, ...player.prizes, ...player.bench]) {
      for (const item of zone.cards) item.id = id++;
    }
  }
  return {fixture:f, rank:10, inventory:plan.candidate.cards,
    candidateDigest:plan.candidateDigest};
}

/**
 * Evaluate a legal source-list inventory with an action decision affected by
 * hidden deck order, without misrepresenting its constructed board as a game.
 * @returns {object}
 */
function auditSourceHiddenPolicy() {
  const a = sourceState(false);
  const b = sourceState(true);
  const sameVisible = x => ({
    active:x.fixture.a.active.cards.map(c=>c.fullName),
    hand:x.fixture.a.hand.cards.map(c=>c.fullName),
    prizesCount:x.fixture.a.prizes.length,
    discard:x.fixture.a.discard.cards.map(c=>c.fullName).sort(),
    deckMultiset:x.fixture.a.deck.cards.map(c=>c.fullName).sort()
  });
  assert.deepEqual(sameVisible(a),sameVisible(b));
  assert.equal(a.candidateDigest,b.candidateDigest);
  const { PlaySupporterTactic } =
    engine('simple-bot/simple-tactics/play-supporter-tactic');
  const defs = engine('simple-bot/simple-bot-definitions');
  const {PlayCardAction,PlayerType,SlotType} =
    engine('game/store/actions/play-card-action');
  const {SimpleTacticsAi} = engine('simple-bot/simple-tactics-ai');
  const options={
    tactics:[PlaySupporterTactic],
    promptResolvers:defs.allPromptResolvers,
    scores:defs.defaultStateScores,
    arbiter:defs.defaultArbiterOptions
  };
  /** @param {ReturnType<typeof sourceState>} state */
  function score(state) {
    const f=state.fixture;
    return new PlaySupporterTactic(options).evaluateAction(
      f.state,f.a.id,new PlayCardAction(f.a.id,0,
        {player:PlayerType.ANY,slot:SlotType.BOARD,index:0})
    );
  }
  const unproductiveTopScore=score(a);
  const productiveTopScore=score(b);
  assert.equal(typeof unproductiveTopScore,'number');
  assert.equal(typeof productiveTopScore,'number');
  assert.notEqual(unproductiveTopScore,productiveTopScore,
    'Source-complete legal inventory should still leak unrevealed ordering');

  /** @param {ReturnType<typeof sourceState>} state */
  function choose(state) {
    const f=state.fixture;
    return new SimpleTacticsAi({id:f.a.id}, options, null)
      .decodeNextAction(f.state)?.constructor.name || null;
  }
  const restore=installSupporterDecisionHook();
  let unproductiveTopAction,productiveTopAction;
  try {
    unproductiveTopAction=choose(a);
    productiveTopAction=choose(b);
  } finally {
    restore();
  }
  const lateA=sourceState(false,14);
  const lateB=sourceState(true,14);
  assert.deepEqual(sameVisible(lateA),sameVisible(lateB));
  const lateUnproductiveScore=score(lateA);
  const lateProductiveScore=score(lateB);
  let lateUnproductiveAction,lateProductiveAction;
  const restoreLate=installSupporterDecisionHook();
  try {
    lateUnproductiveAction=choose(lateA);
    lateProductiveAction=choose(lateB);
  } finally {
    restoreLate();
  }
  const lateBaseScore=new PlaySupporterTactic(options)
    .getStateScore(lateA.fixture.state,lateA.fixture.a.id);
  return {
    sourceRank:10,sourceDeckCards:60,
    candidateDigest:a.candidateDigest,
    identicalObservedZonesAndCompleteSourceDeck:true,
    topSevenChoices:[
      '4 Double Dragon Energy + 3 Battle VIP Pass',
      '4 Regidrago V + 3 Regidrago VSTAR'
    ],
    unproductiveTopScore,productiveTopScore,
    unproductiveTopAction,productiveTopAction,
    actionChanged:unproductiveTopAction!==productiveTopAction,
    lateFourteenCardDeck:{
      startingScore:lateBaseScore,
      supporterThreshold:lateBaseScore-options.scores.tactics.supporterBonus,
      unproductiveTopScore:lateUnproductiveScore,
      productiveTopScore:lateProductiveScore,
      unproductiveTopAction:lateUnproductiveAction,
      productiveTopAction:lateProductiveAction,
      actionChanged:lateUnproductiveAction!==lateProductiveAction
    },
    scope:'Artificial turn-four 60-card source-inventory state, one-tactic corrected bot; not a full match or strength evidence'
  };
}
if(require.main===module){
  console.log(JSON.stringify(auditSourceHiddenPolicy(),null,2));
}
module.exports={sourceState,auditSourceHiddenPolicy};
