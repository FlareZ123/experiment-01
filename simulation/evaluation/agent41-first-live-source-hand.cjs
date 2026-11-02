'use strict';

const {createHash}=require('node:crypto');

/**
 * Extract an actor's first real turn decision hand, excluding setup prompts
 * and later-turn states. This observes only post-decision owner data.
 * @param {object[]} decisionTrace Native headless decision trace.
 * @param {0|1} sourceSeat Source's physical seat.
 * @param {0|1} firstTurnSeat Actual seat that took global turn one.
 * @returns {{status:string,turn:number,actionOrdinal:number|null,
 *   action:string|null,sha256:string|null,ownerHandSize:number|null,
 *   paperOpportunityCertified:false}}
 */
function sourceFirstLiveTurnHand(decisionTrace,sourceSeat,firstTurnSeat){
  if(!Array.isArray(decisionTrace)||
    ![0,1].includes(sourceSeat)||![0,1].includes(firstTurnSeat))
    throw new TypeError('Need native decision trace and both physical seats');
  const turn=sourceSeat===firstTurnSeat?1:2;
  const first=decisionTrace.find(row=>row?.playerSlot===sourceSeat&&
    row.turnBefore===turn&&row.action!=='ResolvePromptAction'&&
    Array.isArray(row.decisionHandBefore?.ownHandPrintings));
  if(!first)return {status:'FIRST_LIVE_HAND_UNOBSERVED',turn,
    actionOrdinal:null,action:null,sha256:null,ownerHandSize:null,
    paperOpportunityCertified:false};
  const cards=first.decisionHandBefore.ownHandPrintings;
  const sha256=createHash('sha256').update(JSON.stringify(cards)).digest('hex');
  return {status:'FIRST_LIVE_HAND_OBSERVED',turn,
    actionOrdinal:Number.isSafeInteger(first.actionOrdinal)?
      first.actionOrdinal:null,action:first.action,sha256,
    ownerHandSize:cards.length,paperOpportunityCertified:false};
}

/**
 * Historical canon uses the earliest Source decisionTrace entry, which can
 * be a setup-phase ChooseCardsPrompt. Do not relabel its digest as first turn.
 * @param {object[]} decisionTrace Native headless decision trace.
 * @param {0|1} sourceSeat
 * @returns {{status:string,turn:number|null,actionOrdinal:number|null}}
 */
function firstRecordedSourceDecisionPhase(decisionTrace,sourceSeat){
  if(!Array.isArray(decisionTrace)||![0,1].includes(sourceSeat))
    throw new TypeError('Need native trace and source seat');
  const first=decisionTrace.find(row=>row?.playerSlot===sourceSeat&&
    Array.isArray(row.decisionHandBefore?.ownHandPrintings));
  return first?{status:first.turnBefore===0?'SETUP_PHASE':'LIVE_OR_OTHER_PHASE',
    turn:first.turnBefore,
    actionOrdinal:Number.isSafeInteger(first.actionOrdinal)?
      first.actionOrdinal:null}:
    {status:'UNOBSERVED',turn:null,actionOrdinal:null};
}

module.exports={sourceFirstLiveTurnHand,firstRecordedSourceDecisionPhase};
