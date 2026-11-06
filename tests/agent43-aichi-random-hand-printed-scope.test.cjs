'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  audit,physicalNumber,randomOpponentHandEffects
}=require('../scripts/agent43-aichi-random-hand-printed-scope.cjs');

test('promo printing number normalization preserves source SMP217',()=>{
  assert.equal(physicalNumber('SM217'),physicalNumber('217'));
  assert.equal(physicalNumber('SWSH001'),physicalNumber('1'));
  assert.equal(physicalNumber('97'),physicalNumber('097'));
});
test('random opponent hand scanner distinguishes private opponent hand from other random targets',()=>{
  assert.equal(randomOpponentHandEffects({
    attacks:[{name:'A',text:'Draw a random card from your own hand.'},
      {name:'B',text:"Choose 2 random cards from your opponent's hand."}]
  }).length,1);
});
test('all 29 original registered source Pokemon printings receive a conservative paper-random inventory census',()=>{
  const census=audit();
  assert.equal(census.registeredOriginalDecks,29);
  assert.ok(census.totalOriginalPokemonLines>=90);
  const hits=census.exactRandomOpponentHandEffects;
  assert.ok(hits.some(x=>x.rank===1&&x.name==='Trevenant & Dusknoir-GX'&&
    x.cardId==='smp-SM217'));
  assert.ok(census.exactEnglishPrintMatches>0);
  assert.equal(census.unresolvedOriginalPokemonLines+
    census.exactEnglishPrintMatches,census.totalOriginalPokemonLines);
  console.log('AGENT43_ORIGINAL_RANDOM_HAND_SCOPE',JSON.stringify({
    originalPokemonLines:census.totalOriginalPokemonLines,
    exactMatches:census.exactEnglishPrintMatches,
    unresolved:census.unresolvedOriginalPokemonLines,
    printedRandomHandHits:hits.map(x=>({
      rank:x.rank,printing:x.cardId,
      effects:x.randomOpponentHandEffects.map(e=>e.name)
    })),
    unknownNamePotentialNames:census.unknownNameFlags
      .filter(x=>x.otherPrintingsKnownWithRandomOpponentHand.length)
      .map(x=>x.name),
    qualifiedGames:0
  }));
});
