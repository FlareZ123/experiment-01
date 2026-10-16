'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stageSourceBunnelbyBoard}=require('./bunnelby-tm-policy-replay.cjs');
const {hasBenchEvolutionTarget}=require('./bunnelby-evolution-policy.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {initializeCards,deckPermutation,seededRandom}=require('./headless.cjs');
const {evaluateDetachedDeckSamples}=require('./detached-deck-sampling.cjs');
const {normalizeDeepClonePrototypes,assertVendorCloneCompatibleSource}=
  require('./normalize-deep-clone.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine=name=>require(path.join(output,name));
const manifest=path.resolve(__dirname,'../../results/aichi-2026/full-decklists.json');

/** @param {object} player */
function zoneNames(player) {
  return {
    active:player.active.cards.map(card=>card.fullName),
    tools:player.active.tools.map(card=>card.fullName),
    bench:player.bench.flatMap(slot=>slot.cards.map(card=>card.fullName)),
    hand:player.hand.cards.map(card=>card.fullName),
    deck:player.deck.cards.map(card=>card.fullName),
    prizes:player.prizes.map(slot=>slot.cards.map(card=>card.fullName)),
    discard:player.discard.cards.map(card=>card.fullName),
    lostzone:player.lostzone.cards.map(card=>card.fullName)
  };
}

/** @param {boolean} bothGloomPrized */
function stageRank2SourceK0(bothGloomPrized) {
  const {fixture:f}=stageSourceBunnelbyBoard();
  const field=resolveManifestFile(manifest,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const rank2=field.decks.find(deck=>deck.rank===2);
  assert.ok(rank2?.playableUnderEngine,'Need source-validated rank-2 printing');
  const manager=initializeCards();
  const cards=rank2.cardIds.map((fullName,index)=>{
    const card=manager.getCardByName(fullName);
    assert.ok(card,'Unresolved rank-2 source printing: '+fullName);
    card.id=10001+index;
    return card;
  });
  assert.equal(cards.length,60);
  const stock=cards.slice();
  /** @param {string} fullName */
  function take(fullName) {
    const index=stock.findIndex(card=>card.fullName===fullName);
    assert.ok(index>=0,'Missing source card: '+fullName);
    return stock.splice(index,1)[0];
  }
  const starting={
    active:take('Bunnelby PRC'),
    bench:take('Oddish UNB'),
    energy:take('Jet Energy PAL'),
    tool:take('Technical Machine: Evolution PAR'),
    hand:[
      take('Guzma & Hala CEC'),take('Tag Call CEC'),
      take('Stealthy Hood UNB'),take('Capture Energy RCL')
    ]
  };
  assert.equal(stock.length,52);
  const gloom=stock.filter(card=>card.fullName==='Gloom UNB');
  assert.equal(gloom.length,2);
  const neutralPrizes=stock.filter(card=>card.fullName!=='Gloom UNB').slice(0,6);
  assert.equal(neutralPrizes.length,6);
  const prized=bothGloomPrized ?
    [...gloom,...neutralPrizes.slice(2)] : neutralPrizes;
  const prizeSet=new Set(prized);
  const remaining=stock.filter(card=>!prizeSet.has(card));
  assert.equal(remaining.length,46);
  const {CardList}=engine('game/store/state/card-list');
  const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
  const player=f.attacker;
  player.active.cards.splice(0,player.active.cards.length,
    starting.active,starting.energy);
  player.active.energies.cards.splice(0,
    player.active.energies.cards.length,starting.energy);
  player.active.tools.splice(0,player.active.tools.length,starting.tool);
  player.bench.length=0;
  const bench=new PokemonCardList();
  bench.cards.push(starting.bench);
  player.bench.push(bench);
  player.hand.cards.splice(0,player.hand.cards.length,...starting.hand);
  player.deck.cards.splice(0,player.deck.cards.length,...remaining);
  player.discard.cards.length=0;
  player.lostzone.cards.length=0;
  player.prizes=prized.map(card=>{
    const slot=new CardList();
    slot.cards.push(card);
    return slot;
  });
  const zones=zoneNames(player);
  const actual=[
    ...zones.active,...zones.tools,...zones.bench,...zones.hand,
    ...zones.deck,...zones.prizes.flat(),...zones.discard,...zones.lostzone
  ].sort();
  assert.deepEqual(actual,rank2.cardIds.slice().sort(),
    'Physical attacker zones must conserve all 60 source-printed cards');
  const observed={
    turn:f.state.turn,active:zones.active.slice(),
    tools:zones.tools.slice(),bench:zones.bench.slice(),
    hand:zones.hand.slice(),deckCount:zones.deck.length,
    prizeCount:zones.prizes.length,sourceRank:2,firstDeckSearch:false
  };
  return {state:f.state,player,observed,zones,rank2,sourceCount:actual.length};
}

/** Test one published 60-card source inventory under paired K0 allocations. */
function auditFullSourceK0() {
  const a=stageRank2SourceK0(false);
  const b=stageRank2SourceK0(true);
  assert.deepEqual(a.observed,b.observed);
  assert.equal(hasBenchEvolutionTarget(a.player),true);
  assert.equal(hasBenchEvolutionTarget(b.player),false);
  const {deepClone}=engine('utils');
  const {Card}=engine('game/store/card/card');
  const opts={samples:16,seed:20261016,permutation:deckPermutation,
    random:seededRandom,isCard:card=>card instanceof Card,
    sampleUnknownPrizes:true,prizesUnobservedVerified:true};
  const score=data=>{
    const before=zoneNames(data.player);
    assertVendorCloneCompatibleSource(data.state);
    const value=evaluateDetachedDeckSamples(data.state,data.player.id,{},0,
      copy=>{
        const player=copy.players.find(side=>side.id===data.player.id);
        return hasBenchEvolutionTarget(player)?1:0;
      },null,current=>normalizeDeepClonePrototypes(current,deepClone(current)),opts);
    assert.deepEqual(zoneNames(data.player),before,
      'Detached K0 scoring moved live source cards or prizes');
    return value;
  };
  const scores=[score(a),score(b)];
  assert.equal(scores[0],scores[1],
    'Same public source-60 K0 state requires the same posterior score');
  return {
    sourceRank:2,sourcePrintCards:60,remainingDeck:46,
    unobservedPrizes:6,eligibleGloomCount:2,
    physicallyPrizedGloom:[0,2],
    pairedPosteriorScores:scores,liveSourceZonesPreserved:true,
    scope:'Constructed source 60 and pinned Store K0 probe; no source-dealt game or win rate'
  };
}
if(require.main===module)console.log(JSON.stringify(auditFullSourceK0(),null,2));
module.exports={stageRank2SourceK0,auditFullSourceK0};
