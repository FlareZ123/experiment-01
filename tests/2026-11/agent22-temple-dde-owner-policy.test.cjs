'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  VERSION, TEMPLE, DDE, chooseTempleDdeDenial
} = require('../../simulation/twinleaf/2026-11/agent22-temple-dde-owner-policy.cjs');

const catalog = {
  trainerStadiumPrints: new Map([[TEMPLE, {type:'Stadium'}]])
};

/** @returns {object} An owner-only detached public observation fixture. */
function view() {
  return {
    actorSeat:0,
    decisionKind:'owner-root',
    globalTurn:12,
    ownHand:[TEMPLE, 'Psychic Energy SVE'],
    ownTurnResources:{stadiumPlayLocked:false,stadiumPlayedTurn:11},
    ownPublic:{
      stadium:[],
      publicTurnRestrictions:{stadiumPlayLocked:false},
      active:{printing:'Shadow Rider Calyrex VMAX CRE'}
    },
    opponentPublic:{
      stadium:[],
      active:{printing:'Regidrago VSTAR SIT',energies:[DDE]},
      bench:[null]
    }
  };
}

test('offers paid native Stadium only when held Temple meets visible Regidrago DDE',()=>{
  const choice=chooseTempleDdeDenial(view(),catalog);
  assert.equal(choice.kind,'play-temple-dde-denial');
  assert.equal(choice.handIndex,0);
  assert.equal(choice.printing,TEMPLE);
  assert.equal(choice.targetPrinting,'Regidrago VSTAR SIT');
  assert.equal(choice.source,VERSION);
  assert.equal(Object.isFrozen(choice),true);
});

test('does not play unheld, previously played, blocked, or already active Stadium',()=>{
  const noHand=view();noHand.ownHand=['Psychic Energy SVE'];
  assert.equal(chooseTempleDdeDenial(noHand,catalog),null);
  const played=view();played.ownTurnResources.stadiumPlayedTurn=12;
  assert.equal(chooseTempleDdeDenial(played,catalog),null);
  const locked=view();locked.ownPublic.publicTurnRestrictions.stadiumPlayLocked=true;
  assert.equal(chooseTempleDdeDenial(locked,catalog),null);
  const existing=view();existing.opponentPublic.stadium=[TEMPLE];
  assert.equal(chooseTempleDdeDenial(existing,catalog),null);
  const unregistered=view();assert.equal(chooseTempleDdeDenial(unregistered,
    {trainerStadiumPrints:new Map()}),null);
});

test('respects exact opponent public attachment, name, and owner-only turn',()=>{
  const notDragon=view();notDragon.opponentPublic.active.printing='Pidgey MEW';
  assert.equal(chooseTempleDdeDenial(notDragon,catalog),null);
  const noDde=view();noDde.opponentPublic.active.energies=['Fire Energy SVE'];
  assert.equal(chooseTempleDdeDenial(noDde,catalog),null);
  const bench=view();bench.opponentPublic.active=null;
  bench.opponentPublic.bench=[{printing:'Regidrago V SIT',energies:[DDE]}];
  assert.equal(chooseTempleDdeDenial(bench,catalog)?.targetPrinting,
    'Regidrago V SIT');
  const prompt=view();prompt.decisionKind='owner-prompt';
  assert.equal(chooseTempleDdeDenial(prompt,catalog),null);
});
