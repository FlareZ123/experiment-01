'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { winProbabilityLowerBound, buildPlan, resolveDeck, exactPrintingIndex, evaluatePlan } =
  require('../simulation/evaluation/field-benchmark.cjs');

/** @param {number} rank */
function deck(rank) {
  return { rank, player: 'P' + rank, archetype: 'test',
    cards: [{ name: 'Psychic Energy', count: 60,
      printing: { set: 'TEST', number: '001' } }] };
}
const manifest = { source: 'test-only', decks: [deck(1), deck(2)] };
const pool = [{ name: 'Psychic Energy', set: 'TEST', setNumber: '1',
  fullName: 'Psychic Energy TEST 1' }];

test('one-sided exact lower bound and requisite perfect trials', () => {
  assert.equal(winProbabilityLowerBound(0, 30), 0);
  assert.equal(winProbabilityLowerBound(0, 0), null);
  assert.ok(winProbabilityLowerBound(597, 597) < .995);
  assert.ok(winProbabilityLowerBound(598, 598) > .995);
  assert.ok(Math.abs(winProbabilityLowerBound(1, 2) -
    (1 - Math.sqrt(.95))) < 1e-12);
  assert.throws(() => winProbabilityLowerBound(2, 1));
});

test('strict printing resolution and full 60-card input', () => {
  assert.equal(resolveDeck(deck(1), exactPrintingIndex(pool)).cards.length, 60);
  assert.equal(resolveDeck(deck(1), new Map()).unresolved[0].reason,
    'missing-exact-printing');
  assert.equal(resolveDeck(deck(1), exactPrintingIndex([...pool, ...pool]))
    .unresolved[0].reason, 'ambiguous-exact-printing');
  assert.throws(() => resolveDeck({rank: 1,
    cards: [{...deck(1).cards[0],count: 59}]},exactPrintingIndex(pool)));
});

test('32 ranks and missing cards are never dropped', () => {
  const plan = buildPlan(manifest,pool,1);
  assert.equal(plan.opponents.length,32);
  assert.equal(plan.opponents[2].status,'missing-published-list');
  const blocked = evaluatePlan(buildPlan(manifest,[],1),{
    gamesPerSeat:1,runMatch:()=>{throw new Error('must not run');}
  });
  assert.ok(blocked.opponents.every(r=>r.attempted===0));
  assert.equal(blocked.opponents[0].status,'candidate-unresolved');
});

test('balanced engine slots do not certify first/second turn; reproducible trials', () => {
  const plan=buildPlan(manifest,pool,1);
  const run=()=>evaluatePlan(plan,{gamesPerSeat:2,seedBase:43,
    runMatch:()=>({finished:true,winner:0})});
  const first=run();
  assert.deepEqual(first,run());
  assert.equal(first.opponents[0].wins,2);
  assert.equal(first.opponents[0].losses,2);
  assert.equal(first.opponents[0].attempted,4);
  assert.equal(first.opponents[0].status,'simulated');
  assert.equal(first.startingTurnBalanceVerified, false);
  assert.equal(first.simultaneousFieldConfidenceCertified, false);
  assert.match(first.engineSlotProtocol, /true first-turn attributed only when engine turn and draw-log agree/);
  assert.match(first.confidenceLimitations, /simultaneous field adjustment/);
});

test('draw, incomplete match and exception are accounted',()=>{
  const plan=buildPlan(manifest,pool,1);
  let n=0;
  const result=evaluatePlan(plan,{gamesPerSeat:2,runMatch:()=>{
    n+=1;
    if(n===1)return {finished:true,winner:3};
    if(n===2)return {finished:false,winner:-1};
    if(n===3)throw new Error('test failure');
    return {finished:true,winner:1};
  }});
  const row=result.opponents[0];
  assert.equal(row.draws,1);
  assert.equal(row.unfinished,1);
  assert.equal(row.errors.length,1);
  assert.equal(row.completed,2);
  assert.equal(row.status,'incomplete');
  assert.equal(row.lower95,null);
});

test('Prism Star source glyph resolves only for correctly tagged printing', () => {
  const printing = {
    name: 'Thunder Mountain Prism Star', set: 'LOT', setNumber: '191',
    fullName: 'Thunder Mountain Prism Star LOT 191', tags: ['Prism Star']
  };
  const entry = { rank: 99, cards: [{ name: 'Thunder Mountain ♢', count: 60,
    printing: { set: 'LOT', number: '191' } }] };
  assert.equal(resolveDeck(entry, exactPrintingIndex([printing])).cards.length, 60);
  assert.equal(resolveDeck(entry, exactPrintingIndex([
    { ...printing, tags: [] }
  ])).unresolved[0].reason, 'missing-exact-printing');
});

