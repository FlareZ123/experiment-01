'use strict';

const assert=require('node:assert/strict');

const VERSION='agent6-owner-public-removal-target-certificate-v2';

// These five Prism Star Stadium printings all have printed text protecting the
// Stadium from Items and Supporters played from hand. If another effect
// suppresses that text, this pure public snapshot alone cannot prove it.
// IDs were checked against the supplied English source card database.
const PROTECTED_PRISM_STADIUMS=Object.freeze({
  'Heat Factory LOT':'sm8-178',
  'Life Forest LOT':'sm8-180',
  'Thunder Mountain LOT':'sm8-191',
  'Black Market TEU':'sm9-134',
  'Wondrous Labyrinth TEU':'sm9-158'
});

/**
 * Exact source card identities and their printed target families.
 * These rules are verified against the supplied English card database.
 * A target certificate never, on its own, certifies complete paper legality.
 */
const REMOVAL_PRINTINGS=Object.freeze({
  'Field Blower GRI':Object.freeze({
    sourceId:'sm2-125',family:'tool-or-stadium',
    maxTargets:2,otherHandCardsRequired:0,destination:'discard'
  }),
  'Lost Vacuum LOR':Object.freeze({
    sourceId:'swsh11-162',family:'tool-or-stadium',
    maxTargets:1,otherHandCardsRequired:1,destination:'lost-zone'
  }),
  'Tool Scrapper RCL':Object.freeze({
    sourceId:'swsh2-168',family:'tool-only',
    maxTargets:2,otherHandCardsRequired:0,destination:'discard'
  }),
  'Tool Scrapper DRX':Object.freeze({
    sourceId:'bw6-116',family:'tool-only',
    maxTargets:2,otherHandCardsRequired:0,destination:'discard'
  })
});

/**
 * Find individual publicly visible removal targets without inspecting
 * opposing hand/deck/Prizes or the owner's concealed draw/deck/Prizes.
 *
 * @param {object} view Detached owner-authenticated actorObservation.
 * @param {number} handIndex Physical source hand index.
 * @returns {object} Independent necessary-condition certificate.
 */
