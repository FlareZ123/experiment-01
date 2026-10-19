'use strict';

const {createHash} = require('node:crypto');

const DOMAIN='aichi-rank11-exclusive-lockbreak-20261019-v1';
const REPEATS_PER_SEAT=64;

/**
 * Precommitted independent physical-seat seed allocation.
 * No seed selection depends on a dealt hand, a result, or starting order.
 * @param {0|1} sourceSeat
 * @param {number} repeat
 * @returns {number} unsigned 32-bit seed
 */
function exclusiveTrialSeed(sourceSeat,repeat) {
  if((sourceSeat!==0&&sourceSeat!==1) ||
      !Number.isInteger(repeat) || repeat<0 || repeat>=REPEATS_PER_SEAT) {
    throw new RangeError('Outside the precommitted seat/repeat frame');
  }
  const input=`${DOMAIN}|seat=${sourceSeat}|repeat=${repeat}`;
  const seed=createHash('sha256').update(input,'utf8').digest().readUInt32BE(0);
  if(seed===0)throw new Error('Registered seed unexpectedly zero');
  return seed;
}

/** @returns {{sourceSeat:0|1,repeat:number,seed:number}[]} */
function exclusiveSeedFrame() {
  const frame=[];
  for(const sourceSeat of [0,1]) {
    for(let repeat=0;repeat<REPEATS_PER_SEAT;repeat++) {
      frame.push({sourceSeat,repeat,seed:exclusiveTrialSeed(sourceSeat,repeat)});
    }
  }
  if(new Set(frame.map(row=>row.seed)).size!==frame.length) {
    throw new Error('Registered frame contains seed collisions');
  }
  return frame;
}

/** @param {{sourceSeat:number,repeat:number,seed:number}[]} frame */
function seedFrameDigest(frame) {
  const text=frame.map(row=>`${row.sourceSeat}:${row.repeat}:${row.seed}\n`).join('');
  return createHash('sha256').update(text,'utf8').digest('hex');
}

module.exports={
  DOMAIN,REPEATS_PER_SEAT,exclusiveTrialSeed,exclusiveSeedFrame,seedFrameDigest
};
