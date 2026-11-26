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

test('scores a terminal state reached on the final allowed action ply',()=>{
  let terminalValueCalls=0,heuristicCalls=0;
  const search=createInformationSetMcts({
    iterations:1,maxPlies:1,seed:17,
    observe:(s,seat)=>({seat,terminal:s.terminal}),
    activeSeat:s=>s.seat,
    enumerateActions:()=>[{name:'win'}],
    actionKey:a=>a.name,
    sampleDeterminization:s=>({...s}),
    applyAction:s=>({...s,seat:1,terminal:true,winner:0}),
    isTerminal:s=>s.terminal,
    terminalValue:(s,seat)=>{
      terminalValueCalls++;
      return s.winner===seat?1:-1;
    },
    evaluateObservation:()=>{
      heuristicCalls++;
      return -1;
    }
  });
  const result=search.search({seat:0,terminal:false,winner:null},0);
  assert.equal(terminalValueCalls,1);
  assert.equal(heuristicCalls,0);
  assert.equal(result.audit.terminalRollouts,1);
  assert.equal(result.audit.heuristicLeaves,0);
  assert.equal(result.audit.completedIterations,1);
  assert.equal(result.audit.maxActionTransitions,1);
  assert.deepEqual(result.audit.seatActionTransitions,[1,0]);
  assert.equal(result.audit.rootActions[0].meanValue,1,
    'terminal winner value must be backpropagated to the acting root seat');
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


function winnerVector(state) {
  if (state.terminalClass === 'adjudicated-draw') return [0, 0];
  if (state.terminalClass === 'seat-0-win') return [1, 0];
  if (state.terminalClass === 'seat-1-win') return [0, 1];
  throw new Error('Terminal state lacks an explicit adjudication class');
}

test('seat-win-probability objective prefers actual wins over draw-heavy win-minus-loss score',()=>{
  function run(valueMode) {
    const config={
      iterations:2400,maxPlies:1,seed:20261126,cPuct:1.4,
      observe:(state,seat)=>({seat,terminal:state.terminal}),
      activeSeat:state=>state.seat,
      enumerateActions:()=>[{name:'draw-heavy'},{name:'balanced'}],
      actionKey:action=>action.name,
      redeterminize:(state,seat,random)=>({...state,roll:random()}),
      applyAction:(state,action)=>{
        const winner=action.name==='draw-heavy' ?
          (state.roll<0.4?0:null) :
          (state.roll<0.5?0:1);
        return {
          ...state,
          terminal:true,
          winner,
          terminalClass:winner===null?'adjudicated-draw':'seat-'+winner+'-win'
        };
      },
      isTerminal:state=>state.terminal,
      evaluateObservation:()=>0,
      terminalValue:(state,seat)=>{
        if(state.terminalClass==='adjudicated-draw')return 0;
        if(state.winner===seat)return 1;
        if(state.winner===1-seat)return -1;
        throw new Error('Terminal state lacks an explicit adjudication class');
      },
      evaluateObservationValues:()=>[0,0],
      terminalValues:winnerVector
    };
    if(valueMode)config.valueMode='seat-win-probability';
    return createInformationSetMcts(config).search(
      {seat:0,terminal:false,winner:null},0);
  }
  const legacy=run(false);
  const winRate=run(true);
  assert.equal(legacy.actionKey,'draw-heavy',
    'zero-sum margin treats a draw as neutral and can prefer a high-draw line');
  assert.equal(winRate.actionKey,'balanced',
    'the general-sum objective must maximize seat 0 actual win probability');
  assert.equal(winRate.audit.valueMode,'seat-win-probability');
  assert.equal(winRate.audit.searchMode,'two-sided-puct');
  assert.equal(winRate.audit.objectiveProtocol,
    'each-seat-maximizes-own-win-probability-adjudicated-draws-zero-v1');
  assert.ok(winRate.audit.rootActions.find(row=>row.actionKey==='balanced').meanValue >
    winRate.audit.rootActions.find(row=>row.actionKey==='draw-heavy').meanValue);
});

test('general-sum PUCT makes the opponent choose its own win-probability best response',()=>{
  const search=createInformationSetMcts({
    valueMode:'seat-win-probability',
    iterations:2400,maxPlies:2,seed:20261127,cPuct:1.4,
    observe:(state,seat)=>({
      seat,entered:state.entered===true,terminal:state.terminal===true
    }),
    activeSeat:state=>state.seat,
    enumerateActions:(state,seat)=>seat===0?
      [{name:'enter'}]:[{name:'draw-heavy'},{name:'balanced'}],
    actionKey:action=>action.name,
    redeterminize:(state,seat,random)=>({...state,roll:random()}),
    applyAction:(state,action)=>{
      if(state.seat===0)return {...state,seat:1,entered:true};
      const winner=action.name==='draw-heavy'?
        (state.roll<0.4?1:null):
        (state.roll<0.5?1:0);
      return {
        ...state,terminal:true,winner,
        terminalClass:winner===null?'adjudicated-draw':'seat-'+winner+'-win'
      };
    },
    isTerminal:state=>state.terminal,
    terminalValues:winnerVector,
    evaluateObservationValues:()=>[0,0]
  });
  const result=search.search({
    seat:0,entered:false,terminal:false,winner:null
  },0);
  const opponentChoices=result.audit.rolloutPaths.flatMap(path=>path.actions)
    .filter(action=>action.seat===1);
  const counts=opponentChoices.reduce((out,action)=>{
    out[action.actionKey]=(out[action.actionKey]??0)+1;
    return out;
  },{});
  assert.ok((counts.balanced??0)>(counts['draw-heavy']??0),
    'seat 1 must maximize its own win probability, not its win-minus-loss margin');
  assert.equal(result.audit.seatActionTransitions[0],result.audit.rootVisits);
  assert.ok(result.audit.seatActionTransitions[1]>0);
});

test('seat-win-probability values reject malformed and out-of-range payoffs',()=>{
  const search=createInformationSetMcts({
    valueMode:'seat-win-probability',
    iterations:1,maxPlies:1,
    observe:(state,seat)=>({seat}),
    activeSeat:state=>state.seat,
    enumerateActions:()=>[{name:'finish'}],
    actionKey:action=>action.name,
    redeterminize:state=>({...state}),
    applyAction:state=>({...state,terminal:true}),
    isTerminal:state=>state.terminal,
    terminalValues:()=>[1,1.01],
    evaluateObservationValues:()=>[0,0]
  });
  assert.throws(()=>search.search({seat:0,terminal:false},0),
    /within \[0, 1\]/);
  const overSum=createInformationSetMcts({
    valueMode:'seat-win-probability',
    iterations:1,maxPlies:1,
    observe:(state,seat)=>({seat}),
    activeSeat:state=>state.seat,
    enumerateActions:()=>[{name:'finish'}],
    actionKey:action=>action.name,
    redeterminize:state=>({...state}),
    applyAction:state=>({...state,terminal:true}),
    isTerminal:state=>state.terminal,
    terminalValues:()=>[0.6,0.6],
    evaluateObservationValues:()=>[0,0]
  });
  assert.throws(()=>overSum.search({seat:0,terminal:false},0),
    /cannot sum to more than one/);
  const unclassified=createInformationSetMcts({
    valueMode:'seat-win-probability',
    iterations:1,maxPlies:1,
    observe:(state,seat)=>({seat}),
    activeSeat:state=>state.seat,
    enumerateActions:()=>[{name:'finish'}],
    actionKey:action=>action.name,
    redeterminize:state=>({...state}),
    applyAction:state=>({...state,terminal:true,winner:null}),
    isTerminal:state=>state.terminal,
    terminalValues:winnerVector,
    evaluateObservationValues:()=>[0,0]
  });
  assert.throws(()=>unclassified.search({seat:0,terminal:false},0),
    /lacks an explicit adjudication class/);
});


test('general-sum mode supports a root best response against a frozen opponent policy',()=>{
  let opponentPolicyCalls=0;
  const search=createInformationSetMcts({
    valueMode:'seat-win-probability',
    iterations:240,maxPlies:2,seed:20261201,
    opponentPolicyId:'frozen-opponent-response-fixture-v1',
    opponentActionPolicy:(observation,actionKeys,seat)=>{
      assert.equal(seat,1);
      opponentPolicyCalls++;
      return actionKeys[0];
    },
    observe:(state,seat)=>({seat,candidateChoice:state.candidateChoice??null}),
    activeSeat:state=>state.seat,
    enumerateActions:(state,seat)=>seat===0?
      [{name:'safe'},{name:'risky'}]:
      [{name:'response-left'},{name:'response-right'}],
    actionKey:action=>action.name,
    redeterminize:(state,seat,random)=>({...state,roll:random()}),
    applyAction:(state,action)=>{
      if(state.seat===0)return {
        ...state,seat:1,candidateChoice:action.name
      };
      const winner=state.candidateChoice==='safe'?0:1;
      return {
        ...state,terminal:true,winner,
        terminalClass:'seat-'+winner+'-win'
      };
    },
    isTerminal:state=>state.terminal===true,
    terminalValues:winnerVector,
    evaluateObservationValues:()=>[0.5,0.5]
  });
  const result=search.search({
    seat:0,terminal:false,candidateChoice:null
  },0);
  assert.equal(result.actionKey,'safe');
  assert.ok(opponentPolicyCalls>0);
  assert.equal(result.audit.searchMode,
    'root-best-response-fixed-opponent-policy');
  assert.equal(result.audit.opponentPolicyId,
    'frozen-opponent-response-fixture-v1');
});
