'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { choosePublicTempleAgainstRegidrago } =
  require('../../simulation/twinleaf/2026-11/agent39-public-temple-regidrago-root.cjs');
const { chooseActorRootIntent } =
  require('../../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

/** @param {{actorSeat?:number, hand?:string[],opponent?:object,stadium?:string[],stadiumUsed?:number,stadiumLocked?:boolean}} [args] */
function observation(args = {}) {
  return {
    decisionKind: 'owner-root',
    actorSeat: args.actorSeat ?? 0,
    globalTurn: 3,
    ownHand: args.hand ?? ['Temple of Sinnoh ASR'],
    ownPublic: {
      active: { name: 'Shadow Rider Calyrex V', printing: 'Shadow Rider Calyrex V CRE' },
      bench: [null, null, null, null, null],
      stadium: args.stadium ?? []
    },
    opponentPublic: args.opponent ?? {
      active: { name: 'Regidrago VSTAR', printing: 'Regidrago VSTAR SIT',
        energies: ['Double Dragon Energy ROS'] },
      bench: [null, null, null, null, null],
      stadium: []
    },
    ownTurnResources: {
      stadiumPlayLocked: args.stadiumLocked ?? false,
      stadiumPlayedTurn: args.stadiumUsed ?? 1,
      pokemonPlayLocked: false,
      abilityPokemonPlayLocked: false
    }
  };
}
test('both physical seats choose the same held Temple against public Regidrago', () => {
  for (const actorSeat of [0, 1]) {
    const intent = choosePublicTempleAgainstRegidrago(observation({ actorSeat }));
    assert.equal(intent.kind, 'play-temple-of-sinnoh');
    assert.equal(intent.handIndex, 0);
    assert.equal(intent.printing, 'Temple of Sinnoh ASR');
  }
});
test('shared root can expose the opt-in native Stadium intent', () => {
  const view = observation();
  const catalog = { basics: new Set(), abilityBasics: new Set() };
  assert.equal(chooseActorRootIntent(view, catalog, {
    templeStadiumPublicRegidrago: true
  }).kind, 'play-temple-of-sinnoh');
  assert.equal(chooseActorRootIntent(view, catalog, {}).kind,
    'no-action');
});
test('refuse already occupied Stadium and consumed Stadium play', () => {
  assert.equal(choosePublicTempleAgainstRegidrago(observation({
    stadium: ['Sky Field ROS'] })), null);
  assert.equal(choosePublicTempleAgainstRegidrago(observation({
    stadiumUsed: 3 })), null);
  assert.equal(choosePublicTempleAgainstRegidrago(observation({
    stadiumLocked: true })), null);
});
test('refuse missing Temple or missing public Regidrago', () => {
  assert.equal(choosePublicTempleAgainstRegidrago(observation({
    hand: ['Lillie’s Determination MEG'] })), null);
  assert.equal(choosePublicTempleAgainstRegidrago(observation({
    opponent: { active: { name: 'Mew VMAX' }, bench: [], stadium: [] }
  })), null);
  assert.equal(choosePublicTempleAgainstRegidrago(observation({
    opponent: { active: null, bench: [
      { name: 'Regidrago V', printing: 'Regidrago V SIT' },
      null, null, null, null], stadium: [] }
  })).kind, 'play-temple-of-sinnoh');
});
