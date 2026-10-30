'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {potentialTwoPrizeAttackVeto}=require('../simulation/twinleaf/agent35-potential-two-prize-attack-veto.cjs');

function view(){
  return {decisionKind:'owner-root',globalTurn:7,
    ownPublic:{prizeCount:2,active:{printing:'Dragapult ex TWM',
      attacks:[{name:'Phantom Dive',damage:200,damageCalculation:null}]},
      bench:[{printing:'Regidrago V SIT',name:'Regidrago V',attacks:[{name:'Celestial Roar'}]}]},
    opponentPublic:{active:{printing:'Dedenne-GX UNB',hp:160,damage:0,
      energies:[],tools:[]}},
    opponentHidden:{hand:['secret'],prizes:['private']},
    unseenDeckOrder:['hidden']};
}
const first={kind:'attack',attackName:'Phantom Dive'};

test('printed two-prize target and fixed potential KO protect attack choice',()=>{
  assert.deepEqual(potentialTwoPrizeAttackVeto(view(),first),{
    protect:true,reason:'potential-two-prize-finishing-attack',
    opponentPrinting:'Dedenne-GX UNB',printedDamage:200,
    opponentRemainingHp:160});
});

test('do not generalize single-prize, unknown damage, or smaller attack',()=>{
  const one=view();one.opponentPublic.active.printing='Klefki SVI';
  assert.equal(potentialTwoPrizeAttackVeto(one,first).protect,false);
  const d=view();d.ownPublic.active.attacks[0].damageCalculation='30x';
  assert.equal(potentialTwoPrizeAttackVeto(d,first).protect,false);
  const low=view();low.ownPublic.active.attacks[0].damage=140;
  assert.equal(potentialTwoPrizeAttackVeto(low,first).protect,false);
  assert.equal(potentialTwoPrizeAttackVeto(view(),{kind:'pass'}).protect,false);
  const notFinal=view();notFinal.ownPublic.prizeCount=3;
  assert.equal(potentialTwoPrizeAttackVeto(notFinal,first).protect,false);
});

test('decline obvious printed Prize-reduction and remain hidden-state invariant',()=>{
  const legacy=view();legacy.opponentPublic.active.energies=['Legacy Energy TWM'];
  assert.equal(potentialTwoPrizeAttackVeto(legacy,first).protect,false);
  const lifeDew=view();lifeDew.opponentPublic.active.tools=['Life Dew PLF'];
  assert.equal(potentialTwoPrizeAttackVeto(lifeDew,first).protect,false);
  const a=view(),b=structuredClone(a);
  b.opponentHidden={hand:['new'],prizes:['new']};
  b.unseenDeckOrder=['different'];
  assert.deepEqual(potentialTwoPrizeAttackVeto(a,first),
    potentialTwoPrizeAttackVeto(b,first));
});
