'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseOwnerBlockadeContinuation}=
  require('../simulation/twinleaf/agent40-owner-blockade-continuation.cjs');
const {choosePublicJetBenchSwitch}=
  require('../simulation/twinleaf/agent40-public-jet-bench-frontier.cjs');
// The pinned CardType.COLORLESS enum is numeric; the catalog supplies it.
const COLORLESS=9;

/** @returns {object} An entirely actor-visible, original-printed board. */
function view(){
  return {
    decisionKind:'owner-root',globalTurn:4,
    ownHand:['Jet Energy PAL'],
    ownTurnResources:{energyPlayedTurn:2,
      energyPlayLocked:false,specialEnergyPlayLocked:false},
    ownPublic:{
      active:{printing:'Bunnelby PRC',energies:['Jet Energy PAL'],
        tools:[],attacks:[
          {name:'Burrow',cost:[COLORLESS],damage:0},
          {name:'Rototiller',cost:[COLORLESS],damage:0}
        ]},
      bench:[
        {printing:'Vileplume AOR',energies:[],attacks:[]},
        {printing:'Exeggutor PLF',energies:[],
          attacks:[{name:'Blockade',cost:[COLORLESS],damage:10}],
          publicRestrictions:{}}
      ],
      stadium:[],publicTurnRestrictions:{}
    },
    opponentPublic:{
      deckCount:40,handCount:4,stadium:[],
      publicTurnRestrictions:{supporterPlayLocked:false}
    }
  };
}
const catalog={specialEnergies:new Set(['Jet Energy PAL']),
  colorlessEnergyType:COLORLESS};

test('opt-in opponent Supporter lock beats generic preservation of paid Burrow',()=>{
  const v=view();
  assert.equal(choosePublicJetBenchSwitch(v,catalog,
    {payable:()=>true}),null);
  assert.deepEqual(chooseOwnerBlockadeContinuation(v,catalog),{
    kind:'attach-special-energy',handIndex:0,printing:'Jet Energy PAL',
    slot:'bench',index:1,
    reason:'finish-bunnelby-tm-into-exeggutor-blockade',
    plannedAttackName:'Blockade'
  });
});

test('preserve immediately threatening Burrow deckout and existing lock',()=>{
  const nearDeckout=view();
  nearDeckout.opponentPublic.deckCount=1;
  assert.equal(chooseOwnerBlockadeContinuation(nearDeckout,catalog),null);
  const existing=view();
  existing.opponentPublic.publicTurnRestrictions.supporterPlayLocked=true;
  assert.equal(chooseOwnerBlockadeContinuation(existing,catalog),null);
});

test('no choice with missing board, no Jet, or a filled attachment quota',()=>{
  const noEgg=view();
  noEgg.ownPublic.bench.pop();
  assert.equal(chooseOwnerBlockadeContinuation(noEgg,catalog),null);
  const noAor=view();
  noAor.ownPublic.bench.shift();
  assert.equal(chooseOwnerBlockadeContinuation(noAor,catalog),null);
  const noJet=view();
  noJet.ownHand.length=0;
  assert.equal(chooseOwnerBlockadeContinuation(noJet,catalog),null);
  const spent=view();
  spent.ownTurnResources.energyPlayedTurn=4;
  assert.equal(chooseOwnerBlockadeContinuation(spent,catalog),null);
});

test('reject disabled Special Energy, Temple, outstanding TM, and Blockade restriction',()=>{
  const lock=view();
  lock.ownPublic.publicTurnRestrictions.specialEnergyPlayLocked=true;
  assert.equal(chooseOwnerBlockadeContinuation(lock,catalog),null);
  const temple=view();
  temple.opponentPublic.stadium.push('Temple of Sinnoh ASR');
  assert.equal(chooseOwnerBlockadeContinuation(temple,catalog),null);
  const stillTm=view();
  stillTm.ownPublic.active.tools.push('Technical Machine: Evolution PAR');
  assert.equal(chooseOwnerBlockadeContinuation(stillTm,catalog),null);
  const blocked=view();
  blocked.ownPublic.bench[1].publicRestrictions.cannotAttackNextTurn=true;
  assert.equal(chooseOwnerBlockadeContinuation(blocked,catalog),null);
});

test('after real opponent gust, fund Active Exeggutor instead of old Bench target',()=>{
  const v=view();
  const previouslyActive=v.ownPublic.active;
  v.ownPublic.active=v.ownPublic.bench.pop();
  v.ownPublic.bench.push(previouslyActive);
  assert.deepEqual(chooseOwnerBlockadeContinuation(v,catalog),{
    kind:'attach-special-energy',handIndex:0,printing:'Jet Energy PAL',
    slot:'active',index:0,
    reason:'fund-gusted-active-exeggutor-blockade',
    plannedAttackName:'Blockade'
  });
  v.ownPublic.active.energies.push('Jet Energy PAL');
  assert.equal(chooseOwnerBlockadeContinuation(v,catalog),null,
    'Already funded Exeggutor must not accept redundant Jet');
  v.ownPublic.active.energies.length=0;
  v.ownPublic.active.publicRestrictions.cannotAttackNextTurn=true;
  assert.equal(chooseOwnerBlockadeContinuation(v,catalog),null,
    'Do not spend Jet while Blockade is forbidden');
});

test('gusted Active requires real AOR and legal owner attachment window',()=>{
  const v=view();
  v.ownPublic.active=v.ownPublic.bench[1];
  v.ownPublic.bench=[v.ownPublic.bench[0]];
  v.ownPublic.bench.length=0;
  assert.equal(chooseOwnerBlockadeContinuation(v,catalog),null,
    'Do not choose narrow dual-lock continuation without Vileplume');
  v.ownPublic.bench.push({printing:'Vileplume AOR'});
  v.ownTurnResources.energyPlayedTurn=v.globalTurn;
  assert.equal(chooseOwnerBlockadeContinuation(v,catalog),null,
    'No second normal Energy attachment');
});
