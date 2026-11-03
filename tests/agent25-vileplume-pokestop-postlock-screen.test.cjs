'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {printCard} = require('../scripts/agent25-dhelmise-hns-discard-lock.cjs');
const {stadiumThreshold,candidateChannels,sourceLockSources,study} =
  require('../scripts/agent25-vileplume-pokestop-postlock-screen.cjs');

/** Exhaustive donor-position subset control independent of hypergeometric kernel. */
function brute({liveDeck,eligibleDonors,uses,threshold=4}) {
  const sampled = new Set();
  for (let turn=0;turn<uses;turn++) {
    for(let j=1;j<=3;j++) sampled.add(turn*4+j);
  }
  let good=0,worlds=0;
  function chooseCards(start,indices) {
    if(indices.length===eligibleDonors) {
      worlds++;
      if(indices.filter(i=>sampled.has(i)).length>=threshold) good++;
      return;
    }
    for(let i=start;i<=liveDeck-(eligibleDonors-indices.length);i++)
      chooseCards(i+1,[...indices,i]);
  }
  chooseCards(0,[]);
  return good/worlds;
}

test('source ranks are authenticated Vileplume co-inclusion opportunities only',()=>{
  assert.deepEqual(sourceLockSources(),[
    {rank:2,archetype:'Vileplume Control',itemLockVileplumeCopies:2,
      activeSupporterLockStoutlandCopies:1,
      basicAbilityLockSilentLabCopies:0,printedPresenceOnly:true},
    {rank:15,archetype:'Lopunny Vileplume',itemLockVileplumeCopies:2,
      activeSupporterLockStoutlandCopies:0,
      basicAbilityLockSilentLabCopies:1,printedPresenceOnly:true}
  ]);
});

test('published English texts establish Item lock, Supporter lock and Stadium replacement',()=>{
  const vile=printCard('xy7-3');
  const stout=printCard('bw7-122');
  const lab=printCard('xy5-140');
  const pokestop=printCard('pgo-68');
  assert.match(vile.abilities[0].text,/can't play any Item cards/);
  assert.match(stout.abilities[0].text,/can't play any Supporter cards/);
  assert.match(lab.rules.join(' '),/Basic Pokémon.*no Abilities/);
  assert.match(lab.rules.join(' '),/Discard this card if another Stadium card comes into play/);
  assert.match(pokestop.rules.join(' '),/discard 3 cards from the top/);
  assert.ok(lab.subtypes.includes('Stadium'));
  assert.ok(pokestop.subtypes.includes('Stadium'));
});

test('all 12 direct discard Item outlets in v2 are locked by Vileplume',()=>{
  const channels=candidateChannels();
  assert.deepEqual(channels.itemDonorOutlets.map(c=>[c.id,c.count]),
    [['xy4-92',4],['sv8-164',1],['sm6-113',4],['swsh1-179',3]]);
  assert.equal(channels.itemOutletCopies,12);
  assert.equal(channels.stadiumDiscardOutlet.id,'pgo-68');
  assert.equal(channels.stadiumDiscardOutlet.count,1);
  assert.equal(channels.fabaSupporterCopies,1);
  for(const item of channels.itemDonorOutlets){
    const card=printCard(item.id);
    assert.ok(card.subtypes.includes('Item'));
    assert.match(card.rules.join(' '),/iscard/);
  }
});

test('four-donor PokéStop deck-position exact event remains rare after two to four uses',()=>{
  const rows=study().referenceGivenAllEightDonorsInLive47;
  const expected=[0,0.005036706153243382,0.03314932913270202,
    0.10074441062376332];
  for(let i=0;i<4;i++){
    assert.equal(rows[i].uses,i+1);
    assert.ok(Math.abs(rows[i].probability-expected[i])<1e-13);
    assert.equal(rows[i].allEligibleDonorsInitiallyInDeckAssumed,true);
  }
  assert.equal(study().onePokestopPrizedInSixProbability,0.1);
  assert.equal(study().directPokestopInOpeningEightUnconditional,8/60);
  assert.equal(study().competitivelyQualifiedGames,0);
});

test('independent small-deck exhaustive all donor placements',()=>{
  for(const testCase of [
    {liveDeck:12,eligibleDonors:4,uses:2,threshold:4},
    {liveDeck:10,eligibleDonors:5,uses:2,threshold:3},
    {liveDeck:12,eligibleDonors:6,uses:2,threshold:4}
  ]){
    const got=stadiumThreshold(testCase).probability;
    const reference=brute(testCase);
    assert.ok(Math.abs(got-reference)<1e-13,
      JSON.stringify({testCase,got,reference}));
  }
  assert.throws(()=>stadiumThreshold({liveDeck:7,
    eligibleDonors:4,uses:2}),/ordinary draw/);
  assert.throws(()=>stadiumThreshold({liveDeck:47,
    eligibleDonors:48,uses:2}));
});
