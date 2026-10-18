'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {isCopyApexShredBoard,shouldCopyApexShred}=
  require('../simulation/twinleaf/mimikyu-extra-turn-shred-policy.cjs');

/** @returns {{state:object,player:object,opponent:object}} */
function board(){
  const player={
    id:202,usedGX:true,
    active:{getPokemonCard:()=>({fullName:'Mimikyu GRI'}),
      energies:{cards:[{name:'Psychic Energy'},{name:'Psychic Energy'}]}},
    discard:{cards:[{fullName:'Dialga-GX UPR'}]}
  };
  const opponent={id:101,active:{
    damage:210,getPokemonCard:()=>({fullName:'Regidrago VSTAR SIT'})
  }};
  return {player,opponent,
    state:{turn:35,players:[opponent,player],
      playerLastAttack:{101:{sourceCard:{fullName:'Regidrago VSTAR SIT'},
        attack:{name:'Apex Dragon',gxAttack:false}}}}
  };
}

test('autonomous board opportunity is independent of global turn',()=>{
  const {state,player}=board();
  for(const turn of [27,28,29,35,54]){
    state.turn=turn;
    assert.equal(isCopyApexShredBoard(state,player),true);
    assert.equal(shouldCopyApexShred(state,player),turn===28,
      'Archived policy must remain restricted to turn28');
  }
});

test('autonomous policy still excludes spent-GX, copying and energy failures',()=>{
  const {state,player,opponent}=board();
  player.usedGX=false;
  assert.equal(isCopyApexShredBoard(state,player),false);
  player.usedGX=true;
  player.discard.cards=[];
  assert.equal(isCopyApexShredBoard(state,player),false);
  player.discard.cards.push({fullName:'Dialga-GX UPR'});
  player.active.energies.cards=[{name:'Psychic Energy'}];
  assert.equal(isCopyApexShredBoard(state,player),false);
  player.active.energies.cards=[{name:'Psychic Energy'},
    {name:'Psychic Energy'}];
  opponent.active.damage=190;
  assert.equal(isCopyApexShredBoard(state,player),false);
  opponent.active.damage=210;
  state.playerLastAttack[101].attack.name='Dragon Laser';
  assert.equal(isCopyApexShredBoard(state,player),false);
});

test('autonomous policy uses acting seat opponent rather than rank order',()=>{
  const {state,player}=board();
  state.players.reverse();
  assert.equal(isCopyApexShredBoard(state,player),true);
  state.playerLastAttack[101].sourceCard.fullName='Noivern ex PAF';
  assert.equal(isCopyApexShredBoard(state,player),false);
});
