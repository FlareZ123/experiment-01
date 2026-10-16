'use strict';

const path = require('node:path');
const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(root, name));
let restoreActive = null;

/** Correct a pinned Extra Energy Bomb action without modifying vendor code. */
function installElectrodeGXEnergyHook() {
  if (restoreActive) return restoreActive;
  const {ElectrodeGX} = load('sets/08-sun-and-moon/set-celestial-storm/electrode-gx');
  const {PowerEffect} = load('game/store/effects/game-effects');
  const {AttachEnergyPrompt} = load('game/store/prompts/attach-energy-prompt');
  const {PlayerType} = load('game/store/actions/play-card-action');
  const {SuperType,CardTag} = load('game/store/card/card-types');
  const {GameError} = load('game/game-error');
  const {GameMessage} = load('game/game-message');
  const original = ElectrodeGX.prototype.reduceEffect;
  /** @param {any} store @param {any} state @param {any} effect */
  function corrected(store,state,effect) {
    if (!(effect instanceof PowerEffect) || effect.power !== this.powers[0]) {
      return original.call(this,store,state,effect);
    }
    const player = effect.player;
    const recipients = [];
    player.forEachPokemon(PlayerType.BOTTOM_PLAYER,(list,card,target)=>{
      if (!card.hasTag(CardTag.POKEMON_GX) && !card.hasTag(CardTag.POKEMON_EX)) {
        recipients.push(target);
      }
    });
    if (recipients.length===0) throw new GameError(GameMessage.CANNOT_USE_POWER);
    const available=player.discard.cards.filter(c=>c.superType===SuperType.ENERGY);
    if (available.length===0) return original.call(this,store,state,effect);
    const mandatory=Math.min(5,available.length);
    const legalTarget=t=>recipients.some(v=>v.player===t.player && v.slot===t.slot && v.index===t.index);
    const wrapped = new Proxy(store,{
      get(target,property) {
        if (property==='prompt') return (nextState,prompt,callback)=>{
          if (prompt instanceof AttachEnergyPrompt &&
              prompt.cardList===player.discard &&
              prompt.message===GameMessage.ATTACH_ENERGY_CARDS &&
              prompt.options.max===5) {
            prompt.options.min=mandatory;
            return target.prompt(nextState,prompt,transfers=>{
              if (!Array.isArray(transfers) || !prompt.validate(transfers)) {
                throw new GameError(GameMessage.ILLEGAL_ACTION);
              }
              const chosen=new Set();
              for (const entry of transfers) {
                if (!entry || !entry.to || !legalTarget(entry.to) ||
                    !available.includes(entry.card) || chosen.has(entry.card)) {
                  throw new GameError(GameMessage.ILLEGAL_ACTION);
                }
                chosen.add(entry.card);
              }
              return callback(transfers);
            });
