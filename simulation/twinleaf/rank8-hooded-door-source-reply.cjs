'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Check a public Garbotoxin board and the acting candidate's own hand.
 * This fixture uses the already published rank-8 source deal, but the
 * predicate deliberately consults no opponent-private zones.
 *
 * @param {object} own
 * @param {object} opponent
 * @returns {boolean}
 */
function hasHoodedDoorWindow(own, opponent) {
  return own.active.getPokemonCard()?.name === 'Shadow Rider Calyrex VMAX' &&
    own.active.tools.some(card => card.name === 'Stealthy Hood') &&
    own.hand.cards.some(card => card.name === 'Battle Compressor') &&
    own.hand.cards.some(card => card.name === 'Night Stretcher') &&
    own.hand.cards.some(card => card.name === 'Field Blower') &&
    own.bench.some(slot =>
      slot.getPokemonCard()?.name === 'Shadow Rider Calyrex VMAX' &&
      !slot.tools.some(card => card.name === 'Stealthy Hood')) &&
    opponent.bench.some(slot =>
      slot.getPokemonCard()?.name === 'Garbodor' &&
      slot.tools.some(card => card.name === 'Float Stone'));
}

/**
 * A genuine-deal action witness for Underworld Door through equipped
 * Garbotoxin. The alternative deliberately keeps the held Field Blower
 * unplayed. Battle Compressor moves a real Psychic Energy into discard,
 * Night Stretcher returns it, and Hood's Active VMAX uses Underworld Door.
 * This is a manually selected conditional line, not an autonomous policy.
 *
 * @template T
 * @param {()=>T} execute
 * @returns {{result:T,events:object[],stage:number,witness:object|null}}
 */
