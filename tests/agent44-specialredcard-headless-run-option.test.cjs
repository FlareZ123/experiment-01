'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {runMatch,upstreamSmokeDeck}=
  require('../simulation/twinleaf/headless.cjs');

/**
 * The explicit paper-physical M4 mode must be a harmless, recorded no-op
 * when the validated decks contain no matching native printed Item.
 * It does not validate competitive policy or source rank5/26 frequency.
 */
test('physical Store opt-in M4 paper mode leaves unrelated games unchanged',()=>{
  const deck=upstreamSmokeDeck();
  assert.equal(deck.length,60);
  assert.equal(deck.includes('Special Red Card M4'),false);
  const request={deckA:deck,deckB:deck,seed:20310317,maxActions:100,
    label:'Agent44 isolated M4 paper flag absent-card baseline'};
  const baseline=runMatch(request);
  const corrected=runMatch({...request,specialRedCardPaperCorrection:true});
  const {specialRedCardPaperCorrection:oldFlag,
    specialRedCardPaperShuffleProtocol:oldProtocol,
    ...oldGame}=baseline;
  const {specialRedCardPaperCorrection:enabled,
    specialRedCardPaperShuffleProtocol:protocol,
    ...newGame}=corrected;
  assert.equal(oldFlag,false);
  assert.equal(oldProtocol,null);
  assert.equal(enabled,true);
  assert.equal(protocol,
    'exact-M4-opponent-hand-fisher-yates-real-store-physical-prng-v1');
  assert.deepEqual(newGame,oldGame,
    'Opt-in Store hook must not alter any unrelated card or RNG sequence');
  assert.ok(baseline.actions>0);
  console.log('AGENT44_M4_HEADLESS_NO_CARD_BILATERAL',
    JSON.stringify({seed:request.seed,actions:baseline.actions,
      baselineOutcome:baseline.outcome,
      optInMode:protocol,unchanged:true,
      stagedOnly:true,competitivelyQualifiedGames:0}));
});
