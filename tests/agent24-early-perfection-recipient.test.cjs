'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseBenchPerfectionFunding}=
  require('../simulation/twinleaf/agent24-early-perfection-recipient.cjs');

const P=5,C=9;
const energy='Psychic Energy MEE';
const source='Gengar & Mimikyu-GX TEU';
const mewtwo='Mewtwo & Mew-GX UNM';
const catalog={
  basicEnergies:new Set([energy]),specialEnergies:new Set(),
  basicEnergyTypes:{Psychic:P},colorlessEnergyType:C,
  perfectionDonors:new Map([[source,[
    {name:'Poltergeist',cost:[P,P],gxAttack:false},
    {name:'Horror House-GX',cost:[P],gxAttack:true}
  ]]])
};

/** @param {string[]} attached */
function fixture(attached=[]){
  return {
    decisionKind:'owner-root',globalTurn:3,actorSeat:0,
    ownHand:[energy,'OTHER'],
    ownTurnResources:{energyPlayedTurn:-1,energyPlayLocked:false},
    ownPublic:{
      active:{printing:'Duskull VIV',energies:[],abilities:[]},
      bench:[
        {printing:mewtwo,energies:attached,abilities:['Perfection']},
        {printing:source,energies:[],abilities:[]}
      ],
      stadium:[],discard:[],publicTurnRestrictions:{gxUsed:false}
    },
    opponentPublic:{active:null,bench:[],stadium:[],
      handCount:5,opponentHiddenHand:['SHOULD_NEVER_BE_READ']}
  };
}

test('first Psychic funds public bench Mewtwo Horror House-GX',()=>{
  const view=fixture();const original=structuredClone(view);
  assert.deepEqual(chooseBenchPerfectionFunding(view,catalog),{
    slot:'bench',index:0,printing:energy,handIndex:0,
    donorAttack:'Horror House-GX',copiedCost:1,
    gapBefore:1,gapAfter:0
  });
  assert.deepEqual(view,original);
});

test('second Psychic finishes two-Psychic Poltergeist payment',()=>{
  const chosen=chooseBenchPerfectionFunding(fixture([energy]),catalog);
  assert.equal(chosen?.donorAttack,'Poltergeist');
  assert.equal(chosen?.gapBefore,1);
  assert.equal(chosen?.gapAfter,0);
});

test('completed donor costs and spent GX no longer consume more owner Basic Energy',()=>{
  const spent=fixture([energy,energy]);
  spent.ownPublic.publicTurnRestrictions.gxUsed=true;
  assert.equal(chooseBenchPerfectionFunding(spent,catalog),null);
  const noNeed=fixture([energy,energy]);
  assert.equal(chooseBenchPerfectionFunding(noNeed,catalog),null);
});

test('missing public donor, missing Mewtwo and already spent Energy turn fail closed',()=>{
  const missing=fixture(); missing.ownPublic.bench[1]=null;
  assert.equal(chooseBenchPerfectionFunding(missing,catalog),null);
  const missingMewtwo=fixture(); missingMewtwo.ownPublic.bench[0]=null;
  assert.equal(chooseBenchPerfectionFunding(missingMewtwo,catalog),null);
  const used=fixture(); used.ownTurnResources.energyPlayedTurn=3;
  assert.equal(chooseBenchPerfectionFunding(used,catalog),null);
  const locked=fixture(); locked.ownTurnResources.energyPlayLocked=true;
  assert.equal(chooseBenchPerfectionFunding(locked,catalog),null);
});

test('unknown Special Energy attached and opponent hidden hand contents cannot influence funding',()=>{
  const unknown=fixture(['MYSTERY SPECIAL']);
  assert.equal(chooseBenchPerfectionFunding(unknown,catalog),null);
  const a=fixture(),b=fixture();
  b.opponentPublic.opponentHiddenHand=['ANYTHING'];
  b.opponentPublic.handCount=1;
  assert.deepEqual(chooseBenchPerfectionFunding(a,catalog),
    chooseBenchPerfectionFunding(b,catalog));
});
