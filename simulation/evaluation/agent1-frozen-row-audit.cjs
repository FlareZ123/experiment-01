'use strict';
const assert = require('node:assert/strict');
function label(row){
  if(row.error)return 'NATIVE_ERROR';
  if(row.finished===true&&row.endReason==='engine-game-end')return row.winner===0||row.winner===1?'NATIVE_TERMINAL':'FINISHED_WINNER_UNVERIFIED';
  if(row.finished===false&&row.endReason==='action-limit')return 'ACTION_CAPPED';
  return 'NATIVE_UNVERIFIED';
}
module.exports={label};
