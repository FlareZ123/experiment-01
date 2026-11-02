'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  scheduledArms,validateSource,rootPublic,
  summarizeGame,classifyPair
}=require('../simulation/evaluation/agent39-rank16-direct-source-shake.cjs');

test('preregistered source groups remain exactly 32 and 64 candidate arms',()=>{
  const arms=scheduledArms();
  assert.equal(arms.length,64);
  assert.equal(new Set(arms.map(a=>a.id)).size,64);
  assert.equal(new Set(arms.map(a=>a.seed)).size,32);
  for(let i=0;i<64;i+=2){
    assert.equal(arms[i].group,arms[i+1].group);
    assert.equal(arms[i].sourceSeat,arms[i+1].sourceSeat);
    assert.equal(arms[i].seed,arms[i+1].seed);
    assert.deepEqual([arms[i].candidateId,arms[i+1].candidateId],
      ['champion-reference','new-moon-lockbreaker-v1']);
  }
});

test('all 32 source seeds are strictly in the registered uint32 domain',()=>{
  const arms=scheduledArms();
  const ids=new Set();
  for(const [i,arm] of arms.entries()){
    assert.ok(arm.seed>=0&&arm.seed<=0xffffffff);
    assert.equal(arm.sourceSeat,Math.floor(i/2)%2);
    assert.equal(arm.group,Math.floor(i/2));
    ids.add(arm.group);
  }
  assert.equal(ids.size,32);
});

test('rank16 original roster hash, printed 60 and source player preserved',()=>{
  assert.equal(validateSource().rank,16);
});

test('a native engine error remains an error, not a game result',()=>{
  const q={error:{message:'Store rejection'},game:null};
  assert.equal(classifyPair(q,q,null),'NATIVE_ERROR');
});

test('unknown physical source deal and mismatched source deal veto pairing',()=>{
  const blank={error:null,game:{sourceDeal:null}};
  assert.equal(classifyPair(blank,blank,null),'SOURCE_DEAL_UNVERIFIED');
  const x={error:null,game:{sourceDeal:{digest:'x'},
    decisionTraceSha256:'a'}};
  const y={error:null,game:{sourceDeal:{digest:'y'},
    decisionTraceSha256:'a'}};
  assert.equal(classifyPair(x,y,{opportunityTurn:1,completed:true}),
    'SOURCE_DEAL_DIFFERENT');
});

test('only a no-offer identical native root transcript passes parity',()=>{
  const c={error:null,game:{sourceDeal:{digest:'same'},
    decisionTraceSha256:'a'}};
  const t={error:null,game:{sourceDeal:{digest:'same'},
    decisionTraceSha256:'b'}};
  assert.equal(classifyPair(c,c,{opportunityTurn:null}),
    'NO_OPPORTUNITY_TRACE_IDENTICAL');
  assert.equal(classifyPair(c,t,{opportunityTurn:null}),
    'NO_OPPORTUNITY_TRACE_DIFFERENT');
});

test('source-selected attempted, aborted and complete are different phases',()=>{
  const game={sourceDeal:{sha:'stable'},decisionTraceSha256:'1'};
  const c={error:null,game};
  assert.equal(classifyPair(c,c,{opportunityTurn:2,completed:true}),
    'NATIVE_DIRECT_LOCK_LINE_OBSERVED');
  assert.equal(classifyPair(c,c,{opportunityTurn:2,completed:false,
    aborted:{step:'garbodor-search'}}),'OWNER_SELECTED_LINE_ABORTED');
  assert.equal(classifyPair(c,c,{opportunityTurn:2,completed:false,aborted:null}),
    'OWNER_SELECTED_LINE_INCOMPLETE');
});

test('accepted public roots exclude pending prompt decisions and other player',()=>{
  const root={
    actionOrdinal:2,turnBefore:2,playerSlot:1,
    pendingPrompt:null,action:'PlayCardAction',card:'Boost Shake EVS'
  };
  const game={
    firstTurnSlot:0,finished:false,actions:6,
    rootActionLedger:[
      {...root,actionOrdinal:0,playerSlot:0},
      {...root,actionOrdinal:1,action:'ResolvePromptAction',pendingPrompt:'ChooseCardsPrompt'},
      root,{...root,actionOrdinal:3,turnBefore:3}
    ],
    decisionTrace:[],
    initialSourceDealFingerprint:{digest:'source'},
    initialFullPhysicalDealFingerprint:{digest:'all'}
  };
  const projected=summarizeGame(game,1);
  assert.equal(projected.firstSourceOwnTurn,2);
  assert.equal(projected.sourceRootsObserved,1);
  assert.equal(projected.firstSourceRootActions[0].card,'Boost Shake EVS');
  assert.equal(projected.nativeGameWinnerExcludedFromResearchOutcome,true);
  assert.deepEqual(rootPublic(root),{
    ordinal:2,turn:2,seat:1,action:'PlayCardAction',
    card:'Boost Shake EVS',attack:null
  });
});
