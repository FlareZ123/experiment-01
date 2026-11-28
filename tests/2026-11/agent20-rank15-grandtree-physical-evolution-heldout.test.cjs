'use strict';

// Same-printing Oddish may differ in turns in play. Grand Tree must evolve the
// established physical copy, never the new copy that merely shares a name.
const test=require('node:test');
const assert=require('node:assert/strict');
const {createPolicy,POLICY_VERSION}=require(
  '../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');
const ODDISH='Oddish UNB 5',TREE='Grand Tree SCR 136';
const oddish=turn=>({printing:ODDISH,lastPlayedOrEvolvedTurn:turn,tools:[],energies:[]});
function promptRequest(seat,bench,choiceIndices,withIndex=true){
  return {role:'opponent',seat,observation:{
    actorSeat:seat,globalTurn:7,ownHand:[],
    ownPublic:{active:{printing:'Fan Rotom SCR 118'},bench,prizeCount:3},
    opponentPublic:{active:{printing:'Shadow Rider Calyrex V CRE 74'},bench:[]}
  },prompt:{
    promptType:'ChoosePokemonPrompt',source:{sourcePrinting:TREE},
    publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,
      ownerSeat:'actor',targetZone:'bench'},
    choices:choiceIndices.map(i=>({kind:'pokemon',token:'oddish'+i,
      printing:ODDISH,publicMetadata:{ownerSeat:'actor',targetZone:'bench',
        ...(withIndex?{benchIndex:i}:{})}
    }))
  }};
}
for(const seat of [0,1]){
  for(const [name,bench,indices,indexed,expected] of [
    ['older second despite first offered newly planted',
      [oddish(7),oddish(6)],[0,1],true,'oddish1'],
    ['older first despite second offered newly planted',
      [oddish(6),oddish(7)],[1,0],true,'oddish0'],
    ['two same-print copies with no index fail closed',
      [oddish(7),oddish(6)],[0,1],false,null],
    ['unique established copy may accept legacy indexless token',
      [oddish(6)],[0],false,'oddish0']
  ]){
    test('seat '+seat+': '+name,()=>{
      const r=createPolicy({role:'opponent',seat,policyVersion:POLICY_VERSION,config:{}})
        .decide(promptRequest(seat,bench,indices,indexed));
      if(expected===null){
        assert.deepEqual(r,{kind:'abstain',reasonCode:'NO_SUPPORTED_POKEMON_CHOICE'});
      }else{
        assert.deepEqual(r,{kind:'select-choices',tokens:[expected]});
      }
    });
  }
}


function activePromptRequest(seat,active,bench,zones,metaZone){
  return {role:'opponent',seat,observation:{
    actorSeat:seat,globalTurn:7,ownHand:[],
    ownPublic:{active,bench,prizeCount:3,stadium:[]},
    opponentPublic:{active:{printing:'Shadow Rider Calyrex V CRE 74'},bench:[]}
  },prompt:{
    promptType:'ChoosePokemonPrompt',source:{sourcePrinting:TREE},
    publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,
      ownerSeat:'actor',...(metaZone?{targetZone:metaZone}:{})},
    choices:zones.map((zone,i)=>({kind:'pokemon',token:zone+i,
      printing:ODDISH,publicMetadata:{ownerSeat:'actor',targetZone:zone,
        ...(zone==='bench'?{benchIndex:0}:{})}
    }))
  }};
}
for(const seat of [0,1]){
  for(const [name,active,bench,zones,metaZone,expected] of [
    ['established Active only',oddish(6),[],['active'],null,'active0'],
    ['old Active rather than newly placed Bench',
      oddish(6),[oddish(7)],['bench','active'],null,'active1'],
    ['new Active vs established Bench',
      oddish(7),[oddish(6)],['active','bench'],null,'bench1'],
    ['prompt Bench-only cannot invent an Active choice',
      oddish(6),[oddish(7)],['active','bench'],'bench',null]
  ]){
    test('seat '+seat+': '+name,()=>{
      const r=createPolicy({role:'opponent',seat,policyVersion:POLICY_VERSION,config:{}})
        .decide(activePromptRequest(seat,active,bench,zones,metaZone));
      if(expected===null)assert.deepEqual(r,
        {kind:'abstain',reasonCode:'NO_SUPPORTED_POKEMON_CHOICE'});
      else assert.deepEqual(r,{kind:'select-choices',tokens:[expected]});
    });
  }
  test('seat '+seat+': established Active Oddish enables Grand Tree root action',()=>{
    const r=createPolicy({role:'opponent',seat,policyVersion:POLICY_VERSION,config:{}})
      .decide({
        role:'opponent',seat,prompt:null,
        observation:{actorSeat:seat,globalTurn:7,ownHand:[],
          ownPublic:{active:oddish(6),bench:[],prizeCount:3,stadium:[]},
          opponentPublic:{active:{printing:'Shadow Rider Calyrex V CRE 74'},bench:[]}},
        actionFrontier:{items:[{kind:'use-stadium',token:'tree',actorPrinting:TREE}]}
      });
    assert.deepEqual(r,{kind:'select-action',token:'tree'});
  });
}
