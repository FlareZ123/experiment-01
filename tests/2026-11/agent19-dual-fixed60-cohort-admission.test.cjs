'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {nativeCohortAdmission}=
  require('../../simulation/evaluation/2026-11/agent19-dual-fixed60-fourrank-paperprofile-native.cjs');
const registration=
  require('../../results/aichi-2026/registrations/agent19-dual-fixed60-four-source-papercore-prospective-20261109.json');

/** @param {{error?:string|null,roots?:number,source?:string|null}} [options] */
function attempts({error=null,roots=0,source=null}={}){
  return {groups:registration.sourceGroups.map(g=>({
    key:[g.rank,g.repeat,g.candidateSlot].join(':'),
    contenders:Object.fromEntries(registration.fixedContenderIds.map(
      id=>[id,{error,rootCount:roots,sourceDealFingerprint:source}]))
  }))};
}
test('all 32 native aborts fail release admission even if the script exits',()=>{
  const x=nativeCohortAdmission(attempts({error:'native assertion'}));
  assert.equal(x.status,'REJECT_ALL_ABORT_OR_NO_NATIVE_ROOT');
  assert.equal(x.engineErrors,32);
  assert.equal(x.competitiveGames,0);
});
test('32 no-opportunity roots without physical opening fail',()=>{
  const x=nativeCohortAdmission(attempts({roots:10}));
  assert.equal(x.status,'REJECT_ALL_ABORT_OR_NO_NATIVE_ROOT');
  assert.equal(x.sourceOpeningsObserved,0);
});
test('actual source opening and root are necessary to admit development',()=>{
  const x=nativeCohortAdmission(attempts({roots:12,source:'known-real-deal'}));
  assert.equal(x.status,'ADMIT_DEVELOPMENT_ONLY');
  assert.equal(x.retained,32);
  assert.equal(x.actionRootsObservedInRows,32);
  assert.equal(x.competitiveGames,0);
});
