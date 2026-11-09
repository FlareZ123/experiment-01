'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chooseSourceFirstOwnGrass}=
  require('../../simulation/twinleaf/agent5/rank13-first-own-turn-grass.cjs');

const GRASS='Grass Energy MEE';
const catalog={basicEnergies:new Set([GRASS])};

/** @param {object} [options] Native-neutral source owner-root changes. */
function view(options={}){
  return {
    decisionKind:'owner-root',actorSeat:options.seat??1,
    globalTurn:options.turn??2,
    ownHand:options.hand??[GRASS,'Battle Compressor PHF'],
    ownTurnResources:{energyPlayLocked:options.locked??false,
      energyPlayedTurn:options.played??0},
    ownPublic:{
      active:{name:'Tapu Lele-GX',printing:'Tapu Lele-GX GRI'},
      bench:[{name:'Regidrago V',printing:'Regidrago V SIT',
        energies:options.attached??[]},null],
      publicTurnRestrictions:{energyPlayLocked:options.locked??false}
    }
  };
}

test('first own turn at original second seat T2 funds Regidrago Bench',()=>{
  const a=chooseSourceFirstOwnGrass(view(),catalog);
  assert.equal(a?.kind,'attach-basic-energy');
  assert.equal(a.printing,GRASS);
  assert.equal(a.slot,'bench');
  assert.equal(a.index,0);
  assert.equal(a.handIndex,0);
  assert.equal(a.futurePrintedAttack,'Apex Dragon');
});
test('owner-first T1 also allowed; invalid seat, later turn, locks and quota denied',()=>{
  assert.equal(chooseSourceFirstOwnGrass(view({seat:0,turn:1}),catalog)?.index,0);
  assert.equal(chooseSourceFirstOwnGrass(view({seat:0,turn:2}),catalog),null);
  assert.equal(chooseSourceFirstOwnGrass(view({seat:1,turn:1}),catalog),null);
  assert.equal(chooseSourceFirstOwnGrass(view({seat:1,turn:4}),catalog),null);
  assert.equal(chooseSourceFirstOwnGrass(view({locked:true}),catalog),null);
  assert.equal(chooseSourceFirstOwnGrass(view({played:2}),catalog),null);
  assert.equal(chooseSourceFirstOwnGrass(view({hand:[]}),catalog),null);
});
test('when already having two Grass, retain original owner action',()=>{
  const v=view({attached:[GRASS,GRASS]});
  assert.equal(chooseSourceFirstOwnGrass(v,catalog),null);
  v.ownPublic.bench=[];
  assert.equal(chooseSourceFirstOwnGrass(v,catalog),null);
});
