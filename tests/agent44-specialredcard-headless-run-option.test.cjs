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
  const deck=upstreamSmokeDeck().map(name=>
    name==='Special Red Card M4' ? "Boss's Orders MEG" : name);
  assert.equal(deck.length,60);
  assert.equal(deck.includes('Special Red Card M4'),false);
  assert.equal(deck.filter(name=>name==="Boss's Orders MEG").length,4,
    'Synthetic no-M4 control remains within Expanded four-name deck limit');
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
  assert.equal(oldFlag,undefined,'Legacy result schema must remain unchanged');
  assert.equal(oldProtocol,undefined,'Legacy result has no M4 paper flag');
  assert.equal(enabled,true);
  assert.equal(protocol,
    'exact-M4-opponent-hand-fisher-yates-real-store-physical-prng-v1');
  assert.deepEqual(newGame,oldGame,
    'Opt-in Store hook must not alter any unrelated card or RNG sequence');

  // The independent owner-root public-paper preselection is opt-in too.
  // When no M4 is physically present, neither AI choice nor physical RNG
  // can be affected; only the explicit versioned metadata may differ.
  const preselected=runMatch({...request,specialRedCardPaperPreselection:true});
  const {specialRedCardPaperPreselection:selectionEnabled,
    specialRedCardPaperPreselectionVersion:selectionProtocol,
    specialRedCardPaperPreselectionAudits:selectionAudit,
    ...preselectedGame}=preselected;
  assert.equal(selectionEnabled,true);
  assert.equal(selectionProtocol,'agent44-m4-owner-root-preselection-v1');
  assert.deepEqual(selectionAudit,[],
    'No M4 printing can yield a paper preselection certificate');
  assert.deepEqual(preselectedGame,baseline,
    'Default-off owner-root screen must not mutate unrelated match traces');
  assert.equal(baseline.specialRedCardPaperPreselection,undefined);
  assert.ok(baseline.actions>0);
  console.log('AGENT44_M4_HEADLESS_NO_CARD_BILATERAL',
    JSON.stringify({seed:request.seed,actions:baseline.actions,
      baselineOutcome:baseline.outcome,
      optInMode:protocol,unchanged:true,
      stagedOnly:true,competitivelyQualifiedGames:0}));
});

test('M4 speculative clone shuffle requires isolated policy RNG and is inert without M4',()=>{
  const deck=upstreamSmokeDeck().map(name=>
    name==='Special Red Card M4' ? "Boss's Orders MEG" : name);
  const request={deckA:deck,deckB:deck,seed:20310318,maxActions:100,
    label:'Agent44 M4 speculative clone shuffle absent-card control'};
  assert.throws(()=>runMatch({...request,
    specialRedCardPaperSpeculativeShuffle:true}),
  /M4 speculative shuffle requires paper preselection, physical Store correction, isolated policy RNG, and per-seat physical shuffle RNG/);
  assert.throws(()=>runMatch({...request,
    specialRedCardPaperPreselection:true,
    specialRedCardPaperCorrection:true,
    isolatePolicyRandomness:true,
    specialRedCardPaperSpeculativeShuffle:true}),
  /M4 speculative shuffle requires paper preselection, physical Store correction, isolated policy RNG, and per-seat physical shuffle RNG/);

  const base=runMatch({...request,isolatePolicyRandomness:true,
    isolatePhysicalShuffleRandomnessAfterSetup:true,
    specialRedCardPaperPreselection:true,
    specialRedCardPaperCorrection:true});
  const withSpec=runMatch({...request,isolatePolicyRandomness:true,
    isolatePhysicalShuffleRandomnessAfterSetup:true,
    specialRedCardPaperPreselection:true,
    specialRedCardPaperCorrection:true,
    specialRedCardPaperSpeculativeShuffle:true});
  const {specialRedCardPaperPreselectionVersion:baseVersion,
    ...baseGame}=base;
  const {specialRedCardPaperPreselectionVersion:specVersion,
    specialRedCardPaperSpeculativeShuffle:specEnabled,
    specialRedCardPaperSpeculativeShuffleProtocol:specProtocol,
    ...specGame}=withSpec;
  assert.equal(baseVersion,'agent44-m4-owner-root-preselection-v1');
  assert.equal(specVersion,
    'agent44-m4-owner-root-preselection-v2-policy-rng-clone-shuffle');
  assert.equal(specEnabled,true);
  assert.equal(specProtocol,
    'exact-M4-opponent-hand-fisher-yates-policy-clone-prng-v1');
  assert.deepEqual(withSpec.specialRedCardPaperPreselectionAudits,[]);
  assert.deepEqual(specGame,baseGame,
    'With no M4 in either deck, the new speculative hook must not change the match trace');
  console.log('AGENT44_M4_SPECULATIVE_NO_CARD_BILATERAL',
    JSON.stringify({seed:request.seed,actions:base.actions,
      noM4Audits:withSpec.specialRedCardPaperPreselectionAudits.length,
      speculativeProtocol:specProtocol,unchanged:true,
      stagedOnly:true,competitivelyQualifiedGames:0}));
});
