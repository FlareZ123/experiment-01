'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const {auditNativeKoPrintedPrizeValues:audit}=require(
  '../simulation/evaluation/agent3-native-ko-printed-prize-audit.cjs');

const root=path.resolve(__dirname,'..');
const fixture=JSON.parse(fs.readFileSync(path.join(root,
  'results/methodology/data/agent3-v28-public-ko-eight-observed-events.json'),'utf8'));
const copy=()=>structuredClone(fixture.observations);

test('eight native KO printings match the independent card database Prize rules',()=>{
  const result=audit(copy());
  assert.equal(result.allMatched,true);
  assert.equal(result.rows.length,8);
  assert.deepEqual(result.rows.map(r=>r.cardId),[
    'sm8-94','swsh4-69','sm5-100','swsh4-69',
    'sm11-71','sm10-81','sm2-60','smp-SM217'
  ]);
  assert.deepEqual(result.rows.map(r=>r.printedPrizeCount),[1,1,2,1,3,1,2,3]);
  assert.equal(result.rows.reduce((n,r)=>n+r.printedPrizeCount,0),14);
  assert.equal(result.qualifiedCompetitiveGames,0);
  assert.equal(result.paperGameCertified,false);
});

test('reject incorrect HP, Prize awards, insufficient damage and unknown printings',()=>{
  const wrongHp=copy();wrongHp[0].victimPrinting.printedHp=110;
  assert.throws(()=>audit(wrongHp),/printed HP mismatch/);
  const wrongPrize=copy();wrongPrize[4].nativePrizeCount=2;
  assert.throws(()=>audit(wrongPrize),/Prize award differs/);
  const noKo=copy();noKo[2].victimDamageBeforeNativeKo=179;
  assert.throws(()=>audit(noKo),/below printed KO threshold/);
  const missing=copy();missing[7].victimPrinting.setNumber='999';
  assert.throws(()=>audit(missing),/Unique printed card required/);
  const badSet=copy();badSet[0].victimPrinting.set='NEVER';
  assert.throws(()=>audit(badSet),/Unverified native printing set/);
});

test('set identity prevents an accidental same-name cross-print match',()=>{
  const wrongSet=copy();wrongSet[6].victimPrinting.set='UNB';
  assert.throws(()=>audit(wrongSet),/printed name mismatch|Unique printed card required/);
});
