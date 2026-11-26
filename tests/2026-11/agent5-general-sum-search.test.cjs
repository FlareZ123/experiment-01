'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {createInformationSetMcts} = require('../../simulation/twinleaf/2026-11/agent5-information-set-mcts.cjs');

function winnerOutcome(state) {
  if (state.terminalClass === 'adjudicated-draw') return {
    kind:'adjudicated-draw',
    ruleId:'synthetic-adjudicated-draw-v1',
    reason:'draw fixture explicitly adjudicated',
    evidenceId:'synthetic-draw-fixture'
  };
  if (state.terminalClass === 'seat-0-win') return {kind:'seat-win',winnerSeat:0};
  if (state.terminalClass === 'seat-1-win') return {kind:'seat-win',winnerSeat:1};
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
      terminalOutcome:winnerOutcome,
      terminalOutcomeProtocolId:'test-terminal-outcome-v1'
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
    terminalOutcomeProtocolId:'test-terminal-outcome-v1',
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
    terminalOutcome:winnerOutcome,
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
    terminalOutcomeProtocolId:'test-terminal-outcome-v1',
    iterations:1,maxPlies:1,
    observe:(state,seat)=>({seat}),
    activeSeat:state=>state.seat,
    enumerateActions:()=>[{name:'finish'}],
    actionKey:action=>action.name,
    redeterminize:state=>({...state}),
    applyAction:state=>({...state,terminal:true}),
    isTerminal:state=>state.terminal,
    terminalOutcome:()=>({kind:'seat-win',winnerSeat:2}),
    evaluateObservationValues:()=>[0,0]
  });
  assert.throws(()=>search.search({seat:0,terminal:false},0),
    /winnerSeat must be 0 or 1/);
  const overSum=createInformationSetMcts({
    valueMode:'seat-win-probability',
    terminalOutcomeProtocolId:'test-terminal-outcome-v1',
    iterations:1,maxPlies:1,
    observe:(state,seat)=>({seat}),
    activeSeat:state=>state.seat,
    enumerateActions:()=>[{name:'finish'}],
    actionKey:action=>action.name,
    redeterminize:state=>({...state}),
    applyAction:state=>({...state,terminal:false}),
    isTerminal:state=>state.terminal,
    terminalOutcome:()=>({kind:'seat-win',winnerSeat:0}),
    evaluateObservationValues:()=>[0.6,0.6]
  });
  assert.throws(()=>overSum.search({seat:0,terminal:false},0),
    /cannot sum to more than one/);
  const unclassified=createInformationSetMcts({
    valueMode:'seat-win-probability',
    terminalOutcomeProtocolId:'test-terminal-outcome-v1',
    iterations:1,maxPlies:1,
    observe:(state,seat)=>({seat}),
    activeSeat:state=>state.seat,
    enumerateActions:()=>[{name:'finish'}],
    actionKey:action=>action.name,
    redeterminize:state=>({...state}),
    applyAction:state=>({...state,terminal:true,winner:null}),
    isTerminal:state=>state.terminal,
    terminalOutcome:()=>({kind:'unresolved'}),
    evaluateObservationValues:()=>[0,0]
  });
  assert.throws(()=>unclassified.search({seat:0,terminal:false},0),
    /kind must be seat-win or adjudicated-draw/);
});


