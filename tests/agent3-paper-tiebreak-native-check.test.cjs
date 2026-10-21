'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const {checkWinner}=require(path.join(output,'game/store/effect-reducers/check-effect'));
const {GamePhase}=require(path.join(output,'game/store/state/state'));

/** @param {number} leader @param {boolean} replay */
function fixture(leader,replay){
  return {phase:GamePhase.PLAYER_TURN,isSuddenDeath:replay,turn:2,
    players:[0,1].map(slot=>({
      name:'player'+slot,active:{cards:[{}]},
      prizes:Array.from({length:6},(_,i)=>({
        cards:slot===leader&&i===0?[]:[{}]
      }))
    }))};
}

test('native checkWinner leaves the six-Prize replay ongoing at first lead',()=>{
  for(const seat of [0,1]){
    const game=fixture(seat,true);
    const observed=checkWinner({log(){}},game);
    assert.equal(observed,game);
    assert.equal(game.phase,GamePhase.PLAYER_TURN);
    assert.deepEqual(game.players.map(p=>p.prizes.filter(x=>x.cards.length).length),
      seat===0?[5,6]:[6,5]);
  }
});

test('ordinary nonreplay remains ongoing at an ordinary first lead',()=>{
  const game=fixture(0,false);
  checkWinner({log(){}},game);
  assert.equal(game.phase,GamePhase.PLAYER_TURN);
});
