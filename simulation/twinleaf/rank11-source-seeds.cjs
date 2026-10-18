'use strict';
const {deriveSlotSeeds} = require('../../scripts/aichi-decorrelated-seeds.cjs');

/** @param {number} i @param {string} protocol @returns {number} */
function seedForRank11Trial(i,protocol){
 if(!Number.isInteger(i)||i<0||i>=128)throw new RangeError('Trial index outside fixed frame');
 if(protocol==='legacy-consecutive-v1')return 2026101800+i;
 if(protocol!=='decorrelated-v2')throw new Error('Unknown rank11 seed protocol');
 const phase=i<100?'pilot':'published-field';
 return deriveSlotSeeds(20261018,phase,11,i%100).A;
}
/** @param {number} count @param {string} protocol */
function seedFrame(count,protocol){
 if(!Number.isInteger(count)||count<1||count>128)throw new RangeError('Invalid trial count');
 const values=Array.from({length:count},(_,i)=>seedForRank11Trial(i,protocol));
 if(new Set(values).size!==values.length||values.includes(0))throw Error('Seed collision');
 return values;
}
module.exports={seedForRank11Trial,seedFrame};
