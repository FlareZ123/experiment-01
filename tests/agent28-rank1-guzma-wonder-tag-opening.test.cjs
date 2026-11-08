'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  exactOpeningResponse,hasBenchPlayableLele,originalRank1Parameters
}=require('../simulation/evaluation/agent28-rank1-guzma-wonder-tag-opening.cjs');
const {exactNaturalGuzmaSighting}=
  require('../simulation/evaluation/agent40-field-guzma-first-nine.cjs');

test('authentic rank1 counts remain one Guzma, two Lele, fourteen Basics',()=>{
  assert.deepEqual(originalRank1Parameters(),{
    guzmaCopies:1,leleCopies:2,otherBasicCopies:12
  });
});

test('eligible Tapu Lele is retained only when initial Active can be different',()=>{
  assert.equal(hasBenchPlayableLele(1,0,false),false);
  assert.equal(hasBenchPlayableLele(1,0,true),true);
  assert.equal(hasBenchPlayableLele(2,0,false),true);
  assert.equal(hasBenchPlayableLele(1,1,false),true);
  assert.equal(hasBenchPlayableLele(0,1,true),true);
  assert.equal(hasBenchPlayableLele(0,1,false),false);
});

test('exact seven/six/one rank1 response access splits direct from Wonder Tag',()=>{
  const x=exactOpeningResponse(originalRank1Parameters());
  assert.equal(x.initialHandsAndPrizesAndNextDraw,'416717869162795200');
  assert.equal(x.validOpeners,'358964655944294400');
  assert.ok(Math.abs(x.directGuzma.percent-12.772841963164904)<1e-10);
  assert.ok(Math.abs(x.additionalBenchPlayableWonderTag.percent-
    18.056005605020044)<1e-10);
  assert.ok(Math.abs(x.combinedOpportunity.percent-30.82884756818495)<1e-10);
  assert.equal(
    BigInt(x.directGuzma.count)+BigInt(x.additionalBenchPlayableWonderTag.count),
    BigInt(x.combinedOpportunity.count)
  );
});

test('removing Lele leaves exactly the independently counted direct 8-card sighting',()=>{
  const x=exactOpeningResponse({guzmaCopies:1,leleCopies:0,otherBasicCopies:14});
  const independent=exactNaturalGuzmaSighting(1,14,8);
  assert.equal(x.additionalBenchPlayableWonderTag.count,'0');
  assert.ok(Math.abs(x.directGuzma.percent-independent.percent)<1e-10);
});
