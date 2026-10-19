'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {evolutionAttackResponses,publicBenchNames}=
  require('../simulation/twinleaf/rank2-gh-search-attack-response.cjs');

function game(){
  return {
    publicAttackTransitions:[{
      actionOrdinal:50,turnBefore:7,triggerPlayerSlot:1,
      initiatingRootActionOrdinal:50,promptPendingAfter:true,
      declarations:[{attackName:'Evolution',playerName:'research-B'}],
      before:[{active:{name:'Shadow Rider Calyrex VMAX'},bench:[]},
        {active:{name:'Bunnelby'},bench:[
          {name:'Oddish'},{name:'Pidgey'}]}],
      settled:{completionRootActionOrdinal:53,
        after:[{active:{name:'Shadow Rider Calyrex VMAX'},bench:[]},
          {active:{name:'Bunnelby'},bench:[
            {name:'Gloom'},{name:'Pidgeotto'}]}]}
    }],
    rootActionLedger:[
      {actionOrdinal:51,turnBefore:7,playerSlot:1,action:'ResolvePromptAction'},
      {actionOrdinal:53,turnBefore:7,playerSlot:1,action:'ResolvePromptAction'},
      {actionOrdinal:54,turnBefore:8,playerSlot:0,action:'PlayCardAction',
        card:'Fog Crystal'},
      {actionOrdinal:55,turnBefore:8,playerSlot:0,action:'AttackAction',
        attack:'Max Geist'}
    ]
  };
}

test('closed Evolution source Store declaration exposes two printed Stage changes and opponent root',()=>{
  const rows=evolutionAttackResponses(game(),1);
  assert.equal(rows.length,1);
  const row=rows[0];
  assert.equal(row.promptPendingAfterDispatch,true);
  assert.equal(row.promptChainClosed,true);
  assert.deepEqual(row.changedBenchStages,[
    {position:0,from:'Oddish',to:'Gloom'},
    {position:1,from:'Pidgey',to:'Pidgeotto'}
  ]);
  assert.deepEqual(row.opposingFirstFollowingRoot,{
    actionOrdinal:54,globalTurn:8,action:'PlayCardAction',
    card:'Fog Crystal',attack:null,ability:null
  });
});

test('open Evolution prompt is explicitly unverified and cannot inherit later public board',()=>{
  const f=game();
  f.publicAttackTransitions[0].settled=null;
  const row=evolutionAttackResponses(f,1)[0];
  assert.equal(row.promptChainClosed,false);
  assert.equal(row.afterBench,null);
  assert.deepEqual(row.changedBenchStages,[]);
  assert.equal(row.opposingFirstFollowingRoot,null);
});

test('wrong seat or a non-Evolution source attack cannot fabricate witness',()=>{
  const f=game();
  assert.deepEqual(evolutionAttackResponses(f,0),[]);
  f.publicAttackTransitions[0].declarations[0].attackName='Burrow';
  assert.deepEqual(evolutionAttackResponses(f,1),[]);
});

test('opponent action before confirmed prompt closure cannot count as response',()=>{
  const f=game();
  f.rootActionLedger[2].turnBefore=7;
  const row=evolutionAttackResponses(f,1)[0];
  assert.equal(row.opposingFirstFollowingRoot.actionOrdinal,55);
});

test('public Bench projection preserves reported slot order',()=>{
  assert.deepEqual(publicBenchNames([{bench:[{name:'A'}]},{bench:[{name:'B'},{name:'C'}]}],1),['B','C']);
  assert.deepEqual(publicBenchNames([],0),[]);
});
