'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const FSS = 'Forest Seal Stone SIT';
const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Restrict the first Tool choice to a usable Pokémon V recipient, or hold it.
 * This is a conservative score-independent owner-policy proposal. A played
 * Tool cannot be freely detached, so attaching it to a non-V is costly.
 *
 * @param {object} player Acting player's own in-play Pokémon and own hand.
 * @param {{toolType: number, vTags: readonly number[], ownerPlayerType: number}} enums Pinned engine values.
 * @returns {{kind:'delegate'|'hold'|'attach',handIndex?:number,target?:object,recipient?:string,reason?:string}}
 */
function selectStoneRecipient(player, enums) {
  const tool = player.hand.cards.find(card => card.trainerType === enums.toolType);
  if (tool?.fullName !== FSS) return {kind:'delegate'};
  if (player.usedVSTAR) return {kind:'hold',reason:'vstar-already-spent'};
  const handIndex = player.hand.cards.indexOf(tool);
  let target;
  let recipient;
  player.forEachPokemon(enums.ownerPlayerType, (slot, pokemon, location) => {
    if (target || slot.tools.length || !pokemon) return;
    if (pokemon.tags.some(tag => enums.vTags.includes(tag))) {
      target = location;
      recipient = pokemon.fullName;
    }
  });
  if (!target) return {kind:'hold',reason:'no-free-v-recipient'};
  return {kind:'attach',handIndex,target,recipient};
}

/**
 * Research-only reversible replacement for the first-Tool proposal made by
 * Twinleaf's AttachToolTactic. Only the selected candidate player is affected;
 * non-Stone tools and every other tactic retain their pinned source behavior.
 * No hidden zones, lookahead scoring or paper winner claims are used.
 *
 * @template T
 * @param {0|1} candidateSeat Actual physical candidate seat.
 * @param {()=>T} execute Synchronous genuine Store match.
 * @returns {{result:T,audit:object}}
 */
function withStoneVRecipient(candidateSeat, execute) {
  assert.ok(candidateSeat === 0 || candidateSeat === 1);
  assert.equal(typeof execute, 'function');
  const engine = file => require(path.join(OUTPUT, file));
  const {AttachToolTactic} = engine('simple-bot/simple-tactics/attach-tool-tactic');
  const {PlayCardAction,PlayerType} = engine('game/store/actions/play-card-action');
  const {TrainerType,CardTag} = engine('game/store/card/card-types');
  const vTags = [CardTag.POKEMON_V, CardTag.POKEMON_VSTAR,
    CardTag.POKEMON_VMAX, CardTag.POKEMON_VUNION];
  const original = AttachToolTactic.prototype.useTactic;
  const expectedId = candidateSeat === 0 ? 101 : 202;
  const events = [];
  const adapted = function forestStoneOwnerOnly(state, player) {
    if (player.id !== expectedId) return original.call(this,state,player);
    const next = selectStoneRecipient(player, {
      toolType:TrainerType.TOOL, vTags, ownerPlayerType:PlayerType.BOTTOM_PLAYER
    });
    if (next.kind === 'delegate') return original.call(this,state,player);
    events.push({turn:state.turn,kind:next.kind,reason:next.reason??null,
      card:FSS,recipient:next.recipient??null});
    if (next.kind === 'hold') return undefined;
    return new PlayCardAction(player.id,next.handIndex,next.target);
  };
  AttachToolTactic.prototype.useTactic = adapted;
  try {
    return {result:execute(),audit:{
      version:'forest-stone-v-recipient-v1',candidateSeat,events,
      scope:'candidate owner hand and public Pokémon; proposed Tool tactic only',
      admittedGameWins:0
    }};
  } finally {
    assert.equal(AttachToolTactic.prototype.useTactic,adapted);
    AttachToolTactic.prototype.useTactic = original;
  }
}

module.exports={FSS,selectStoneRecipient,withStoneVRecipient};
