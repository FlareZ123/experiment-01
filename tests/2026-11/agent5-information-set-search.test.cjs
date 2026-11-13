'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createInformationSetMcts, observationSha256
} = require('../../simulation/twinleaf/2026-11/agent5-information-set-mcts.cjs');

function chanceGame(hidden) {
  return {seat:0, hidden, choice:null, terminal:false, winner:null};
}
function chanceSearch(realHidden) {
  const search = createInformationSetMcts({
    iterations:1200, maxPlies:4, seed:12345, cPuct:1.6,
    observe:(s,seat)=>({seat,choice:s.choice,terminal:s.terminal}),
    activeSeat:s=>s.seat,
    enumerateActions:s=>s.seat===0?[
      {type:'choose',name:'A'},{type:'choose',name:'B'}
    ]:[{type:'resolve'}],
    actionKey:a=>a.name??a.type,
    actionPrior:()=>1,
    sampleDeterminization:(s,seat,rng)=>({
      ...s,hidden:rng()<0.8?'red':'blue'
    }),
    applyAction:(s,a)=>{
      const next={...s};
      if(s.seat===0){next.choice=a.name;next.seat=1;}
      else {
        next.terminal=true;
        next.winner=(next.choice==='A' ? next.hidden==='red' : next.hidden==='blue')?0:1;
      }
      return next;
    },
    isTerminal:s=>s.terminal,
    terminalValue:(s,seat)=>s.winner===seat?1:-1,
    evaluateObservation:()=>0
  });
  return search.search(chanceGame(realHidden),0);
}

test('PUCT selects the higher expected-value action across sampled hidden worlds',()=>{
  const result=chanceSearch('blue');
  assert.equal(result.actionKey,'A');
  assert.equal(result.audit.rootVisits,1200);
  assert.equal(result.audit.rootObservationSha256.length,64);
  assert.ok(result.audit.rootActions.find(x=>x.actionKey==='A').meanValue >
    result.audit.rootActions.find(x=>x.actionKey==='B').meanValue);
});

test('root action is invariant to the real hidden identity for identical observation and seed',()=>{
  const a=chanceSearch('red');
  const b=chanceSearch('blue');
  assert.equal(a.audit.rootObservationSha256,b.audit.rootObservationSha256);
  assert.equal(a.actionKey,b.actionKey);
  assert.deepEqual(a.audit.rootActions,b.audit.rootActions);
});

test('two-player PUCT accounts for an adversarial response',()=>{
  const search=createInformationSetMcts({
    iterations:800,maxPlies:4,seed:77,cPuct:1.4,
    observe:(s,seat)=>({seat,choice:s.choice,terminal:s.terminal}),
    activeSeat:s=>s.seat,
    enumerateActions:s=>s.seat===0?[
      {name:'greedy'},{name:'safe'}
    ]:[{name:'counter'},{name:'pass'}],
    actionKey:a=>a.name,
    sampleDeterminization:(s)=>({...s}),
    applyAction:(s,a)=>{
      const next={...s};
      if(s.seat===0){next.choice=a.name;next.seat=1;}
      else {
        next.terminal=true;
        next.winner=s.choice==='greedy'&&a.name==='counter'?1:
          s.choice==='safe'?null:0;
      }
      return next;
    },
    isTerminal:s=>s.terminal,
    terminalValue:(s,seat)=>s.winner===null?0:s.winner===seat?1:-1,
    evaluateObservation:()=>0
  });
  const result=search.search({seat:0,choice:null,terminal:false,winner:null},0);
  assert.equal(result.actionKey,'safe');
});

test('rejects a determinization that changes the root legal observation',()=>{
  const search=createInformationSetMcts({
    iterations:1,
    observe:s=>({seat:s.seat,hand:s.hand}),
    activeSeat:s=>s.seat,
    enumerateActions:()=>[{name:'pass'}],actionKey:a=>a.name,
    sampleDeterminization:s=>({...s,hand:['different']}),
    applyAction:s=>({...s,terminal:true}),isTerminal:s=>s.terminal,
    terminalValue:()=>0,evaluateObservation:()=>0
  });
  assert.throws(()=>search.search({seat:0,hand:['known'],terminal:false},0),
    /changed the root player/);
});

test('rejects an action frontier that leaks hidden state into an identical observation',()=>{
  let sample=0;
  const search=createInformationSetMcts({
    iterations:2,maxPlies:2,seed:9,
    observe:s=>({seat:s.seat,turn:s.turn}),
    activeSeat:s=>s.seat,
    enumerateActions:s=>s.seat===0?[
      {name:s.hidden==='red'?'red-only':'blue-only'}
    ]:[{name:'finish'}],
    actionKey:a=>a.name,
    sampleDeterminization:s=>({...s,hidden:sample++===0?'red':'blue'}),
    applyAction:s=>({...s,seat:1}),
    isTerminal:s=>s.terminal,
    terminalValue:()=>0,evaluateObservation:()=>0
  });
  assert.throws(()=>search.search({seat:0,turn:1,hidden:'irrelevant',terminal:false},0),
    /frontier depends on hidden state/);
});

test('canonical observation hash ignores object insertion order but preserves arrays',()=>{
  const a={seat:0,board:{active:'A',bench:['B','C']}};
  const b={board:{bench:['B','C'],active:'A'},seat:0};
  const c={seat:0,board:{active:'A',bench:['C','B']}};
  assert.equal(observationSha256(a),observationSha256(b));
  assert.notEqual(observationSha256(a),observationSha256(c));
});
