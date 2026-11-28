'use strict';

// Eldegoss V's Happy Match is not an automatic on-Bench draw engine under
// opponent Basic/Rule-Box/all-Ability locks. Only actor-visible board facts
// are used; no opponent hand, Prize or deck information.
const test=require('node:test');
const assert=require('node:assert/strict');
const {eldCanBench,rootDecision}=require(
  '../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');
const ELD='Eldegoss V RCL 19';
const card=(printing,extra={})=>({
  printing,tools:[],energies:[],printed:{stage:'BASIC'},...extra
});
function observation(seat,{active='Pidgey FLF 75',bench=[],stadium=[],
  activeAbilitySuppressions=[]}={}){
  const a=typeof active==='string'?card(active):active;
  if(activeAbilitySuppressions.length)
    a.abilitySuppressions=activeAbilitySuppressions;
  return {actorSeat:seat,globalTurn:8,ownHand:[ELD],
    ownPublic:{active:card('Fan Rotom SCR 118'),
      bench:[card('Oddish UNB 5')],discard:['Guzma BUS 115'],
      stadium:[],prizeCount:3},
    opponentPublic:{active:a,bench,stadium,prizeCount:3}};
}
for(const seat of [0,1]){
  for(const [name,op,blocked] of [
    ['Iron Thorns ex Initialization','Iron Thorns ex TEF 77',true],
    ['Galarian Weezing Neutralizing Gas','Galarian Weezing RCL 113',true],
    ['Wobbuffet Bide Barricade','Wobbuffet PHF 36',true],
    ['Klefki Mischievous Lock','Klefki SVI 96',true],
    ['nonblocking Pidgey','Pidgey FLF 75',false],
    ['Flutter Mane only disables opposing Active Abilities',
      'Flutter Mane TEF 78',false]
  ]){
    test('seat '+seat+': opponent Active '+name,()=>{
      const obs=observation(seat,{active:op});
      assert.equal(eldCanBench(obs),!blocked);
      const result=rootDecision({role:'opponent',seat,prompt:null,observation:obs,
        actionFrontier:{items:[
          {kind:'play-card',token:'eldegoss',actorPrinting:ELD}
        ]}
      });
      assert.deepEqual(result,blocked?
        {kind:'abstain',reasonCode:'NO_SUPPORTED_ROOT_ACTION'}:
        {kind:'select-action',token:'eldegoss'});
    });
  }
  for(const [name,active,ability,suppressed,allowed] of [
    ['Thorns known suppressed','Iron Thorns ex TEF 77','Initialization',true,true],
    ['Klefki known suppressed','Klefki SVI 96','Mischievous Lock',true,true],
    ['Klefki explicitly live','Klefki SVI 96','Mischievous Lock',false,false]
  ]){
    test('seat '+seat+': '+name,()=>{
      const o=observation(seat,{active,activeAbilitySuppressions:[
        {abilityName:ability,suppressed}
      ]});
      assert.equal(eldCanBench(o),allowed);
    });
  }
  for(const [name,benched,allowed] of [
    ['Alolan Muk passive Bench Power of Alchemy',card('Alolan Muk SUM 58'),false],
    ['Alolan Muk publicly suppressed',card('Alolan Muk SUM 58',{
      abilitySuppressions:[{abilityName:'Power of Alchemy',suppressed:true}]
    }),true],
    ['Garbodor BKP Tool-enabled Garbotoxin',card('Garbodor BKP 57',{
      tools:['Float Stone BKT 137']
    }),false],
    ['Garbodor DRX Tool-enabled Garbotoxin',card('Garbodor DRX 54',{
      tools:['Stealthy Hood UNB 186']
    }),false],
    ['Garbodor without Tool does not activate',card('Garbodor BKP 57'),true],
    ['Garbodor publicly suppressed despite Tool',card('Garbodor BKP 57',{
      tools:['Float Stone BKT 137'],
      abilitySuppressions:[{abilityName:'Garbotoxin',suppressed:true}]
    }),true],
    ['Unrelated Trashalanche Garbodor does not activate Garbotoxin',
      card('Garbodor GRI 51',{tools:['Float Stone BKT 137']}),true]
  ]){
    test('seat '+seat+': '+name,()=>{
      const obs=observation(seat,{bench:[benched]});
      assert.equal(eldCanBench(obs),allowed);
    });
  }
  test('seat '+seat+': Jamming Tower does not negate Garbodor Tool-presence condition',()=>{
    const obs=observation(seat,{bench:[card('Garbodor BKP 57',{
      tools:['Float Stone BKT 137']})],
      stadium:['Jamming Tower TWM 153']});
    assert.equal(eldCanBench(obs),false);
  });
}
