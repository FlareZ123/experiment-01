'use strict';

const {test} = require('node:test');
const assert = require('node:assert/strict');
const source = require('../results/aichi-2026/full-decklists.json');
const {
  SOURCE_BLOB_SHA,ENERGY_TYPES,compositionDigest,
  loadPinnedSource,auditMay2026SourcePrints,derivePreEventRepresentative
} = require('../simulation/evaluation/agent22-aichi-source-print-crosswalk.cjs');
const {auditPostdatedMEE} =
  require('../simulation/evaluation/agent17-may2026-future-energy-print-audit.cjs');

test('source Git blob remains fixed and independent chronology counts reconcile',()=>{
  assert.equal(SOURCE_BLOB_SHA,
    'ae773f6201d7aa69d31914dbfee66f3fba692200');
  assert.deepEqual(loadPinnedSource(),source);
  const got = auditMay2026SourcePrints(source);
  const prior = auditPostdatedMEE(source);
  assert.equal(got.sourceDeckCount,29);
  assert.equal(got.affectedRanks.length,22);
  assert.equal(got.affectedRows,35);
  assert.equal(got.affectedCopies,120);
  assert.equal(got.affectedRows,prior.rows);
  assert.equal(got.affectedCopies,prior.copies);
  assert.deepEqual(got.affectedRanks.map(x=>x.rank),prior.affectedRanks);
  assert.ok(/^[a-f0-9]{64}$/u.test(got.crosswalkSha256));
  assert.equal(got.historicalPrintMatch,'incomplete');
  assert.equal(got.engineProxyMapStatus,'proposed-not-runtime-verified');
});

test('all eight MEE art families map to earlier matching Basic Energy types',()=>{
  const sourceFixture={
    event:'CL Aichi Open League, 2026-05-10',
    decks:[{
      rank:1,player:'Synthetic',
      cards:[
        ...ENERGY_TYPES.map((type,i)=>({
          category:'Energy',name:type+' Energy',count:1,
          printing:{set:'MEE',number:String(i+9),language:'en'}
        })),
        {category:'Pokémon',name:'Test Basic',count:52,
          printing:{set:'SVI',number:'1',language:'en'}}
      ]
    }]
  };
  const original = structuredClone(sourceFixture);
  const {sourceProvenance,derivedRoster,sourceCompositionMatch} =
    derivePreEventRepresentative(sourceFixture);
  assert.equal(sourceCompositionMatch,true);
  assert.equal(sourceProvenance.affectedRows,8);
  assert.equal(sourceProvenance.affectedCopies,8);
  assert.deepEqual(sourceFixture,original);
  const changed=derivedRoster.decks[0].cards.slice(0,8);
  for (let i=0;i<8;i++) {
    assert.equal(changed[i].name,ENERGY_TYPES[i]+' Energy');
    assert.equal(changed[i].printing.number,String(i+1));
    assert.equal(sourceProvenance.entries[i].historicalPhysicalPrinting,'unknown');
  }
  assert.equal(compositionDigest(sourceFixture),compositionDigest(derivedRoster));
  assert.equal(sourceProvenance.entries[0].engineSupportedEquivalent,'not-tested');
});

test('original roster stays immutable and separate proxy changes only dated art IDs',()=>{
  const original=structuredClone(source);
  const before=compositionDigest(source);
  const result=derivePreEventRepresentative(source);
  assert.deepEqual(source,original);
  assert.equal(result.sourceCompositionMatch,true);
  assert.equal(compositionDigest(result.derivedRoster),before);
  assert.notDeepEqual(result.derivedRoster,source);
  const auditAgain=auditMay2026SourcePrints(result.derivedRoster);
  assert.equal(auditAgain.affectedCopies,0);
  assert.equal(auditAgain.affectedRows,0);
  assert.equal(result.engineAvailabilityCertified,false);
  assert.equal(result.gameplayEquivalenceCertified,false);
  assert.equal(result.historicalPhysicalPrintingCertified,false);
  assert.equal(result.sourceProvenance.entries.filter(x=>
    x.rank===1&&x.name==='Psychic Energy'&&x.count===11).length,1);
  const rank1=result.derivedRoster.decks.find(x=>x.rank===1);
  const psychic=rank1.cards.find(x=>
    x.name==='Psychic Energy'&&x.category==='Energy');
  assert.equal(psychic.printing.set,'MEE');
  assert.equal(psychic.printing.number,'5');
});

test('fail closed on a false energy-type equivalence or incomplete physical 60',()=>{
  const fixture=structuredClone(source);
  const row=fixture.decks[0].cards.find(x=>
    x.printing?.set==='MEE'&&Number(x.printing.number)===13);
  row.name='Darkness Energy';
  assert.throws(()=>auditMay2026SourcePrints(fixture),
    /mismatched energy name/u);
  const short=structuredClone(source);
  short.decks[0].cards[0].count--;
  assert.throws(()=>auditMay2026SourcePrints(short),
    /exactly 60 cards/u);
});

test('crosswalk is deterministic under input row reordering',()=>{
  const shuffled=structuredClone(source);
  for(const deck of shuffled.decks) deck.cards.reverse();
  shuffled.decks.reverse();
  const a=auditMay2026SourcePrints(source);
  const b=auditMay2026SourcePrints(shuffled);
  assert.equal(a.crosswalkSha256,b.crosswalkSha256);
  assert.equal(a.sourceCompositionSha256,b.sourceCompositionSha256);
});


test('committed crosswalk is exactly the independent source-derived 35-row map',()=>{
  const stored=require('../results/aichi-2026/original-source-art-crosswalk-v1.json');
  const expected=auditMay2026SourcePrints(source);
  assert.equal(stored.sourceGitBlobSha,expected.sourceGitBlobSha);
  assert.equal(stored.schema,expected.schema);
  assert.equal(stored.affectedRows,expected.affectedRows);
  assert.equal(stored.affectedCopies,expected.affectedCopies);
  assert.deepEqual(stored.affectedRanks,expected.affectedRanks);
  assert.deepEqual(stored.entries,expected.entries);
  assert.equal(stored.historicalPrintMatch,'incomplete');
  assert.equal(stored.engineProxyMapStatus,'proposed-not-runtime-verified');
});
