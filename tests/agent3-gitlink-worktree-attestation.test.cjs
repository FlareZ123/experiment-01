'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {attestVendorWorktree}=
  require('../simulation/evaluation/agent3-gitlink-worktree-attestation.cjs');

const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const ROOT='1111111111111111111111111111111111111111';
const OTHER='2222222222222222222222222222222222222222';
const sample=()=>({
  repositoryHead:ROOT,expectedRepositoryHead:ROOT,
  gitlinkTreeLine:'160000 commit '+PIN+'\tvendor/twinleaf',
  vendorHead:PIN,expectedVendorHead:PIN,trackedVendorStatus:''
});

test('matching parent gitlink, clean checked-out vendor and registered heads attest',()=>{
  const out=attestVendorWorktree(sample());
  assert.equal(out.attested,true);
  assert.deepEqual(out.reasons,[]);
  assert.equal(out.competitiveQualified,false);
});
test('same compiled HEAD with changed tracked vendor source fails closed',()=>{
  const out=attestVendorWorktree({...sample(),
    trackedVendorStatus:' M ptcg-server/src/game/store/store.ts'});
  assert.equal(out.attested,false);
  assert.ok(out.reasons.includes('tracked-vendor-worktree-dirty-or-unobserved'));
});
test('different actual vendor checkout is not covered by matching remote gitlink',()=>{
  const out=attestVendorWorktree({...sample(),vendorHead:OTHER});
  assert.equal(out.attested,false);
  assert.ok(out.reasons.includes('checkout-pin-mismatch'));
  assert.ok(out.reasons.includes('checkout-gitlink-mismatch'));
});
test('changed parent gitlink cannot be masked by expected vendor checkout',()=>{
  const out=attestVendorWorktree({...sample(),
    gitlinkTreeLine:'160000 commit '+OTHER+'\tvendor/twinleaf'});
  assert.equal(out.attested,false);
  assert.ok(out.reasons.includes('committed-gitlink-pin-mismatch'));
  assert.ok(out.reasons.includes('checkout-gitlink-mismatch'));
});
test('plain vendored files are not a git submodule',()=>{
  const out=attestVendorWorktree({...sample(),
    gitlinkTreeLine:'100644 blob '+PIN+'\tvendor/twinleaf'});
  assert.equal(out.attested,false);
  assert.ok(out.reasons.includes('committed-gitlink-unobserved'));
});
test('unobserved inputs and different expected repo HEAD do not attest',()=>{
  const out=attestVendorWorktree({...sample(),
    repositoryHead:null,expectedRepositoryHead:OTHER,
    gitlinkTreeLine:null,vendorHead:null,trackedVendorStatus:null});
  assert.equal(out.attested,false);
  assert.ok(out.reasons.includes('repository-head-unobserved'));
  assert.ok(out.reasons.includes('repository-head-mismatch'));
  assert.ok(out.reasons.includes('committed-gitlink-unobserved'));
  assert.ok(out.reasons.includes('vendor-head-unobserved'));
  assert.ok(out.reasons.includes('tracked-vendor-worktree-dirty-or-unobserved'));
});
test('invalid expected pin is explicitly rejected',()=>{
  const out=attestVendorWorktree({...sample(),expectedVendorHead:'HEAD'});
  assert.equal(out.attested,false);
  assert.ok(out.reasons.includes('invalid-expected-pin'));
});
test('missing input object is rejected instead of guessed',()=>{
  assert.throws(()=>attestVendorWorktree(null),TypeError);
});
