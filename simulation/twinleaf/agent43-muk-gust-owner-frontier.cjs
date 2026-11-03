'use strict';

const assert = require('node:assert/strict');

const VERSION='agent43-muk-gust-owner-visible-frontier-v1';

/**
 * A bounded owner-visible supplementary planning view for exact physical
 * Trainer hand opportunities. Uses the existing Agent5 generic Trainer
 * frontier and detached ActorObservation. This is a card-specific *filter*
 * and may be attached to a general selector without a new bot override.
 *
 * Claims stop at printed action prerequisites and known target ownership.
 * Native dispatch, card-specific immunity, opponent targeting, sequencing,
 * continued Ability state, and game results remain unverified.
 *
 * @param {object} view Frozen authentic owner-root actorObservation.
 * @param {object} trainerFrontier Existing Agent5 ownerTrainerOpportunity.
 * @returns {object} The current target/control/payment competition ledger.
 */
function ownerMukGustFrontier(view,trainerFrontier) {
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(trainerFrontier?.rows instanceof Array);
  assert.equal(trainerFrontier.actorSeat,view.actorSeat);

  const opp=view.opponentPublic, own=view.ownPublic;
  const active=opp.active;
  const benched=opp.bench.filter(slot=>slot!==null);
  const isMuk=p=>p?.name==='Alolan Muk' &&
    p.abilities?.includes('Power of Alchemy');
  const activeMuk=isMuk(active);
  const benchMuk=benched.filter(isMuk);
  const totalMuk=(activeMuk?1:0)+benchMuk.length;
  const missingOtherLockAudit=totalMuk===0;
  const prizeBehind=own.prizeCount>opp.prizeCount;
  const itemLocked=view.ownTurnResources.itemPlayLocked===true;

  // All hand-held physical Trainer copies are separately represented.
  const held=name=>trainerFrontier.rows
    .filter(row=>row.type==='Item'&&row.name===name);
  const usable=name=>held(name)
    .filter(row=>row.publicBlocker===null).map(row=>row.handIndex);
  const heldRope=held('Escape Rope');
  const heldCatcher=held('Counter Catcher');
  const heldCologne=held('Canceling Cologne');
  const rope=usable('Escape Rope');
  const catcher=usable('Counter Catcher');
  const cologne=usable('Canceling Cologne');

  // This source objective is meaningful only when there is a live Muk;
  // an egg in the public discard provides one observable reason to want
  // its Basic Ability returned. This is never the full value function.
  const eggInOwnDiscard=own.discard.some(print=>
    /^Exeggcute (PLF|PLB|BW)/.test(print));
  const multipleLiveMuk=totalMuk>1;

  /**
   * Distinguish target-control geometry, physical held resources, and
   * an unresolved "can successfully execute" status on each alternative.
   * @param {string} key
   * @param {number[][]} indexGroups
   * @param {string|null} structuralBlocker
   * @param {string} targeting
   * @returns {object}
   */
  function option(key,indexGroups,structuralBlocker,targeting) {
    const heldAll=indexGroups.every(xs=>xs.length>0);
    const blocker=structuralBlocker??
      (itemLocked?'public-item-lock':heldAll?null:'missing-unblocked-held-item');
    return {
      key,selected:false,paperPaid:false,nativeAccepted:false,
      originalHandIndices:indexGroups.map(xs=>[...xs]),
      availableOnPublicPrintedPrerequisites:blocker===null,
      blocker,
      targeting,
      aloneDisablesKnownPowerOfAlchemy:blocker===null&&!multipleLiveMuk,
      hypotheticalEffectWindow:'source-current-turn-only',
      cannotCertifyOtherLockEffects:true
    };
  }

  const direct=option('direct-cologne',[cologne],
    !activeMuk?'muk-not-active':null,'no-gust-needed');
  const ropeEffect=option('rope-plus-cologne',[rope,cologne],
    benchMuk.length!==1?'requires-exactly-one-bench-muk':
    benched.length!==1?'opponent-has-alternate-bench-promotion':null,
    'opponent-chooses-promoted-bench');
  const catcherEffect=option('catcher-plus-cologne',[catcher,cologne],
    benchMuk.length===0?'no-benched-muk-target':
    !prizeBehind?'source-not-behind-on-prizes':null,
    'source-chooses-promoted-bench');
  return {
    version:VERSION,
    actorSeat:view.actorSeat,globalTurn:view.globalTurn,
    opponentVisibleMukCount:totalMuk,
    opponentBenchedMukCount:benchMuk.length,
    opponentOtherBenchCount:benched.length-benchMuk.length,
    ownPrizeCount:own.prizeCount,
    opponentPrizeCount:opp.prizeCount,
    sourceBehindOnPrizes:prizeBehind,
    ownDiscardExeggcuteObservable:eggInOwnDiscard,
    heldPhysical:{rope:heldRope.length,catcher:heldCatcher.length,
      cologne:heldCologne.length},
    options:[direct,ropeEffect,catcherEffect],
    resourceCompetition:{
      oneCologneCannotFundMultipleSimultaneousBranches:true,
      alternativeTargetingChoicesNotCombined:true,
      commonRootIsAnItemNotSupporter:true
    },
    qualification:{
      onlyActorPublicBoardAndOwnHand:true,
      completeBasicAbilityLockMatrix:false,
      paperLegalGameActionSetProven:false,
      nativeAcceptedAndPaid:false,
      actionSelected:false,
      actualEggPropagation:false,
      opponentReplyVerified:false,
      competitiveGameQualified:false,
      missingOtherLockAudit
    }
  };
}

module.exports={VERSION,ownerMukGustFrontier};
