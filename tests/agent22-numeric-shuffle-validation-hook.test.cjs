'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {validateNumericShuffle,withNumericShuffleValidator}=
  require('../simulation/twinleaf/agent22-numeric-shuffle-validation-hook.cjs');

class NativeShapedShufflePrompt {
  constructor(playerId){this.playerId=playerId;}
  getPerspectivePlayerId(){return this.playerId;}
  validate(result,state){
    if(result===null)return false;
    const player=state.players.find(p=>p.id===this.getPerspectivePlayerId());
    if(!player||result.length!==player.deck.cards.length)return false;
    const s=result.slice();
    s.sort(); // Exact bug in the pinned upstream ShuffleDeckPrompt.
    for(let i=0;i<s.length;i++)if(s[i]!==i)return false;
    return true;
  }
}
const state=n=>({players:[
  {id:101,deck:{cards:Array.from({length:n},()=>({}))}},
  {id:202,deck:{cards:[]}}
]});
const permutation=n=>Array.from({length:n},(_,i)=>n-1-i);

test('pinned legacy numeric shuffle validator rejects every 11+ permutation',()=>{
  const p=new NativeShapedShufflePrompt(101);
  assert.equal(p.validate(permutation(9),state(9)),true);
  assert.equal(p.validate(permutation(10),state(10)),true);
  for(const n of [11,12,43,60]){
    assert.equal(p.validate(permutation(n),state(n)),false);
    assert.equal(validateNumericShuffle(p,permutation(n),state(n)),true);
  }
});

test('research-only scoped numeric hook admits legal shuffle permutations',()=>{
  const original=NativeShapedShufflePrompt.prototype.validate;
  const p=new NativeShapedShufflePrompt(101),s=state(43);
  const observed=withNumericShuffleValidator(()=>{
    assert.equal(p.validate(permutation(43),s),true);
    assert.equal(p.validate(Array.from({length:43},(_,i)=>i),s),true);
    assert.equal(p.validate([1,1,...Array.from({length:41},(_,i)=>i+2)],s),false);
    assert.equal(p.validate([0,1,2],s),false);
    assert.equal(p.validate(null,s),false);
    assert.equal(p.validate(permutation(43),state(42)),false);
    assert.equal(p.validate(permutation(43),{players:[]}),false);
    return 'validated';
  },{ShuffleDeckPrompt:NativeShapedShufflePrompt});
  assert.equal(observed,'validated');
  assert.strictEqual(NativeShapedShufflePrompt.prototype.validate,original);
});

test('research-owned patch restores original native method after exception',()=>{
  const original=NativeShapedShufflePrompt.prototype.validate;
  assert.throws(()=>withNumericShuffleValidator(()=>{
    assert.notStrictEqual(
      NativeShapedShufflePrompt.prototype.validate,original);
    throw Error('intentional test exception');
  },{ShuffleDeckPrompt:NativeShapedShufflePrompt}),/intentional test exception/);
  assert.strictEqual(NativeShapedShufflePrompt.prototype.validate,original);
});
