'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {PREFIX,createPublicEndstateObserver}=
  require('../simulation/evaluation/agent1-v14-public-endstate-observer.cjs');

function game(){
  return {finished:true,endReason:'engine-game-end',winner:1,
    prizesRemaining:[6,6],finalState:[
      {deckRemaining:0,handSize:2,activePokemon:'Girafarig',
        benchedPokemon:['Latias ex']},
      {deckRemaining:15,handSize:6,activePokemon:'Mega Absol ex',
        benchedPokemon:['Garbodor']}
    ]};
}

test('true native root result produces only public counts and active/bench names',()=>{
  const native=game();
  const calls=[];
  const headless={runMatch(request){calls.push(request);return native;}};
  const original=headless.runMatch;
  const instrument=createPublicEndstateObserver({headless});
  const request={label:PREFIX+'11:202:A:champion-reference'};
  const received=instrument.run(()=>headless.runMatch(request));
  assert.strictEqual(received,native);
  assert.strictEqual(headless.runMatch,original);
  assert.deepEqual(calls,[request]);
  assert.equal(instrument.observations.length,1);
  assert.deepEqual(instrument.observations[0],{
    id:'11:202:A:champion-reference',nativeReturned:true,
    publicNativeStateAvailable:true,opaqueAbort:false,
    nativeFinished:true,nativeEndReason:'engine-game-end',
    nativeWinner:1,nativePrizesBySeat:[6,6],
    publicDeckCountsBySeat:[0,15],publicHandCountsBySeat:[2,6],
    publicActiveNamesBySeat:['Girafarig','Mega Absol ex'],
    publicBenchNamesBySeat:[['Latias ex'],['Garbodor']]
  });
  assert.equal(JSON.stringify(instrument.observations).includes('private'),false);
});

test('native throw is rethrown with only opaque abort, then restores exact hook',()=>{
  const cause=Error('native engine error with concealed card');
  const headless={runMatch(){throw cause;}};
  const old=headless.runMatch;
  const obs=createPublicEndstateObserver({headless});
  assert.throws(()=>obs.run(()=>headless.runMatch({
    label:PREFIX+'6:201:B:new-moon-lockbreaker-v1'})),e=>e===cause);
  assert.strictEqual(headless.runMatch,old);
  assert.deepEqual(obs.observations,[{
    id:'6:201:B:new-moon-lockbreaker-v1',nativeReturned:false,
    publicNativeStateAvailable:false,opaqueAbort:true
  }]);
  assert.equal(JSON.stringify(obs.observations).includes('concealed'),false);
});

test('nonregistered native labels are never promoted to registered evidence',()=>{
  const headless={runMatch:()=>game()};
  const obs=createPublicEndstateObserver({headless});
  const ret=obs.run(()=>headless.runMatch({label:'other-native-run'}));
  assert.equal(ret.finished,true);
  assert.deepEqual(obs.observations,[]);
});

test('missing final owner counts refuse public endstate availability',()=>{
  const native=game();
  native.finalState[0].deckRemaining=undefined;
  const headless={runMatch:()=>native};
  const obs=createPublicEndstateObserver({headless});
  obs.run(()=>headless.runMatch({label:PREFIX+'test'}));
  assert.equal(obs.observations[0].publicNativeStateAvailable,false);
  assert.equal('publicDeckCountsBySeat' in obs.observations[0],false);
});

test('the actual original headless method is restored even if execute throws',()=>{
  const headless={runMatch:()=>game()};
  const original=headless.runMatch;
  const obs=createPublicEndstateObserver({headless});
  assert.throws(()=>obs.run(()=>{throw Error('inner runner aborted');}),
    /inner runner aborted/);
  assert.strictEqual(headless.runMatch,original);
  assert.deepEqual(obs.observations,[]);
});

test('capped native result cannot publish an unfinished Store winner sentinel',()=>{
  const unfinished=game();
  unfinished.finished=false;
  unfinished.winner=0;
  unfinished.endReason='action-limit';
  const headless={runMatch:()=>unfinished};
  const obs=createPublicEndstateObserver({headless});
  obs.run(()=>headless.runMatch({label:PREFIX+'native-capped'}));
  assert.equal(obs.observations[0].nativeFinished,false);
  assert.equal(obs.observations[0].nativeWinner,null);
  assert.equal(obs.observations[0].nativeEndReason,'action-limit');
});
