'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {POLICY_VERSION,createPolicy}=
  require('./agent46-candidate-policy.cjs');

function request(seat=0){
  const active={name:'Mimikyu',printing:'Mimikyu GRI',
    abilities:[],attacks:[{name:'Copycat',cost:['Colorless','Colorless']}],
    energies:['Psychic Energy CRE','Psychic Energy CRE']};
  const target={name:'Regidrago VSTAR',printing:'Regidrago VSTAR SIT',
    hp:280,damage:0,tools:[],
    printed:{types:['Dragon'],subtypes:['VSTAR']},attacks:[{name:'Apex Dragon'}]};
  const view={
    actorSeat:seat,globalTurn:4,decisionKind:'owner-prompt',
    ownPublic:{
      active,bench:[],
      discard:['Dialga-GX UPR','Radiant Eternatus CRZ'],
      publicTurnRestrictions:{gxUsed:false}
    },
    opponentPublic:{active:target,bench:[]}
  };
  const receipt={
    actorSeat:seat,turn:4,opponentLastTurnTurn:2,
    mimikyuCopycatCompatible:true,
    opponentCopycatChoices:[{
      turn:2,sourcePrinting:'Regidrago VSTAR SIT',
      attackName:'Apex Dragon',gxAttack:false,copycatAttack:true
    }]
  };
  const prompt={
    actingSeat:seat,promptType:'ChooseAttackPrompt',
    source:{classification:'actor-choice',sourceKind:'card-effect',
      effectName:'Apex Dragon'},
    choices:[
      {kind:'attack',token:'power-beam',
        publicMetadata:{sourceAttack:'Power Beam'}},
      {kind:'attack',token:'timeless-gx',
        publicMetadata:{sourceAttack:'Timeless-GX'}}
    ]
  };
  return {role:'candidate',seat,observation:view,
    prompt,publicEventReceipt:receipt};
}

function decide(r){
  return createPolicy({role:'candidate',seat:r.seat,
    policyVersion:POLICY_VERSION,config:{}}).decide(r);
}

for(const seat of [0,1]){
  test('seat '+seat+' clean 280-HP Regidrago chooses Timeless 150 + Power Beam 200',()=>{
    const r=request(seat);
    assert.deepEqual(decide(r),{kind:'select-choice',token:'timeless-gx'});
  });
  test('seat '+seat+' spent GX skips Timeless and takes non-GX Power Beam',()=>{
    const r=request(seat);r.observation.ownPublic.publicTurnRestrictions.gxUsed=true;
    assert.deepEqual(decide(r),{kind:'select-choice',token:'power-beam'});
  });
  test('seat '+seat+' absent Dragon Radiant discard avoids unproven two-turn chain',()=>{
    const r=request(seat);r.observation.ownPublic.discard=['Dialga-GX UPR'];
    assert.deepEqual(decide(r),{kind:'select-choice',token:'power-beam'});
  });
  test('seat '+seat+' remaining HP <=200 prioritizes immediate Power Beam KO',()=>{
    const r=request(seat);r.observation.opponentPublic.active.damage=110;
    assert.deepEqual(decide(r),{kind:'select-choice',token:'power-beam'});
  });
  test('seat '+seat+' defender tool blocks unmodeled prevention assumptions',()=>{
    const r=request(seat);
    r.observation.opponentPublic.active.tools=['Stealthy Hood UNB'];
    assert.deepEqual(decide(r),{kind:'select-choice',token:'power-beam'});
  });
  test('seat '+seat+' stale opponent-turn stamp does not trigger heuristic',()=>{
    const r=request(seat);r.publicEventReceipt.turn=3;
    assert.deepEqual(decide(r),{kind:'select-choice',token:'power-beam'});
  });
  test('seat '+seat+' absent Apex permission blocks hypothetical chain',()=>{
    const r=request(seat);
    r.publicEventReceipt.opponentCopycatChoices=[];
    assert.deepEqual(decide(r),{kind:'select-choice',token:'power-beam'});
  });
  test('seat '+seat+' living Fairy Zone keeps existing immediate Timeless priority',()=>{
    const r=request(seat);
    r.observation.ownPublic.bench=[{
      name:"Lillie's Clefairy ex",printing:"Lillie's Clefairy ex JTG",
      abilities:['Fairy Zone'],
      abilitySuppressions:[{abilityName:'Fairy Zone',suppressed:false}]
    }];
    assert.deepEqual(decide(r),{kind:'select-choice',token:'timeless-gx'});
  });
  test('seat '+seat+' non-Regidrago target avoids unsupported generic two-turn extrapolation',()=>{
    const r=request(seat);
    r.observation.opponentPublic.active.printing='Dialga-GX UPR';
    assert.deepEqual(decide(r),{kind:'select-choice',token:'power-beam'});
  });
}
