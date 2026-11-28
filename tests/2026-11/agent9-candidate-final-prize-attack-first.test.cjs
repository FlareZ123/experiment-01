'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const candidate=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const E='Psychic Energy MEE 13';
function mon(printing,energy=0,damage=0,hp=320,types=['Psychic'],subtypes=['VMAX']){
  return {printing,hp,damage,
    printed:{stage:subtypes[0],subtypes,types,weakness:[],
      resistance:[],retreatCost:[]},
    energies:Array(energy).fill(E),tools:[],attacks:
      printing==='Shadow Rider Calyrex VMAX CRE 75'?
        [{name:'Max Geist',cost:['Colorless','Colorless','Colorless'],
          damage:'10+'}]:[],
    abilities:[],abilitySuppressions:[]};
}
function player(active,bench,prizeCount,deckCount){
  return {active,bench,prizeCount,deckCount,handCount:2,
    stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
    publicTurnRestrictions:{gxUsed:false,stadiumAndToolHaveNoEffectTurnsRemaining:0}};
}
function make(seat,options={}){
  const {energy=4,damage=150,prizes=2,deck=2,enemy='VSTAR',
    enemyBench=1,offerAttack=true,offerDoor=false,unmodeled=false}=options;
  const a=mon('Shadow Rider Calyrex VMAX CRE 75',energy);
  const b=mon('Shadow Rider Calyrex V CRE 74',0,0,210,['Psychic'],['V']);
  const t=enemy==='MEGA'?
    mon('Mega Absol ex MEG 86',0,damage,280,['Darkness'],['Basic','MEGA','ex']):
    mon('Regidrago VSTAR SIT 136',0,damage,280,['Dragon'],['VSTAR']);
  const spare=mon('Mimikyu GRI 58',0,0,70,['Psychic'],['Basic']);
  const items=[
    {token:'draw',kind:'play-card',actorPrinting:"Lillie's Determination MEG 100",
      publicMetadata:{cardType:'supporter'}},
    ...(offerDoor?[{token:'door',kind:'use-ability',actorPrinting:a.printing,
      publicMetadata:{abilityName:'Underworld Door'}}]:[]),
    ...(offerAttack?[{token:'geist',kind:'attack',attackName:'Max Geist',
      publicMetadata:{hasUnmodeledModifier:unmodeled}}]:[]),
    {token:'pass',kind:'pass'}];
  return {role:'candidate',seat,prompt:null,publicEventReceipt:null,
    observation:{actorSeat:seat,decisionKind:'owner-root',
      ownHand:["Lillie's Determination MEG 100",E],
      ownPublic:player(a,[b],prizes,deck),
      opponentPublic:player(t,Array(enemyBench).fill(spare),6,30),
      ownTurnResources:{supporterPlayedTurn:0}},
    actionFrontier:{schema:'aichi-action-frontier-v1',items}};
}
for(const seat of [0,1]){
  for(const [label,options,want] of [
    ['two-prize VSTAR immediate Max Geist vs Lillie',
      {energy:4,damage:150,prizes:2,deck:2},'geist'],
    ['three-prize Mega ex immediate Max Geist vs Lillie',
      {energy:4,damage:150,prizes:3,enemy:'MEGA'},'geist'],
    ['last opponent Active wins game despite four own Prizes',
      {energy:4,damage:150,prizes:4,enemyBench:0},'geist'],
    ['already-lethal Max Geist beats optional Door and Supporter',
      {energy:4,damage:150,prizes:2,deck:3,offerDoor:true},'geist'],
    ['nonlethal current Max Geist preserves selected draw',
      {energy:3,damage:150,prizes:2,deck:3},'draw'],
    ['two Prize payout not final at three Prizes remaining',
      {energy:4,damage:150,prizes:3,deck:3},'draw'],
    ['attack missing from native frontier',
      {energy:4,damage:150,prizes:2,offerAttack:false},'draw'],
    ['native metadata explicitly says attack has unmodeled modifier',
      {energy:4,damage:150,prizes:2,unmodeled:true},'draw'],
    ['future KO not yet reachable with 4 Psychic',
      {energy:4,damage:100,prizes:2},'draw']
  ]){
    test(label+' seat '+seat,()=>{
      const req=make(seat,options);
      const output=candidate.createPolicy({role:'candidate',seat,
        policyVersion:candidate.POLICY_VERSION,config:{}}).decideWithAudit(req);
      assert.deepEqual(output.decision,{kind:'select-action',token:want});
      assert.deepEqual(output.policyAudit.selectedTokens,[want]);
      assert.deepEqual(output.policyAudit.evaluations.map(row=>row.token),
        req.actionFrontier.items.map(row=>row.token));
    });
  }
}
