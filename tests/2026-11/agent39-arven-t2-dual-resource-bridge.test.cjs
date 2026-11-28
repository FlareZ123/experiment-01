'use strict';
/*
 * Actual PR95-derived pure worker decision at the typed Arven prompt.
 * No fake engine action: both selected tokens are offered Item+Tool cards.
 * This fixture is an actor-only constructed state, not a native Store turn.
 */
const test=require('node:test');
const assert=require('node:assert/strict');
const {createPolicy,POLICY_VERSION}=
  require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const ENERGY='Psychic Energy MEE 13';
const FOG='Fog Crystal CRE 140';
const TREASURE='Mysterious Treasure FLI 113';
const FOREST='Forest Seal Stone SIT 156';
function pokemon(printing,energy=0){
  return {
    printing,hp:210,damage:0,energies:Array(energy).fill(ENERGY),
    tools:[],abilities:[],abilitySuppressions:[],attacks:[],
    printed:{stage:'BASIC',types:['Psychic'],subtypes:['Basic'],
      weakness:[],resistance:[],retreatCost:['Colorless']}
  };
}
function side(active){
  return {
    active,bench:[],stadium:[],discard:[],lostZone:[],
    resolvingSupporter:[],handCount:2,deckCount:40,
    publicTurnRestrictions:{
      gxUsed:false,vstarUsed:false,
      stadiumAndToolHaveNoEffectTurnsRemaining:0
    }
  };
}
function request(seat,{hand=[ENERGY,'Night Stretcher ASC 196'],
  energyPlayed=1,stadiumPlayed=0,vstarUsed=false,
  available=[FOG,TREASURE,FOREST],active='Shadow Rider Calyrex V CRE 74',
  currentStadium=[]}={}){
  const choices=available.map((printing,i)=>({
    token:'card-'+i,kind:'card',printing,
    publicMetadata:{
      selectionIndex:i,selectedCount:1,
      sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true
    }
  }));
  choices.push({token:'empty',kind:'empty-selection',label:'Choose no cards'});
  return {
    role:'candidate',seat,publicEventReceipt:null,
    observation:{
      actorSeat:seat,globalTurn:3,decisionKind:'owner-prompt',
      ownHand:hand,
      ownTurnResources:{
        supporterPlayedTurn:1,energyPlayedTurn:energyPlayed,
        stadiumPlayedTurn:stadiumPlayed,vstarUsed,itemPlayLocked:false
      },
      ownPublic:side(pokemon(active,1)),
      opponentPublic:{...side(pokemon('Snorlax PGO 55')),stadium:currentStadium}
    },
    prompt:{
      schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
      promptType:'ChooseCardsPrompt',description:'CHOOSE_CARD_TO_HAND',
      source:{
        classification:'actor-choice',sourceKind:'card-effect',
        sourcePrinting:'Arven SVI 166',effectName:'Arven'
      },
      choices,
      publicMetadata:{
        selectionType:'card-combination',sourceZone:'deck',
        ownerSeat:'actor',isOwnerVisible:true,
        minimumCount:0,maximumCount:2,allowCancel:false,isSecret:false
      }
    },
    actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[]}
  };
}
function run(input,wanted){
  const out=createPolicy({
    role:'candidate',seat:input.seat,
    policyVersion:POLICY_VERSION,config:{}
  }).decideWithAudit(input);
  assert.deepEqual(out.decision,
    {kind:'select-choices',tokens:wanted});
  assert.deepEqual(out.policyAudit.selectedTokens,wanted);
  assert.deepEqual(out.policyAudit.evaluations.map(x=>x.token),
    input.prompt.choices.map(x=>x.token));
  protocol.validatePrompt(input.prompt,input.seat);
  protocol.validateDecision(out.decision,input.prompt,new Set());
  protocol.validatePolicyAudit(out.policyAudit,input,
    out.decision,POLICY_VERSION);
  return out;
}
for(const seat of [0,1]){
  test('two missing axes choose Treasure Item plus FSS Tool, seat '+seat,()=>{
    const result=run(request(seat),['card-1','card-2']);
    assert.equal(result.policyAudit.selectionRuleCode,
      'ARVEN_T2_TREASURE_FOREST_DUAL_AXIS');
    assert.equal(result.policyAudit.evaluations[1].score,96);
  });
  test('one held Psychic with no discard spare preserves old pair, seat '+seat,()=>{
    run(request(seat,{hand:[ENERGY]}),['card-2','card-0']);
  });
  test('manual Energy already used preserves old pair, seat '+seat,()=>{
    run(request(seat,{energyPlayed:3}),['card-2','card-0']);
  });
  test('VMAX already held so Treasure is redundant, seat '+seat,()=>{
    run(request(seat,{hand:[ENERGY,'Night Stretcher ASC 196',
      'Shadow Rider Calyrex VMAX CRE 75']}),['card-2','card-0']);
  });
  test('no offered FSS means no invented Tool, seat '+seat,()=>{
    run(request(seat,{available:[FOG,TREASURE]}),['card-0']);
  });
  test('VSTAR used or a stadium contested prevents narrow override, seat '+seat,()=>{
    run(request(seat,{vstarUsed:true}),['card-2','card-0']);
    run(request(seat,{currentStadium:['Sky Field ROS 89']}),['card-2','card-0']);
  });
}
