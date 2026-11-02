'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..');
const profile=JSON.parse(fs.readFileSync(path.join(root,
  'simulation/evaluation/profiles/agent27-original-regidrago-min2-source-canary-v1.json'),'utf8'));

test('frozen original source file matches its registered Git blob SHA',()=>{
  assert.equal(profile.schema,'agent27-original-source-min2-canary-profile-v1');
  const bytes=fs.readFileSync(path.join(root,profile.sourceDeckManifest.path));
  const actual=createHash('sha1').update('blob '+bytes.length)
    .update(Buffer.from([0])).update(bytes).digest('hex');
  assert.equal(actual,profile.sourceDeckManifest.blobSha);
  const source=JSON.parse(bytes.toString('utf8'));
  for(const rank of profile.sourceDeckManifest.ranks){
    const deck=source.decks.find(row=>row.rank===rank);
    assert.ok(deck);
    assert.equal(deck.cards.reduce((sum,card)=>sum+card.count,0),60);
  }
});
test('registered source cases and historic flags are fixed',()=>{
  assert.deepEqual(profile.seedCases,[
    {seed:20261106,seatRanks:[10,1]},
    {seed:20261113,seatRanks:[1,10]},
    {seed:20261114,seatRanks:[10,1]}
  ]);
  const registration=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/registrations/agent41-crossrank-r6-r11-v1-20261019.json'),'utf8'));
  assert.deepEqual(profile.frozenFlags,registration.frozenFlags);
  assert.deepEqual(profile.allowedInfrastructureEnvironmentKeys,
    ['AGENT_TOOLSDIRECTORY']);
  assert.deepEqual(profile.expectedFullPhysicalDealSha256BySeed,{
    '20261106':'904d37e7c932f664a33fa02ee0417314f6256709f3b10197d6419d8882111d02',
    '20261113':'fc6545372675f04b386052bbfd78cfd949e2113dc2a08ba0ac8e23f47282f985',
    '20261114':'bd5448a4ceb5e014671c04ff4a2eb10a4a4710d85afed284b6ff101724554d96'
  });
  assert.equal(profile.maxNativeActions,110);
  assert.equal(profile.pinnedTwinleaf,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
});
