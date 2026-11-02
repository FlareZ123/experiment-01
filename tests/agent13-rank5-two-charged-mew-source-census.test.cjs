'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {census}=require('../scripts/agent13-rank5-two-charged-mew-source-census.cjs');
function fixture(){
  const make=(id,dual,nextAction)=>({
    trial:{id},rawNativeRow:{sourceSeat:1,endReason:'engine-game-end',
      rootActionLedger:nextAction?[{actionOrdinal:10,turnBefore:5,playerSlot:1,
        action:'AttackAction'},{actionOrdinal:11,turnBefore:6,playerSlot:0,
        action:'PassTurnAction'},{actionOrdinal:12,turnBefore:7,playerSlot:1,
        action:nextAction}]:[],
      sourceAttackSettlement:{attacks:[{actionOrdinal:10,turnBefore:5,
        publicBoardBefore:[{active:{name:'Lunatone'},bench:[]},
          {active:{name:'Mew VMAX',energyCards:['Double Colorless Energy']},
            bench:[{name:'Mew VMAX',energyCards:
              dual?['Double Colorless Energy']:[]}]}]}]}}});
  return {schema:'agent13-integrated-rank5-v31-corrected-root-release-v1',
    modes:{integratedV3:{attempts:[make('a',true,'PassTurnAction'),
      make('b',false,'AttackAction'),...Array.from({length:6},(_,i)=>
        make('f'+i,false,null))]}}};
}
test('only a physically distinct second DCE Mew counts',()=>{
  const rows=census(fixture());
  assert.equal(rows.length,8);
  assert.equal(rows[0].charged.length,1);
  assert.equal(rows[0].charged[0].chargedMewCount,2);
  assert.equal(rows[0].charged[0].sourcePassedNextOwnTurn,true);
  assert.equal(rows[1].charged.length,0);
});
test('missing source public board rejects misleading count',()=>{
  const data=fixture();
  data.modes.integratedV3.attempts[0].rawNativeRow.
    sourceAttackSettlement.attacks[0].publicBoardBefore=[];
  assert.throws(()=>census(data),/public-board/);
});
