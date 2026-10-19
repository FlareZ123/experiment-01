'use strict';

/**
 * Classify an actual source-dealt rank11 combined-opening attempt using only
 * the frozen policy audit, valid deal/start evidence and engine action cap.
 * @param {object} audit Output from withRank11ExclusiveOpeners.
 * @param {object} game Output from runArm.
 * @param {0|1} sourceSeat
 * @param {number} maxActions
 * @returns {object}
 */
function classifyTrial(audit,game,sourceSeat,maxActions) {
  const validStart=game.verifiedByDrawLog===true &&
    (game.firstTurnSlot===0 || game.firstTurnSlot===1);
  if(!validStart)throw new Error('Authentic starting turn was not verified');
  const selected=audit.selected;
  const sourceActuallyFirst=game.firstTurnSlot===sourceSeat;
  const branch=selected?.kind==='direct' ? audit.direct :
    selected?.kind==='held-seal' ? audit.held : null;
  const completed=branch?.completed===true;
  const aborted=branch?.aborted??null;
  if(completed && aborted)throw new Error('Cannot both complete and abort a source line');
  const resultClass=selected===null ? 'no-route' :
    `${selected.kind}-${completed?'completed':aborted?'aborted':'unresolved'}`;
  return {
    sourceActuallyFirst,sourceFirstTurnVerified:true,
    resultClass,selectedKind:selected?.kind??null,
    selectedTurn:selected?.turn??null,
    completed,aborted,
    actionCapped:game.finished!==true && game.actions>=maxActions,
    competingClaimAttempts:audit.blockedOtherRoute,
    sourceFirstOwnTurnReached:game.turns >= (sourceActuallyFirst?1:2)
  };
}

module.exports={classifyTrial};
