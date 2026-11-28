'use strict';

// TM: Evolution PAR178 targets up to TWO physical Benched Pokémon per attack.
// Bunnelby's Ω Barrage can use that attack twice. A single-choice policy
// wastes an entire potential evolution even if the second choice is offered.
const test=require('node:test');
const assert=require('node:assert/strict');
const {evolutionPrompt}=require(
  '../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');
const C=printing=>({printing});
function request(seat,benchPrint,order,extra={}){
  const bench=benchPrint.map(C);
  const choices=order.map(i=>({kind:'pokemon',printing:benchPrint[i],
    token:'bench-'+i,publicMetadata:{
      ownerSeat:'actor',targetZone:'bench',
      ...(extra.indexless?{}:{benchIndex:i})
    }}));
  return {role:'opponent',seat,
    observation:{actorSeat:seat,globalTurn:3,ownerK1:extra.ownerK1??null,
      ownPublic:{active:C('Bunnelby PRC 121'),bench}},
    prompt:{promptType:'ChoosePokemonPrompt',
      source:{sourcePrinting:'Technical Machine: Evolution PAR 178',
        effectName:'Evolution'},
      publicMetadata:{selectionType:'pokemon',
        minimumCount:extra.min??1,maximumCount:extra.max??2,
        ownerSeat:'actor',targetZone:'bench'},
      choices}
  };
}
for(const seat of [0,1]){
  for(const [name,bench,order,expected] of [
    ['two identical fresh Oddish can both evolve',[
      'Oddish UNB 5','Oddish UNB 5'],[0,1],['bench-0','bench-1']],
    ['mixed Gloom and Pidgeotto both Stage2',[
      'Gloom UNB 7','Pidgeotto TEU 123'],[0,1],['bench-0','bench-1']],
    ['mixed Oddish and Buneary both Stage1 regardless offered order',[
      'Oddish UNB 5','Buneary PFL 83'],[1,0],['bench-0','bench-1']],
    ['two identical Oddish with reversed offered order',[
      'Oddish UNB 5','Oddish UNB 5'],[1,0],['bench-1','bench-0']],
    ['Stage2 Gloom plus Stage1 Oddish with no turn-age restriction',[
      'Oddish UNB 5','Gloom UNB 7'],[0,1],['bench-1','bench-0']]
  ]){
    test('seat '+seat+': '+name,()=>{
      const r=evolutionPrompt(request(seat,bench,order));
      assert.deepEqual(r,{kind:'select-choices',tokens:expected});
    });
  }
  test('seat '+seat+': prompt max1 never selects second evolution',()=>{
    const r=evolutionPrompt(request(seat,
      ['Oddish UNB 5','Oddish UNB 5'],[0,1],{max:1}));
    assert.deepEqual(r,{kind:'select-choices',tokens:['bench-0']});
  });
  test('seat '+seat+': optional min0 still chooses real available evolution',()=>{
    const r=evolutionPrompt(request(seat,
      ['Oddish UNB 5','Oddish UNB 5'],[0,1],{min:0}));
    assert.deepEqual(r,{kind:'select-choices',tokens:['bench-0','bench-1']});
  });
  test('seat '+seat+': indexless identical physical Bench choices fail closed',()=>{
    const r=evolutionPrompt(request(seat,
      ['Oddish UNB 5','Oddish UNB 5'],[0,1],{indexless:true}));
    assert.deepEqual(r,{kind:'abstain',reasonCode:'NO_SUPPORTED_POKEMON_CHOICE'});
  });
  test('seat '+seat+': one unique printing may accept legacy indexless choice',()=>{
    const r=evolutionPrompt(request(seat,['Oddish UNB 5'],[0],{indexless:true}));
    assert.deepEqual(r,{kind:'select-choices',tokens:['bench-0']});
  });
  test('seat '+seat+': invalid target index cannot invent another Pokémon',()=>{
    const q=request(seat,['Oddish UNB 5','Oddish UNB 5'],[0,1]);
    q.prompt.choices[0].publicMetadata.benchIndex=5;
    assert.deepEqual(evolutionPrompt(q),{
      kind:'select-choices',tokens:['bench-1']
    });
  });
}


function cardSearchRequest(seat,bench,offered,max=2){
  return {role:'opponent',seat,observation:{
    actorSeat:seat,globalTurn:3,ownPublic:{
      active:C('Bunnelby PRC 121'),bench:bench.map(C)
    }},
    prompt:{promptType:'ChooseCardsPrompt',
      source:{sourcePrinting:'Technical Machine: Evolution PAR 178',
        effectName:'Evolution'},
      publicMetadata:{selectionType:'card-combination',minimumCount:1,
        maximumCount:max,ownerSeat:'actor',sourceZone:'deck'},
      choices:offered.map((printing,i)=>({
        kind:'card',token:'deck-'+i,printing,
        publicMetadata:{ownerSeat:'actor',sourceZone:'deck'}
      }))
    }
  };
}
for(const seat of [0,1]){
  for(const [name,bench,offered,expected] of [
    ['two Gloom copies both taken for two Oddish',[
      'Oddish UNB 5','Oddish UNB 5'],[
      'Gloom UNB 7','Gloom UNB 7'],['deck-0','deck-1']],
    ['TEU + MEW Pidgeotto for two Pidgey',[
      'Pidgey FLF 75','Pidgey FLF 75'],[
      'Pidgeotto TEU 123','Pidgeotto MEW 17'],['deck-0','deck-1']],
    ['two Mega Lopunny for two Buneary',[
      'Buneary PFL 83','Buneary PFL 83'],[
      'Mega Lopunny ex PFL 84','Mega Lopunny ex PFL 84'],
      ['deck-0','deck-1']],
    ['Gloom plus Mega for mixed Oddish and Buneary',[
      'Oddish UNB 5','Buneary PFL 83'],[
      'Gloom UNB 7','Mega Lopunny ex PFL 84'],['deck-0','deck-1']],
    ['only one eligible copy offered cannot invent second Gloom',[
      'Oddish UNB 5','Oddish UNB 5'],[
      'Gloom UNB 7'],['deck-0']]
  ]){
    test('seat '+seat+': TM deck evolution: '+name,()=>{
      assert.deepEqual(evolutionPrompt(cardSearchRequest(seat,bench,offered)),{
        kind:'select-choices',tokens:expected
      });
    });
  }
  test('seat '+seat+': TM deck card search maximum one is binding',()=>{
    const r=evolutionPrompt(cardSearchRequest(seat,
      ['Oddish UNB 5','Oddish UNB 5'],
      ['Gloom UNB 7','Gloom UNB 7'],1));
    assert.deepEqual(r,{kind:'select-choices',tokens:['deck-0']});
  });
}