function withRank8HoodedDoorReply(execute) {
  const {SimpleTacticsAi} = require(path.join(root,'simple-bot/simple-tactics-ai'));
  const {PlayCardAction,PlayerType,SlotType} =
    require(path.join(root,'game/store/actions/play-card-action'));
  const {ResolvePromptAction} =
    require(path.join(root,'game/store/actions/resolve-prompt-action'));
  const {UseAbilityAction} =
    require(path.join(root,'game/store/actions/game-actions'));
  const {GamePhase} = require(path.join(root,'game/store/state/state'));
  const original = SimpleTacticsAi.prototype.decodeNextAction;
  const events = [];
  let stage = 0;
  let witness = null;
  let beforeDoor = null;
  let postDoorPassProbe = null;
  let liveLockAbilityProbes = null;
  const board = {player:PlayerType.ANY,slot:SlotType.BOARD,index:0};

  /** @param {object} state @param {string} detail @param {object} action */
  const mark = (state,detail,action) => {
    events.push({stage,turn:state.turn,detail,action:action.constructor.name});
    stage += 1;
    return action;
  };
  /** @param {object} own @param {string} name */
  const play = (own,name) => {
    const index = own.hand.cards.findIndex(card => card.name === name);
    assert.ok(index >= 0,'Actual candidate hand lacks '+name);
    return new PlayCardAction(own.id,index,board);
  };
  function reply(state) {
    const own = state.players.find(player => player.id === this.client.id);
    const pending = state.prompts.find(prompt => prompt.result === undefined);
    if (own?.id !== 202) return original.call(this,state);
    const opponent = state.players[0];
    if (stage === 0 && state.turn === 8 &&
        state.activePlayer === 1 && state.phase === GamePhase.PLAYER_TURN &&
        !pending && hasHoodedDoorWindow(own,opponent)) {
      witness = {
        sourceTurn:state.turn,
        ownHand:own.hand.cards.map(card => card.fullName),
        active:own.active.getPokemonCard().fullName,
        activeTools:own.active.tools.map(card => card.fullName),
        sourceGarbodorTools:opponent.bench.flatMap(slot =>
          slot.getPokemonCard()?.name === 'Garbodor' ?
            slot.tools.map(card => card.fullName) : []),
        firstAction:'Battle Compressor'
      };
      return mark(state,'Play real-hand Battle Compressor with equipped Garbotoxin',play(own,'Battle Compressor'));
    }
    if (stage === 0) return original.call(this,state);
    if (stage === 1 && pending?.constructor.name === 'ChooseCardsPrompt') {
      const energy = pending.cards.cards.find(card => card.name === 'Psychic Energy');
      assert.ok(energy,'No searchable Psychic Energy in the actual deck');
      assert.equal(pending.validate([energy]),true);
      return mark(state,'Discard one searched Basic Psychic Energy',
        new ResolvePromptAction(pending.id,[energy]));
    }
    if (stage === 2 && !pending && state.turn === 8) {
      return mark(state,'Play held Night Stretcher',play(own,'Night Stretcher'));
    }
    if (stage === 3 && pending?.constructor.name === 'ChooseCardsPrompt') {
      const energy = pending.cards.cards.find(card => card.name === 'Psychic Energy');
      assert.ok(energy,'No Psychic Energy in real discard-choice prompt');
      assert.equal(pending.validate([energy]),true);
      return mark(state,'Return discarded Psychic Energy to hand',
        new ResolvePromptAction(pending.id,[energy]));
    }
    if (stage === 4 && !pending && state.turn === 8) {
      assert.ok(own.hand.cards.some(card => card.name === 'Psychic Energy'));
      assert.ok(opponent.bench.some(slot =>
        slot.getPokemonCard()?.name === 'Garbodor' &&
        slot.tools.some(card => card.name === 'Float Stone')),
        'Opponent Garbotoxin must remain enabled for this test');
      assert.ok(own.active.tools.some(card => card.name === 'Stealthy Hood'));
      const destination = own.bench.findIndex(slot =>
        slot.getPokemonCard()?.name === 'Shadow Rider Calyrex VMAX');
      assert.ok(destination >= 0);
      const {probeDoorTarget} =
        require('./underworld-door-source-lock-probe.cjs');
      liveLockAbilityProbes = {
        hoodedActive:probeDoorTarget(state,own.id,'active',0),
        unhoodedBench:probeDoorTarget(state,own.id,'bench',destination)
      };
      beforeDoor = {
        handCount:own.hand.cards.length,
        deckCount:own.deck.cards.length,
        benchPsychic:own.bench[destination].energies.cards
          .filter(card => card.name === 'Psychic Energy').length
      };
      return mark(state,'Declare Hooded Active Underworld Door under live Garbotoxin',
        new UseAbilityAction(own.id,'Underworld Door',
          {player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0}));
    }
    if (stage === 5 && pending?.constructor.name === 'AttachEnergyPrompt') {
      const energy = pending.cardList.cards.find(card => card.name === 'Psychic Energy');
      const destination = own.bench.findIndex(slot =>
        slot.getPokemonCard()?.name === 'Shadow Rider Calyrex VMAX');
      assert.ok(energy && destination >= 0);
      const chosen = [{card:energy,to:{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:destination
      }}];
      assert.equal(pending.validate(chosen),true);
      return mark(state,'Attach recovered Psychic to Bench VMAX under live lock',
        new ResolvePromptAction(pending.id,chosen));
    }
    if (stage === 6 && !pending && state.turn === 8) {
      const destination = own.bench.find(slot =>
        slot.getPokemonCard()?.name === 'Shadow Rider Calyrex VMAX');
      assert.ok(opponent.bench.some(slot =>
        slot.getPokemonCard()?.name === 'Garbodor' &&
        slot.tools.some(card => card.name === 'Float Stone')),
        'Source Garbotoxin Tool was removed during supposed preservation');
      assert.ok(own.hand.cards.some(card => card.name === 'Field Blower'),
        'The held Field Blower should remain available');
      assert.equal(destination.energies.cards
        .filter(card => card.name === 'Psychic Energy').length,
        beforeDoor.benchPsychic + 1);
      assert.equal(own.deck.cards.length,beforeDoor.deckCount-2,
        'Underworld Door must draw two cards');
      assert.equal(own.hand.cards.length,beforeDoor.handCount+1,
        'Energy attachment followed by two drawn cards');
      witness = {
        ...witness,afterDoor:true,sourceGarbodorStillEquipped:true,
        heldFieldBlowerPreserved:true,attachedPsychic:true,
        twoCardsDrawn:true,benchTarget:destination.getPokemonCard().fullName
      };
      stage = 7;
    }
    const action = original.call(this,state);
    if (stage === 7 && !pending && state.turn === 8 &&
        action?.constructor.name === 'PassTurnAction' && postDoorPassProbe === null) {
      const {probePassedAttackOptions} =
        require('./pass-attack-announcement-probe.cjs');
      const probe = probePassedAttackOptions(state,own.id);
      postDoorPassProbe = {
        ...probe,
        observedAfterHoodedDoor: true,
        activeEnergy:own.active.energies.cards.map(card=>card.fullName),
        benchEnergy:own.bench.filter(slot=>slot.getPokemonCard()).map(slot=>({
          pokemon:slot.getPokemonCard().fullName,
          energy:slot.energies.cards.map(card=>card.fullName)
        }))
      };
    }
    return action;
  }
  SimpleTacticsAi.prototype.decodeNextAction = reply;
  try {
    const result = execute();
    return {result,events,stage,witness,postDoorPassProbe,liveLockAbilityProbes};
  } finally {
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,reply);
    SimpleTacticsAi.prototype.decodeNextAction = original;
  }
}

module.exports = {hasHoodedDoorWindow,withRank8HoodedDoorReply};
