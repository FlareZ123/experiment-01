'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseTempleMimikyuThornsLine,VERSION}=
  require('../../simulation/twinleaf/2026-11/agent12-thorns-mimikyu-temple-owner.cjs');

const catalog={
  basicEnergies:new Set(['Psychic Energy MEE','Lightning Energy SVE']),
  specialEnergies:new Set(['Speed Lightning Energy RCL','Jet Energy PAL',
    'Double Colorless Energy SUM']),
  trainerStadiumPrints:new Map([
    ['Temple of Sinnoh ASR',{name:'Temple of Sinnoh',type:'Stadium'}]])
};

function view(){
  return {
    decisionKind:'owner-root',actorSeat:0,globalTurn:4,
    ownHand:['Psychic Energy MEE','Jet Energy PAL','Temple of Sinnoh ASR'],
    ownTurnResources:{
      energyPlayedTurn:0,stadiumPlayedTurn:0,stadiumPlayLocked:false,
      energyPlayLocked:false,specialEnergyPlayLocked:false
    },
    ownPublic:{
      active:{printing:'Iron Thorns ex TWM',energies:[]},
      bench:[{printing:'Mimikyu PAL',energies:[]},null],
      stadium:[],publicTurnRestrictions:{}
    },
    opponentPublic:{
      active:{printing:'Iron Thorns ex TWM',
        energies:['Speed Lightning Energy RCL']},
      stadium:[]
    }
  };
}

test('physical Basic Psychic, Jet promotion, and Temple hand action follow sequence',()=>{
  const s=view();
  const first=chooseTempleMimikyuThornsLine(s,catalog);
  assert.equal(first.kind,'attach-basic-energy');
  assert.equal(first.slot,'bench');
  assert.equal(first.index,0);
  s.ownHand.splice(0,1);
  s.ownPublic.bench[0].energies.push('Psychic Energy MEE');
  const second=chooseTempleMimikyuThornsLine(s,catalog);
  assert.equal(second.kind,'attach-special-energy');
  assert.equal(second.slot,'bench');
  s.ownPublic.active={...s.ownPublic.bench[0],
    energies:['Psychic Energy MEE','Jet Energy PAL']};
  s.ownPublic.bench[0]={printing:'Iron Thorns ex TWM',energies:[]};
  s.ownHand.splice(s.ownHand.indexOf('Jet Energy PAL'),1);
  const third=chooseTempleMimikyuThornsLine(s,catalog);
  assert.equal(third.kind,'play-temple-dde-denial');
  assert.equal(third.printing,'Temple of Sinnoh ASR');
  assert.equal(third.source,VERSION);
});

test('no opponent Special Energy or held Temple prohibits unproven denial',()=>{
  const s=view();
  s.opponentPublic.active.energies=['Lightning Energy SVE'];
  assert.equal(chooseTempleMimikyuThornsLine(s,catalog),null);
  s.opponentPublic.active.energies=['Speed Lightning Energy RCL'];
  s.ownPublic.active={printing:'Mimikyu PAL',energies:['Psychic Energy MEE']};
  s.ownPublic.bench=[];
  s.ownHand=['Temple of Sinnoh ASR'];
  assert.equal(chooseTempleMimikyuThornsLine(s,catalog)?.kind,
    'play-temple-dde-denial');
  s.ownHand=[];
  assert.equal(chooseTempleMimikyuThornsLine(s,catalog),null);
});

test('Stadium quota and Temple active prevent redundant play',()=>{
  const s=view();
  s.ownPublic.active={
    printing:'Mimikyu PAL',energies:['Psychic Energy MEE','Jet Energy PAL']};
  s.ownPublic.bench=[];
  s.ownPublic.stadium=['Temple of Sinnoh ASR'];
  assert.equal(chooseTempleMimikyuThornsLine(s,catalog),null);
  s.ownPublic.stadium=[];
  s.ownTurnResources.stadiumPlayedTurn=s.globalTurn;
  assert.equal(chooseTempleMimikyuThornsLine(s,catalog),null);
});

test('suppressed Jet switch and own Special lock are never claimed payable',()=>{
  const s=view();
  s.ownPublic.stadium=['Temple of Sinnoh ASR'];
  s.ownPublic.bench[0].energies=['Psychic Energy MEE'];
  assert.equal(chooseTempleMimikyuThornsLine(s,catalog),null);
  s.ownPublic.stadium=[];
  s.ownTurnResources.energyPlayedTurn=s.globalTurn;
  assert.equal(chooseTempleMimikyuThornsLine(s,catalog),null);
});