test('arbitrary new fixed 60-card candidate has provenance fingerprint', () => {
  const custom = { label: 'Novel candidate test', cards: deck(1).cards };
  const plan = buildPlan(manifest, pool, custom);
  assert.equal(plan.candidateRank, null);
  assert.equal(plan.candidateLabel, 'Novel candidate test');
  assert.match(plan.candidateDigest, /^[0-9a-f]{64}$/);
  assert.match(plan.manifestDigest, /^[0-9a-f]{64}$/);
  assert.equal(plan.candidate.cards.length, 60);
  const report = evaluatePlan(plan, { gamesPerSeat: 1,
    runMatch: () => ({ finished: true, winner: 0 }) });
  assert.equal(report.candidateDigest, plan.candidateDigest);
  assert.equal(report.manifestDigest, plan.manifestDigest);
});

test('Basic Energy fallback requires exact type, unmodified text and explicit opt-in', () => {
  const { basicEnergyEquivalents } = require('../simulation/evaluation/basic-energy-equivalents.cjs');
  const basic = { name: 'Psychic Energy', set: 'BLW', setNumber: '109',
    fullName: 'Psychic Energy BLW', superType: 3, energyType: 0,
    provides: [5], text: '' };
  const source = { rank: 99, cards: [{name: 'Psychic Energy', count:60,
    printing: { set:'MEE', number:'13' }}] };
  const strict = resolveDeck(source, exactPrintingIndex([basic]));
  assert.equal(strict.cards, null);
  const equivalence = basicEnergyEquivalents([basic]);
  const allowed = resolveDeck(source, exactPrintingIndex([basic]), equivalence);
  assert.equal(allowed.cards.length, 60);
  assert.equal(allowed.substitutions.length, 1);
  assert.equal(allowed.substitutions[0].count, 60);
  assert.equal(allowed.substitutions[0].enginePrinting, basic.fullName);
  assert.equal(basicEnergyEquivalents([{...basic,energyType:1}]).size, 0);
  assert.equal(basicEnergyEquivalents([{...basic,provides:[3]}]).size, 0);
  assert.equal(basicEnergyEquivalents([{...basic,text:'Draw cards'}]).size, 0);
  assert.equal(basicEnergyEquivalents([{...basic,energyEffect:()=>{}}]).size, 0);
  assert.equal(basicEnergyEquivalents([{...basic,set:'BASE'}]).size, 0);
});

test('source printing substitutions appear in the evaluation provenance', () => {
  const original = { name:'Psychic Energy',set:'BLW',setNumber:'109',
    fullName:'Psychic Energy BLW',superType:3,energyType:0,provides:[5],text:'' };
  const deckWithUnavailableArt = {
    rank: 1, player:'Aichi winner', archetype:'Synthetic',
    cards:[{name:'Psychic Energy',count:60,printing:{set:'MEE',number:'13'}}]
  };
  const plan = buildPlan({source:'test',decks:[deckWithUnavailableArt]},
    [original], 1, {allowBasicEnergyEquivalent:true});
  assert.equal(plan.candidate.cards.length,60);
  assert.equal(plan.opponents[0].status,'ready');
  assert.equal(plan.candidate.substitutions[0].originalPrinting.set,'MEE');
  assert.equal(plan.printEquivalencePolicy,'ordinary-basic-energy-only');
  const record = evaluatePlan(plan,{gamesPerSeat:1,
    runMatch:()=>({finished:true,winner:0})});
  assert.equal(record.candidateSubstitutions.length,1);
  assert.equal(record.opponents[0].opponentSubstitutions.length,1);
  assert.equal(record.opponents[1].status,'missing-published-list');
});

test('strict prompt mode is explicit, forwarded to runner, and preserved in report', () => {
  const plan = buildPlan(manifest, pool, 1);
  const seen = [];
  const runner = request => {
    seen.push(request);
    return { finished: true, winner: 0 };
  };
  const strict = evaluatePlan(plan, {
    gamesPerSeat: 1, selectedRanks: [2],
    strictPromptValidation: true, runMatch: runner
  });
  assert.equal(strict.strictPromptValidation, true);
  assert.equal(seen.length, 2);
  assert.ok(seen.every(request => request.strictPromptValidation === true));
  seen.length = 0;
  const upstream = evaluatePlan(plan, {
    gamesPerSeat: 1, selectedRanks: [2], runMatch: runner
  });
  assert.equal(upstream.strictPromptValidation, false);
  assert.equal(seen.length, 2);
  assert.ok(seen.every(request => !Object.hasOwn(request, 'strictPromptValidation')));
});

test('Forest Seal Stone correction is passed only when explicitly selected', () => {
  const plan = buildPlan(manifest, pool, 1);
  const requests = [];
  const runMatch = request => {
    requests.push(request);
    return { finished: true, winner: 0 };
  };
  const corrected = evaluatePlan(plan, {
    gamesPerSeat: 1, selectedRanks: [1],
    forestSealSearchCorrection: true, runMatch
  });
  assert.equal(corrected.forestSealSearchCorrection, true);
  assert.equal(requests.length, 2);
  assert.ok(requests.every(request => request.forestSealSearchCorrection === true));
  requests.length = 0;
  const baseline = evaluatePlan(plan, {
    gamesPerSeat: 1, selectedRanks: [1], runMatch
  });
  assert.equal(baseline.forestSealSearchCorrection, false);
  assert.ok(requests.every(request => !Object.hasOwn(request, 'forestSealSearchCorrection')));
});

