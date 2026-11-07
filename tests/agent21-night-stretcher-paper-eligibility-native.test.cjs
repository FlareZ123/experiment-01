'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {withPaperNightStretcherEligibility,VERSION}=
  require('../simulation/twinleaf/agent21-night-stretcher-paper-eligibility.cjs');

const ROOT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const native=name=>require(path.join(ROOT,name));

/** @param {string} discardKind */
function fixture(discardKind){
  const {Player}=native('game/store/state/player');
  const manager=initializeCards();
  const owner=new Player();
  owner.id=1234;
  const Night=manager.getCardByName('Night Stretcher SFA');
  assert.ok(Night);
  const printing={
    'special-only':'Double Colorless Energy NXD',
    'basic':'Psychic Energy MEE',
    'pokemon':'Lunatone OBF'
  }[discardKind];
  if(printing)owner.discard.cards.push(manager.getCardByName(printing));
  return {owner,night:Night};
}

const {NightlyStretcher}=native(
  'sets/10-scarlet-and-violet/set-shrouded-fable/nightly-stretcher');
const originalDescriptor=Object.getOwnPropertyDescriptor(
  NightlyStretcher.prototype,'canPlay');

for(const seat of [0,1]){
  test('paper Night Stretcher eligibility vetoes Special-only but preserves Basic and Pokemon, seat '+
    seat,()=>{
    const special=fixture('special-only');
    const basic=fixture('basic');
    const pokemon=fixture('pokemon');
    const empty=fixture('empty');
    assert.equal(special.night.canPlay(null,null,special.owner),true,
      'Original vendor implementation erroneously reports playable');
    const wrapped=withPaperNightStretcherEligibility(()=>{
      assert.equal(special.night.canPlay(null,null,special.owner),false);
      assert.equal(basic.night.canPlay(null,null,basic.owner),true);
      assert.equal(pokemon.night.canPlay(null,null,pokemon.owner),true);
      assert.equal(empty.night.canPlay(null,null,empty.owner),false);
      return 'native-paper-eligibility-scoped';
    });
    assert.equal(wrapped.result,'native-paper-eligibility-scoped');
    assert.equal(wrapped.audit.version,VERSION);
    assert.equal(wrapped.audit.checked,4);
    assert.equal(wrapped.audit.rejectedSpecialOnlyOrEmpty,2);
    assert.equal(wrapped.audit.eligibleBasicOrPokemon,2);
    assert.equal(wrapped.audit.ownerDiscardOnly,true);
    assert.equal(special.owner.discard.cards.length,1);
    assert.equal(wrapped.audit.prospectiveOriginalGamesQualified,0);
    assert.equal(special.night.canPlay(null,null,special.owner),true,
      'Original property must be fully restored');
    const restored=Object.getOwnPropertyDescriptor(
      NightlyStretcher.prototype,'canPlay');
    assert.strictEqual(restored.value,originalDescriptor.value);
    console.log('AGENT21_NIGHT_STRETCHER_SCOPED_NATIVE_FIX',
      JSON.stringify({seat,checked:wrapped.audit.checked,
        specialOnlyRejected:true,basicAllowed:true,pokemonAllowed:true,
        restored:true,competitiveQualifiedGames:0}));
  });
}
test('paper Night Stretcher eligibility descriptor restored even on exception',()=>{
  const special=fixture('special-only');
  assert.throws(()=>withPaperNightStretcherEligibility(()=>{
    assert.equal(special.night.canPlay(null,null,special.owner),false);
    throw Error('deliberate boundary exception');
  }),/deliberate boundary exception/);
  assert.strictEqual(
    Object.getOwnPropertyDescriptor(
      NightlyStretcher.prototype,'canPlay').value,
    originalDescriptor.value
  );
});
