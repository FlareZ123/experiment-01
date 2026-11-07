'use strict';

const assert=require('node:assert/strict');
const {knownOutsideDeck}=require('./owner-k1-prize-knowledge.cjs');

const VERSION='agent49-owner-original60-mandatory-plan-gate-v1';

/**
 * Fail-closed necessary-card test against a player-authenticated, FIXED
 * original 60. A paper player always knows the card names in their own
 * registered list at K0; they do not yet know which are currently Prized.
 *
 * Exact physical native fullName strings are required. Equivalent artwork
 * or set printings must be explicitly listed by the caller after independent
 * source-text validation; this helper never guesses aliases.
 *
 * @param {string[]} ownOriginal60 Registered card printings, 60 objects.
 * @param {Array<{role:string,acceptablePrintings:string[],copies:number}>}
 *   requirements Search targets necessary for a declared finite plan.
 * @returns {object} Conservative impossible-vs-not-disproven certificate.
 */
function preflightOriginal60Plan(ownOriginal60,requirements){
  assert.ok(Array.isArray(ownOriginal60)&&ownOriginal60.length===60);
  assert.ok(ownOriginal60.every(x=>typeof x==='string'&&x.length>0));
  assert.ok(Array.isArray(requirements)&&requirements.length>0);
  const multiplicity=new Map();
  for(const printing of ownOriginal60)
    multiplicity.set(printing,(multiplicity.get(printing)??0)+1);
  const seen=new Set();
  const assignedPrintings=new Set();
  const required=requirements.map(row=>{
    assert.ok(typeof row?.role==='string'&&row.role.length>0);
    assert.ok(!seen.has(row.role),'Roles must be distinct');
    seen.add(row.role);
    assert.ok(Array.isArray(row.acceptablePrintings)&&
      row.acceptablePrintings.length>0&&
      row.acceptablePrintings.every(p=>typeof p==='string'&&p.length>0)&&
      new Set(row.acceptablePrintings).size===row.acceptablePrintings.length);
    // Distinct plan roles have distinct compulsory objects. If a printing
    // could satisfy two roles, callers must consolidate their demand or
    // describe alternative plans; otherwise one card would be double-counted.
    for(const p of row.acceptablePrintings){
      assert.ok(!assignedPrintings.has(p),
        'Overlapping required printings must be consolidated into one role');
      assignedPrintings.add(p);
    }
    assert.ok(Number.isSafeInteger(row.copies)&&row.copies>=1&&row.copies<=60);
    const availableFromStart=row.acceptablePrintings.reduce(
      (n,p)=>n+(multiplicity.get(p)??0),0);
    return {
      role:row.role,acceptablePrintings:[...row.acceptablePrintings],
      needed:row.copies,original60Copies:availableFromStart,
      absentOrInsufficientInOriginal60:availableFromStart<row.copies
    };
  });
  const blockers=required.filter(x=>x.absentOrInsufficientInOriginal60);
  return {
    version:VERSION,
    status:blockers.length?'blocked-impossible-original60':'not-disproven',
    blockedBy: blockers,
    required,readOnly:true,
    ownOriginal60Only:true,opponentHiddenCardsUsed:false,
    doesNotInspectUnsearchedDeck:true,doesNotInspectPrizes:true,
    exactCurrentDeckMembershipCertified:false,
    currentDrawProbabilityCertified:false,
    nativeActionOrPromptCertified:false,paperLegalityCertified:false,
    strategicBenefitCertified:false,qualifiedCompetitiveGames:0
  };
}

/**
 * K0-visible upper bound on copies that can STILL reside in the acting
 * owner's deck. Subtract only physically known original cards already in
 * the owner's hand or face-up own zones. Face-down Prizes are never read:
 * an unknown copy counts as potentially in deck, even if actually Prized.
 *
 * The plan must require its named cards from the DECK, not merely in play.
 * A necessary target exhausted in public zones cannot be owner-searched.
 * A not-disproven target may still be Prized, absent, locked or unusable.
 *
 * @param {string[]} ownOriginal60 Immutable registered native fullNames.
 * @param {object} view Genuine actor-owned detached root/prompt observation.
 * @param {Array<{role:string,acceptablePrintings:string[],copies:number}>}
 *   requirements Independent required source-card print families.
 * @returns {object} Read-only, public-only necessary-condition certificate.
 */
function preflightVisibleOwnerRemainingUpperBound(
  ownOriginal60,view,requirements
){
  assert.ok(view?.decisionKind==='owner-root'||
    view?.decisionKind==='owner-prompt');
  assert.ok(Array.isArray(view.ownHand));
  assert.ok(view.ownPublic&&typeof view.ownPublic==='object');
  const starting=preflightOriginal60Plan(ownOriginal60,requirements);
  const originalCounts=new Map();
  for(const printing of ownOriginal60)
    originalCounts.set(printing,(originalCounts.get(printing)??0)+1);
  const visibleCounts=new Map();
  for(const printing of knownOutsideDeck(view))
    visibleCounts.set(printing,(visibleCounts.get(printing)??0)+1);
  // Certify ownership inventory is consistent before computing vetoes.
  // Mismatched public/native printing names must be repaired at the caller,
  // never converted into a guessed playable card.
  for(const [printing,visibleCopies] of visibleCounts){
    const registered=originalCounts.get(printing)??0;
    assert.ok(visibleCopies<=registered,
      'Visible own zone exceeds registered original60 printing: '+printing);
  }
  const requirementsStatus=starting.required.map(row=>{
    const seenOutside=row.acceptablePrintings.reduce((sum,name)=>
      sum+(visibleCounts.get(name)??0),0);
    const maximumStillInDeck=row.original60Copies-seenOutside;
    assert.ok(maximumStillInDeck>=0);
    return {
      ...row,visibleOutsideDeckCopies:seenOutside,
      maximumRemainingDeckCopies:maximumStillInDeck,
      guaranteedInsufficientInCurrentDeck:maximumStillInDeck<row.needed
    };
  });
  const blockedBy=requirementsStatus.filter(
    row=>row.guaranteedInsufficientInCurrentDeck);
  return {
    version:VERSION,
    status:blockedBy.length?
      'blocked-impossible-visible-exhaustion':'not-disproven',
    requirements:requirementsStatus,blockedBy,
    usedOnlyOwnRegistered60AndPublicOwnerZones:true,
    ownerHiddenDeckInspected:false,ownerHiddenPrizesInspected:false,
    opponentHiddenInformationInspected:false,
    currentDeckMembershipCertified:false,paperLegalityCertified:false,
    nativePromptOrAttackCertified:false,competitiveGamesQualified:0
  };
}

module.exports={VERSION,preflightOriginal60Plan,
  preflightVisibleOwnerRemainingUpperBound};
