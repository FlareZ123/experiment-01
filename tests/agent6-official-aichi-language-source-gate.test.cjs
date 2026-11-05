'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const {
  EVENT,gitBlobSha1,sourcePrinted60Sha256,attestOfficialAichiLanguage,
  attestRepositoryOfficialAichiLanguage
}=require('../simulation/evaluation/agent6-official-aichi-language-source-gate.cjs');

test('complete 29-original source admission SHA aligns with official only-Japanese rule',()=>{
  const result=attestRepositoryOfficialAichiLanguage();
  const originalSource=fs.readFileSync(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'));
  assert.equal(gitBlobSha1(originalSource),
    'ae773f6201d7aa69d31914dbfee66f3fba692200');
  assert.notEqual(gitBlobSha1(Buffer.concat([originalSource,Buffer.from(' ')])),
    gitBlobSha1(originalSource));
  assert.equal(EVENT.date,'2026-05-10');
  assert.equal(EVENT.requiredPhysicalCardLanguage,'ja');
  assert.equal(EVENT.officialRuleText,'日本語のカードのみ使用可能。');
  assert.equal(result.originalSourceDecks,29);
  assert.deepEqual(result.knownMissingOriginalRanks,[23,25,28]);
  assert.equal(result.originalSourceCardCopies,1740);
  assert.deepEqual(result.sourceDisplayLanguageRows,{en:989});
  assert.deepEqual(result.sourceDisplayLanguageCopies,{en:1740});
  assert.equal(result.ranks.length,29);
  assert.deepEqual(result.ranks.map(r=>r.rank),
    [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,
      21,22,24,26,27,29,30,31,32]);
  assert.equal(result.ranks[0].transcribedPrinted60Sha256,
    '159019c3e714677433e87bbdaf6789922ba33491549864d3a7ab17b4f7db3090');
  assert.ok(result.ranks.every(r=>
    r.sourceDisplayLanguageCopies.en===60&&
    !r.exactActualPhysicalJapanesePrintingsAuthenticated &&
    r.requiredPhysicalCardLanguage==='ja'));
  assert.equal(result.exactActualPhysicalJapanesePrintingsAuthenticated,false);
  assert.equal(result.competitivelyQualifiedGames,0);
});

test('source admission hash follows exact transcribed printing; preserves input',()=>{
  const card={category:'Energy',name:'Psychic Energy',count:60,
    printing:{set:'MEE',number:'13',language:'en'}};
  const manifest={decks:[{rank:1,player:'Synthetic',cards:[card]}],
    missing_full_lists:[{rank:2}]};
  const admission={sourceGitBlobSha:'synthetic',
    rows:[{rank:1,printed60Sha256:sourcePrinted60Sha256([card]),
      physicalCards:60}]};
  const baseline=JSON.stringify({manifest,admission});
  const first=attestOfficialAichiLanguage(manifest,admission);
  assert.equal(JSON.stringify({manifest,admission}),baseline);
  assert.deepEqual(first.sourceDisplayLanguageRows,{en:1});
  assert.deepEqual(first.sourceDisplayLanguageCopies,{en:60});
  assert.deepEqual(first.knownMissingOriginalRanks,[2]);
  assert.equal(first.ranks[0].transcribedPrinted60Sha256,
    admission.rows[0].printed60Sha256);
  const translated={...card,printing:{...card.printing,language:'ja'}};
  manifest.decks[0].cards=[translated];
  assert.throws(()=>attestOfficialAichiLanguage(manifest,admission),
    /transcription SHA mismatch/);
  admission.rows[0].printed60Sha256=sourcePrinted60Sha256([translated]);
  const second=attestOfficialAichiLanguage(manifest,admission);
  assert.deepEqual(second.sourceDisplayLanguageRows,{ja:1});
  assert.equal(second.ranks[0].exactActualPhysicalJapanesePrintingsAuthenticated,
    false,'changing a language token is not proof of historical physical art');
});

test('fails closed for malformed physical totals, admission and conflicting ranks',()=>{
  const card={category:'Energy',name:'Grass Energy',count:60,
    printing:{set:'MEE',number:'9',language:'en'}};
  const manifest={decks:[{rank:7,player:'Synthetic',cards:[card]}],
    missing_full_lists:[]};
  const admission={sourceGitBlobSha:'test',
    rows:[{rank:7,physicalCards:60,
      printed60Sha256:sourcePrinted60Sha256([card])}]};
  assert.throws(()=>attestOfficialAichiLanguage({},admission),
    /Expected published/);
  assert.throws(()=>attestOfficialAichiLanguage(manifest,{rows:[]}),
    /Unadmitted original/);
  manifest.decks[0].cards=[{...card,count:59}];
  assert.throws(()=>attestOfficialAichiLanguage(manifest,admission),
    /physical-card count mismatch/);
  manifest.decks[0].cards=[card];
  manifest.missing_full_lists=[{rank:7}];
  assert.throws(()=>attestOfficialAichiLanguage(manifest,admission),
    /both original and missing/);
  manifest.missing_full_lists=[];
  manifest.decks.push({...manifest.decks[0]});
  assert.throws(()=>attestOfficialAichiLanguage(manifest,admission),
    /Duplicate or invalid source rank/);
});
