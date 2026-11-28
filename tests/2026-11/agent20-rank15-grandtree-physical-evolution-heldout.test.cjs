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
