'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {calculate,main}=
  require('../scripts/agent6-newmoon-fog-compressor-first8.cjs');

/** @param {object} p @param {string} numerator @param {string} denominator */
function equalFraction(p,numerator,denominator) {
  assert.equal(p.numerator,numerator);
  assert.equal(p.denominator,denominator);
}

test('actual unchanged 60 binds four Fog and two Compressor with 17 legal starters',()=>{
  const m=main();
  assert.deepEqual(m.inventory,{
    basics:17,mewtwo:2,gengar:1,fog:4,compressor:2
  });
  assert.equal(m.competitivelyQualified,false);
  assert.match(m.candidatePrintingHash,/^[a-f0-9]{64}$/);
});

test('exact first-eight single-channel, union and overlap fractions',()=>{
  const {channels}=main();
  equalFraction(channels.fogSeenChannel,'13770330','176991403');
  // This reproduces the earlier independently published Compressor-only
  // necessary initial-resource probability, not a new gameplay result.
  equalFraction(channels.compressorSeenChannel,'15335595','353982806');
  equalFraction(channels.eitherChannel,'12803988680','121947076667');
  equalFraction(channels.bothChannels,'3933762335','243894153334');
  assert.ok(channels.eitherChannel.probability<1);
  assert.ok(channels.eitherChannel.probability>
    channels.fogSeenChannel.probability);
});

test('disjoint source item inventory cannot fake an overlap',()=>{
  const i={basics:17,mewtwo:2,gengar:1,fog:4,compressor:0};
  const result=calculate(i);
  assert.equal(result.bothChannels.probability,0);
  assert.deepEqual(result.eitherChannel,result.fogSeenChannel);
});

test('single-Gengar and at-least-one Mewtwo assumptions fail closed',()=>{
  assert.throws(()=>calculate({basics:17,mewtwo:2,gengar:0,fog:4,compressor:2}));
  assert.throws(()=>calculate({basics:17,mewtwo:0,gengar:1,fog:4,compressor:2}));
});
