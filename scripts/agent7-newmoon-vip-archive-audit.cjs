'use strict';

const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {deriveSlotSeeds} = require('./aichi-decorrelated-seeds.cjs');

const EXPECTED_ENGINE = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/**
 * Independently audit a registered 16-deal native opening-policy archive.
 * @param {object} report Parsed newmoon-first-own-vip-prospective.json
 * @returns {object} Denominator-preserving mechanical census
 */
function auditVipArchive(report) {
  assert.equal(report.schema, 'newmoon-first-own-vip-prospective-mechanical-exposure-v1');
  const registration = report.registration;
  assert.equal(registration.enginePin, EXPECTED_ENGINE);
  assert.equal(report.sourceEngineRevision, EXPECTED_ENGINE);
  assert.equal(registration.seedBase, 20261019);
  assert.equal(registration.maxActions, 90);
  assert.equal(registration.repeatsPerRankAndSeat, 4);
  assert.deepEqual(registration.ranks, [6, 11]);
  assert.deepEqual(registration.seats, ['A', 'B']);
  assert.deepEqual(registration.pairedPolicies, ['unchanged-weak-profile', 'newmoon-first-own-vip-v1']);
  assert.equal(report.registeredSourceDeals, 16);
  assert.equal(report.observedAttempts, 16);
  assert.equal(report.competitivelyQualifiedGames, 0);
  assert.equal(report.observations.length, 16);
  const expected = new Map();
  for (const rank of [6, 11]) {
    for (let repeat = 0; repeat < 4; repeat++) {
      const seeds = deriveSlotSeeds(20261019, 'pilot', rank, repeat);
      for (const candidateSeat of ['A', 'B']) {
        const trialId = 'newmoon-vip-v1:rank'+rank+':repeat'+repeat+':seat'+candidateSeat;
        expected.set(trialId, {rank,repeat,candidateSeat,
          candidateEngineSeat:candidateSeat === 'A' ? 0 : 1,seed:seeds[candidateSeat]});
      }
    }
  }
  assert.deepEqual(report.plannedIds, [...expected.keys()]);
  const seen = new Set();
  const cells = new Map();
  const rows = [];
  let nativeOffers = 0, ownerSelections = 0, postDispatchBench = 0;
  let failed = 0, sourceFirst = 0;
  for (const row of report.observations) {
    assert.ok(expected.has(row.trialId),'Unregistered trial '+row.trialId);
    assert.ok(!seen.has(row.trialId),'Repeated trial '+row.trialId);
    seen.add(row.trialId);
    for (const [key,value] of Object.entries(expected.get(row.trialId))) {
      assert.equal(row[key],value,row.trialId+': '+key);
    }
    assert.equal(row.sourceDigest,report.opponentPrinted60Digests[row.rank]);
    assert.equal(row.candidateDigest,report.candidatePrinted60Digest);
    assert.equal(row.engineRevision,EXPECTED_ENGINE);
    assert.equal(row.competitiveQualification,false);
    if (row.status === 'engine-or-provenance-exception') {
      failed++;
      rows.push({trialId:row.trialId,status:row.status,error:row.error});
      continue;
    }
    assert.equal(row.status,'original-and-candidate-policy-bounded');
    assert.equal(row.verifiedByDrawLog,true);
    assert.ok(row.firstTurnSlot === 0 || row.firstTurnSlot === 1);
    assert.equal(row.candidateActuallyFirst,row.firstTurnSlot === row.candidateEngineSeat);
    assert.equal(row.cardConservationVerified,true);
    assert.ok(Array.isArray(row.baseline.firstOwnTurnActions));
    assert.ok(Array.isArray(row.alternative.firstOwnTurnActions));
    assert.equal(row.policyAudit.version,'newmoon-first-own-vip-v1');
    assert.equal(row.policyAudit.candidateSeat,row.candidateEngineSeat);
    const events = row.policyAudit.events;
    assert.ok(Array.isArray(events));
    const offers=events.filter(e=>e.kind==='real-hand-first-own-VIP-offer'&&e.legal);
    const choices=events.filter(e=>e.kind==='validated-owner-deck-targets');
    const benches=events.filter(e=>e.kind==='post-dispatch-public-bench');
    assert.equal(row.policyAudit.selectedLegalVip,offers.length>0);
    assert.equal(row.policyAudit.validatedSearchSelection,choices.length>0);
    assert.ok(offers.length<=1&&choices.length<=1&&benches.length<=1);
    assert.ok(choices.length<=offers.length,'Own-deck choice without a legal VIP offer');
    assert.ok(benches.length<=choices.length,'Bench event without selected targets');
    if(benches.length){
      assert.ok(choices[0].names.every(name=>benches[0].names.includes(name)),
        'Public Bench missing selected Basic name');
      assert.ok(events.indexOf(benches[0])>events.indexOf(choices[0]));
    }
    nativeOffers+=offers.length;
    ownerSelections+=choices.length;
    postDispatchBench+=benches.length;
    if(row.firstTurnSlot!==row.candidateEngineSeat)sourceFirst++;
    const cell='rank'+row.rank+'-seat'+row.candidateSeat+'-'+
      (row.candidateActuallyFirst?'candidate-first':'source-first');
    const item=cells.get(cell)||{cell,attempts:0,nativeOffers:0,
      ownerSelections:0,postDispatchBench:0};
    item.attempts++;
    item.nativeOffers+=offers.length;
    item.ownerSelections+=choices.length;
    item.postDispatchBench+=benches.length;
    cells.set(cell,item);
    rows.push({trialId:row.trialId,rank:row.rank,seat:row.candidateSeat,
      seed:row.seed,candidateActuallyFirst:row.candidateActuallyFirst,
      baselineActions:row.baseline.actions,alternativeActions:row.alternative.actions,
      nativeOffer:offers.length===1,ownerSelection:choices.length===1,
      selectedNames:choices[0]?.names??[],
      postDispatchBench:benches.length===1,status:row.status,
      postVipBenchNames:benches[0]?.names??null,
      freeBenchImmediatelyAfterVip:benches.length?
        benches[0].names.filter(name=>name===null).length:null,
      firstOwnTurnActionsEqual:JSON.stringify(row.baseline.firstOwnTurnActions)===
        JSON.stringify(row.alternative.firstOwnTurnActions),
      ...(offers.length?{
        baselineFirstOwnTurnActions:row.baseline.firstOwnTurnActions,
        alternativeFirstOwnTurnActions:row.alternative.firstOwnTurnActions
      }:{})});
  }
  assert.equal(seen.size,16);
  assert.equal(failed,report.falseOrFailedAttempts);
  assert.equal(report.verifiedActualStartingOrders,16-failed);
  assert.equal(nativeOffers,report.legalVIPDispatches);
  assert.equal(ownerSelections,report.ownerPromptValidSelections);
  assert.equal(nativeOffers,4,'Headline native-offer count changed');
  assert.equal(ownerSelections,4,'Headline prompt count changed');
  assert.equal(failed,0);
  return {schema:'newmoon-vip-16-immutable-archive-independent-census-v1',
    attempts:seen.size,sourceFirst,candidateFirst:16-sourceFirst,
    nativeOffers,ownerSelections,postDispatchBench,
    postDispatchUnverified:ownerSelections-postDispatchBench,
    failureCount:failed,qualifiedGames:0,
    noOfferFirstOwnActionDivergences:rows.filter(x=>
      x.status==='original-and-candidate-policy-bounded'&&
      !x.nativeOffer&&!x.firstOwnTurnActionsEqual).map(x=>x.trialId),
    cells:[...cells.values()].sort((a,b)=>a.cell.localeCompare(b.cell)),rows};
}
if(require.main===module){
  const file=process.argv[2]||'newmoon-first-own-vip-prospective.json';
  const report=JSON.parse(readFileSync(file,'utf8'));
  process.stdout.write(JSON.stringify(auditVipArchive(report),null,2)+'\n');
}
module.exports={auditVipArchive};
