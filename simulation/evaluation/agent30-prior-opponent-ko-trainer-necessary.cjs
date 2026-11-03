'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent30-prior-opponent-ko-trainer-necessary-v1';
const SOURCE_PRIOR_KO = Object.freeze({
  'Raihan EVS':Object.freeze({sourceId:'swsh7-152',type:'Supporter'}),
  'Teammates PRC':Object.freeze({sourceId:'xy5-141',type:'Supporter'}),
  'Unfair Stamp TWM':Object.freeze({sourceId:'sv6-165',type:'Item'})
});

/**
 * Paper-source negative certificate limited to the actual first global
 * player turn. With no prior opponent turn, no eligible owner Pokémon can
 * have been KO'd during the opponent's previous turn.
 *
 * A later-turn decision is UNKNOWN absent an owner-authenticated
 * opponent-turn knockout-event history. Do not infer KOs from discard piles:
 * they also contain cards discarded by costs, effects, and play.
 *
 * @param {object} view Authentic detached root owner observation.
 * @param {{handIndex:number,printing:string,type:string}} row Owner card.
 * @returns {object} A proven NO or a deliberately incomplete UNKNOWN.
 */
function priorOpponentKOTrainerPrerequisite(view,row){
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(Number.isSafeInteger(view.globalTurn)&&view.globalTurn>=1);
  assert.ok(Array.isArray(view.ownHand));
  assert.ok(Number.isSafeInteger(row?.handIndex)&&row.handIndex>=0&&
    row.handIndex<view.ownHand.length);
  assert.equal(view.ownHand[row.handIndex],row.printing);
  const spec=SOURCE_PRIOR_KO[row.printing];
  if(!spec)return {
    version:VERSION,printing:row.printing,sourceCardId:null,
    knownPrintedPriorKORequirement:false,status:'unmodeled-print',
    blocked:false,paperPlayable:null
  };
  assert.equal(row.type,spec.type,'Native Trainer category mismatch');
  const noOpponentPreviousTurn=view.globalTurn===1;
  return {
    version:VERSION,printing:row.printing,sourceCardId:spec.sourceId,
    knownPrintedPriorKORequirement:true,
    globalTurn:view.globalTurn,
    firstGlobalPlayerTurn:noOpponentPreviousTurn,
    blocked:noOpponentPreviousTurn,
    status:noOpponentPreviousTurn?
      'proved-no-opponent-prior-turn':'no-authenticated-ko-history',
    paperPlayable:noOpponentPreviousTurn?false:null,
    noUnwitnessedOpponentKOInference:true
  };
}

/**
 * @param {object} view
 * @param {object[]} rows Genuine held physical Trainer rows.
 */
function screenOwnerPriorOpponentKOPrerequisites(view,rows){
  assert.ok(Array.isArray(rows));
  const seen=new Set();
  const examined=rows.map(row=>{
    assert.ok(!seen.has(row.handIndex),'Repeated physical owner hand index');
    seen.add(row.handIndex);
    return {handIndex:row.handIndex,
      ...priorOpponentKOTrainerPrerequisite(view,row)};
  });
  return {
    version:VERSION,actorSeat:view.actorSeat,globalTurn:view.globalTurn,
    heldTrainerCopies:examined.length,
    exactPrintedPriorKORequirementsSeen:examined.filter(row=>
      row.knownPrintedPriorKORequirement).length,
    provenFirstGlobalTurnBlockedCopies:examined.filter(row=>
      row.blocked).length,
    remainingUnknownCopies:examined.filter(row=>!row.blocked).length,
    allPaperPlayableCertified:false,
    opponentConcealedInformationUsed:false,
    competitivelyQualifiedGames:0,
    rows:examined
  };
}

module.exports={
  VERSION,SOURCE_PRIOR_KO,priorOpponentKOTrainerPrerequisite,
  screenOwnerPriorOpponentKOPrerequisites
};
