'use strict';

const assert = require('node:assert/strict');
const {test} = require('node:test');
const {
  replacementDistance,summarizeArchetype,run
} = require('../scripts/agent42-missing-opponent-proxy-envelope.cjs');

test('multiset replacement distance is whole-card and symmetrical',()=>{
  const a={rank:1,cards:[{name:'A',count:59},{name:'B',count:1}]};
  const b={rank:2,cards:[{name:'A',count:58},{name:'C',count:2}]};
  assert.equal(replacementDistance(a,b),2);
  assert.equal(replacementDistance(b,a),2);
  assert.equal(replacementDistance(a,a),0);
  const s=summarizeArchetype([a,b]);
  assert.equal(s.invariantCopyCount,58);
  assert.equal(s.pairCount,1);
  assert.equal(s.range[0],2);
});

test('exact published 29-source missing-rank structure stays explicit',()=>{
  const r=run();
  assert.equal(r.exactOriginalLists,29);
  assert.deepEqual(r.remainingOriginalGaps,[23,25,28]);
  assert.equal(r.regidrago.listCount,9);
  assert.equal(r.regidrago.pairCount,36);
  assert.deepEqual(r.regidrago.range,[6,21]);
  assert.equal(r.regidrago.totalDistance,465);
  assert.equal(r.regidrago.invariantCopyCount,34);
  assert.equal(r.regidrago.medoids[0].rank,12);
  assert.equal(r.regidrago.medoids[0].sumSubstitutions,93);
  assert.deepEqual(r.raichu.ranks,[4,17]);
  assert.deepEqual(r.raichu.range,[20,20]);
  assert.equal(r.raichu.invariantCopyCount,40);
  assert.equal(r.hypotheticalProxyAssignments,162);
  assert.equal(r.competitiveQualifiedGames,0);
});

test('rank4 and rank17 have mutually exclusive setup engines',()=>{
  const r=run();
  const names = new Map(r.divergentRaichuNames.map(c=>[c.name,c]));
  assert.deepEqual(names.get('Unown'),{
    name:'Unown',rank4:0,rank17:4
  });
  assert.deepEqual(names.get('Rescue Carrier'),{
    name:'Rescue Carrier',rank4:0,rank17:4
  });
  assert.deepEqual(names.get('Quick Ball'),{
    name:'Quick Ball',rank4:4,rank17:0
  });
  assert.deepEqual(names.get('Sky Field'),{
    name:'Sky Field',rank4:3,rank17:0
  });
});
