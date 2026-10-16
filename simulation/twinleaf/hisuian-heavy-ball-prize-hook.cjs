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
  const original=HisuianHeavyBall.prototype.shuffleFaceDownPrizeCards;
  const patched=makePaperPrizeShuffle(original);
  HisuianHeavyBall.prototype.shuffleFaceDownPrizeCards=patched;
  const restore=()=>{
    assert.strictEqual(HisuianHeavyBall.prototype.shuffleFaceDownPrizeCards,patched,
      'Hisuian Heavy Ball hook lost method ownership');
    HisuianHeavyBall.prototype.shuffleFaceDownPrizeCards=original;
    installed=null;
  };
  installed=restore;
  return restore;
}

module.exports={makePaperPrizeShuffle,installHisuianHeavyBallPrizeShuffleHook};
