'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {diagnosePowerglassThreat}=require('../simulation/twinleaf/agent7-owner-powerglass-knockout-threat.cjs');
/** @returns {object} Detached root93-style owner/public input. */
function fixture(){
  return {
    decisionKind:'owner-root',actorSeat:1,globalTurn:14,
    ownHand:['Battle VIP Pass FST','Powerglass SFA','Secret Box TWM'],
    ownTurnResources:{toolPlayLocked:false},
    ownPublic:{
      publicTurnRestrictions:{toolPlayLocked:false},
      active:{printing:'Unown AOR',hp:60,damage:0,tools:[],
        attacks:[{name:'Hidden Power',cost:[9],damage:10,gxAttack:false}]},
      discard:['Psychic Energy MEE','Psychic Energy MEE']
    },
    opponentPublic:{active:{printing:'Trubbish FST',hp:70,damage:60}}
  };
}
const meta={basicEnergyPrintings:new Set(['Psychic Energy MEE']),colorlessType:9};
test('actual v9 root93 printed public plan: 1 Tool and 1 Basic can threaten 10 HP',()=>{
  const got=diagnosePowerglassThreat(fixture(),meta);
  assert.equal(got.handIndex,1);
  assert.equal(got.attackName,'Hidden Power');
  assert.equal(got.defenderRemainingHp,10);
  assert.equal(got.opponentCanRespondBeforeAttack,true);
  assert.equal(got.actualStoreAcceptanceUnverified,true);
});
test('held Tool, public discard and legal Tool play remain necessary',()=>{
  const cases=[
    view=>view.ownHand.splice(1,1),
    view=>view.ownPublic.discard.splice(0),
    view=>view.ownPublic.active.tools.push('Float Stone BKT'),
    view=>view.ownTurnResources.toolPlayLocked=true,
    view=>view.ownPublic.publicTurnRestrictions.toolPlayLocked=true
  ];
  for(const mutate of cases){const view=fixture();mutate(view);
    assert.equal(diagnosePowerglassThreat(view,meta),null);}
});
test('reject non-one-Colorless or insufficient damage even if physically funded',()=>{
  for(const cost of [[5],[5,9],[]]){
    const view=fixture();view.ownPublic.active.attacks[0].cost=cost;
    assert.equal(diagnosePowerglassThreat(view,meta),null);
  }
  const damage=fixture();damage.ownPublic.active.attacks[0].damage=9;
  assert.equal(diagnosePowerglassThreat(damage,meta),null);
});
test('reject concealed/absent or already-KO opponent and irrelevant current phase',()=>{
  for(const mutate of [
    view=>view.opponentPublic.active=null,
    view=>view.opponentPublic.active.damage=70,
    view=>view.decisionKind='owner-prompt',
    view=>view.ownPublic.active=null
  ]){
    const view=fixture();mutate(view);
    assert.equal(diagnosePowerglassThreat(view,meta),null);
  }
});
test('actor seat symmetry and Basic-only source; no opponent hidden state',()=>{
  const view=fixture();view.actorSeat=0;
  assert.equal(diagnosePowerglassThreat(view,meta).handIndex,1);
  const energy={...meta,basicEnergyPrintings:new Set()};
  assert.equal(diagnosePowerglassThreat(view,energy),null);
});
