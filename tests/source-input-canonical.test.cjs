'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {sourceInputTraceSha256}=
  require('../simulation/evaluation/source-input-canonical.cjs');

const digest='a'.repeat(64);
const zone='b'.repeat(64);
function event(step,selection=1) {
  return {
    step,action:'ResolvePromptAction',pendingPrompt:{id:7,kind:'ChooseCardsPrompt'},
    promptReplayAction:{schema:'choose-card-references-v1',selection:[{index:selection}]},
    zoneDigestBefore:digest,zoneDigestAfter:zone,
    continuityDigestBefore:digest,continuityDigestAfter:zone
  };
}
test('portable source transport has a repeatable domain-specific digest',()=>{
  const original=[event(0)];
  const a=sourceInputTraceSha256(original);
  const b=sourceInputTraceSha256(JSON.parse(JSON.stringify(original)));
  assert.equal(a,b);
  assert.match(a,/^[0-9a-f]{64}$/);
  assert.notEqual(a,sourceInputTraceSha256([event(0,0)]));
});
test('one changed private-zone fingerprint invalidates source digest',()=>{
  const original=[event(0),event(1)];
  const modified=JSON.parse(JSON.stringify(original));
  modified[1].zoneDigestAfter='c'.repeat(64);
  assert.notEqual(sourceInputTraceSha256(original),sourceInputTraceSha256(modified));
});
test('missing action envelope, corrupted digest and step gap fail closed',()=>{
  const missing=event(0);
  delete missing.promptReplayAction;
  assert.throws(()=>sourceInputTraceSha256([missing]),/Nonportable/);
  const bad=event(0);
  bad.continuityDigestBefore='abc';
  assert.throws(()=>sourceInputTraceSha256([bad]),/Missing source digest/);
  assert.throws(()=>sourceInputTraceSha256([event(1)]),/Invalid source step/);
});
