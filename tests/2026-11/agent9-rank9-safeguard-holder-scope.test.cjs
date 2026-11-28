'use strict';
// Aichi rank3/7 PAL97 opponent-source scope regression for rank9. No native game.
const test=require('node:test');
const assert=require('node:assert/strict');
const rank9=require('../../simulation/evaluation/2026-11/agent29-rank9-tactical-slice.cjs');

function card(printing,hp,type='Colorless') {
  return {
    printing,hp,damage:0,energies:[],tools:[],
    printed:{stage:'Basic',types:[type],subtypes:['Basic']},
    abilityDetails:[],abilitySuppressions:[]
  };
}
const safeguardText="Prevent all damage done to this Pokémon by attacks from your opponent's Pokémon ex and Pokémon V.";
function mimikyu(suppressed=false,printing='Mimikyu PAL 97') {
  return {
    ...card(printing,70,'Psychic'),
    abilityDetails:[{name:'Safeguard',text:safeguardText}],
    abilitySuppressions:suppressed?[{abilityName:'Safeguard',suppressed:true}]:[]
  };
}
function scenario(seat,{activeMimikyu=false,benchMimikyu=true,activeSuppressed=false,nativeName=false}={}) {
  const mega={
    ...card('Mega Absol ex MEG 86',280,'Darkness'),
    energies:[
      'Prism Energy ASC 216','Prism Energy ASC 216',
      'Darkness Energy MEE 15'
    ],
    printed:{stage:'Basic',types:['Darkness'],subtypes:['Basic','MEGA','ex']}
  };
  const snorlax={
    ...card('Snorlax PGO 55',150),
    abilityDetails:[{
      name:'Block',
      text:"As long as this Pokémon is in the Active Spot, your opponent's Active Pokémon can't retreat."
    }]
  };
  const girafarig=card('Girafarig LOT 94',90,'Psychic');
  const printing=nativeName?'Mimikyu PAL':'Mimikyu PAL 97';
  const active=activeMimikyu?mimikyu(activeSuppressed,printing):snorlax;
  return {
    actorSeat:seat,globalTurn:4,phase:2,ownHand:[],
    ownPublic:{active:mega,bench:[],stadium:[],prizeCount:6,discard:[]},
    opponentPublic:{
      active,bench:benchMimikyu?[girafarig,mimikyu(false,printing)]:[girafarig],
      stadium:[],prizeCount:6
    },
    ownTurnResources:{
      energyPlayedTurn:true,supporterPlayedTurn:0,retreatedTurn:false
    }
  };
}
function rank9Root(seat,o) {
  const p=rank9.createPolicy({
    role:'opponent',seat,policyVersion:rank9.POLICY_VERSION,config:{}
  });
  return p.decide({
    role:'opponent',seat,observation:o,prompt:null,sequence:3,
    actionFrontier:{items:[
      {
        kind:'attack',attackName:'Claw of Darkness',token:'claw',
        publicMetadata:{attackCostPayable:true}
      },
      {kind:'pass',token:'pass'}
    ]}
  });
}
for(const seat of [0,1]) {
  test(`seat ${seat}: Benched PAL97 Safeguard does not block Claw versus Active Snorlax`,()=>{
    const o=scenario(seat);
    assert.equal(rank9.payable(o.ownPublic.active,
      ['darkness','darkness','colorless'],-1,o),true);
    assert.equal(rank9.printedDamage(o,o.ownPublic.active,
      o.opponentPublic.active,'Claw of Darkness'),200);
    assert.deepEqual(rank9Root(seat,o),{
      kind:'select-action',token:'claw'
    });
  });
  test(`seat ${seat}: pinned native Mimikyu PAL fullname also scopes holder-only Safeguard`,()=>{
    const o=scenario(seat,{nativeName:true});
    assert.equal(o.opponentPublic.bench[1].printing,'Mimikyu PAL');
    assert.equal(rank9.printedDamage(o,o.ownPublic.active,
      o.opponentPublic.active,'Claw of Darkness'),200);
    assert.deepEqual(rank9Root(seat,o),{
      kind:'select-action',token:'claw'
    });
  });
  test(`seat ${seat}: remove the unrelated Safeguard, keep the same Claw`,()=>{
    const o=scenario(seat,{benchMimikyu:false});
    assert.equal(rank9.printedDamage(o,o.ownPublic.active,
      o.opponentPublic.active,'Claw of Darkness'),200);
    assert.deepEqual(rank9Root(seat,o),{
      kind:'select-action',token:'claw'
    });
  });
  test(`seat ${seat}: own PAL97 Safeguard still blocks a modern ex attack`,()=>{
    const o=scenario(seat,{activeMimikyu:true});
    assert.equal(rank9.printedDamage(o,o.ownPublic.active,
      o.opponentPublic.active,'Claw of Darkness'),null);
    assert.deepEqual(rank9Root(seat,o),{
      kind:'select-action',token:'pass'
    });
  });
  test(`seat ${seat}: suppressed Active PAL97 not re-shielded by a second Benched PAL97`,()=>{
    const o=scenario(seat,{activeMimikyu:true,activeSuppressed:true});
    assert.equal(rank9.printedDamage(o,o.ownPublic.active,
      o.opponentPublic.active,'Claw of Darkness'),200);
    assert.deepEqual(rank9Root(seat,o),{
      kind:'select-action',token:'claw'
    });
  });
}