test('opt-in Double Dragon policy is forwarded and identified without contaminating baseline', () => {
  const plan = buildPlan(manifest, pool, 1);
  const requests = [];
  const runMatch = request => {
    requests.push(request);
    return { finished: true, winner: 0 };
  };
  const experimental = evaluatePlan(plan, {
    gamesPerSeat: 1, selectedRanks: [1], doubleDragonRecovery: true, runMatch
  });
  assert.equal(experimental.doubleDragonRecovery, true);
  assert.match(experimental.policy, /DoubleDragonAttachTactic-v4/);
  assert.equal(requests.length, 2);
  assert.ok(requests.every(request => request.doubleDragonRecovery === true));

  requests.length = 0;
  const control = evaluatePlan(plan, {
    gamesPerSeat: 1, selectedRanks: [1], runMatch
  });
  assert.equal(control.doubleDragonRecovery, false);
  assert.doesNotMatch(control.policy, /DoubleDragonAttachTactic/);
  assert.equal(requests.length, 2);
  assert.ok(requests.every(request => !Object.hasOwn(request, 'doubleDragonRecovery')));
});


test('Supporter decision hook is explicit, forwarded and labelled separately', () => {
  const plan = buildPlan(manifest, pool, 1);
  const requests = [];
  const runMatch = request => {
    requests.push(request);
    return { finished: true, winner: 0 };
  };
  const patched = evaluatePlan(plan, {
    gamesPerSeat: 1, selectedRanks: [1],
    supporterDecisionCorrection: true, runMatch
  });
  assert.equal(patched.supporterDecisionCorrection, true);
  assert.match(patched.policy, /SupporterDecisionGuard-v1/);
  assert.equal(requests.length, 2);
  assert.ok(requests.every(request => request.supporterDecisionCorrection === true));

  requests.length = 0;
  const baseline = evaluatePlan(plan, {
    gamesPerSeat: 1, selectedRanks: [1], runMatch
  });
  assert.equal(baseline.supporterDecisionCorrection, false);
  assert.doesNotMatch(baseline.policy, /SupporterDecisionGuard/);
  assert.equal(requests.length, 2);
  assert.ok(requests.every(request => !Object.hasOwn(request, 'supporterDecisionCorrection')));
});

test('isolated policy randomness is opt-in, forwarded, and labelled end to end', () => {
  const plan = buildPlan(manifest, pool, 1);
  const requests = [];
  const runMatch = request => {
    requests.push(request);
    return { finished: true, winner: 0 };
  };
  const isolated = evaluatePlan(plan, {
    gamesPerSeat: 1, selectedRanks: [1],
    isolatePolicyRandomness: true, runMatch
  });
  assert.equal(isolated.isolatePolicyRandomness, true);
  assert.equal(isolated.randomnessProtocol,
    'separate-game-and-per-seat-policy-prng-v1');
  assert.equal(requests.length, 2);
  assert.ok(requests.every(request => request.isolatePolicyRandomness === true));

  requests.length = 0;
  const legacy = evaluatePlan(plan, {
    gamesPerSeat: 1, selectedRanks: [1], runMatch
  });
  assert.equal(legacy.isolatePolicyRandomness, false);
  assert.equal(legacy.randomnessProtocol, 'legacy-shared-prng');
  assert.equal(requests.length, 2);
  assert.ok(requests.every(request =>
    !Object.hasOwn(request, 'isolatePolicyRandomness')));
});

test('Temple-unlock response is only forwarded when explicitly opted in', () => {
  const plan = buildPlan(manifest, pool, 1);
  const requests = [];
  const runMatch = request => {
    requests.push(request);
    return { finished: true, winner: 0 };
  };
  const tuned = evaluatePlan(plan, {
    gamesPerSeat: 1, selectedRanks: [1], templeUnlockRecovery: true, runMatch
  });
  assert.equal(tuned.templeUnlockRecovery, true);
  assert.match(tuned.policy, /TempleUnlockTactic-v1/);
  assert.equal(requests.length, 2);
  assert.ok(requests.every(request => request.templeUnlockRecovery === true));
  requests.length = 0;
  const unmodified = evaluatePlan(plan, {
    gamesPerSeat: 1, selectedRanks: [1], runMatch
  });
  assert.equal(unmodified.templeUnlockRecovery, false);
  assert.doesNotMatch(unmodified.policy, /TempleUnlockTactic/);
  assert.equal(requests.length, 2);
  assert.ok(requests.every(request => !Object.hasOwn(request, 'templeUnlockRecovery')));
});
