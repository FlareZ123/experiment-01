'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {graphOwnerPath,graphDifferenceWitness}=
  require('../simulation/twinleaf/graph-difference-witness.cjs');

test('owner paths resolve canonical repeated aliases to a stable first reachable owner',()=>{
  const graph={root:[['state',['ref',0]]],nodes:[
    {className:'State',fields:[['players',[true,true,true],['ref',1]]]},
    {className:'Array',fields:[['0',[true,true,true],['ref',2]]]},
    {className:'Player',fields:[['active',[true,true,true],['ref',3]]]},
    {className:'PokemonCardList',fields:[['cards',[true,true,true],['ref',4]]]},
    {className:'Array',fields:[]}
  ]};
  assert.equal(graphOwnerPath(graph,4),'Store.state.players[0].active.cards');
  assert.equal(graphOwnerPath(graph,99),null);
});

test('describe leaf value mismatch without relying on bare node index',()=>{
  const pre={root:[['state',['ref',0]]],nodes:[
    {className:'State',fields:[['active',[true,true,true],['ref',1]]]},
    {className:'PokemonCard',fields:[['damageTakenLastTurn',[true,true,true],['number','0']]]}
  ]};
  const post={root:pre.root,nodes:[
    pre.nodes[0],
    {className:'PokemonCard',fields:[['damageTakenLastTurn',[true,true,true],['number','30']]]}
  ]};
  const witness=graphDifferenceWitness(pre,post,{
    path:'$.nodes[1].fields[0][2][1]',before:'0',after:'30'
  });
  assert.equal(witness.gamePath,'Store.state.active');
  assert.equal(witness.property,'damageTakenLastTurn');
  assert.equal(witness.before,'0');
  assert.equal(witness.after,'30');
});

test('new property and root changes remain explainable',()=>{
  const before={root:[['state',['ref',0]]],
    nodes:[{className:'State',fields:[]}]};
  const after={root:before.root,nodes:[
    {className:'State',fields:[['newField',[true,true,true],['number','1']]]}
  ]};
  const detail=graphDifferenceWitness(before,after,{
    path:'$.nodes[0].fields.length',before:0,after:1
  });
  assert.deepEqual(
    {gamePath:detail.gamePath,fieldsBefore:detail.fieldsBefore,fieldsAfter:detail.fieldsAfter},
    {gamePath:'Store.state',fieldsBefore:0,fieldsAfter:1}
  );
  assert.equal(graphDifferenceWitness(before,after,{
    path:'$.root.length',before:2,after:3
  }).canonicalPath,'$.root.length');
});
