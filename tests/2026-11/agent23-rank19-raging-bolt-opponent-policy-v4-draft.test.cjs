'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const m=require('../../simulation/evaluation/2026-11/agent23-rank19-raging-bolt-opponent-policy-v4-draft.cjs');
const L='Lightning Energy MEE',F='Fighting Energy MEE',D='Darkness Energy MEE',X='Double Dragon Energy ROS';
const B='Raging Bolt ex TEF',M='Galarian Moltres V CRE 97',S="Professor Sada's Vitality PAR";
const mon=(printing,energies=[],hp=320,damage=0)=>({printing,energies,hp,damage,tools:[],printed:{retreatCost:['Colorless']},abilitySuppressions:[]});
const own=(active,bench,discard=[],prizeCount=6)=>({active,bench,discard,stadium:[],prizeCount,publicTurnRestrictions:{gxUsed:true}});
const target=()=>mon('Shadow Rider Calyrex VMAX CRE');
const attack={kind:'attack',token:'bolt',actorPrinting:B,attackName:'Bellowing Thunder',publicMetadata:{attackCostPayable:true}};
const sada={kind:'play-card',token:'sada',actorPrinting:S};
const gust={kind:'play-card',token:'gust',actorPrinting:'Guzma BUS'};
const pass={kind:'pass',token:'pass'};
const request=(seat,o,active=target(),bench=[],items=[attack,pass])=>({role:'opponent',seat,observation:{actorSeat:seat,ownPublic:o,ownHand:[],opponentPublic:{active,bench,stadium:[],prizeCount:6}},actionFrontier:{items}});
const policy=(seat,caps)=>m.createPolicy({role:'opponent',seat,policyVersion:m.POLICY_VERSION,config:{draftPromptContracts:caps}});
const select=token=>({kind:'select-action',token});
for(const seat of [0,1]){
 test('seat '+seat+' no capability means no draft root',()=>{
  const r=request(seat,own(mon(B,[X]),[mon('Ho-Oh-EX DRX',[L,F,D,L,F])]),target(),[],[attack,pass]);
  assert.equal(m.chooseRoot(r,new Set()),null);
  assert.deepEqual(policy(seat,[m.DISCARD]).decide(r),select('bolt'));
 });
 test('seat '+seat+' attach-only capability never enables discard attack',()=>{
  const r=request(seat,own(mon(B,[X]),[mon('Ho-Oh-EX DRX',[L,F,D,L,F])],[D]),target(),[],[attack,sada,pass]);
  assert.deepEqual(policy(seat,[m.ATTACH]).decide(r),select('sada'));
 });
 test('seat '+seat+' terminal Bellowing is not diverted into extra acceleration or gust',()=>{
  const r=request(seat,own(mon(B,[X]),[mon(M,[D,D,L]),mon('Ho-Oh-EX DRX',[F])],[F],1),mon('Wobbuffet PHF',[],110),[target()],[attack,sada,gust,pass]);
  assert.deepEqual(policy(seat,[m.DISCARD,m.ATTACH]).decide(r),select('bolt'));
 });
 test('seat '+seat+' nonterminal one-Prize Bolt loses to a ready three-Prize Moltres gust',()=>{
  const r=request(seat,own(mon(B,[X]),[mon(M,[D,D,L]),mon('Ho-Oh-EX DRX',[F])],[F],4),mon('Wobbuffet PHF',[],110),[target()],[attack,sada,gust,pass]);
  assert.deepEqual(policy(seat,[m.DISCARD,m.ATTACH]).decide(r),select('gust'));
 });
 test('seat '+seat+' Sada before nonterminal Bellowing when it protects reserve resources',()=>{
  const r=request(seat,own(mon(B,[X]),[mon(M,[D,D,L]),mon(B,[L,F])],[F,D],6),target(),[],[attack,sada,pass]);
  assert.deepEqual(policy(seat,[m.DISCARD,m.ATTACH]).decide(r),select('sada'));
 });
 test('seat '+seat+' malformed draft prompt fails closed rather than inventing a donor',()=>{
  const r=request(seat,own(mon(B,[X]),[mon(M,[D,D,L])]));
  r.prompt={promptType:'DiscardEnergyPrompt',source:{sourceKind:'card-effect',effectName:'wrong',sourcePrinting:B},choices:[],publicMetadata:{selectionType:'energy-discard'}};
  assert.deepEqual(policy(seat,[m.DISCARD]).decide(r),{kind:'abstain',reasonCode:'UNSUPPORTED_DISCARD_ENERGY_PROMPT'});
 });
}
