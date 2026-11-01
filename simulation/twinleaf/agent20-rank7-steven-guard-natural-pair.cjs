'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {run:sourceRun}=require('./agent22-rank7-dealt-steven-pair.cjs');
const {installStevenPaperMinimumHook}=
  require('./agent20-steven-paper-minimum-hook.cjs');

const compiled=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @returns {object} Native real-deal replay of pre-existing Agent 22 protocol. */
function run(){
  const {Store}=require(path.join(compiled,'game/store/store'));
  const initialDispatch=Store.prototype.dispatch;

  const baseline=sourceRun();
  assert.strictEqual(Store.prototype.dispatch,initialDispatch,
    'Unmodified reference run must restore its Store hooks');
  const restore=installStevenPaperMinimumHook();
  let guarded;
  try {
    guarded=sourceRun();
  } finally {
    restore();
  }
  assert.strictEqual(Store.prototype.dispatch,initialDispatch,
    'Narrow paper minimum correction must restore the original dispatch');
  assert.equal(baseline.attempted,8);
  assert.equal(guarded.attempted,8);
  assert.deepEqual(guarded.seeds,baseline.seeds);
  assert.deepEqual(guarded.rows,baseline.rows,
    'Legal original-source Steven search policy should be unchanged by a zero-only veto');

  const pairs=guarded.rows.flatMap(row=>row.branches);
  const totalAcceptedSourceSearches=pairs.reduce((count,branch)=>{
    const accepted=branch.search?.accepted;
    if(typeof accepted==='number')return count+accepted;
    return count;
  },0);
  assert.equal(pairs.filter(b=>b.error!==null).length,0,
    'Every original source arm must remain exception-free');
  assert.equal(pairs.filter(b=>b.result?.endReason==='max-actions').length<=8,true);

  return {
    schema:'agent20-rank7-real-deal-steven-minimum-nonperturbation-v1',
    pin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceRank:7,opponentRank:1,
    originalSource60sUnchanged:true,
    controlSeeds:guarded.seeds,
    originalPhysicalSeats:[0,1],
    actionsPerArmCap:80,
    arms:guarded.attempted,
    baselineVsGuardedRowsIdentical:true,
    totalAcceptedSourceSearches,
    StoreDispatchRestored:true,
    competitiveQualifiedGames:0,
    limitation:'Reuses Agent 22 source-deal seeds, not independent replication or game-win evidence'
  };
}

if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run};
