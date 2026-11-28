'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {POLICY_VERSION,createPolicy}=require('./agent46-candidate-policy.cjs');

const constantAttacker={
  name:'Trevenant & Dusknoir-GX',
  printing:'Trevenant & Dusknoir-GX SMP',
  attacks:[{name:'Night Watch',damage:150,cost:['Psychic','Psychic','Colorless']}],
  energies:['Psychic Energy CRE','Psychic Energy CRE','Psychic Energy CRE'],
  printed:{subtypes:['TAG TEAM','GX'],types:['Psychic']}
};
function target(printing,printed={},hp=280){
  return {printing,name:printing.split(' ').slice(0,-1).join(' '),
    hp,damage:hp-70,energies:[],tools:[],attacks:[],
    printed:{subtypes:printed.subtypes??[],
      stage:printed.stage??null,
      types:printed.types??['Dragon'],
      weakness:[],resistance:[]}};
}
function request(seat,first,second) {
  const source=[first,second];
  return {role:'candidate',seat,
    observation:{
      actorSeat:seat,globalTurn:3,decisionKind:'owner-prompt',
      ownPublic:{active:constantAttacker,bench:[],
        publicTurnRestrictions:{gxUsed:false}},
      opponentPublic:{active:target('Dummy Active',{},90),
        bench:source}
    },
    prompt:{actingSeat:seat,promptType:'ChoosePokemonPrompt',
      source:{classification:'actor-choice',sourceKind:'card-effect',
        sourcePrinting:'Guzma BUS',effectName:'Guzma'},
      publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
      choices:source.map((slot,i)=>({
        kind:'pokemon',token:'target-'+i,label:'Opponent bench '+(i+1)+': '+slot.printing,
        printing:slot.printing,
        publicMetadata:{ownerSeat:'opponent',isOwnerVisible:true,
          targetZone:'bench'}
      }))
    }};
}
function audit(seat,first,second){
  return createPolicy({role:'candidate',seat,policyVersion:POLICY_VERSION,
    config:{}}).decideWithAudit(request(seat,first,second));
}
const baseline=target('Bunnelby PRC 121',{subtypes:['Basic']},70);
const dualPrize=[
  ['Regidrago VSTAR SIT',{subtypes:['VSTAR'],stage:'VSTAR'}],
  ['Arceus VSTAR BRS',{stage:'VSTAR'}],
  ['Regidrago V SIT',{subtypes:['V']}],
  ['M Rayquaza-EX ROS',{subtypes:['Mega']}],
  ['Mewtwo-EX BKT',{subtypes:['EX']}],
  ['Dedenne-GX UNB',{subtypes:['GX']}],
  ["Lillie's Clefairy ex JTG",{subtypes:['ex']}]
];
const triplePrize=[
  ['Shadow Rider Calyrex VMAX CRE',{subtypes:['VMAX']}],
  ['Morpeko V-UNION PR',{subtypes:['V-UNION']}],
  ['Trevenant & Dusknoir-GX SMP',{subtypes:['TAG TEAM']}],
  ['Mega Lucario ex MEG',{subtypes:['Mega Evolution ex']}],
  ['Mega Gardevoir ex MEG',{}]
];
const onePrize=[
  ['Radiant Eternatus CRZ',{subtypes:['Radiant']}],
  ['Mimikyu GRI',{subtypes:['Basic']}],
  ['Froslass TWM',{subtypes:['Stage 1']}]
];

for(const seat of [0,1]){
  for(const [printing,printed] of dualPrize){
    test('seat '+seat+' public Rule Box receives exactly 2 Prizes: '+printing,()=>{
      const row=audit(seat,baseline,target(printing,printed));
      assert.deepEqual(row.decision,{kind:'select-choices',tokens:['target-1']});
      const [one,two]=row.policyAudit.evaluations;
      assert.equal(one.status,'scored');
      assert.equal(two.status,'scored');
      assert.equal(two.score-one.score,1700);
    });
  }
  for(const [printing,printed] of triplePrize){
    test('seat '+seat+' public Rule Box receives exactly 3 Prizes: '+printing,()=>{
      const row=audit(seat,baseline,target(printing,printed));
      assert.deepEqual(row.decision,{kind:'select-choices',tokens:['target-1']});
      const [one,three]=row.policyAudit.evaluations;
      assert.equal(three.score-one.score,3400);
    });
  }
  for(const [printing,printed] of onePrize){
    test('seat '+seat+' ordinary/radiant single Prize remains 1: '+printing,()=>{
      const row=audit(seat,baseline,target(printing,printed));
      // Equal printed public Prize counts: native Bench order wins the tie.
      assert.deepEqual(row.decision,{kind:'select-choices',tokens:['target-0']});
      const [one,other]=row.policyAudit.evaluations;
      assert.equal(other.score-one.score,0);
    });
  }
}
test('negative control: a Tera ex is 2, not mistaken for a Mega ex',()=>{
  const row=audit(0,baseline,target('Dragapult ex TWM',{subtypes:['Tera ex']},320));
  assert.equal(row.policyAudit.evaluations[1].score-
    row.policyAudit.evaluations[0].score,1700);
});
test('negative control: an old Mega-EX is 2, unlike modern Mega ex 3',()=>{
  const old=audit(0,baseline,target('M Rayquaza-EX ROS',{},220));
  const modern=audit(0,baseline,target('Mega Lucario ex MEG',{},340));
  assert.equal(old.policyAudit.evaluations[1].score-
    old.policyAudit.evaluations[0].score,1700);
  assert.equal(modern.policyAudit.evaluations[1].score-
    modern.policyAudit.evaluations[0].score,3400);
});
