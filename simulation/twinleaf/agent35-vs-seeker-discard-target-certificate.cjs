'use strict';

const assert = require('node:assert/strict');

const VERSION='agent35-public-vs-seeker-discard-target-certificate-v1';
const VS_SEEKER='VS Seeker PHF';
const SOURCE_ID='xy4-109';

/**
 * Classify public, registered native full names without reading any game
 * State. Every registered card is marked Supporter or Other. An unknown
 * printing is kept unknown rather than silently treated as a non-Supporter.
 *
 * @param {object[]} allCards Public CardManager catalogue.
 * @param {{TrainerCard:Function,TrainerType:object}} nativeTypes
 * @returns {Map<string,'Supporter'|'Other'>}
 */
function publicSupporterPrintIndex(allCards,nativeTypes){
  assert.ok(Array.isArray(allCards));
  assert.equal(typeof nativeTypes?.TrainerCard,'function');
  const supporter=nativeTypes.TrainerType?.SUPPORTER;
  assert.notEqual(supporter,undefined);
  const map=new Map();
  for(const card of allCards){
    if(typeof card?.fullName!=='string'||!card.fullName)continue;
    const kind=card instanceof nativeTypes.TrainerCard &&
      card.trainerType===supporter?'Supporter':'Other';
    const previous=map.get(card.fullName);
    if(previous!==undefined)assert.equal(previous,kind,
      'Conflicting public print classes for native fullName');
    map.set(card.fullName,kind);
  }
  return map;
}

/**
 * Negative-only printed-source gate for VS Seeker (Phantom Forces #109).
 * Its printed effect returns a Supporter from the owner's discard pile.
 * A Trainer cannot be played for an effect that would not change game state.
 * With a full known public discard and zero Supporters, the absence of
 * a target proves this Item cannot currently be played.
 *
 * The physical own discard, and any Supporters it contains, are public.
 * Neither deck, Prize, opponent hand nor speculative future effects enter.
 *
 * @param {object} view Actual owner's detached owner-root observation.
 * @param {{handIndex:number,printing:string}} row Exact held Trainer.
 * @param {Map<string,'Supporter'|'Other'>} printTypes Public catalogue.
 * @returns {object} Negative certificate or unresolved positive candidate.
 */
function vsSeekerDiscardTargetCertificate(view,row,printTypes){
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(Array.isArray(view.ownHand));
  assert.ok(Number.isSafeInteger(row?.handIndex)&&
    row.handIndex>=0&&row.handIndex<view.ownHand.length);
  assert.equal(row.printing,view.ownHand[row.handIndex]);
  assert.ok(printTypes instanceof Map);
  if(row.printing!==VS_SEEKER)return {
    version:VERSION,printing:row.printing,sourceId:null,
    printedRuleKnown:false,blocked:false,
    status:'different-printed-trainer',
    paperPlayable:null
  };
  const discard=view.ownPublic?.discard;
  if(!Array.isArray(discard))return {
    version:VERSION,printing:row.printing,sourceId:SOURCE_ID,
    printedRuleKnown:true,blocked:false,
    status:'owner-public-discard-unavailable',
    supporterTargets:[],unclassifiedDiscardCopies:null,
    paperPlayable:null
  };
  const supporterTargets=discard.filter(name=>
    printTypes.get(name)==='Supporter');
  const unclassified=discard.filter(name=>!printTypes.has(name));
  const noTarget=supporterTargets.length===0&&unclassified.length===0;
  const resource=view.ownTurnResources;
  return {
    version:VERSION,printing:row.printing,sourceId:SOURCE_ID,
    printedRuleKnown:true,blocked:noTarget,
    status:noTarget?'proven-no-public-supporter-target':
      supporterTargets.length?'public-supporter-target-present':
        'unclassified-discard-cannot-exclude-supporter',
    supporterTargets,
    unclassifiedDiscardCopies:unclassified.length,
    supporterQuotaUnused:Number.isSafeInteger(resource?.supporterPlayedTurn)?
      resource.supporterPlayedTurn===0:null,
    itemLockKnownOpen:resource?.itemPlayLocked===false,
    paperPlayable:noTarget?false:null,
    publicDiscardOnly:true,
    recoveredSupporterPlayableThisTurnCertified:false,
    targetSelectionOrNativeSettlementCertified:false
  };
}

/**
 * Compose the exact-target veto with an existing generic Trainer or
 * four-family negative paper census. This wrapper never selects a move;
 * it can only add a proven blocker, preserving prior negative certificates.
 *
 * @param {object} view Detached owner root.
 * @param {{rows:object[]}} census Existing owner-paper screen.
 * @param {Map<string,'Supporter'|'Other'>} printTypes Public catalogue.
 * @returns {object}
 */
function withVsSeekerDiscardTargetEvidence(view,census,printTypes){
  assert.ok(Array.isArray(census?.rows));
  const rows=census.rows.map(row=>{
    const cert=vsSeekerDiscardTargetCertificate(view,row,printTypes);
    if(!cert.printedRuleKnown)return row;
    const prior=row.necessaryBlockers??[];
    const added=cert.blocked?
      'printed-discard-target:vs-seeker-no-supporter':null;
    const blockers=added&&!prior.includes(added)?
      [...prior,added]:[...prior];
    return {...row,vsSeekerDiscardTargetCertificate:cert,
      necessaryBlockers:blockers,
      paperPlayable:cert.blocked?false:row.paperPlayable};
  });
  return {...census,vsSeekerEvidenceVersion:VERSION,rows,
    provenNecessaryConditionFailures:rows.filter(x=>
      x.paperPlayable===false).length,
    remainingUnresolvedCopies:rows.filter(x=>
      x.paperPlayable!==false).length,
    anyPaperPlayableTrainerCertified:false,
    opponentHiddenInformationUsed:false,
    competitiveGameQualified:false};
}

module.exports={VERSION,VS_SEEKER,SOURCE_ID,publicSupporterPrintIndex,
  vsSeekerDiscardTargetCertificate,withVsSeekerDiscardTargetEvidence};
