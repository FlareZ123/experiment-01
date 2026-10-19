'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {runMatch,upstreamSmokeDeck}=
  require('../simulation/twinleaf/headless.cjs');

test('genuine pinned full-game setup audit is read-only and owner-private',()=>{
  const deck=upstreamSmokeDeck();
  assert.equal(deck.length,60);
  const request={
    deckA:deck,deckB:deck,seed:20261019,
    maxActions:80,isolatePolicyRandomness:true,
    captureDecisionTrace:true
  };
  const control=runMatch(request);
  const audited=runMatch({...request,captureSetupCompensation:true});
  const setup=audited.initialSetupCompensation;
  assert.ok(setup,'First player-turn setup boundary must be reached');
  assert.equal(setup.schema,'real-store-initial-setup-compensation-v1');
  assert.equal(setup.excludesPrivateCardIdentities,true);
  assert.equal(setup.initialSourceDealMatchingRequired,false);
  assert.equal(setup.createsCompetitiveWinRateEvidence,false);
  assert.equal(setup.mulligans.length,2);
  assert.equal(setup.bonusPromptCount.length,2);
  assert.equal(setup.bonusDrawn.length,2);
  assert.deepEqual(setup.bonusOffered,[
    Math.max(0,setup.mulligans[1]-setup.mulligans[0]),
    Math.max(0,setup.mulligans[0]-setup.mulligans[1])
  ]);
  assert.deepEqual(setup.bonusSelected,setup.bonusDrawn);
  assert.ok(!JSON.stringify(setup).includes('Energy'));
  assert.equal(control.initialSetupCompensation,undefined);
  for(const key of [
    'actions','winner','turns','finished','firstTurnSlot','firstDrawLogName',
    'seed','engine','attackDeclarationTrace','rootActionLedger',
    'deckHashes','actionCounts','cardsPlayedBySeat'
  ]) {
    assert.deepEqual(audited[key],control[key],
      'Source play was perturbed by setup telemetry: '+key);
  }
});

test('real source compensation appears in actual Store on an opening with a disparity',()=>{
  const {planAichi}=require('../simulation/evaluation/aichi-pilot.cjs');
  const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
  initializeCards();
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(row=>row.rank===6);
  assert.equal(source?.status,'ready');
  const candidate=plan.candidate.cards;
  // Seed is a previously untested deterministic setup-only probe; it is not
  // registered independent competitive or comparison data.
  const output=runMatch({
    deckA:candidate,deckB:source.cards,seed:20261019,
    maxActions:90,isolatePolicyRandomness:true,
    captureSetupCompensation:true
  });
  const setup=output.initialSetupCompensation;
  assert.ok(setup,'Authentic source-vs-candidate setup was incomplete');
  assert.deepEqual(setup.bonusSelected,setup.bonusDrawn);
  assert.deepEqual(setup.bonusOffered,[
    Math.max(0,setup.mulligans[1]-setup.mulligans[0]),
    Math.max(0,setup.mulligans[0]-setup.mulligans[1])
  ]);
  assert.ok(setup.setupActionsObserved>0);
});
