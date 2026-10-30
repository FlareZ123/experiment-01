'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {attestField,parseField,printingFingerprint,attestNativePlan}=
  require('../simulation/evaluation/agent13-source-identity-gate.cjs');

const root=path.resolve(__dirname,'..');
const csv=fs.readFileSync(path.join(root,
  'results/aichi-2026/field.csv'),'utf8');
const original=JSON.parse(fs.readFileSync(path.join(root,
  'results/aichi-2026/full-decklists.json'),'utf8'));

/** @returns {object} Detached mutable fixture. */
function fresh(){return structuredClone(original);}

test('canonical 32 rank identities attest all 29 exact original sixties',()=>{
  const receipt=attestField(original,csv);
  assert.equal(receipt.publishedCount,29);
  assert.deepEqual(receipt.missingRanks,[23,25,28]);
  assert.equal(receipt.sources.length,29);
  assert.deepEqual(receipt.sources.map(x=>x.rank),
    [...parseField(csv).values()].filter(x=>x.published).map(x=>x.rank));
  for(const source of receipt.sources){
    assert.match(source.printingSha256,/^[a-f0-9]{64}$/);
    assert.ok(source.cardRows>=1);
  }
});

test('source printing fingerprint is row-order-independent and print-sensitive',()=>{
  const source=original.decks[0];
  const reversed=[...source.cards].reverse();
  assert.equal(printingFingerprint(source.cards),
    printingFingerprint(reversed));
  const altered=structuredClone(source.cards);
  altered[0].printing.number+='-changed';
  assert.notEqual(printingFingerprint(source.cards),
    printingFingerprint(altered));
});

test('wrong rank/archetype attribution fails closed',()=>{
  const bad=fresh();
  bad.decks.find(x=>x.rank===11).archetype='Regidrago';
  assert.throws(()=>attestField(bad,csv),/Wrong archetype at rank 11/);
});

test('wrong player attribution fails closed',()=>{
  const bad=fresh();
  bad.decks.find(x=>x.rank===10).player='Wrong Player';
  assert.throws(()=>attestField(bad,csv),/Wrong player at rank 10/);
});

test('incomplete or duplicated source sixties fail closed',()=>{
  const missingCard=fresh();
  missingCard.decks[0].cards[0].count-=1;
  assert.throws(()=>attestField(missingCard,csv),/Incorrect original 60/);
  const duplicateRank=fresh();
  duplicateRank.decks[1].rank=1;
  assert.throws(()=>attestField(duplicateRank,csv),/Duplicate original source rank/);
});

test('missing list metadata and publication flag must agree',()=>{
  const bad=fresh();
  bad.missing_full_lists[0].rank=24;
  assert.throws(()=>attestField(bad,csv),/Unpublished rank set mismatch/);
  const falsePublication=csv.replace(
    '11,Wataru Yano,Absol Garbodor,yes',
    '11,Wataru Yano,Absol Garbodor,no');
  assert.throws(()=>attestField(original,falsePublication),
    /Deck supplied for unpublished rank 11/);
});

test('exact category subtotals and row printings must remain accountable',()=>{
  const bad=fresh();
  bad.decks[0].category_counts.Energy+=1;
  assert.throws(()=>attestField(bad,csv),/Incorrect category count/);
  const badPrint=fresh();
  delete badPrint.decks[0].cards[0].printing.number;
  assert.throws(()=>attestField(badPrint,csv),
    /Missing exact published printing/);
});

test('unquoted field parser rejects ambiguous CSV and missing ranks',()=>{
  assert.throws(()=>parseField(csv.replace(
    '10,Haruku Yoshioka,Regidrago,yes',
    '10,Haruku,Yoshioka,Regidrago,yes')),/Ambiguous field.csv row/);
  assert.throws(()=>parseField(csv.split('\n').filter(
    x=>!x.startsWith('32,')).join('\n')),/Incomplete Aichi Top 32 field/);
});

/** @returns {object} Synthetic resolved result from the real original roster. */
function fakeNativePlan(){
  const printings=new Map(original.decks.map(d=>[d.rank,d]));
  const opponents=[...parseField(csv).values()].map(row=>{
    const source=printings.get(row.rank);
    if(!source)return {rank:row.rank,status:'missing-published-list',
      cards:null};
    return {rank:row.rank,player:row.player,archetype:row.archetype,
      status:'ready',substitutions:[],
      cards:source.cards.flatMap(c=>Array(c.count).fill(
        c.name+' '+c.printing.set+' '+c.printing.number))};
  });
  return {sourceDeckCount:29,opponents};
}

test('published printing proofs bind to ordered native source sixties',()=>{
  const receipt=attestNativePlan(fakeNativePlan(),original,csv);
  assert.equal(receipt.sources.length,29);
  assert.deepEqual(receipt.missingRanks,[23,25,28]);
  for(const row of receipt.sources){
    assert.equal(row.nativeStatus,'ready');
    assert.equal(row.nativeHasSubstitutions,false);
    assert.match(row.printingSha256,/^[a-f0-9]{64}$/);
    assert.match(row.nativeOrderedSha256,/^[a-f0-9]{64}$/);
  }
});

test('native seat rank label is a separate fail-closed invariant',()=>{
  const plan=fakeNativePlan();
  plan.opponents.find(x=>x.rank===11).archetype='Regidrago';
  assert.throws(()=>attestNativePlan(plan,original,csv),
    /Native source archetype mismatch at rank 11/);
  const duplicate=fakeNativePlan();
  duplicate.opponents[31].rank=11;
  assert.throws(()=>attestNativePlan(duplicate,original,csv),
    /Duplicate resolved source rank/);
});

test('native 59-card and fake missing-source game packets cannot pass',()=>{
  const undersized=fakeNativePlan();
  undersized.opponents.find(x=>x.rank===6).cards.pop();
  assert.throws(()=>attestNativePlan(undersized,original,csv),
    /Invalid resolved 60 at rank 6/);
  const fakeMissing=fakeNativePlan();
  fakeMissing.opponents.find(x=>x.rank===25).status='ready';
  assert.throws(()=>attestNativePlan(fakeMissing,original,csv),
    /missing-published-list/);
});

test('native hash is order-sensitive and unresolved sources remain excluded',()=>{
  const originalPlan=fakeNativePlan();
  const originalProof=attestNativePlan(originalPlan,original,csv);
  const changed=fakeNativePlan();
  changed.opponents[0].cards.reverse();
  const changeProof=attestNativePlan(changed,original,csv);
  assert.notEqual(originalProof.sources[0].nativeOrderedSha256,
    changeProof.sources[0].nativeOrderedSha256);
  assert.equal(originalProof.sources[0].printingSha256,
    changeProof.sources[0].printingSha256);
  const unresolved=fakeNativePlan();
  const source=unresolved.opponents.find(x=>x.rank===14);
  source.cards=null;
  source.status='unresolved-printings';
  const proof=attestNativePlan(unresolved,original,csv);
  assert.equal(proof.sources.find(x=>x.rank===14).nativeOrderedSha256,null);
});
