'use strict';
const assert=require('node:assert/strict');
const VERSION='agent8-source-rank5-mew-genesect-bench-priority-v1';
/**
 * Reserve the first live attacker and Fusion Strike System engine before
 * playing an optional off-axis Basic such as Dedenne-GX or Crobat V.
 * Read only the owner's held Basic indices and public board; both roles
 * must be actually present in hand and eligible under the caller's locks.
 * @param {object} view Detached actor owner-root observation.
 * @param {number[]} eligibleIndices Exact owner-hand legal-looking Basic indices.
 * @returns {number|null} The role-critical owner-hand index, if any.
 */
function chooseMewGenesectBenchIndex(view,eligibleIndices){
  assert.equal(view.decisionKind,'owner-root');
  const active=view.ownPublic.active;
  const inPlay=[active,...(view.ownPublic.bench??[])].filter(Boolean);
  const hasAttacker=inPlay.some(p=>
    p.printing==='Mew V FST'||p.printing==='Mew VMAX FST');
  const hasEngine=inPlay.some(p=>p.printing==='Genesect V FST');
  const first=(printing)=>eligibleIndices.find(i=>
    view.ownHand[i]===printing)??null;
  if(!hasAttacker){
    const mew=first('Mew V FST');
    if(mew!==null)return mew;
  }
  if(!hasEngine){
    const genesect=first('Genesect V FST');
    if(genesect!==null)return genesect;
  }
  return null;
}
module.exports={VERSION,chooseMewGenesectBenchIndex};
