'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {auditRank6GuzmaPublicBench}=
  require('../simulation/evaluation/agent23-rank6-v10-public-guzma-pivot.cjs');

function attempt(id,seat,opponentBench,sourceFirstAction='PassTurnAction'){
  const source={active:{name:'Iron Thorns ex',energyCards:[]},
    bench:[{name:'Iron Thorns ex',energyCards:[
      'Double Colorless Energy']}],
    stadium:['Thunder Mountain Prism Star']};
  const opponent={active:{name:'Latias ex',energyCards:['Psychic Energy']},
    bench:opponentBench.map(name=>({name,energyCards:[]})),stadium:[]};
  const board=seat===0?[source,opponent]:[opponent,source];
  const archived={id,originalSourceSeat:seat,status:'returned-unqualified',
    actualSourceAttackSettlement:{attacks:[{
      turnBefore:2,attackName:'Volt Cyclone',
      settledPromptChain:true,settlementCrossesClockReset:false,
      publicBoardAfter:board
    }]},
    publicRootActions:[{
      playerSlot:seat,turnBefore:4,action:'ResolvePromptAction'
    },{
      playerSlot:seat,turnBefore:4,action:sourceFirstAction,
      card:sourceFirstAction==='PlayCardAction'?'Spiky Energy':null,
      actionOrdinal:46
    }]};
  Object.defineProperty(archived,'ownerHand',{get(){
    throw new Error('No hidden hand should be read by public-only audit');
  }});
  return archived;
}

test('real-seat invariant: opponent Bench permits only one Guzma precondition',()=>{
  const ids=['first','second'];
  const result=auditRank6GuzmaPublicBench({attempts:[
    attempt(ids[0],0,['Dialga-GX'],'PassTurnAction'),
    attempt(ids[1],1,['Unown','Duskull'],'PlayCardAction')
  ]},ids);
  assert.equal(result.bothOpponentsHaveBench,true);
  assert.deepEqual(result.rows.map(x=>
    x.afterAttackOpposingBenchedPokemon),
  [['Dialga-GX'],['Unown','Duskull']]);
  assert.equal(result.rows[0].firstNativeSourceVoluntaryAction.action,
    'PassTurnAction');
  assert.equal(result.rows[1].firstNativeSourceVoluntaryAction.card,
    'Spiky Energy');
  for(const row of result.rows){
    assert.equal(row.afterAttackSourceDceOnBenchedPokemonCount,1);
    assert.deepEqual(row.afterAttackSourceActiveEnergyNames,[]);
    assert.equal(row.ownGuzmaHandAvailability,null);
    assert.equal(row.paperGuzmaPivotAvailableProven,false);
    assert.equal(row.qualifiedCompetitiveGame,false);
  }
});

test('empty opposing Bench correctly blocks printed Guzma paired switch',()=>{
  const ids=['empty'];
  const result=auditRank6GuzmaPublicBench({attempts:[
    attempt(ids[0],0,[])
  ]},ids);
  assert.equal(result.bothOpponentsHaveBench,false);
  assert.equal(result.rows[0].opposingBenchAvailableForPrintedGuzma,false);
});

test('unsettled attack, duplicate source or missing seat are rejected',()=>{
  const a=attempt('a',0,['Dialga-GX']);
  const invalid=structuredClone(a);
  invalid.actualSourceAttackSettlement.attacks[0].settledPromptChain=false;
  assert.throws(()=>auditRank6GuzmaPublicBench({attempts:[invalid]},['a']),
    /One same-epoch physically resolved Volt/);
  assert.throws(()=>auditRank6GuzmaPublicBench({attempts:[a,a]},['a']),
    /Require one original registered source/);
  const unknown=structuredClone(a);
  unknown.originalSourceSeat=2;
  assert.throws(()=>auditRank6GuzmaPublicBench({attempts:[unknown]},['a']));
});
