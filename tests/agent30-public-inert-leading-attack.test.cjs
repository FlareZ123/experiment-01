'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {choosePublicInertLeadingAttack:choose}=require(
  '../simulation/twinleaf/agent30-public-inert-leading-attack.cjs');

/** @param {object} changes @returns {object} */
function observation(changes={}){
  return {
    decisionKind:'owner-root',
    ownPublic:{active:{printing:'Pidgey MEW'},bench:Array(5).fill({}),
      discard:['Card X'],...(changes.ownPublic??{})},
    opponentPublic:{active:{printing:'Iron Thorns ex TWM'}},
    ...Object.fromEntries(Object.entries(changes).filter(([k])=>
      k!=='ownPublic'))
  };
}

/** @param {string} first @param {string} later @param {number} damage */
function affordable(first,later,damage){
  return [{name:first,damage:0},{name:later,damage}];
}

test('Pidgey MEW full five-Bench uses separately payable Tackle',()=>{
  assert.deepEqual(choose(observation(),affordable('Call for Family','Tackle',20)),{
    attackName:'Tackle',
    reason:'Pidgey MEW Call for Family cannot place Basics on a full Bench'
  });
});

test('Sky Field enlarged full eight-Bench still blocks placement',()=>{
  const v=observation({ownPublic:{bench:Array(8).fill({})}});
  assert.equal(choose(v,affordable('Call for Family','Tackle',20))?.attackName,
    'Tackle');
});

test('Vacant Bench makes Call for Family potentially useful',()=>{
  const v=observation({ownPublic:{bench:[{},{},null,{},{}]}});
  assert.equal(choose(v,affordable('Call for Family','Tackle',20)),null);
});

test('Duskull PRE full Bench chooses separately payable Mumble',()=>{
  const v=observation({ownPublic:{active:{printing:'Duskull PRE'}}});
  assert.equal(choose(v,affordable('Come and Get You','Mumble',30))?.attackName,
    'Mumble');
});

test('Duskull PRE open Bench retains discarded Basic recovery',()=>{
  const v=observation({ownPublic:{active:{printing:'Duskull PRE'},
    bench:[null,{},{},{},{}]}});
  assert.equal(choose(v,affordable('Come and Get You','Mumble',30)),null);
});

test('Dialga-GX UPR full hand Overclock gives Shred preference',()=>{
  const v=observation({ownHand:Array(6).fill('Resource'),
    ownPublic:{active:{printing:'Dialga-GX UPR'}}});
  assert.equal(choose(v,affordable('Overclock','Shred',80))?.attackName,
    'Shred');
});

test('Dialga-GX UPR short hand retains Overclock draw',()=>{
  const v=observation({ownHand:Array(5).fill('Resource'),
    ownPublic:{active:{printing:'Dialga-GX UPR'}}});
  assert.equal(choose(v,affordable('Overclock','Shred',80)),null);
});

test('Trubbish NVI empty public discard chooses Sludge Bomb',()=>{
  const v=observation({ownPublic:{active:{printing:'Trubbish NVI'},discard:[]}});
  assert.equal(choose(v,affordable('Garbage Collection','Sludge Bomb',20))?.attackName,
    'Sludge Bomb');
});

test('Trubbish NVI holds recovery when discard contains a card',()=>{
  const v=observation({ownPublic:{active:{printing:'Trubbish NVI'}}});
  assert.equal(choose(v,affordable('Garbage Collection','Sludge Bomb',20)),null);
});

test('Same-named different printing is never treated as proven inert',()=>{
  const v=observation({ownPublic:{active:{printing:'Pidgey FLF'}}});
  assert.equal(choose(v,affordable('Call for Family','Tackle',20)),null);
});

test('Unpayable alternative is never proposed',()=>{
  assert.equal(choose(observation(),[{name:'Call for Family',damage:0}]),null);
});

test('Nonnumeric, variable, and changed damage fail closed',()=>{
  for(const damage of [10,'20','20+',null,0]){
    assert.equal(choose(observation(),affordable('Call for Family','Tackle',damage)),null);
  }
  assert.equal(choose(observation(),[
    {name:'Call for Family',damage:0},
    {name:'Tackle',damage:20,damageCalculation:'extra'}]),null);
});

test('Different leading attack and absent defender fail closed',()=>{
  assert.equal(choose(observation(),affordable('Other','Tackle',20)),null);
  assert.equal(choose(observation({opponentPublic:{active:null}}),
    affordable('Call for Family','Tackle',20)),null);
});

test('Does not read opponent concealed hand, deck or Prize cards',()=>{
  const enemy={active:{printing:'Iron Thorns ex TWM'}};
  for(const k of ['hand','deck','prizes']){
    Object.defineProperty(enemy,k,{get(){throw Error('CONCEALED_READ');}});
  }
  const v=observation({opponentPublic:enemy});
  assert.equal(choose(v,affordable('Call for Family','Tackle',20))?.attackName,
    'Tackle');
});
