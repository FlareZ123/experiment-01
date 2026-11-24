'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {shufflePrizePositions} = require('./paper-shuffle-rng-utils.cjs');

const modulePath=path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output/sets/09-sword-and-shield/set-astral-radiance/hisuian-heavy-ball');

/**
 * The pinned Hisuian Heavy Ball builds a shuffled list of Prize positions but
 * leaves the player's original CardList positions untouched. Its caller also
 * passes Array.filter()'s new array, so permuting that array cannot repair it.
 * Copy only card contents back to the *existing* Prize CardList positions.
 *
 * @param {(positions: object[])=>object[]} original Pinned shuffle method.
 * @param {(card:object,positions:object[])=>object|null} randomForOwner
 * @returns {(positions: object[])=>object[]}
 */
function makePaperPrizeShuffle(original, randomForOwner) {
  return function paperPrizeShuffle(positions) {
    const random = typeof randomForOwner === 'function' ?
      randomForOwner(this, positions) : null;
    const shuffled = random ?
      shufflePrizePositions(positions, random) : original.call(this, positions);
    assert.ok(Array.isArray(shuffled) && shuffled.length === positions.length,
      'Unexpected pinned Hisuian Heavy Ball Prize permutation');
    const cards = shuffled.map(position => position.cards.slice());
    for (let index = 0; index < positions.length; index += 1) {
      positions[index].cards.splice(0, positions[index].cards.length, ...cards[index]);
    }
    return positions;
  };
}

let installed=null;

/**
 * @param {{rootStore?:any,randomBySeat?:Array<Function>}} options
 * @returns {()=>void} Restore the original pinned method.
 */
function installHisuianHeavyBallPrizeShuffleHook(options = {}) {
  if(installed!==null)throw new Error('Hisuian Heavy Ball hook already installed');
  const {rootStore = null, randomBySeat = null} = options;
  if (randomBySeat !== null &&
      (!rootStore || !Array.isArray(randomBySeat) || randomBySeat.length !== 2 ||
       randomBySeat.some(stream => !stream || typeof stream.randomInt !== 'function'))) {
    throw new TypeError('Owner-local Heavy Ball shuffle requires root Store and two unbiased streams');
  }
  let activeSeat = null;
  const {HisuianHeavyBall}=require(modulePath);
  const {GameMessage}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/game-message'));
  const original=HisuianHeavyBall.prototype.shuffleFaceDownPrizeCards;
  const originalReduce=HisuianHeavyBall.prototype.reduceEffect;
  const patched=makePaperPrizeShuffle(original, () =>
    activeSeat === null || randomBySeat === null ? null : randomBySeat[activeSeat]);

  // Pinned reducer erroneously offers face-up Prize Pokémon in its choice
  // prompt, although the printed Item permits taking only face-down Prizes.
  // Restrict the one transient prompt without modifying physical Prize cards.
  const patchedReduce=function paperFaceDownSelection(store,state,effect) {
    if (effect?.trainerCard!==this || !effect?.player)
      return originalReduce.call(this,store,state,effect);
    const eligible=new Set(effect.player.prizes
      .filter(slot=>slot.isSecret).flatMap(slot=>slot.cards));
    const ownerSeat = randomBySeat !== null && store === rootStore ?
      state.players.indexOf(effect.player) : null;
    if (ownerSeat !== null && ownerSeat !== 0 && ownerSeat !== 1) {
      throw new Error('Hisuian Heavy Ball physical owner is not a player seat');
    }
    const existing=Object.getOwnPropertyDescriptor(store,'prompt');
    const originalPrompt=store.prompt;
    const filteredPrompt=function (promptState,prompt,callback) {
      if(prompt?.constructor?.name==='ChooseCardsPrompt' &&
          prompt.player===effect.player &&
          prompt.message===GameMessage.CHOOSE_CARD_TO_HAND) {
        prompt.cards.cards=prompt.cards.cards.filter(card=>eligible.has(card));
      }
      if (typeof callback !== 'function') {
        return originalPrompt.call(this,promptState,prompt,callback);
      }
      const wrappedCallback=(...args)=>{
        const previousSeat=activeSeat;
        if(ownerSeat!==null) activeSeat=ownerSeat;
        try { return callback(...args); }
        finally { activeSeat=previousSeat; }
      };
      return originalPrompt.call(this,promptState,prompt,wrappedCallback);
    };
    Object.defineProperty(store,'prompt',{
      configurable:true,writable:true,value:filteredPrompt
    });
    try {
      return originalReduce.call(this,store,state,effect);
    } finally {
      assert.strictEqual(store.prompt,filteredPrompt,
        'Heavy Ball prompt wrapper lost ownership');
      if(existing) Object.defineProperty(store,'prompt',existing);
      else delete store.prompt;
    }
  };

  HisuianHeavyBall.prototype.shuffleFaceDownPrizeCards=patched;
  HisuianHeavyBall.prototype.reduceEffect=patchedReduce;
  const restore=()=>{
    assert.strictEqual(HisuianHeavyBall.prototype.shuffleFaceDownPrizeCards,patched,
      'Hisuian Heavy Ball shuffle hook lost method ownership');
    assert.strictEqual(HisuianHeavyBall.prototype.reduceEffect,patchedReduce,
      'Hisuian Heavy Ball choice hook lost method ownership');
    HisuianHeavyBall.prototype.reduceEffect=originalReduce;
    HisuianHeavyBall.prototype.shuffleFaceDownPrizeCards=original;
    installed=null;
  };
  installed=restore;
  return restore;
}

module.exports={makePaperPrizeShuffle,installHisuianHeavyBallPrizeShuffleHook};
