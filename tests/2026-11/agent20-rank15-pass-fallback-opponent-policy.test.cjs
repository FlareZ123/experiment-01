'use strict';const test=require('node:test'),assert=require('node:assert/strict');
const {createPolicy,POLICY_VERSION}=require('../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');
const mon=printing=>({printing,hp:70,damage:0,energies:[],tools:[],printed:{stage:'BASIC',weakness:[],resistance:[]}});
const player=active=>({active,bench:[],discard:[],stadium:[],prizeCount:3});
const q=()=>({role:'opponent',seat:0,prompt:null,observation:{actorSeat:0,globalTurn:7,
 ownHand:[],ownPublic:player(mon('Fan Rotom SCR 118')),
 opponentPublic:player(mon('Mimikyu GRI 58'))},
 actionFrontier:{items:[{kind:'pass',token:'end'}]}});
const policy=(config={})=>createPolicy({role:'opponent',seat:0,policyVersion:POLICY_VERSION,config});
test('strict source research retains explicit abstention on unsupported root',()=>{
 assert.deepEqual(policy().decide(q()),{kind:'abstain',reasonCode:'NO_SUPPORTED_ROOT_ACTION'});
});
test('playable mode can end an otherwise unproductive turn with only offered Pass token',()=>{
 assert.deepEqual(policy({allowPassFallback:true}).decide(q()),{kind:'select-action',token:'end'});
});
test('playable mode does not invent Pass when frontier has none',()=>{
 const r=q();r.actionFrontier.items=[];
 assert.equal(policy({allowPassFallback:true}).decide(r).reasonCode,'NO_EXECUTABLE_ACTION');
});
test('playable mode does not skip unimplemented native prompt or leak opponent choice',()=>{
 const r=q();r.prompt={promptType:'ChooseCardsPrompt',source:{sourcePrinting:'Unknown EX 1',effectName:'Unknown'},publicMetadata:{selectionType:'card-combination'},choices:[]};
 assert.equal(policy({allowPassFallback:true}).decide(r).reasonCode,'UNSUPPORTED_PROMPT_TYPE');
});
test('playable mode does not bypass wrong-seat or absent actor observation',()=>{
 const r=q();r.seat=1;
 assert.equal(policy({allowPassFallback:true}).decide(r).reasonCode,'ROLE_SEAT_BINDING_MISMATCH');
});
test('config accepts only explicit boolean opt-in, never arbitrary capability flags',()=>{
 assert.throws(()=>policy({allowPassFallback:false}),/AGENT20_RANK15_INIT_MISMATCH/);
 assert.throws(()=>policy({allowPassFallback:true,hiddenOpponentPeek:true}),/AGENT20_RANK15_INIT_MISMATCH/);
});