function removalTargetCertificate(view,handIndex){
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(view.actorSeat===0||view.actorSeat===1);
  assert.ok(Array.isArray(view.ownHand));
  assert.ok(Number.isSafeInteger(handIndex)&&handIndex>=0&&
    handIndex<view.ownHand.length);
  const printing=view.ownHand[handIndex];
  const rule=Object.hasOwn(REMOVAL_PRINTINGS,printing)?
    REMOVAL_PRINTINGS[printing]:null;
  const common={version:VERSION,handIndex,printing,
    sourceId:rule?.sourceId??null,
    printedRuleKnown:rule!==null,
    evidence:'exact source printing and owner-visible public board',
    nativeEnumeratorNotReliedUpon:true,
    opponentConcealedInformationRead:false,
    paperPlayableCertified:false,
    nativeStoreAcceptanceCertified:false,
    settlementAndStrategicBenefitCertified:false};
  if(!rule)return {...common,status:'unmodeled-exact-printing',
    eligibleTargetCount:null,targets:null,
    publiclyProvenBlocker:null};

  assert.ok(view.ownPublic&&view.opponentPublic&&view.ownTurnResources);
  const targets=[];
  const protectedStadiums=[];
  for(const [side,board] of [
    ['own',view.ownPublic],['opponent',view.opponentPublic]]){
    const slots=[['active',0,board.active],
      ...(board.bench??[]).map((slot,i)=>['bench',i,slot])];
    for(const [zone,slotIndex,slot] of slots){
      for(const [toolIndex,toolPrinting] of (slot?.tools??[]).entries()){
        targets.push({side,zone,slotIndex,toolIndex,
          printing:toolPrinting,targetClass:'tool'});
      }
    }
    if(rule.family==='tool-or-stadium'){
      for(const [stadiumIndex,stadiumPrinting] of
        (board.stadium??[]).entries()){
        const normalized=stadiumPrinting.replace(' ◇','');
        const target={side,zone:'stadium',stadiumIndex,
          printing:stadiumPrinting,targetClass:'stadium'};
        if(Object.hasOwn(PROTECTED_PRISM_STADIUMS,normalized)){
          protectedStadiums.push({...target,
            sourceId:PROTECTED_PRISM_STADIUMS[normalized],
            protection:'Item-Supporter-effect-prevention-while-active',
            suppressionOfPrintedProtectionUnverified:true});
        }else{
          targets.push(target);
        }
      }
    }
  }
  const publicItemLocked=view.ownTurnResources.itemPlayLocked===true||
    view.ownPublic.publicTurnRestrictions?.itemPlayLocked===true;
  const otherHandCount=view.ownHand.length-1;
  const handCostPayable=otherHandCount>=rule.otherHandCardsRequired;
  const stadiumCount=(view.ownPublic.stadium??[]).length+
    (view.opponentPublic.stadium??[]).length;
  const boardInconsistent=stadiumCount>1;
  const blockers=[
    ...(publicItemLocked?['observed-public-item-lock']:[]),
    ...(!targets.length&&!protectedStadiums.length?
      ['no-public-removal-target']:[]),
    ...(!handCostPayable?['mandatory-other-hand-card-unavailable']:[]),
    ...(boardInconsistent?['multiple-stadium-zones-inconsistent']:[])
  ];
  return {...common,
    family:rule.family,destination:rule.destination,
    maxTargets:rule.maxTargets,
    otherHandCardsRequired:rule.otherHandCardsRequired,
    otherHandCount,handCostPayable,
    publicItemLocked,stadiumCount,boardInconsistent,
    targets,eligibleTargetCount:targets.length,
    protectedStadiums,printedProtectionSuppressionUnverified:
      protectedStadiums.length>0,
    finalTargetDestinationCertified:false,
    publiclyProvenBlocker:blockers.length?blockers[0]:null,
    blockers,
    status:blockers.length?'necessary-condition-failed':
      targets.length?'public-target-and-physical-cost-present-unresolved':
      'protected-prism-star-stadium-effect-unresolved',
    // Choice targets are public and physically present. Effects, other locks,
    // in-hand discard desirability, prompt semantics and subsequent settlement
    // still require separate checks under an authentic Store action.
    targetAndPaymentSufficientForPaperPlay:false};
}

/**
 * Add read-only public-target evidence to an Agent4 paper necessity census.
 * Preserve that census's explicit UNKNOWN for surviving target candidates.
 * A newly proven failure can mark an otherwise UNKNOWN row ineligible.
 *
 * @param {object} view Detached real owner-root observation.
 * @param {object} census Agent4 necessary-condition report for this root.
 * @returns {object} New report, without mutating either argument.
 */
function withPublicRemovalTargetEvidence(view,census){
  assert.equal(census?.actorSeat,view.actorSeat);
  assert.equal(census?.globalTurn,view.globalTurn);
  assert.ok(Array.isArray(census.rows));
  const rows=census.rows.map(row=>{
    const cert=removalTargetCertificate(view,row.handIndex);
    assert.equal(row.printing,cert.printing,
      'Paper source row must match authenticated physical owner hand index');
    if(!cert.printedRuleKnown)return {...row};
    const targetBlocked=cert.blockers.length>0;
    const priorBlockers=row.necessaryBlockers??[];
    const added=cert.blockers.map(x=>'printed-removal-target:'+x)
      .filter(x=>!priorBlockers.includes(x));
    return {...row,
      exactTargetEligibility:cert.eligibleTargetCount>0?
        'public-target-present':cert.protectedStadiums.length?
        'prism-star-stadium-protection-unresolved':'proven-no-public-target',
      removalTargetCertificate:cert,
      necessaryBlockers:[...priorBlockers,...added],
      paperPlayable:targetBlocked?false:row.paperPlayable};
  });
  const ruledOut=rows.filter(row=>row.paperPlayable===false).length;
  return {...census,
    publicRemovalEvidenceVersion:VERSION,
    rows,provenNecessaryConditionFailures:ruledOut,
    remainingUnresolvedCopies:rows.length-ruledOut,
    allRemainingArePaperLegal:false};
}

module.exports={VERSION,REMOVAL_PRINTINGS,PROTECTED_PRISM_STADIUMS,
  removalTargetCertificate,withPublicRemovalTargetEvidence};
