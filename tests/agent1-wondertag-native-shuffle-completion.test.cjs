'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,withWonderTagNativeShuffleCompletion:observe}=
  require('../simulation/twinleaf/agent1-wondertag-native-shuffle-completion.cjs');

/** Printed native effect and Store fixture without hidden deck-card reads. */
function fixture(){
  class FakePlayPokemonEffect{
    constructor(player,pokemonCard){this.player=player;this.pokemonCard=pokemonCard;}
  }
  class FakeShuffleDeckPrompt{constructor(playerId){this.playerId=playerId;}}
  class FakeLele{
    constructor(){this.fullName='Tapu Lele-GX GRI';}
    reduceEffect(store,state,effect){
      if(effect instanceof FakePlayPokemonEffect&&effect.pokemonCard===this){
        store.prompt(state,new FakeShuffleDeckPrompt(effect.player.id),
          order=>{effect.player.deck.applyOrder(order);return state;});
      }
      return state;
    }
  }
  const original=FakeLele.prototype.reduceEffect;
  const applied=[];
  const players=[
    {id:10,deck:{cards:[0,1,2],applyOrder:order=>applied.push([0,order])}},
    {id:20,deck:{cards:[0,1,2],applyOrder:order=>applied.push([1,order])}}
  ];
  const state={players},prompts=[];
  const store={prompt(_state,prompt,callback){
    prompts.push({prompt,callback});return _state;
  }};
  function play(seat=0){
    const lele=new FakeLele(),player=players[seat];
    return lele.reduceEffect(store,state,
      new FakePlayPokemonEffect(player,lele));
  }
  return {FakeLele,FakePlayPokemonEffect,FakeShuffleDeckPrompt,
    TapuLeleGX:FakeLele,PlayPokemonEffect:FakePlayPokemonEffect,
    ShuffleDeckPrompt:FakeShuffleDeckPrompt,
    original,prompts,applied,players,state,store,play};
}

test('actual printed native callback records only its own resolved shuffle',()=>{
  const x=fixture();
  const r=observe(()=>{
    x.play(1);
    assert.equal(x.prompts.length,1);
    assert.equal(x.applied.length,0);
    x.prompts[0].callback([2,0,1]);
    assert.deepEqual(x.applied,[[1,[2,0,1]]]);
    return 'native-result';
  },x);
  assert.equal(r.result,'native-result');
  assert.equal(r.audit.version,VERSION);
  assert.equal(r.audit.printedEntrances,1);
  assert.equal(r.audit.shufflePromptsOffered,1);
  assert.equal(r.audit.shuffleCallbacksCompleted,1);
  assert.equal(r.audit.validShuffleCallbacksCompleted,1);
  assert.equal(r.audit.invalidNativeShufflePermutations,0);
  assert.equal(r.audit.outstandingShuffleCallbacks,0);
  assert.deepEqual(r.audit.bySeat,{0:0,1:1});
  assert.equal(r.audit.readsHiddenDeck,false);
  assert.equal(r.audit.changesNativeActions,false);
  assert.strictEqual(x.FakeLele.prototype.reduceEffect,x.original);
});

test('native prompt scheduled but never resolved is an explicit incomplete shuffle',()=>{
  const x=fixture();
  const r=observe(()=>x.play(0),x);
  assert.equal(r.audit.shufflePromptsOffered,1);
  assert.equal(r.audit.shuffleCallbacksCompleted,0);
  assert.equal(r.audit.outstandingShuffleCallbacks,1);
  assert.equal(x.applied.length,0);
});

test('irrelevant Pokémon effects do not create printed Wonder Tag receipts',()=>{
  const x=fixture();
  const r=observe(()=>{
    const other=new x.FakeLele();
    other.fullName='Different Pokémon';
    other.reduceEffect(x.store,x.state,
      new x.FakePlayPokemonEffect(x.players[0],other));
    return null;
  },x);
  assert.equal(r.audit.printedEntrances,0);
  assert.equal(r.audit.shufflePromptsOffered,0);
});

test('real callback failure cannot certify physical shuffle completion',()=>{
  const x=fixture();
  x.players[0].deck.applyOrder=()=>{throw Error('invalid shuffle order');};
  const r=observe(()=>{
    x.play(0);
    assert.throws(()=>x.prompts[0].callback([1,2]),/invalid shuffle order/);
  },x);
  assert.equal(r.audit.shuffleCallbacksFailed,1);
  assert.equal(r.audit.shuffleCallbacksCompleted,0);
  assert.equal(r.audit.outstandingShuffleCallbacks,0);
  assert.strictEqual(x.FakeLele.prototype.reduceEffect,x.original);
});

test('native run failure restores the exact original class hook',()=>{
  const x=fixture();
  assert.throws(()=>observe(()=>{x.play(0);throw Error('native abort');},x),
    /native abort/);
  assert.strictEqual(x.FakeLele.prototype.reduceEffect,x.original);
});

test('replayed accepted shuffle callback is rejected instead of double counted',()=>{
  const x=fixture();
  const r=observe(()=>{
    x.play(0);
    x.prompts[0].callback([2,1,0]);
    assert.throws(()=>x.prompts[0].callback([3,2,1]),
      /Native Wonder Tag shuffle callback replayed/);
  },x);
  assert.equal(r.audit.shuffleCallbacksCompleted,1);
  assert.equal(r.audit.shufflePromptsOffered,1);
  assert.equal(r.audit.outstandingShuffleCallbacks,0);
});

test('one real registered native trial identifies both shuffle offer and callback',()=>{
  const x=fixture();
  const id='11:103:B:champion-reference';
  const r=observe(()=>{
    x.play(1);
    x.prompts[0].callback([0,2,1]);
  },{...x,getCurrentTrialId:()=>id});
  assert.equal(r.audit.nativeTrialAttributionAvailable,true);
  assert.deepEqual(r.audit.offeredTrialSeats,[{id,seat:1}]);
  assert.deepEqual(r.audit.completedTrialSeats,[{id,seat:1}]);
  assert.equal(r.audit.shuffleCallbacksCompleted,1);
});

test('callback originating in another registered native trial is rejected',()=>{
  const x=fixture(),id='6:101:B:champion-reference';
  let current=id;
  const r=observe(()=>{
    x.play(0);
    current='11:103:B:champion-reference';
    assert.throws(()=>x.prompts[0].callback([1,2,0]),
      /Native Wonder Tag shuffle callback crossed registered trials/);
  },{...x,getCurrentTrialId:()=>current});
  assert.deepEqual(r.audit.offeredTrialSeats,[{id,seat:0}]);
  assert.equal(r.audit.shuffleCallbacksCompleted,0);
  assert.deepEqual(r.audit.completedTrialSeats,[]);
});

test('invalid shuffle permutation is reported even if native callback completes',()=>{
  const x=fixture();
  const r=observe(()=>{
    x.play(0);
    x.prompts[0].callback([0,0,2]);
  },x);
  assert.equal(r.audit.shuffleCallbacksCompleted,1);
  assert.equal(r.audit.validShuffleCallbacksCompleted,0);
  assert.equal(r.audit.invalidNativeShufflePermutations,1);
  assert.equal(r.audit.outstandingShuffleCallbacks,0);
});
