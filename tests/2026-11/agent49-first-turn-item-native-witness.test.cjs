'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {rootPhysicalSnapshot,rootPhysicalWitness}=
  require('../../simulation/twinleaf/agent5-owner-root-slice.cjs');

/** Public-only physical Store stub containing no secret deck identities. */
function nativeFixture(item){
  const card={fullName:item};
  const owner={
    id:101,
    hand:{cards:[card,{fullName:'Grass Energy MEE'}]},
    discard:{cards:[]},supporter:{cards:[]},
    active:{energies:{cards:[]},tools:[]},
    bench:[null,null,null,null,null],
    stadium:{cards:[]},
    supporterTurn:0,stadiumUsedTurn:0,retreatedTurn:0
  };
  const state={
    players:[owner],turn:1,phase:2,activePlayer:owner.id
  };
  return {state,owner,card};
}
const cases=[
  {kind:'play-seeker-get-crispin',printing:'VS Seeker PHF'},
  {kind:'play-regidrago-battle-compressor',
    printing:'Battle Compressor PHF'}
];
for(const intent of cases){
  test('native Item enters public resolving zone before owner prompt: '+intent.kind,()=>{
    const {state,owner,card}=nativeFixture(intent.printing);
    const before=rootPhysicalSnapshot(state,0,intent);
    owner.hand.cards.shift();
    owner.supporter.cards.push(card);
    const after=rootPhysicalSnapshot(state,0,intent);
    assert.equal(rootPhysicalWitness(intent,before,after,{}),
      'confirmed-public-effect');
    assert.equal(after.handCount,before.handCount-1);
  });
  test('native Item witness declines unrelated hand loss: '+intent.kind,()=>{
    const {state,owner}=nativeFixture(intent.printing);
    const before=rootPhysicalSnapshot(state,0,intent);
    owner.hand.cards.pop();
    const after=rootPhysicalSnapshot(state,0,intent);
    assert.equal(rootPhysicalWitness(intent,before,after,{}),
      'no-confirmed-public-effect');
  });
}
