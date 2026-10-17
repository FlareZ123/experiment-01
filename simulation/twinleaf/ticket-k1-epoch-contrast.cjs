'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {fixture}=require('./redeemable-ticket-paper-regression.cjs');
const {installRedeemableTicketPaperOrderHook}=
  require('./redeemable-ticket-paper-hook.cjs');
const {initializeCards}=require('./headless.cjs');
const {hasBenchEvolutionTarget,hasK0PossibleBenchEvolutionTarget}=
  require('./bunnelby-evolution-policy.cjs');

const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine=name=>require(path.join(root,name));

/**
 * Physically different unknown-order decks, with identical cards and public
 * contents. A hypothetical earlier genuine owner-deck search established the
 * complete old Prize composition, though it does not reveal the shuffled
 * order of the remaining deck. The prepared Store begins after that search.
 *
 * @param {number} insertion 0 is among next six new Prizes; 6 remains in deck.
 */
function build(insertion){
  const game=fixture(16);
  const manager=initializeCards();
  const target=manager.getCardByName('Gloom UNB');
  const oddish=manager.getCardByName('Oddish UNB');
  assert.ok(target&&oddish);
  target.id=666;
  oddish.id=667;
  // Replace the same physically indexed Psychic card in both States.
  const removed=game.a.deck.cards.pop();
  assert.equal(removed.id,115);
  game.a.deck.cards.splice(insertion,0,target);
  const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
  const bench=new PokemonCardList();
  bench.cards.push(oddish);
  game.a.bench.push(bench);
  const fullNames=cards=>cards.map(c=>c.fullName);
  return {
    ...game,target,oddish,
    originalDeckNames:fullNames(game.a.deck.cards),
    sourcePrints:[
      ...game.a.deck.cards,...game.a.prizes.flatMap(slot=>slot.cards),
      ...game.a.hand.cards,...game.a.active.cards,...game.a.bench.flatMap(s=>s.cards)
    ],
    previousPrizeNames:fullNames(game.a.prizes.flatMap(slot=>slot.cards))
  };
}

/** @param {object} stage */
function publicView(stage){
  const p=stage.a;
  return {
    turn:stage.state.turn,
    hand:p.hand.cards.map(c=>c.fullName).sort(),
    active:p.active.getPokemonCard()?.fullName,
    bench:p.bench.map(slot=>slot.getPokemonCard()?.fullName).sort(),
    deckCount:p.deck.cards.length,
    prizeCount:p.prizes.reduce((n,slot)=>n+slot.cards.length,0),
    discarded:p.discard.cards.map(c=>c.fullName).sort()
  };
}

/**
 * Genuine corrected Ticket Store reducer demonstrates why knowing original
 * Prizes and deck membership does not imply knowing new Prize membership.
 * This remains a synthetic Store contrast without a recorded search action.
 */
function auditTicketK1EpochContrast(){
  const intoPrizes=build(0);
  const remainsInDeck=build(6);
  assert.deepEqual(publicView(intoPrizes),publicView(remainsInDeck));
  assert.deepEqual(intoPrizes.previousPrizeNames,
    remainsInDeck.previousPrizeNames);
  assert.deepEqual(intoPrizes.originalDeckNames.slice().sort(),
    remainsInDeck.originalDeckNames.slice().sort());
  assert.equal(hasBenchEvolutionTarget(intoPrizes.a),true);
  assert.equal(hasBenchEvolutionTarget(remainsInDeck.a),true);
  const priorDeckSize=intoPrizes.a.deck.cards.length;
  const restore=installRedeemableTicketPaperOrderHook();
  try{
    for(const stage of [intoPrizes,remainsInDeck]){
      stage.store.reduceEffect(stage.state,
        new stage.TrainerEffect(stage.a,stage.ticket));
    }
  }finally{restore();}
  assert.deepEqual(publicView(intoPrizes),publicView(remainsInDeck));
  const a=intoPrizes.a,b=remainsInDeck.a;
  const inPrizes=player=>player.prizes.some(slot=>slot.cards.includes(
    player===a?intoPrizes.target:remainsInDeck.target));
  assert.equal(inPrizes(a),true);
  assert.equal(inPrizes(b),false);
  assert.equal(hasBenchEvolutionTarget(a),false);
  assert.equal(hasBenchEvolutionTarget(b),true);
  assert.equal(hasK0PossibleBenchEvolutionTarget(a,intoPrizes.sourcePrints),true);
  assert.equal(hasK0PossibleBenchEvolutionTarget(b,remainsInDeck.sourcePrints),true);
  assert.ok(a.prizes.every(slot=>slot.isSecret));
  assert.ok(b.prizes.every(slot=>slot.isSecret));
  assert.equal(priorDeckSize,16);
  return {
    priorDeckSize,oldPrizeCount:6,
    postRedealPublicViewsMatch:true,
    physicallyPrizedTarget:[true,false],
    literalDeckPresence:[false,true],
    sourcePossibilityAfterRedeal:[true,true],
    targetNewPrizeProbabilityUnderUniformOrder:6/priorDeckSize,
    nature:'Actual paper-corrected Store Ticket reducer on constructed states',
    qualifiedForCompetitiveInference:false
  };
}

if(require.main===module)console.log(JSON.stringify(
  auditTicketK1EpochContrast(),null,2));
module.exports={build,auditTicketK1EpochContrast};
