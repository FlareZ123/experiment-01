'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,chooseHeldGuzmaMobility}=require(
  '../simulation/twinleaf/agent2-held-guzma-mobility-frontier.cjs');

const P=5,D=6,C=9;
const catalog={
  colorlessEnergyType:C,
  basicEnergies:new Set(['Psychic Energy MEE','Darkness Energy SVE 7']),
  basicEnergyTypes:{Psychic:P,Darkness:D},
  specialConditions:{ASLEEP:2,PARALYZED:3}
};

/** @param {string} name @param {number[]} cost @param {string[]} energies */
function pokemon(name,cost,energies){
  return {name,energies,attacks:[{name,damage:70,cost,gxAttack:false}],
    publicRestrictions:{},specialConditions:[]};
}

/** @returns {object} Owner-only detached root decision observation. */
function view(){
  return {decisionKind:'owner-root',globalTurn:9,
    ownHand:['Guzma BUS'],
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false},
    ownPublic:{
      active:pokemon('Active Swing',[P],['Psychic Energy MEE']),
      bench:[pokemon('Bench Slash',[D],['Darkness Energy SVE 7']),
        null,null,null,null],
      publicTurnRestrictions:{supporterPlayLocked:false,
        attackLockTurnsRemaining:0}
    },
    opponentPublic:{bench:[{name:'Public opposing Basic'}]},
    opponentHidden:{hand:['concealed X']}
  };
}

test('version identifies the restriction-aware opt-in for native provenance',()=>{
  assert.match(VERSION,/v2-public-attack-restrictions$/);
});

test('funded and usable Active attack still vetoes unnecessary Guzma',()=>{
  assert.equal(chooseHeldGuzmaMobility(view(),catalog),null);
});

test('each public named-attack lock permits an invested Bench pivot',()=>{
  for(const restriction of [
    {blockedAttackNameNextTurn:'Active Swing'},
    {blockedAttackNameUntilLeavesActive:'Active Swing'},
    {cannotUseAttacksNextTurn:['Active Swing']},
    {onlyAllowedAttackNameNextTurn:'Different Attack'},
    {cannotAttackNextTurn:true}
  ]){
    const v=view();
    Object.assign(v.ownPublic.active.publicRestrictions,restriction);
    const result=chooseHeldGuzmaMobility(v,catalog);
    assert.equal(result?.kind,'play-held-guzma-mobility',
      JSON.stringify(restriction));
    assert.equal(result.benchIndex,0);
    assert.equal(result.handIndex,0);
    assert.equal(result.anticipatedMissing,0);
  }
});

test('public Asleep and Paralyzed Active conditions allow the switch',()=>{
  for(const status of [catalog.specialConditions.ASLEEP,
    catalog.specialConditions.PARALYZED]){
    const v=view();
    v.ownPublic.active.specialConditions=[status];
    assert.equal(chooseHeldGuzmaMobility(v,catalog)?.benchIndex,0);
  }
});

test('a second genuinely usable funded Active attack still prevents pivot',()=>{
  const v=view();
  v.ownPublic.active.publicRestrictions.blockedAttackNameNextTurn=
    'Active Swing';
  v.ownPublic.active.attacks.push({name:'Alternate Hit',
    damage:10,cost:[P],gxAttack:false});
  assert.equal(chooseHeldGuzmaMobility(v,catalog),null);
});

test('an unmatched restriction leaves the usable original Active attack',()=>{
  const v=view();
  v.ownPublic.active.publicRestrictions.blockedAttackNameNextTurn=
    'Unrelated Attack';
  assert.equal(chooseHeldGuzmaMobility(v,catalog),null);
});

test('the opponent Bench and unspent Supporter remain mandatory',()=>{
  const noBench=view();
  noBench.opponentPublic.bench=[null,null,null,null,null];
  noBench.ownPublic.active.publicRestrictions.cannotAttackNextTurn=true;
  assert.equal(chooseHeldGuzmaMobility(noBench,catalog),null);
  const used=view();
  used.ownTurnResources.supporterPlayedTurn=1;
  used.ownPublic.active.publicRestrictions.cannotAttackNextTurn=true;
  assert.equal(chooseHeldGuzmaMobility(used,catalog),null);
});

test('unknown attached Special Energy and uninvested Bench stay fail-closed',()=>{
  const unknown=view();
  unknown.ownPublic.active.energies=['Mystery Energy X'];
  unknown.ownPublic.active.publicRestrictions.cannotAttackNextTurn=true;
  assert.equal(chooseHeldGuzmaMobility(unknown,catalog),null);
  const noInvestment=view();
  noInvestment.ownPublic.bench[0].energies=[];
  noInvestment.ownPublic.active.publicRestrictions.cannotAttackNextTurn=true;
  assert.equal(chooseHeldGuzmaMobility(noInvestment,catalog),null);
});

test('opponent concealed card identities cannot affect mobility choice',()=>{
  const a=view(),b=view();
  a.ownPublic.active.publicRestrictions.cannotAttackNextTurn=true;
  b.ownPublic.active.publicRestrictions.cannotAttackNextTurn=true;
  b.opponentHidden.hand=['other unknown'];
  assert.deepEqual(chooseHeldGuzmaMobility(a,catalog),
    chooseHeldGuzmaMobility(b,catalog));
});