test('general-sum mode supports a root best response against a frozen opponent policy',()=>{
  let opponentPolicyCalls=0;
  const search=createInformationSetMcts({
    valueMode:'seat-win-probability',
    terminalOutcomeProtocolId:'test-terminal-outcome-v1',
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
    terminalOutcome:winnerOutcome,
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


test('seat-win-probability two-sided PUCT is symmetric for rootSeat 0 and 1',()=>{
  for(const rootSeat of [0,1]) {
    const search=createInformationSetMcts({
      valueMode:'seat-win-probability',
      terminalOutcomeProtocolId:'test-terminal-outcome-v1',
      iterations:96,maxPlies:1,seed:0x5ea700+rootSeat,cPuct:1.4,
      observe:(state,seat)=>({
        actorSeat:seat,rootSeat:state.rootSeat,turn:state.turn
      }),
      activeSeat:state=>state.seat,
      enumerateActions:()=>[{name:'win'},{name:'lose'}],
      actionKey:action=>action.name,
      redeterminize:state=>({...state}),
      applyAction:(state,action)=>{
        const winner=action.name==='win'?rootSeat:1-rootSeat;
        return {
          ...state,terminal:true,winner,
          terminalClass:'seat-'+winner+'-win'
        };
      },
      isTerminal:state=>state.terminal===true,
      terminalOutcome:winnerOutcome,
      evaluateObservationValues:()=>[0,0]
    });
    const result=search.search({
      seat:rootSeat,rootSeat,turn:1,terminal:false
    },rootSeat);
    assert.equal(result.actionKey,'win');
    assert.equal(result.audit.rootSeat,rootSeat);
    assert.equal(result.audit.searchMode,'two-sided-puct');
    assert.equal(result.audit.valueMode,'seat-win-probability');
    const winning=result.audit.rootActions.find(row=>row.actionKey==='win');
    const losing=result.audit.rootActions.find(row=>row.actionKey==='lose');
    assert.ok(winning.meanValue>losing.meanValue,
      'each physical root seat must maximize its own win-probability component');
  }
});

test('fixed-opponent best response crosses both root seats and actor-relative redeterminization',()=>{
  for(const rootSeat of [0,1]) {
    const policySeats=[];
    const redeterminized=[0,0];
    const search=createInformationSetMcts({
      valueMode:'seat-win-probability',
      terminalOutcomeProtocolId:'test-terminal-outcome-v1',
      iterations:128,maxPlies:2,seed:0x51de000+rootSeat,
      opponentPolicyId:'fixed-pass-cross-seat-v1',
      opponentActionPolicy:(observation,actionKeys,seat)=>{
        policySeats.push(seat);
        assert.equal(observation.actorSeat,seat);
        assert.ok(actionKeys.includes('pass'));
        return 'pass';
      },
      observe:(state,seat)=>({
        actorSeat:seat,rootSeat:state.rootSeat,
        lastAction:state.lastAction??null
      }),
      activeSeat:state=>state.seat,
      enumerateActions:(state,seat)=>seat===rootSeat?
        [{key:'attack'},{key:'concede'}]:
        [{key:'pass'},{key:'counter'}],
      actionKey:action=>action.key,
      redeterminize:(state,seat)=> {
        redeterminized[seat]++;
        return {...state};
      },
      applyAction:(state,action)=>{
        if(state.seat===rootSeat) {
          return {...state,seat:1-rootSeat,lastAction:action.key};
        }
        const winner=state.lastAction==='attack'?rootSeat:1-rootSeat;
        return {
          ...state,terminal:true,winner,
          terminalClass:'seat-'+winner+'-win'
        };
      },
      isTerminal:state=>state.terminal===true,
      terminalOutcome:winnerOutcome,
      evaluateObservationValues:()=>[0,0]
    });
    const result=search.search({
      seat:rootSeat,rootSeat,lastAction:null,terminal:false
    },rootSeat);
    assert.equal(result.actionKey,'attack');
    assert.equal(result.audit.searchMode,
      'root-best-response-fixed-opponent-policy');
    assert.equal(result.audit.opponentPolicyId,'fixed-pass-cross-seat-v1');
    assert.ok(policySeats.length>0);
    assert.ok(policySeats.every(seat=>seat===1-rootSeat),
      'the frozen response policy must be called only for the non-root physical seat');
    assert.ok(redeterminized[rootSeat]>0);
    assert.ok(redeterminized[1-rootSeat]>0);
    assert.ok(result.audit.actorRelativeDeterminizationCallsBySeat[rootSeat]>0);
    assert.ok(result.audit.actorRelativeDeterminizationCallsBySeat[1-rootSeat]>0);
    assert.ok(result.audit.seatActionTransitions[rootSeat]>0);
    assert.ok(result.audit.seatActionTransitions[1-rootSeat]>0);
  }
});

test('terminal win-probability vectors reject fractional estimates',()=>{
  const search=createInformationSetMcts({
    valueMode:'seat-win-probability',
    terminalOutcomeProtocolId:'test-terminal-outcome-v1',
    iterations:1,maxPlies:1,
    observe:(state,seat)=>({actorSeat:seat}),
    activeSeat:state=>state.seat,
    enumerateActions:()=>[{name:'finish'}],
    actionKey:action=>action.name,
    redeterminize:state=>({...state}),
    applyAction:state=>({...state,terminal:true}),
    isTerminal:state=>state.terminal===true,
    terminalOutcome:()=>[0,0],
    evaluateObservationValues:()=>[0.5,0.5]
  });
  assert.throws(()=>search.search({seat:0,terminal:false},0),
    /must be a typed outcome object/);
});


test('terminal outcomes cannot turn an unclassified state into a draw',()=>{
  for(const outcome of [
    [0,0],
    {kind:'unresolved'},
    {kind:'adjudicated-draw',ruleId:'unversioned',reason:'missing rule version',evidenceId:'fixture-evidence'},
    {kind:'adjudicated-draw',ruleId:'test-draw-v1',reason:'no evidence',evidenceId:''}
  ]) {
    const search=createInformationSetMcts({
      valueMode:'seat-win-probability',
      terminalOutcomeProtocolId:'test-terminal-outcome-v1',
      iterations:1,maxPlies:1,
      observe:(state,seat)=>({actorSeat:seat}),
      activeSeat:state=>state.seat,
      enumerateActions:()=>[{name:'finish'}],
      actionKey:action=>action.name,
      redeterminize:state=>({...state}),
      applyAction:state=>({...state,terminal:true}),
      isTerminal:state=>state.terminal===true,
      terminalOutcome:()=>outcome,
      evaluateObservationValues:()=>[0,0]
    });
    assert.throws(()=>search.search({seat:0,terminal:false},0));
  }
});


test('seat-win-probability mode requires a versioned terminal protocol id',()=>{
  assert.throws(()=>createInformationSetMcts({
    valueMode:'seat-win-probability',
    terminalOutcomeProtocolId:'unversioned',
    terminalOutcome:()=>({kind:'seat-win',winnerSeat:0}),
    evaluateObservationValues:()=>[0,0],
    observe:(state,seat)=>({actorSeat:seat}),
    activeSeat:state=>state.seat,
    enumerateActions:()=>[{name:'pass'}],
    actionKey:action=>action.name,
    applyAction:state=>({...state}),
    isTerminal:state=>false,
    redeterminize:state=>({...state})
  }),/requires a versioned terminalOutcomeProtocolId/);
});


function makeActorSafePromptEvent(transitionActorSeat, actorSeat=transitionActorSeat, token='opaque-choice-'+transitionActorSeat+'-'+actorSeat) {
  return {
    transitionActorSeat,
    actorSeat,
    promptType:'ChooseCardsPrompt',
    actorObservationDigest:'a'.repeat(64),
    promptProjectionDigest:'b'.repeat(64),
    selectedTokens:[token],
    promptPolicyId:'test-prompt-policy-v1',
    nativeValidationSucceeded:true,
    stableSuccessorDigest:'c'.repeat(64)
  };
}

test('rollout prompt receipts are isolated per iteration and prompt RNG cannot perturb transition RNG',()=>{
  function run(extraPromptDraws) {
    const transitionDraws=[];
    const retainedContexts=[];
    const search=createInformationSetMcts({
      iterations:4,maxPlies:2,seed:0x50524f4d,
      opponentPolicyId:'test-finish-policy-v1',
      opponentActionPolicy:(observation,actionKeys,seat)=>{
        assert.equal(seat,1);
        assert.ok(actionKeys.includes('finish'));
        return 'finish';
      },
      observe:(state,seat)=>({
        actorSeat:seat,lastAction:state.lastAction??null
      }),
      activeSeat:state=>state.seat,
      enumerateActions:(state,seat)=>seat===0?
        [{key:'start'}]:[{key:'finish'}],
      actionKey:action=>action.key,
      redeterminize:state=>({...state}),
      applyAction:(state,action,transitionRandom,searchContext,rolloutContext)=>{
        assert.ok(Object.isFrozen(searchContext));
        assert.ok(Object.isFrozen(rolloutContext));
        assert.equal(rolloutContext.transitionActorSeat,state.seat);
        assert.equal(typeof rolloutContext.promptRandom,'function');
        const before=transitionRandom();
        rolloutContext.promptRandom();
        for(let index=0;index<extraPromptDraws;index++)rolloutContext.promptRandom();
        const after=transitionRandom();
        transitionDraws.push({seat:state.seat,before,after});
        retainedContexts.push(rolloutContext);
        rolloutContext.recordPromptEvent(makeActorSafePromptEvent(
          state.seat,1-state.seat,'opaque-'+rolloutContext.iteration+'-'+state.seat));
        if(state.seat===0)return {...state,seat:1,lastAction:'start'};
        return {...state,terminal:true,winner:0};
      },
      isTerminal:state=>state.terminal===true,
      terminalValue:(state,seat)=>state.winner===seat?1:-1,
      evaluateObservation:()=>0
    });
    return {
      result:search.search({seat:0,terminal:false,lastAction:null},0),
      transitionDraws,
      retainedContexts
    };
  }

  const onePromptDraw=run(0);
  const manyPromptDraws=run(7);
  assert.deepEqual(onePromptDraw.transitionDraws,manyPromptDraws.transitionDraws,
    'prompt-policy RNG consumption must not shift engine transition RNG');
  const audit=onePromptDraw.result.audit;
  assert.equal(audit.promptEventSchemaId,'actor-safe-prompt-event-v2');
  assert.equal(audit.promptRandomProtocolId,
    'per-rollout-independent-prompt-policy-rng-v1');
  assert.equal(audit.rolloutPaths.length,4);
  for(const path of audit.rolloutPaths) {
    assert.equal(path.promptEvents.length,2,
      'each fixed-opponent rollout records root and opponent prompt events');
    assert.deepEqual(path.promptEvents.map(event=>event.ordinal),[0,1]);
    assert.deepEqual(path.promptEvents.map(event=>event.transitionActorSeat),[0,1]);
    assert.deepEqual(path.promptEvents.map(event=>event.actorSeat),[1,0]);
    assert.ok(Object.isFrozen(path.promptEvents));
    assert.ok(path.promptEvents.every(event=>Object.isFrozen(event)));
    assert.ok(Object.isFrozen(path.promptEvents[0].selectedTokens));
  }
  assert.notStrictEqual(
    audit.rolloutPaths[1].promptEvents,
    audit.rolloutPaths[2].promptEvents,
    'rollout event arrays must never be shared between iterations'
  );
  assert.throws(()=>onePromptDraw.retainedContexts[0].recordPromptEvent(
    makeActorSafePromptEvent(0)),/only during their action transition/);
  assert.throws(()=>onePromptDraw.retainedContexts[0].promptRandom(),
    /cannot be used outside its action transition/);
});

test('rollout prompt recorder binds transition actor separately from prompt owner and rejects unsanitized payloads',()=>{
  const cases=[
    [makeActorSafePromptEvent(1,0),/transitionActorSeat must match the bound transition actor/],
    [makeActorSafePromptEvent(0,2),/actorSeat must be a physical prompt-owner seat/],
    [{...makeActorSafePromptEvent(0),rawResult:{hiddenCard:'forbidden'}},/exactly the actor-safe allowlisted keys/],
    [{...makeActorSafePromptEvent(0),actorObservationDigest:'not-a-digest'},/64-character SHA-256 hex digest/],
    [{...makeActorSafePromptEvent(0),selectedTokens:[{}]},/opaque token strings/],
    [{...makeActorSafePromptEvent(0),promptPolicyId:'unversioned-policy'},/versioned identifier/],
    [{...makeActorSafePromptEvent(0),nativeValidationSucceeded:false},/only after successful native validation/],
    [{...makeActorSafePromptEvent(0),promptType:''},/short non-empty string/]
  ];
  for(const [event,expected] of cases) {
    const search=createInformationSetMcts({
      iterations:2,maxPlies:1,seed:0x45564e54,
      observe:(state,seat)=>({actorSeat:seat}),
      activeSeat:state=>state.seat,
      enumerateActions:()=>[{key:'finish'}],
      actionKey:action=>action.key,
      redeterminize:state=>({...state}),
      applyAction:(state,action,transitionRandom,searchContext,rolloutContext)=>{
        rolloutContext.recordPromptEvent(event);
        return {...state,terminal:true,winner:0};
      },
      isTerminal:state=>state.terminal===true,
      terminalValue:()=>1,
      evaluateObservation:()=>0
    });
    assert.throws(()=>search.search({seat:0,terminal:false},0),expected);
  }
});
