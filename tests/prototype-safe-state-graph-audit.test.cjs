'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {characterizePrototypeSafeStateGraph}=
  require('../simulation/twinleaf/prototype-safe-state-graph-audit.cjs');

const compiled=fs.existsSync(path.resolve(
  __dirname,'../vendor/twinleaf/ptcg-server/output/game'));

test('pinned tool-attack history has a measured clone alias-fidelity limitation',
{skip:!compiled},()=>{
  const audit=characterizePrototypeSafeStateGraph();
  assert.equal(audit.pinnedRevision,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  const after=audit.additionalStateProfiles.crisisPunchAfterRealAttack;
  assert.equal(after.promptWaits,3);
  assert.equal(after.defendingBoardDamage,280);
  const ready=audit.additionalStateProfiles.crisisPunchReady;
  for(const profile of [ready,after.profiles]) {
    assert.ok(profile.pinned.sharedReferences.count>0);
    assert.ok(profile.pinned.sourcePrototypeAliases.count>0);
    assert.equal(profile.prototypeSafe.sharedReferences.count,0);
    assert.equal(profile.prototypeSafe.sourcePrototypeAliases.count,0);
    assert.equal(profile.prototypeSafe.missingProperties.count,0);
    assert.ok(profile.prototypeSafe.indirectInstancePrototypes.count>0,
      'Two-pass prototype-safe copy must expose intermediate instance inheritance');
    assert.equal(profile.postSuperRepair.sharedReferences.count,0);
    assert.equal(profile.postSuperRepair.indirectInstancePrototypes.count,0,
      'Post-super repair must restore exact source class prototypes');
    assert.equal(profile.postSuperRepair.sourcePrototypeAliases.count,0);
    assert.equal(profile.postSuperRepair.missingProperties.count,0);
    assert.equal(profile.postSuperRepair.valueMismatches.count,0);
    assert.equal(profile.postSuperRepair.arrayLengthMismatches.count,0);
    assert.equal(profile.postSuperRepair.classPrototypeMismatches.count,0);
    assert.equal(profile.postSuperRepair.repeatedArrayBreaks.count,0);
    assert.equal(profile.postSuperRepair.repeatedObjectBreaks.count,0);
  }
  assert.equal(ready.pinned.repeatedObjectBreaks.count,0);
  assert.equal(ready.prototypeSafe.repeatedObjectBreaks.count,0);
  assert.equal(ready.postSuperRepair.repeatedObjectBreaks.count,0);
  for(const mode of ['pinned','prototypeSafe']){
    const broken=after.profiles[mode].repeatedObjectBreaks;
    assert.equal(broken.count,2);
    assert.ok(broken.examples.every(example=>
      example.includes('state.players.0.discard.cards.0.attacks.0') &&
      (example.includes('state.lastAttack') ||
       example.includes('state.playerLastAttack.101.attack'))));
  }
  assert.equal(audit.syntheticRepeatedArrayAliasPreserved,false);
});
