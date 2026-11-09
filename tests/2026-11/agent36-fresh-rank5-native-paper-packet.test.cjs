'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {commonSourceFundingOptions,preflight,runFreshPacket} =
  require('../../simulation/evaluation/agent36-fresh-rank5-native-paper-packet.cjs');

function player(seat) {
  return {id:seat+101,deck:{cards:Array.from({length:60},(_,i)=>
      ({fullName:'Physical '+seat+'-'+i}))},
    hand:{cards:[]},discard:{cards:[]},lostzone:{cards:[]},
    stadium:{cards:[]},supporter:{cards:[]},
    prizes:Array.from({length:6},()=>({cards:[]})),
    active:{cards:[],tools:[]},bench:[]};
}

test('four prospective 32-bit rank5 physical deals remain frozen',()=>{
  const reg=preflight();
  assert.equal(reg.groups.length,4);
  assert.deepEqual(reg.groups.map(x=>x.candidateSlot),['A','B','A','B']);
});

test('all Mew actor mechanics are selected symmetrically for both owners',()=>{
  const config=commonSourceFundingOptions();
  assert.equal(config.actorMewDceRecipientRoot,true);
  assert.equal(config.actorMewGenesectTechnoBlast,true);
  assert.equal(config.sourceScopedQuickBallRoot,false);
  assert.ok(Object.keys(config)
    .filter(k=>k.endsWith('SourceOnly')).every(k=>config[k]===false));
});

test('registered batch wires four distinct real Store receipts, without fake wins',()=>{
  // Provide the native runner callback separately, as runNativeBatch does.
  const nativeBatch=(enable,runner,extra)=>{
    const rows=[];
    for(const trial of extra.registeredTrials) {
      const state={players:[],phase:'SETUP',turn:0,activePlayer:0,prompts:[]};
      const store={state,dispatch(action) {
        if(action.type==='AddPlayerAction')
          state.players.push(player(state.players.length));
      }};
      const row=runner({
        registeredTrials:extra.registeredTrials,
        registeredFrameName:extra.registeredFrameName,
        seed:trial.seed,
        actualTestStore:store,
        actualTrialId:trial.id
      });
      rows.push(row);
    }
    return {selected:{
      manifest:{observedTwinleafGitCommit:
        'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05'},
      rawDevelopment:{rows}
    }};
  };
  const run=opts=>{
    const store=opts.actualTestStore;
    opts.onRootStoreCreated(store,opts.actualTrialId);
    store.dispatch({type:'AddPlayerAction'});
    store.dispatch({type:'AddPlayerAction'});
    store.state.turn=1;
    store.state.phase='PLAYER_TURN';
    const action={};
    store.dispatch(action);
    opts.onRootActionDispatched(store,action,0,0,1);
    const trial=opts.registeredTrials.find(x=>x.id===opts.actualTrialId);
    return {trial,sourceSeat:trial.candidateSlot==='A'?1:0,
      candidateSeat:trial.candidateSlot==='A'?0:1,
      finished:false,rootActionLedger:[{actionOrdinal:0,playerSlot:0,
        turnBefore:1,action:'Object'}]};
  };
  const result=runFreshPacket({nativeBatch,run});
  assert.equal(result.initialPhysicalStoreGameCount,4);
  assert.equal(result.joinedNativeGames,4);
  assert.equal(result.cleanOriginalPhysicalGames,4);
  assert.equal(result.exactNativeActionReceiptCount,4);
  assert.equal(result.terminalNativeGames,0);
  assert.equal(result.paperQualifiedGames,0);
});
