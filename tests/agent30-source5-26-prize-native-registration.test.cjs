'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {deriveSlotSeeds}=require('../scripts/aichi-decorrelated-seeds.cjs');

const root=path.resolve(__dirname,'..');
const registration=require('../results/aichi-2026/registrations/agent30-public-prize-source5-26-native-v1-20261103.json');
const roster=require('../results/aichi-2026/full-decklists.json');
const sources=require('../results/aichi-2026/original-printed60-admission-v1.json');

/** @param {object} row */
function originalPrinted60Hash(row){
  const normalized=row.cards.map(card=>[
    card.category,card.name,card.count,card.printing.set,
    String(card.printing.number),card.printing.language
  ]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
  return createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
}

test('precommit both original 60s plus immutable 12 native arms and all four physical deals',()=>{
  assert.equal(registration.schema,'agent30-public-prize-original5-26-registered-native-v1');
  assert.deepEqual(registration.sourceRanks,[5,26]);
  assert.equal(registration.enginePin,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.deepEqual(registration.repeats,[0,1]);
  assert.deepEqual(registration.source5PhysicalSeats,[0,1]);
  assert.equal(registration.seedBase,20261130);
  assert.equal(registration.maxActionsPerNativeAttempt,90);
  assert.equal(registration.totalPhysicalDealGroups,4);
  assert.equal(registration.totalNativeAttempts,12);
  assert.equal(registration.independentCompetitiveGames,0);
  assert.equal(registration.gameplayAndPaperQualified,false);
  assert.equal(registration.armsPerCohort.length,3);
  assert.deepEqual(roster.missing_full_lists.map(x=>x.rank).sort((a,b)=>a-b),[23,25,28]);
  for(const rank of registration.sourceRanks){
    const deck=roster.decks.find(d=>d.rank===rank);
    assert.ok(deck);
    assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60);
    const official=sources.rows.find(r=>r.rank===rank);
    assert.ok(official);
    assert.equal(official.printed60Sha256,
      registration.originalPrinted60Sha256ByRank[String(rank)]);
    assert.equal(originalPrinted60Hash(deck),official.printed60Sha256);
  }
  const [five,twentySix]=registration.sourceRanks.map(r=>roster.decks.find(d=>d.rank===r));
  const copies=(deck,name)=>deck.cards.filter(c=>c.name===name)
    .reduce((n,c)=>n+c.count,0);
  assert.equal(copies(five,'Special Red Card'),2);
  assert.equal(copies(five,'Counter Catcher'),0);
  assert.equal(copies(twentySix,'Special Red Card'),1);
  assert.equal(copies(twentySix,'Counter Catcher'),1);
});

test('all pre-registered seeds are distinct across same-rank repeat/physical-slot cohorts',()=>{
  const keys=new Set();
  const seeds=new Set();
  for(const repeat of registration.repeats){
    const physical=deriveSlotSeeds(registration.seedBase,
      registration.phase,registration.rankSeedKey,repeat);
    for(const [seat,slot] of registration.source5PhysicalSeats.entries()){
      const label=[repeat,seat,slot].join(':');
      assert.ok(!keys.has(label));
      keys.add(label);
      assert.ok(Number.isSafeInteger(physical[slot]));
      assert.ok(!seeds.has(physical[slot]),
        'Registered native physical seed cannot be reused across cohorts');
      seeds.add(physical[slot]);
    }
  }
  assert.equal(seeds.size,4);
});

test('registration and runner syntax pinned to one source pairing',()=>{
  const source=fs.readFileSync(path.join(root,
    'simulation/twinleaf/agent30-source5-26-public-prize-native-aba.cjs'),'utf8');
  assert.match(source,/sourceOriginalRanks:\[5,26\]/);
  assert.match(source,/source5PhysicalSeats|physicalSlots:\['A','B'\]/);
  assert.match(source,/ownerTrainerPublicPrizeScreen:true/);
  assert.match(source,/maxActions:MAX_ACTIONS/);
  assert.match(source,/totalNativeAttempts:rows\.length\*3/);
  assert.match(source,/sameDealAndActionsAcrossABA/);
  assert.match(source,/registeredCohortsPreserved/);
});
