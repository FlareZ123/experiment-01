'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');

const root=path.resolve(__dirname,'..');
const load=filename=>JSON.parse(fs.readFileSync(path.join(root,filename),'utf8'));
const registry=load(
  'results/aichi-2026/registrations/agent45-apex-intake-physical-prospective-40-v1.json');
const field=load('results/aichi-2026/full-decklists.json');
const original=load('results/aichi-2026/original-printed60-admission-v1.json');
const apex=load('results/aichi-2026/agent43-apex-alchemy-paper-expanded-v0.json');

/** @param {string} file @returns {string} */
function gitBlob(file){
  const bytes=fs.readFileSync(path.join(root,file));
  return createHash('sha1').update(
    Buffer.concat([Buffer.from('blob '+bytes.length+'\x00'),bytes])
  ).digest('hex');
}

/** @param {object} source @returns {string} */
function originalPrinted60Sha(source){
  const printed=source.cards.map(card=>[
    card.category,card.name,card.count,card.printing.set,
    card.printing.number,card.printing.language
  ]);
  printed.sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b),'en'));
  return createHash('sha256').update(
    JSON.stringify(printed),'utf8').digest('hex');
}

/** @param {object} deck @returns {number} */
function countCards(deck){
  return deck.cards.reduce((total,c)=>total+c.count,0);
}

test('the source, Apex and prospective registration are frozen by Git blob',()=>{
  assert.equal(gitBlob(registry.originalRosterPath),
    registry.originalRosterGitBlob);
  const chosen=registry.candidatePrintedSixties[0];
  assert.equal(chosen.id,'apex-alchemy-v0');
  assert.equal(gitBlob(chosen.path),chosen.gitBlob);
  const apexCanon=apex.cards.map(card=>
    card.cardId+':'+card.count+'\n').sort().join('');
  assert.equal(createHash('sha256').update(apexCanon,'utf8')
    .digest('hex'),chosen.authorCanonicalSha256);
  assert.equal(apex.deck_identity_sha256,chosen.authorCanonicalSha256);
  assert.equal(countCards(apex),60);
  assert.equal(countCards(field.decks.find(deck=>deck.rank===1)),60);
});

test('original Aichi source card/printing signatures are exact and unchanged',()=>{
  assert.deepEqual(registry.sourceRanks,[1,2,6,11,26]);
  assert.equal(original.sourceGitBlobSha,registry.originalRosterGitBlob);
  for(const source of registry.opponentPrintedSixties){
    const d=field.decks.find(deck=>deck.rank===source.rank);
    const certified=original.rows.find(row=>row.rank===source.rank);
    assert.ok(d&&certified,'missing exact original source rank '+source.rank);
    assert.equal(countCards(d),60);
    assert.equal(source.originalPlayer,d.player);
    assert.equal(source.printed60Sha256,certified.printed60Sha256);
    assert.equal(source.printed60Sha256,originalPrinted60Sha(d));
    assert.equal(certified.competitivelyQualified,false);
  }
});

test('preserve actual cryptographic preregistration and both physical source seats',()=>{
  assert.equal(registry.actualNativeAttempts,0);
  assert.equal(registry.numberOfSeedGroups,20);
  assert.equal(registry.numberOfProposedNativeAttempts,40);
  assert.equal(registry.registeredTrialGroups.length,20);
  assert.equal(registry.runMatrix.length,40);
  assert.equal(registry.competitivelyQualifiedGames,0);
  assert.equal(registry.target995PercentProven,false);
  assert.equal(registry.selectedCommonBilateralPolicy,
    'PENDING_NO_SELECTED_COMPETITIVE_POLICY');
  const groups=new Set();
  for(const group of registry.registeredTrialGroups){
    assert.ok(Number.isSafeInteger(group.seed)&&group.seed>=0&&
      group.seed<=0xffffffff);
    assert.ok([0,1].includes(group.repeat));
    assert.ok(['A','B'].includes(group.candidateSlot));
    assert.ok(registry.sourceRanks.includes(group.rank));
    const cell=[group.rank,group.repeat,group.candidateSlot].join(':');
    assert.equal(groups.has(cell),false,'duplicate registered source cell '+cell);
    groups.add(cell);
  }
  for(const rank of registry.sourceRanks)
    for(const repeat of [0,1])
      for(const seat of ['A','B'])
        assert.ok(groups.has([rank,repeat,seat].join(':')));
});

test('each seed group has exactly two identical source-seed, opposite-roster arms',()=>{
  assert.deepEqual(registry.candidatePrintedSixties.map(x=>x.id),
    ['apex-alchemy-v0','champion-rank1-reference']);
  const seen=new Set();
  for(const group of registry.registeredTrialGroups){
    const match=registry.runMatrix.filter(x=>
      x.rank===group.rank&&x.repeat===group.repeat&&
      x.candidateSlot===group.candidateSlot);
    assert.equal(match.length,2);
    assert.deepEqual(match.map(x=>x.candidateId),
      registry.candidatePrintedSixties.map(x=>x.id));
    for(const arm of match){
      assert.equal(arm.seed,group.seed);
      assert.equal(arm.originalSourceSeat,
        group.candidateSlot==='A'?1:0);
      assert.equal(seen.has(arm.id),false);
      seen.add(arm.id);
    }
  }
  assert.equal(seen.size,40);
});

test('a sampled physical source deal is not imputed from a registered seed',()=>{
  assert.match(registry.state,/NO_NATIVE_RUN/);
  assert.match(registry.sourcePhysicalDealPairing,/UNVERIFIED/);
  assert.ok(registry.comparisonDiscipline.includes(
    'Identical PRNG seed does not imply matching source deal'));
  assert.ok(registry.preconditionsBeforeAnyNativeRun.some(x=>
    x.includes('selected single identical two-seat owner-only policy')));
  assert.ok(registry.limitations.some(x=>x.includes('No preselected winner')));
});
