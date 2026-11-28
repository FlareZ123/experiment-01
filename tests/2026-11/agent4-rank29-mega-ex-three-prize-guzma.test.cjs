'use strict';

// Decision-changing original-Top32 rank11 counterexample. Mega Absol ex MEG86
// is a 3-Prize Mega Evolution ex even when the pinned native actor projection
// supplies no synthetic 'Mega Evolution ex' subtype string. Latias ex SSP76 is
// an ordinary 2-Prize ex; both coexist in the authentic rank11 source deck.
// All tests are physical actor-only constructed requests, NOT a native Store,
// full game, runner admission, or matchup win-rate measurement.
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  POLICY_VERSION,createPolicy,opponentPokemonScore
}=require('../../simulation/evaluation/2026-11/agent4-rank29-iron-thorns-opponent-policy.cjs');

const PRINT=Object.freeze({
  megaAbsol:'Mega Absol ex MEG 86',
  megaLopunny:'Mega Lopunny ex PFL 84',
  megaDragonite:'Mega Dragonite ex ASC 152',
  megaKangaskhan:'Mega Kangaskhan ex MEG 104',
  latias:'Latias ex SSP 76',
  classicMegaEX:'M Charizard-EX FLF 69'
});
const HP=Object.freeze({
  [PRINT.megaAbsol]:280,[PRINT.megaLopunny]:330,
  [PRINT.megaDragonite]:370,[PRINT.megaKangaskhan]:300,
  [PRINT.latias]:210,[PRINT.classicMegaEX]:230
});

function pokemon(printing) {
  const hp=HP[printing];
  assert.ok(hp);
  return {
    printing,hp,damage:hp-110,energies:[],tools:[],
    // The current pinned native observation can lack reliable subtypes;
    // recognition must fall back to exact face-up Pokémon printings.
    printed:{stage:'BASIC',subtypes:[],weakness:[],resistance:[]}
  };
}

function makeRequest(seat,order,ready=true) {
  const bench=order.map(pokemon);
  const observation={
    actorSeat:seat,globalTurn:9,ownHand:['Guzma BUS 115'],
    ownPublic:{
      active:{printing:'Iron Thorns ex TWM 77',hp:230,damage:0,energies:[],tools:[]},
      bench:[{
        printing:'Iron Thorns ex TWM 77',hp:230,damage:0,tools:[],
        energies:ready?[
          'Speed Lightning Energy RCL 173',
          'Double Colorless Energy SUM 136'
        ]:[]
      }],
      prizeCount:3,stadium:[],discard:[],publicTurnRestrictions:{}
    },
    opponentPublic:{
      active:{printing:'Dedenne-GX UNB 57',hp:160,damage:0,tools:[]},
      bench,stadium:[],prizeCount:3
    },
    ownTurnResources:{supporterAvailable:true}
  };
  const choices=bench.map((row,i)=>({
    kind:'pokemon',token:'opponent-bench-'+i,printing:row.printing,
    publicMetadata:{
      ownerSeat:'opponent',targetZone:'bench',benchIndex:i,
      isOwnerVisible:true
    }
  }));
  return {
    role:'opponent',seat,observation,
    prompt:{
      promptType:'ChoosePokemonPrompt',
      source:{sourceKind:'card-effect',sourcePrinting:'Guzma BUS 115',effectName:'Guzma'},
      publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
      choices
    }
  };
}

for(const seat of [0,1]) {
  test('seat '+seat+': source-rank11 Guzma chooses terminal Mega over ordinary ex regardless offered order',()=>{
    for(const order of [
      [PRINT.latias,PRINT.megaAbsol],
      [PRINT.megaAbsol,PRINT.latias]
    ]) {
      const request=makeRequest(seat,order);
      const policy=createPolicy({role:'opponent',seat,policyVersion:POLICY_VERSION,config:{}});
      const expected=order.indexOf(PRINT.megaAbsol);
      const before=order.indexOf(PRINT.latias);
      // With 3 own Prizes, a payable 140-damage Volt Cyclone KO on
      // Mega Absol ends the game; Latias's 2-Prize KO does not.
      assert.deepEqual(policy.decide(request),{
        kind:'select-choices',tokens:['opponent-bench-'+expected]
      });
      const megaScore=opponentPokemonScore(request.prompt.choices[expected],
        request.observation,'guzma');
      const ordinaryScore=opponentPokemonScore(request.prompt.choices[before],
        request.observation,'guzma');
      assert.equal(megaScore,1550);
      assert.equal(ordinaryScore,1285);
      assert.ok(megaScore>ordinaryScore);
    }
  });

  test('seat '+seat+': all Aichi Mega Evolution ex printings take 3 Prizes while old Mega-EX stays 2',()=>{
    for(const printing of [
      PRINT.megaAbsol,PRINT.megaLopunny,PRINT.megaDragonite,PRINT.megaKangaskhan
    ]) {
      const request=makeRequest(seat,[printing]);
      assert.equal(opponentPokemonScore(request.prompt.choices[0],
        request.observation,'guzma'),1550,printing);
    }
    for(const printing of [PRINT.latias,PRINT.classicMegaEX]) {
      const request=makeRequest(seat,[printing]);
      assert.equal(opponentPokemonScore(request.prompt.choices[0],
        request.observation,'guzma'),1285,printing);
    }
  });

  test('seat '+seat+': no false winning gust when Bench attacker is unfunded',()=>{
    const request=makeRequest(seat,[PRINT.megaAbsol],false);
    assert.ok(opponentPokemonScore(request.prompt.choices[0],
      request.observation,'guzma')<1550);
  });
}
