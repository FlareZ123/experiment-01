'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {lastBenchBasicConflict}=
  require('../simulation/twinleaf/agent27-owner-lastbench-basic-conflict.cjs');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const root=path.resolve(__dirname,'..');
const catalog={basics:new Set(['Girafarig LOT','Tapu Lele-GX GRI']),
  abilityBasics:new Set(['Tapu Lele-GX GRI'])};
const base={decisionKind:'owner-root',globalTurn:2,
  ownHand:['Girafarig LOT','Tapu Lele-GX GRI'],
  ownTurnResources:{pokemonPlayLocked:false,abilityPokemonPlayLocked:false},
  ownPublic:{bench:[{printing:'A'},{printing:'B'},
    {printing:'C'},{printing:'D'},null],active:{printing:'E'}},
  opponentPublic:{handCount:7,bench:[]}};

const decide=(view=base)=>{
  const chosen=chooseActorRootIntent(view,catalog,{});
  return {chosen,conflict:lastBenchBasicConflict(view,catalog,chosen)};
};
test('registered rank1 source contains both printed Basic competitors',()=>{
  const data=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const source=data.decks.find(d=>d.rank===1);
  assert.ok(source);
  for(const [name,print] of [['Girafarig','LOT'],['Tapu Lele-GX','GRI']]){
    assert.ok(source.cards.some(row=>row.name===name&&
      row.printing.set===print&&row.count>=1));
  }
});
test('actual first-match chooser excludes alternative at last Bench slot',()=>{
  const result=decide();
  assert.deepEqual(result.chosen,{kind:'bench-basic',handIndex:0,
    benchIndex:4,printing:'Girafarig LOT'});
  assert.equal(result.conflict?.benchIndex,4);
  assert.deepEqual(result.conflict?.selected,{printing:'Girafarig LOT',
    handIndex:0,hasPrintedAbility:false});
  assert.deepEqual(result.conflict?.omitted,[{printing:'Tapu Lele-GX GRI',
    handIndex:1,hasPrintedAbility:true}]);
  assert.equal(result.conflict?.nativePlayability,'unverified');
  assert.equal(result.conflict?.strategicPreference,'not-inferred');
});
test('exhausted Bench and non-last slots do not invent a conflict',()=>{
  const full={...base,ownPublic:{...base.ownPublic,bench:
    base.ownPublic.bench.map(x=>x??{printing:'Filled'})}};
  assert.equal(lastBenchBasicConflict(full,catalog,{kind:'pass'}),null);
  const two={...base,ownPublic:{...base.ownPublic,bench:
    [null,...base.ownPublic.bench.slice(1)]}};
  const result=decide(two);
  assert.equal(result.conflict,null);
});
test('owner play lock and Ability-Basic lock restrict physical alternatives',()=>{
  const locked={...base,ownTurnResources:{...base.ownTurnResources,
    pokemonPlayLocked:true}};
  assert.equal(lastBenchBasicConflict(locked,catalog,
    {kind:'bench-basic',benchIndex:4,handIndex:0,printing:'Girafarig LOT'}),null);
  const abilityLocked={...base,ownTurnResources:{...base.ownTurnResources,
    abilityPokemonPlayLocked:true}};
  assert.equal(decide(abilityLocked).conflict,null);
});
test('opponent concealed hand, deck order and Prize truth cannot change offer',()=>{
  const make=(opponentPrivate,unseenDeck)=>({...base,opponentPrivate,
    unseenOwnedDeckOrder:unseenDeck});
  const first=decide(make({hand:['A'],prize:['B']},['X']));
  const other=decide(make({hand:['Hidden'],prize:['Secret']},['Y']));
  assert.deepEqual(first,other);
});
