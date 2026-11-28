'use strict';
// Source-qualified Tool costs and target eligibility. Native frontier
// enumerates Tool play destinations; policy chooses a strategically valid
// recipient before the Tool is irreversibly attached.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createPolicy,POLICY_VERSION}=
  require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const SEAL='Forest Seal Stone SIT 156',HOOD='Stealthy Hood UNB 186',
  FLOAT='Float Stone BKT 137',RIDER='Shadow Rider Calyrex V CRE 74',
  VMAX='Shadow Rider Calyrex VMAX CRE 75',LELE='Tapu Lele-GX GRI 60';
const pokemon=(printing,subtypes=['Basic','V'],tools=[],retreatCost=['Colorless'])=>({
  printing,name:printing,hp:210,damage:0,abilities:[],attacks:[],energies:[],
  tools,printed:{types:['Psychic'],subtypes,retreatCost}
});
function caseFor(seat,{active=pokemon(RIDER),bench=[pokemon(VMAX,['VMAX','V'])],
  opp='Snorlax PGO 55',vstarUsed=false,stadium=[]}={}){
  const view={actorSeat:seat,globalTurn:3,decisionKind:'owner-root',
    ownHand:[SEAL,HOOD,FLOAT],ownTurnResources:{supporterPlayedTurn:0},
    ownPublic:{active,bench,stadium,deckCount:25,discard:[],lostZone:[],
      publicTurnRestrictions:{vstarUsed,stadiumAndToolHaveNoEffectTurnsRemaining:0}},
    opponentPublic:{active:pokemon(opp),bench:[],stadium:[],
      deckCount:25,discard:[],lostZone:[],
      publicTurnRestrictions:{stadiumAndToolHaveNoEffectTurnsRemaining:0}}
  };
  const policy=createPolicy({role:'candidate',seat,policyVersion:POLICY_VERSION,config:{}});
  const play=(token,tool,zone,idx,recipient)=>({
    token,kind:'play-card',actorPrinting:tool,targetPrinting:recipient,
    publicMetadata:{targetSeat:'actor',targetZone:zone,targetIndex:idx,
      cardType:'trainer',isOwnerVisible:true}
  });
  const request={role:'candidate',seat,observation:view,prompt:null,
    publicEventReceipt:null,actionFrontier:{schema:'aichi-action-frontier-v1',items:[
      {kind:'pass',token:'pass'}
    ]}};
  return {view,policy,request,play};
}
for(const seat of [0,1]){
  test('Forest Seal Stone targets untooled Basic V before VMAX seat='+seat,()=>{
    const {policy,request,play}=caseFor(seat);
    request.actionFrontier.items.unshift(
      play('vmax',SEAL,'bench',0,VMAX),
      play('basic',SEAL,'active',undefined,RIDER));
    assert.deepEqual(policy.decide(request),
      {kind:'select-action',token:'basic'});
  });
  test('Forest Seal Stone attachment actually enables later Star Alchemy seat='+seat,()=>{
    const {policy,request,view,play}=caseFor(seat,{
      bench:[pokemon('Snorlax PGO 55',['Basic'])]});
    request.actionFrontier.items.unshift(
      play('seal',SEAL,'active',undefined,RIDER));
    assert.deepEqual(policy.decide(request),{kind:'select-action',token:'seal'});
    view.ownPublic.active.tools.push(SEAL);
    view.ownHand=[];
    request.actionFrontier.items=[
      {token:'star',kind:'use-ability',actorPrinting:RIDER,
        publicMetadata:{abilityName:'Star Alchemy',sourceSeat:'actor',sourceZone:'active'}},
      {token:'pass',kind:'pass'}];
    assert.deepEqual(policy.decide(request),{kind:'select-action',token:'star'});
  });
  test('spent VSTAR, already tooled and non-V target veto Tool seat='+seat,()=>{
    const {policy,request,play}=caseFor(seat,{vstarUsed:true});
    request.actionFrontier.items.unshift(play('seal',SEAL,'active',undefined,RIDER));
    assert.deepEqual(policy.decide(request),{kind:'select-action',token:'pass'});
    const second=caseFor(seat,{active:pokemon(RIDER,['Basic','V'],[FLOAT])});
    second.request.actionFrontier.items.unshift(
      second.play('seal',SEAL,'active',undefined,RIDER));
    assert.deepEqual(second.policy.decide(second.request),
      {kind:'select-action',token:'pass'});
    const nonV=caseFor(seat,{active:pokemon('Snorlax PGO 55',['Basic'])});
    nonV.request.actionFrontier.items.unshift(
      nonV.play('seal',SEAL,'active',undefined,'Snorlax PGO 55'));
    assert.deepEqual(nonV.policy.decide(nonV.request),
      {kind:'select-action',token:'pass'});
  });
  test('Hood goes on Shadow Rider VMAX under Iron Thorns ability lock seat='+seat,()=>{
    const {policy,request,play}=caseFor(seat,{opp:'Iron Thorns ex TWM 77',
      bench:[pokemon(VMAX,['VMAX','V']),pokemon(LELE,['Basic','GX'])]});
    request.actionFrontier.items.unshift(
      play('support',HOOD,'bench',1,LELE),
      play('rider',HOOD,'bench',0,VMAX));
    assert.deepEqual(policy.decide(request),{kind:'select-action',token:'rider'});
    assert.equal(policy.decideWithAudit(request).policyAudit.evaluations.find(
      x=>x.token==='rider').score,800);
  });
  test('Snorlax Block alone is not an Ability-lock reason to waste Hood seat='+seat,()=>{
    const {policy,request,play}=caseFor(seat,{opp:'Snorlax PGO 55'});
    request.actionFrontier.items.unshift(play('hood',HOOD,'bench',0,VMAX));
    assert.deepEqual(policy.decide(request),{kind:'select-action',token:'pass'});
  });
  test('Float Stone on trapped Active target but not unrelated Bench seat='+seat,()=>{
    const {policy,request,play}=caseFor(seat);
    request.actionFrontier.items.unshift(
      play('bench-float',FLOAT,'bench',0,VMAX),
      play('active-float',FLOAT,'active',undefined,RIDER));
    assert.deepEqual(policy.decide(request),
      {kind:'select-action',token:'active-float'});
  });
  test('Jamming Tower makes Tool-effect acceleration unsupported seat='+seat,()=>{
    const {policy,request,play}=caseFor(seat,{stadium:['Jamming Tower TWM 153']});
    request.actionFrontier.items.unshift(
      play('seal',SEAL,'active',undefined,RIDER),
      play('hood',HOOD,'bench',0,VMAX),
      play('float',FLOAT,'active',undefined,RIDER));
    assert.deepEqual(policy.decide(request),{kind:'select-action',token:'pass'});
  });
}
