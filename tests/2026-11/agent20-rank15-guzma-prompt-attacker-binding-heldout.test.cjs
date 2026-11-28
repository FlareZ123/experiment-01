'use strict';

// Guzma root promises one specific Bench Mega, and its second mandatory switch
// prompt must not secretly choose another identical print disabled from attack.
const test=require('node:test');
const assert=require('node:assert/strict');
const {guzmaPrompt,guzmaOpportunity}=require(
  '../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');
const MEGA='Mega Lopunny ex PFL 84';
const ENERGY='Grass Energy BLW 105';
const GUZMA='Guzma BUS 115';
const card=(printing,extra={})=>({
  printing,energies:[ENERGY],tools:[],hp:330,damage:0,
  printed:{stage:'STAGE_1'},...extra
});
function make(seat,restriction){
  const first=card(MEGA,{
    publicRestrictions:restriction==='cannotUseAttacksNextTurn'?
      {cannotUseAttacksNextTurn:['Gale Thrust']}:
      restriction==='cannotAttackNextTurn'?{cannotAttackNextTurn:true}:{}
  });
  const bench=[first,card(MEGA)];
  const observation={actorSeat:seat,globalTurn:8,
    ownTurnResources:{supporterPlayedTurn:7},ownHand:[GUZMA],
    ownPublic:{active:card('Fan Rotom SCR 118'),bench,prizeCount:2},
    opponentPublic:{active:card('Pidgey FLF 75'),
      bench:[card('Shadow Rider Calyrex V CRE 74',{hp:210,damage:30})],
      prizeCount:2}
  };
  const prompt={
    promptType:'ChoosePokemonPrompt',source:{sourcePrinting:GUZMA},
    publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
    choices:bench.map((x,i)=>({kind:'pokemon',token:'mega'+i,
      printing:MEGA,publicMetadata:{
        ownerSeat:'actor',targetZone:'bench',benchIndex:i
      }}))
  };
  return {role:'opponent',seat,observation,prompt};
}
for(const seat of [0,1]){
  for(const [restriction,expected] of [
    ['cannotUseAttacksNextTurn',1],
    ['cannotAttackNextTurn',1],
    ['none',0]
  ]){
    test('seat '+seat+': '+restriction+' root-to-prompt attacker index',()=>{
      const request=make(seat,restriction);
      const promised=guzmaOpportunity(request.observation);
      assert.equal(promised.attackerIndex,expected);
      assert.deepEqual(guzmaPrompt(request),{
        kind:'select-choices',tokens:['mega'+expected]
      });
    });
  }
}


for(const seat of [0,1]){
  for(const [label,belt,stadium,opponentTool,expected] of [
    ['Choice Belt on attacker still allows base-230 terminal',true,[],[],true],
    ['Jamming disables Belt but base-230 terminal persists',
      true,['Jamming Tower TWM 153'],[],true],
    ['without Choice Belt retains same base terminal',false,[],[],true],
    ['opaque defender Tool remains conservative',true,[],
      ['Stealthy Hood UNB 186'],false]
  ]){
    test('seat '+seat+': '+label,()=>{
      const source=make(seat,'none');
      source.observation.ownPublic.bench=[
        card(MEGA,{tools:belt?['Choice Belt PAL 176']:[],publicRestrictions:{}})
      ];
      source.observation.ownPublic.stadium=stadium;
      source.observation.opponentPublic.bench[0].tools=opponentTool;
      const root={...source,prompt:null,actionFrontier:{items:[
        {kind:'play-card',token:'guzma',actorPrinting:GUZMA}
      ]}};
      assert.equal(!!guzmaOpportunity(root.observation),expected);
      const {rootDecision}=require(
        '../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');
      const decision=rootDecision(root);
      assert.equal(decision.kind==='select-action',expected);
      if(expected)assert.equal(decision.token,'guzma');
    });
  }
}
