'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const modulePath=path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output/sets/09-sword-and-shield/set-astral-radiance/hisuian-heavy-ball');

/**
 * The pinned Hisuian Heavy Ball builds a shuffled list of Prize positions but
 * leaves the player's original CardList positions untouched. Its caller also
 * passes Array.filter()'s new array, so permuting that array cannot repair it.
 * Copy only card contents back to the *existing* Prize CardList positions.
 *
 * @param {(positions: object[])=>object[]} original Pinned shuffle method.
 * @returns {(positions: object[])=>object[]}
 */
function makePaperPrizeShuffle(original) {
  return function paperPrizeShuffle(positions) {
    const shuffled=original.call(this,positions);
    assert.ok(Array.isArray(shuffled) && shuffled.length===positions.length,
      'Unexpected pinned Hisuian Heavy Ball Prize permutation');
    const cards=shuffled.map(position=>position.cards.slice());
    for(let index=0;index<positions.length;index++) {
      positions[index].cards.splice(0,positions[index].cards.length,...cards[index]);
    }
    return positions;
  };
}

let installed=null;

/** @returns {()=>void} Restore the original pinned method. */
function installHisuianHeavyBallPrizeShuffleHook() {
  if(installed!==null)throw new Error('Hisuian Heavy Ball hook already installed');
  const {HisuianHeavyBall}=require(modulePath);
  const {GameMessage}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/game-message'));
  const original=HisuianHeavyBall.prototype.shuffleFaceDownPrizeCards;
  const originalReduce=HisuianHeavyBall.prototype.reduceEffect;
  const patched=makePaperPrizeShuffle(original);

  // Pinned reducer erroneously offers face-up Prize Pokémon in its choice
  // prompt, although the printed Item permits taking only face-down Prizes.
  // Restrict the one transient prompt without modifying physical Prize cards.
  const patchedReduce=function paperFaceDownSelection(store,state,effect) {
    if (effect?.trainerCard!==this || !effect?.player)
      return originalReduce.call(this,store,state,effect);
    const eligible=new Set(effect.player.prizes
      .filter(slot=>slot.isSecret).flatMap(slot=>slot.cards));
    const existing=Object.getOwnPropertyDescriptor(store,'prompt');
    const originalPrompt=store.prompt;
    const filteredPrompt=function (promptState,prompt,callback) {
      if(prompt?.constructor?.name==='ChooseCardsPrompt' &&
          prompt.player===effect.player &&
          prompt.message===GameMessage.CHOOSE_CARD_TO_HAND) {
        prompt.cards.cards=prompt.cards.cards.filter(card=>eligible.has(card));
      }
      return originalPrompt.call(this,promptState,prompt,callback);
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
