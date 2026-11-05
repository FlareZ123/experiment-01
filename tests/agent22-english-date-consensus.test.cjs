'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {collapseSameDayReleaseAliases,auditDateConsensus} =
  require('../scripts/agent22-english-date-consensus.cjs');
const archive=require('../results/aichi-2026/full-decklists.json');
const sets=require('../resources/sets/en.json');

test('entire original 29 field source obtains reported 1589 English dates',()=>{
  const audit=auditDateConsensus(archive,sets);
  assert.equal(audit.sourceDeckCount,29);
  assert.equal(audit.originalCardCopies,1740);
  assert.equal(audit.datedEnglishCopies,1589);
  assert.equal(audit.englishDisplayPostEventCopies,5);
  assert.equal(audit.englishDisplayPostEventEntries,3);
  assert.equal(audit.unresolvedEnglishCodeCopies,151);
  assert.deepEqual(audit.unresolvedEnglishCodes.map(x=>x.code),
    ['BWP','MEE','SMP','SP','XYP']);
  const aliases=audit.dateOnlySameDaySetAliases
    .filter(x=>x.sourceCopies>0)
    .sort((a,b)=>a.code.localeCompare(b.code));
  assert.deepEqual(aliases.map(x=>[x.code,x.sourceCopies]),[
    ['ASR',53],['BRS',1],['CRZ',1],['LOR',12],['SIT',75]
  ]);
  assert.equal(audit.dateConsensusAliasesSourceCopies,142);
  assert.equal(audit.historicalPhysicalPrintingsCertified,false);
  assert.equal(audit.paperExpandedLegalityCertified,false);
  assert.equal(audit.competitiveGamesQualified,0);
});

test('two sets sharing one code and date yield a date-only proof',()=>{
  const synthetic={decks:[{rank:1,cards:[{
    name:'Synthetic card',count:60,printing:{set:'ZZZ',number:'1'}
  }]}]};
  const metadata=[
    {id:'base',ptcgoCode:'ZZZ',releaseDate:'2020/01/01',name:'Base'},
    {id:'gallery',ptcgoCode:'ZZZ',releaseDate:'2020/01/01',name:'Gallery'}
  ];
  const normalized=collapseSameDayReleaseAliases(metadata);
  assert.equal(normalized.sets.length,1);
  const audit=auditDateConsensus(synthetic,metadata);
  assert.equal(audit.datedEnglishCopies,60);
  assert.equal(audit.unresolvedEnglishCodeCopies,0);
  assert.deepEqual(audit.dateOnlySameDaySetAliases[0].setIds,
    ['base','gallery']);
  assert.equal(audit.historicalPhysicalPrintingsCertified,false);
});

test('identical code with conflicting release dates stays unresolved',()=>{
  const source={decks:[{rank:1,cards:[{
    name:'Synthetic card',count:60,printing:{set:'ZZZ',number:'1'}
  }]}]};
  const metadata=[
    {id:'base',ptcgoCode:'ZZZ',releaseDate:'2020/01/01'},
    {id:'second',ptcgoCode:'ZZZ',releaseDate:'2026/12/01'}
  ];
  const normalized=collapseSameDayReleaseAliases(metadata);
  assert.equal(normalized.sets.length,2);
  assert.equal(normalized.differentDateAliases.length,1);
  const audit=auditDateConsensus(source,metadata);
  assert.equal(audit.datedEnglishCopies,0);
  assert.equal(audit.unresolvedEnglishCodeCopies,60);
  assert.equal(audit.englishDisplayPostEventCopies,0);
});

test('the date consensus helper rejects invalid release-date formatting',()=>{
  assert.throws(()=>collapseSameDayReleaseAliases([
    {id:'synthetic',ptcgoCode:'ZZZ',releaseDate:'next Tuesday'}
  ]),/regular expression/);
});
