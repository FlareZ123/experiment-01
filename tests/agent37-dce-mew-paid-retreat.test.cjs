'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseDceMewPaidRetreat,VERSION,DCE,MEW,GENESECT}=
  require('../simulation/twinleaf/agent37-dce-mew-paid-retreat.cjs');

function fixture(){
  const catalog={
    colorlessEnergyType:9,
    specialConditions:{ASLEEP:1,PARALYZED:2}
  };
  const active={printing:GENESECT,
    printed:{retreatCost:[9,9]},energies:[DCE],
    specialConditions:[],publicRestrictions:{},
    attacks:[{name:'Techno Blast',cost:[8,8,9],damage:210}]};
  const target={printing:MEW,energies:[DCE],
    specialConditions:[],publicRestrictions:{},
    attacks:[{name:'Cross Fusion Strike',cost:[9,9],damage:0}]};
  const donor={printing:GENESECT,energies:[],
    specialConditions:[],publicRestrictions:{},attacks:[]};
  const view={decisionKind:'owner-root',globalTurn:47,
    ownHand:[],ownTurnResources:{retreatedTurn:0},
    ownPublic:{active,bench:[{printing:'Mew V FST'},target,donor],
      stadium:[],publicTurnRestrictions:{attackLockTurnsRemaining:0}},
    opponentPublic:{stadium:[],active:{printing:'Tapu Lele-GX'}}};
  Object.defineProperty(view,'opponentHidden',{
    get(){throw Error('Opponent private zone read prohibited');}
  });
  Object.defineProperty(view,'ownDeck',{
    get(){throw Error('Owner hidden draw deck read prohibited');}
  });
  return {view,catalog,active,target,donor};
}

test('owner-public DCE correctly funds one printed two-Colorless Retreat',()=>{
  const {view,catalog}=fixture();
  assert.match(VERSION,/agent37-owner-public-dce/);
  const result=chooseDceMewPaidRetreat(view,catalog);
  assert.deepEqual(result,{
    kind:'paid-retreat',benchIndex:1,printing:MEW,
    attackName:'Cross Fusion Strike',retreatCostUnits:1,
    paymentPrinting:DCE,policy:VERSION
  });
});

test('preserves exact public owner observation without private-zone reads',()=>{
  const {view,catalog}=fixture();
  const before=JSON.stringify(view);
  assert.equal(chooseDceMewPaidRetreat(view,catalog)?.benchIndex,1);
  assert.equal(JSON.stringify(view),before);
  view.decisionKind='owner-prompt';
  assert.throws(()=>chooseDceMewPaidRetreat(view,catalog),/owner-root/);
});

test('requires an independently funded Mew VMAX and Benched Genesect donor',()=>{
  const {view,catalog,target,donor}=fixture();
  target.energies=[];
  assert.equal(chooseDceMewPaidRetreat(view,catalog),null);
  target.energies=[DCE];
  view.ownPublic.bench[2]=null;
  assert.equal(chooseDceMewPaidRetreat(view,catalog),null);
  view.ownPublic.bench[2]=donor;
  target.attacks[0].cost=[5,5];
  assert.equal(chooseDceMewPaidRetreat(view,catalog),null);
});

test('cannot invent or pay a retreat with untrusted special Energy',()=>{
  const {view,catalog,active}=fixture();
  active.energies=['Counter Energy CIN'];
  assert.equal(chooseDceMewPaidRetreat(view,catalog),null);
  active.energies=[DCE];
  active.printed.retreatCost=[9,9,9];
  assert.equal(chooseDceMewPaidRetreat(view,catalog),null);
  active.printed.retreatCost=[9,9];
  view.ownPublic.stadium=['Temple of Sinnoh ASR'];
  assert.equal(chooseDceMewPaidRetreat(view,catalog),null);
});

test('once-per-turn, status, attack and target eligibility veto mobility',()=>{
  const {view,catalog,active,target}=fixture();
  view.ownTurnResources.retreatedTurn=47;
  assert.equal(chooseDceMewPaidRetreat(view,catalog),null);
  view.ownTurnResources.retreatedTurn=0;
  view.globalTurn=1;
  assert.equal(chooseDceMewPaidRetreat(view,catalog),null);
  view.globalTurn=47;
  active.specialConditions=[catalog.specialConditions.PARALYZED];
  assert.equal(chooseDceMewPaidRetreat(view,catalog),null);
  active.specialConditions=[];
  active.publicRestrictions.cannotRetreatWhileActive=true;
  assert.equal(chooseDceMewPaidRetreat(view,catalog),null);
  active.publicRestrictions.cannotRetreatWhileActive=false;
  view.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=1;
  assert.equal(chooseDceMewPaidRetreat(view,catalog),null);
  view.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=0;
  target.publicRestrictions.cannotAttackNextTurn=true;
  assert.equal(chooseDceMewPaidRetreat(view,catalog),null);
});

test('natural case disallows substitution of unrelated attacker or Active',()=>{
  const {view,catalog,active,target}=fixture();
  target.printing='Mew V FST';
  assert.equal(chooseDceMewPaidRetreat(view,catalog),null);
  target.printing=MEW;
  active.printing='Crobat V DAA';
  assert.equal(chooseDceMewPaidRetreat(view,catalog),null);
});
