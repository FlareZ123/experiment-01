'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {shakeTurnOneWindow,sourceReport}=require('../scripts/aichi-absol-boost-shake-direct.cjs');

test('first turn direct access fractions, each independent 60-card registration',()=>{
  const data=JSON.parse(fs.readFileSync(path.join(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  const r=sourceReport(data).ranks;
  assert.deepEqual(r.map(x=>x.rank),[8,11,16,22]);
  assert.deepEqual(r.map(x=>x.boostShake),[1,2,2,0]);
  assert.deepEqual(r.map(x=>x.earlyDirectAccess.numerator),
    ['2661125507','68180030335','13570028727','0']);
  assert.deepEqual(r.map(x=>x.earlyDirectAccess.denominator),
    ['197276216280','3517488113568','532952744480','1']);
  assert(r[1].earlyDirectAccess.probability>r[0].earlyDirectAccess.probability);
  assert(r[2].earlyDirectAccess.probability>r[1].earlyDirectAccess.probability);
});

test('first turn core requirement and all-Garbodor-prized case',()=>{
  const x={basics:11,trubbish:2,garbodor:2,floatStone:3,boostShake:2};
  for(const key of ['trubbish','garbodor','floatStone','boostShake']){
    assert.equal(shakeTurnOneWindow({...x,[key]:0}).probability,0);
  }
  const oneG=shakeTurnOneWindow({...x,garbodor:1});
  assert(oneG.probability>0&&oneG.probability<1);
});
