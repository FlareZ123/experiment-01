'use strict';

const assert=require('node:assert/strict');

const VERSION='agent26-rank13-source-t53-dialga-shred-overclock-v1';

/**
 * Target the single native owner-visible attack opportunity discovered after
 * the prior exact-source T3 Marnie intervention. Propose an attack; the real
 * native Store retains final legality and printed-payment authority.
 *
 * @param {object} view Detached, owner-only actorObservation.
 * @returns {{kind:'attack',attackName:'Shred',source:string}|null}
 */
function chooseRank13SourceDialgaShred(view){
  assert.equal(view.decisionKind,'owner-root');
  if(view.globalTurn!==53)return null;
  const own=view.ownPublic;
  const source=own?.active;
  const defending=view.opponentPublic?.active;
  if(source?.printing!=='Dialga-GX UPR'||
    defending?.printing!=='Unown AOR')return null;
  if(!Array.isArray(source.energies)||
    source.energies.filter(x=>x==='Fire Energy MEE').length<2||
    !source.energies.some(x=>x.startsWith('Double Dragon Energy ')))
    return null;
  if(!source.attacks?.some(x=>x.name==='Shred'))return null;
  if([...(own.stadium??[]),...(view.opponentPublic.stadium??[])]
    .some(x=>x.startsWith('Temple of Sinnoh ')))return null;
  const r=own.publicTurnRestrictions;
  const a=source.publicRestrictions;
  if(r?.attackLockTurnsRemaining>0||
    a?.cannotAttackNextTurn===true||
    a?.blockedAttackNameNextTurn==='Shred'||
    a?.blockedAttackNameUntilLeavesActive==='Shred'||
    a?.cannotUseAttacksNextTurn?.includes('Shred')||
    a?.onlyAllowedAttackNameNextTurn&&
      a.onlyAllowedAttackNameNextTurn!=='Shred')return null;
  return {kind:'attack',attackName:'Shred',source:VERSION};
}

module.exports={VERSION,chooseRank13SourceDialgaShred};
