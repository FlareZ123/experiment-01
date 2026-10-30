'use strict';

const assert=require('node:assert/strict');
const {verifyFrame,classifyOriginalK0}=
  require('../simulation/twinleaf/agent32-rank11-eight-k0-bench-native.cjs');

assert.equal(verifyFrame(),true);

const base={
  decisionKind:'owner-root',
  ownHand:[
    'Boost Shake EVS','Forest Seal Stone SIT','Darkness Energy MEE',
    'Guzma BUS','Float Stone BKT','Carmine TWM','Marnie SSH'
  ],
  ownPublic:{
    active:{name:'Oranguru V',printing:'Oranguru V ASR'},
    bench:[null,null,null,null,null]
  }
};
const original=classifyOriginalK0(base);
assert.equal(original.candidateHandCondition,true);
assert.equal(original.noTrubbishKnownInHandOrBench,true);
assert.equal(original.originalEightCardK0Branch,true);
assert.equal(original.ownerAccessibleAtFirstRoot,8);
assert.equal(original.knownBothGarbodor,false);

const benched=classifyOriginalK0({
  ...base,
  ownHand:base.ownHand.slice(0,6),
  ownPublic:{...base.ownPublic,
    bench:[{printing:'Trubbish FST'},null,null,null,null]}
});
assert.equal(benched.candidateHandCondition,true,
  'A Basic played during setup leaves the private hand');
assert.equal(benched.benchedTrubbish,true);
assert.equal(benched.originalEightCardK0Branch,false);
assert.equal(benched.ownerAccessibleAtFirstRoot,8);

const bonus=classifyOriginalK0({
  ...base, ownHand:base.ownHand.concat('Darkness Energy MEE')
});
assert.equal(bonus.ownerAccessibleAtFirstRoot,9);
assert.equal(bonus.candidateHandCondition,true);
assert.equal(bonus.originalEightCardK0Branch,false);

const vip=classifyOriginalK0({
  ...base, ownHand:base.ownHand.concat('Battle VIP Pass FST')
});
assert.equal(vip.candidateHandCondition,false);

const bothHeld=classifyOriginalK0({
  ...base,
  ownHand:[
    'Boost Shake EVS','Garbodor BKP','Garbodor BKP',
    'Darkness Energy MEE','Marnie SSH','Forest Seal Stone SIT',
    'Float Stone BKT'
  ]
});
assert.equal(bothHeld.knownBothGarbodor,true);

// The actor-visible projection ignores unavailable hidden deck/prize fields.
const concealed=classifyOriginalK0({
  ...base, secretDeck:['Trubbish FST'], secretPrizes:['Garbodor BKP'],
  opponentSecretHand:['Battle VIP Pass FST']
});
assert.deepEqual(concealed,original);

console.log('Agent32 eight exact native K0 Bench-classifier pure controls passed');
