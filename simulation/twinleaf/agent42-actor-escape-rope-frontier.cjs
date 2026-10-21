'use strict';

const assert=require('node:assert/strict');
const VERSION='agent42-actor-public-energy-gap-escape-rope-v1';
const PRINTING='Escape Rope BST';

/**
 * Propose a source-agnostic Item switch from an authenticated owner-only
 * observation when an opponent's currently Energy-equipped attacker has no
 * comparably equipped Bench replacement. The opponent chooses its new Active.
 * This deliberately narrow last-chance heuristic has no outcome prediction.
 * Native Store remains the final legality authority.
 *
 * @param {object} view Detached actorObservation from genuine Store root.
 * @returns {{kind:'play-escape-rope',handIndex:number,printing:string}|null}
 */
function chooseEscapeRope(view){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic,opp=view.opponentPublic;
  const r=view.ownTurnResources;
  if(r.itemPlayLocked===true ||
      own.publicTurnRestrictions?.itemPlayLocked===true ||
      !own.active||!opp?.active ||
      !Array.isArray(own.bench)||!Array.isArray(opp.bench) ||
      !own.bench.some(Boolean)||!opp.bench.some(Boolean) ||
      !Array.isArray(opp.active.energies) ||
      opp.active.energies.length===0 ||
      !opp.bench.filter(Boolean).every(p=>
        Array.isArray(p.energies)&&p.energies.length===0))return null;
  const handIndex=view.ownHand.indexOf(PRINTING);
  return handIndex<0?null:{
    kind:'play-escape-rope',handIndex,printing:PRINTING
  };
}

module.exports={VERSION,PRINTING,chooseEscapeRope};
