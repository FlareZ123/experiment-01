'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {opponentStadiumAttackEntitlement}=require('../simulation/twinleaf/agent5-opponent-stadium-attack-entitlement.cjs');
const type={LIGHTNING:4,PSYCHIC:5,COLORLESS:9,FAIRY:10,DRAGON:11};
const refs={cardTypes:type,stageBasic:2};
function view(){
  return {decisionKind:'owner-root',actorSeat:0,
    ownPublic:{prizeCount:5},
    opponentPublic:{prizeCount:6,
      active:{printing:'Unown AOR',name:'Unown',
        printed:{stage:2,types:[type.PSYCHIC]},
        energies:['Prism Energy ASC'],
        attacks:[{name:'Hidden Power',cost:[type.COLORLESS],
          damage:10,gxAttack:false}]}}};
}
test('the real source Unown becomes payable after Wondrous to Thunder',()=>{
  const r=opponentStadiumAttackEntitlement(view(),
    'Wondrous Labyrinth Prism Star','Thunder Mountain Prism Star',refs);
  assert.equal(r.status,'public-printed-attack-costs-compared');
  assert.deepEqual(r.newlyPayable.map(a=>a.name),['Hidden Power']);
  assert.deepEqual(r.rows[0].beforeSymbols,['C','C']);
  assert.deepEqual(r.rows[0].afterSymbols,['C']);
  assert.equal(r.rows[0].beforePayable,false);
  assert.equal(r.rows[0].afterPayable,true);
});
test('inverse replacement makes opponent attack unpayable',()=>{
  const r=opponentStadiumAttackEntitlement(view(),
    'Thunder Mountain Prism Star','Wondrous Labyrinth Prism Star',refs);
  assert.deepEqual(r.newlyUnpayable.map(a=>a.name),['Hidden Power']);
});
test('unknown cost semantics never give a positive entitlement result',()=>{
  const r=opponentStadiumAttackEntitlement(view(),
    'Wondrous Labyrinth Prism Star','Unknown Stadium',refs);
  assert.equal(r.unknown.length,1);
  assert.equal(r.newlyPayable.length,0);
});
test('opponent Prize perspective determines Reversal Energy units',()=>{
  const v=view();
  v.opponentPublic.active={printing:'Synthetic Stage1',
    name:'Synthetic Stage1',printed:{stage:1,types:[type.LIGHTNING]},
    energies:['Reversal Energy PAL'],attacks:[{name:'Attack',
      cost:[type.LIGHTNING,type.COLORLESS,type.COLORLESS],damage:100}]};
  const r=opponentStadiumAttackEntitlement(v,
    'Wondrous Labyrinth Prism Star','Thunder Mountain Prism Star',refs);
  assert.deepEqual(r.newlyPayable.map(a=>a.name),['Attack']);
});
test('no opponent Active leaves no invented funded attacks',()=>{
  const v=view();v.opponentPublic.active=null;
  const r=opponentStadiumAttackEntitlement(v,
    'Wondrous Labyrinth Prism Star','Thunder Mountain Prism Star',refs);
  assert.equal(r.status,'no-opponent-active');
  assert.deepEqual(r.newlyPayable,[]);
});
