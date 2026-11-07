'use strict';

const assert=require('node:assert/strict');

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

module.exports={VERSION,preflightOriginal60Plan};
