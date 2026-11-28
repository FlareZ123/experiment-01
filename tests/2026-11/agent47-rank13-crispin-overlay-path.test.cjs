'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const base=require('../../simulation/evaluation/2026-11/agent24-rank13-regidrago-opponent-policy.cjs');
const overlay=require('../../simulation/evaluation/2026-11/agent47-rank13-crispin-overlay.cjs');

const grass=()=>({printing:'Grass Energy MEE 9'});
const fire=()=>({printing:'Fire Energy MEE 10'});
const p=(printing,hp,other={})=>({
  printing,hp,damage:0,energies:[],tools:[],printed:{
    types:['Dragon'],subtypes:['Basic'],weakness:[],resistance:[],...other
  },specialConditions:[],publicRestrictions:{},
  ...('energies' in other?{energies:other.energies}:{})
});
function observation(seat=0){
  return{
    actorSeat:seat,globalTurn:5,decisionKind:'owner-root',
    ownHand:['VS Seeker PHF 109'],
    ownTurnResources:{supporterPlayedTurn:0},
    ownPublic:{
      active:p('Regidrago VSTAR SIT 136',280,{energies:[grass(),fire()]}),
      bench:[],discard:['Dialga-GX UPR 100','Crispin SCR 133','Guzma BUS 115'],
      prizeCount:1,deckCount:18,
      publicTurnRestrictions:{gxUsed:true,vstarUsed:true,supporterPlayLocked:false}},
    opponentPublic:{
      active:p('Mimikyu GRI 58',70,{types:['Psychic']}),
      bench:[p('Shadow Rider Calyrex VMAX CRE 75',320,{subtypes:['VMAX']})],
      prizeCount:2,deckCount:17,handCount:3,stadium:[]}
  };
}
function root(seat,view,items){
  return{role:'opponent',seat,observation:{...view,decisionKind:'owner-root'},
    prompt:null,actionFrontier:{items}};
}
function prompt(seat,view,type,source,meta,choices){
  return{role:'opponent',seat,observation:{...view,decisionKind:'owner-prompt'},
    prompt:{promptType:type,source:{
      classification:'actor-choice',sourceKind:'card-effect',
      sourcePrinting:source,effectName:source.split(' ').slice(0,-1).join(' ')
    },publicMetadata:meta,choices}
  };
}
const card=(token,printing)=>({token,kind:'card',printing});
const action=(token,kind,printing,more={})=>({
  token,kind,label:printing??token,actorPrinting:printing,...more
});

for(const seat of [0,1]){
  test('seat '+seat+': actual rank13 source worker + overlay covers VS Seeker, Crispin, funded Apex and Shred choice',()=>{
    const view=observation(seat);
    const before=base.createPolicy({role:'opponent',seat,policyVersion:base.POLICY_VERSION,config:{}});
    const worker=overlay.createPolicy({role:'opponent',seat,
      policyVersion:overlay.POLICY_VERSION,config:{}});
    const seekerRoot=root(seat,view,[
      action('seeker','play-card','VS Seeker PHF 109'),
      action('pass','pass','Pass')]);
    assert.deepEqual(worker.decide(seekerRoot),{kind:'select-action',token:'seeker'});
    const seekerPrompt=prompt(seat,view,'ChooseCardsPrompt','VS Seeker PHF 109',
      {selectionType:'card-combination',minimumCount:1,maximumCount:1},
      [card('guzma','Guzma BUS 115'),card('crispin','Crispin SCR 133')]);
    // Exact underlying worker would choose a non-funding gust in this state.
    assert.deepEqual(before.decide(seekerPrompt),{kind:'select-choices',tokens:['guzma']});
    assert.deepEqual(worker.decide(seekerPrompt),{kind:'select-choices',tokens:['crispin']});
    view.ownHand=['Crispin SCR 133'];
    const crispinRoot=root(seat,view,[
      action('crispin-action','play-card','Crispin SCR 133'),
      action('pass','pass','Pass')]);
    assert.deepEqual(worker.decide(crispinRoot),{kind:'select-action',token:'crispin-action'});
    const energyPrompt=prompt(seat,view,'ChooseCardsPrompt','Crispin SCR',
      {selectionType:'card-combination',minimumCount:0,maximumCount:2,
        ownerSeat:'actor',sourceZone:'deck',isOwnerVisible:true},
      [card('g1','Grass Energy MEE 9'),card('g2','Grass Energy MEE 9'),
        card('f1','Fire Energy MEE 10')]);
    energyPrompt.prompt.source.effectName='Crispin';
    assert.deepEqual(worker.decide(energyPrompt),{kind:'select-choices',tokens:['g1','f1']});
    const attach=prompt(seat,view,'AttachEnergyPrompt','Crispin SCR',
      {selectionType:'energy-attachment',minimumCount:1,maximumCount:1,
        ownerSeat:'actor',sourceZone:'effect-revealed',isOwnerVisible:true},
      [
        {token:'fire-active',kind:'energy',printing:'Fire Energy MEE',
          publicMetadata:{ownerSeat:'actor',sourceZone:'effect-revealed',
            isOwnerVisible:true,zone:'active'}},
        {token:'grass-active',kind:'energy',printing:'Grass Energy MEE',
          publicMetadata:{ownerSeat:'actor',sourceZone:'effect-revealed',
            isOwnerVisible:true,zone:'active'}}
      ]);
    attach.prompt.source.effectName='Crispin';
    assert.deepEqual(worker.decide(attach),{kind:'select-choice',token:'grass-active'});
    // This models the visible board after native attachment, not a Store replay.
    view.ownPublic.active.energies.push(grass());
    const apexRoot=root(seat,view,[
      action('apex','attack','Apex Dragon',{attackName:'Apex Dragon'}),
      action('pass','pass','Pass')]);
    assert.deepEqual(worker.decide(apexRoot),{kind:'select-action',token:'apex'});
    const apexPrompt=prompt(seat,view,'ChooseAttackPrompt','Regidrago VSTAR SIT 136',
      {selectionType:'attack',minimumCount:1,maximumCount:1},
      [{token:'covert',kind:'attack',label:'Covert Flight',
        publicMetadata:{sourceAttack:'Covert Flight'}},
       {token:'shred',kind:'attack',label:'Shred',
        publicMetadata:{sourceAttack:'Shred'}}]);
    apexPrompt.prompt.source.effectName='Apex Dragon';
    assert.deepEqual(worker.decide(apexPrompt),{kind:'select-choice',token:'shred'});
  });
}
test('negative: incomplete funded geometry delegates to baseline Guzma rather than fabricating Crispin win',()=>{
  const seat=0,view=observation(seat);
  view.ownPublic.active.energies=[grass(),grass()];
  const r=prompt(seat,view,'ChooseCardsPrompt','VS Seeker PHF 109',
      {selectionType:'card-combination',minimumCount:1,maximumCount:1},
      [card('guzma','Guzma BUS 115'),card('crispin','Crispin SCR 133')]);
  const worker=overlay.createPolicy({role:'opponent',seat,
    policyVersion:overlay.POLICY_VERSION,config:{}});
  assert.deepEqual(worker.decide(r),{kind:'select-choices',tokens:['guzma']});
});
test('negative: overlay rejects wrong seat actor state without delegating into worker',()=>{
  const worker=overlay.createPolicy({role:'opponent',seat:0,
    policyVersion:overlay.POLICY_VERSION,config:{}});
  const r=root(1,observation(1),[action('pass','pass','Pass')]);
  assert.deepEqual(worker.decide(r),{kind:'abstain',reasonCode:'ROLE_SEAT_BINDING_MISMATCH'});
});
