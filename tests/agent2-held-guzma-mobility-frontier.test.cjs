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


test('source-first rank11 observed T9 pivot is within the generic held-Guzma vocabulary',()=>{
  // A source-owned original-Store T9 hand held Guzma BUS after a real T7
  // Marnie. This synthetic owner-only test uses the printed attack costs
  // of Garbodor BKP57 and Oranguru V ASR133, with the actual one-Darkness
  // attachment observed on each. The historical native Store separately
  // accepted Guzma and switched to Oranguru in CI 39686792051.
  const v=view();
  const sourceCatalog={...catalog,
    basicEnergies:new Set([...catalog.basicEnergies,'Darkness Energy MEE'])};
  v.ownHand=['Guzma BUS','Marnie SSH','Temple of Sinnoh ASR',
    'Dark Patch ASR'];
  v.ownPublic.active=pokemon('Garbodor',
    [P,C,C,C],['Darkness Energy MEE']);
  v.ownPublic.bench=[
    pokemon('Oranguru V',[C,C,C],['Darkness Energy MEE']),
    pokemon('Crobat V',[D,C],[]),null,null,null
  ];
  const chosen=chooseHeldGuzmaMobility(v,sourceCatalog);
  assert.deepEqual(chosen,{
    kind:'play-held-guzma-mobility',handIndex:0,
    printing:'Guzma BUS',benchIndex:0,anticipatedMissing:2
  });
  const usedSupporter=structuredClone(v);
  usedSupporter.ownTurnResources.supporterPlayedTurn=1;
  assert.equal(chooseHeldGuzmaMobility(usedSupporter,sourceCatalog),null);
  const noOpponentBench=structuredClone(v);
  noOpponentBench.opponentPublic.bench=[null,null,null,null,null];
  assert.equal(chooseHeldGuzmaMobility(noOpponentBench,sourceCatalog),null);
});
