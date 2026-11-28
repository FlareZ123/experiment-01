'use strict';

// Grand Tree follows the chosen physical evolution chain. An unrelated Gloom
// on Bench cannot shadow a freshly evolved Pidgeotto's Stage2 deck prompt.
const test=require('node:test');
const assert=require('node:assert/strict');
const {grandTreePrompt}=require(
  '../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');
const card=printing=>({printing});
function req(seat,board,offer){
  return {role:'opponent',seat,
    observation:{actorSeat:seat,globalTurn:7,
      ownPublic:{active:card('Fan Rotom SCR 118'),bench:board.map(card)}},
    prompt:{
      promptType:'ChooseCardsPrompt',
      source:{sourcePrinting:'Grand Tree SCR 136',effectName:'Grand Tree'},
      publicMetadata:{selectionType:'card-combination',sourceZone:'deck',
        ownerSeat:'actor',minimumCount:1,maximumCount:1,allowCancel:false},
      choices:offer.map((printing,i)=>({kind:'card',printing,token:'card'+i,
        publicMetadata:{ownerSeat:'actor',sourceZone:'deck'}}))
    }
  };
}
for(const seat of [0,1]){
  for(const [name,board,offer,target] of [
    ['unrelated Gloom cannot hide Pidgeot Stage2',
      ['Gloom UNB 7','Pidgeotto TEU 123'],['Pidgeot ex OBF 164'],
      'Pidgeot ex OBF 164'],
    ['Gloom cannot hide Pidgeotto Stage1; choose Air Mail print',
      ['Gloom UNB 7','Pidgey FLF 75'],
      ['Pidgeotto MEW 17','Pidgeotto TEU 123'],'Pidgeotto TEU 123'],
    ['Oddish cannot hide Pidgeotto-to-Pidgeot',
      ['Oddish UNB 5','Pidgeotto TEU 123'],
      ['Pidgeot ex OBF 164'],'Pidgeot ex OBF 164'],
    ['same-stage Gloom chooses Vileplume BUS when offered',
      ['Gloom UNB 7','Pidgeotto TEU 123'],
      ['Vileplume BUS 6'],'Vileplume BUS 6'],
    ['Gloom cannot hide Buneary-to-Mega',
      ['Buneary PFL 83','Gloom UNB 7'],
      ['Mega Lopunny ex PFL 84'],'Mega Lopunny ex PFL 84'],
    ['never invent an unoffered evolution card',
      ['Gloom UNB 7','Pidgeotto TEU 123'],
      ['Oddish UNB 5'],null]
  ]){
    test('seat '+seat+': '+name,()=>{
      const r=grandTreePrompt(req(seat,board,offer));
      const selected=r.kind==='select-choices'?
        offer[Number(r.tokens[0].slice(-1))]:null;
      assert.equal(selected,target);
      if(target===null)assert.deepEqual(r,{
        kind:'abstain',reasonCode:'NO_LEGAL_CARD_SET'
      });
    });
  }
}
