'use strict';

const assert=require('node:assert/strict');

/**
 * Build a source-driven set of named Pokémon Tools from the supplied complete
 * card list. The catalog is not prefiltered by paper Expanded legality.
 * An archived held name has to match a catalog name plus a printing suffix.
 *
 * @param {Array<object>} cards Source card database definitions.
 * @returns {Set<string>} Trainer Tool card names.
 */
function namedToolCatalog(cards){
  assert.ok(Array.isArray(cards));
  return new Set(cards.filter(c=>c?.supertype==='Trainer'&&
    Array.isArray(c.subtypes)&&
    c.subtypes.includes('Pokémon Tool')&&
    typeof c.name==='string'
  ).map(c=>c.name));
}

/**
 * Inspect one previously archived original-source owner Pass without reading
 * the opposing concealed zones or asserting positive paper playability.
 * This is an action-coverage upper bound only.
 *
 * @param {object} sourcePass Agent35 original owner Pass observation.
 * @param {0|1} seat Source owner physical seat.
 * @param {Set<string>} toolNames Known public card-list Tool names.
 * @returns {object} Detached, privacy-minimized result.
 */
function classifyOwnerPassTool(sourcePass,seat,toolNames){
  assert.ok(seat===0||seat===1);
  assert.ok(toolNames instanceof Set);
  assert.ok(Number.isSafeInteger(sourcePass?.ordinal)&&
    sourcePass.ordinal>=0);
  assert.ok(Array.isArray(sourcePass.ownerHandAtPass));
  assert.ok(Array.isArray(sourcePass.publicBoardBeforePass)&&
    sourcePass.publicBoardBeforePass.length===2);
  const own=sourcePass.publicBoardBeforePass[seat];
  assert.ok(own&&typeof own==='object');
  const eligibleNames=[...toolNames].sort((a,b)=>b.length-a.length);
  const heldTools=sourcePass.ownerHandAtPass.flatMap(printing=>{
    const name=eligibleNames.find(n=>printing.startsWith(n+' '));
    return name?[{printing,cardName:name}]:[];
  });
  const zones=[
    {slot:'active',index:0,pokemon:own.active??null},
    ...(own.bench??[]).map((pokemon,index)=>({
      slot:'bench',index,pokemon
    }))
  ];
  const freeRecipients=zones.filter(z=>z.pokemon!==null&&
    Array.isArray(z.pokemon.toolCards)&&
    z.pokemon.toolCards.length===0).map(z=>({
    slot:z.slot,index:z.index,pokemonName:z.pokemon.name
  }));
  return {
    nativePassOrdinal:sourcePass.ordinal,
    globalTurn:sourcePass.turn,
    ownerSeat:seat,
    physicallyHeldNamedToolCopies:heldTools.length,
    heldTools,
    freeOwnRecipients:freeRecipients,
    structuralToolOpportunity:heldTools.length>0&&freeRecipients.length>0,
    nativePlayAccepted:'unproven-at-this-root',
    printedEligibility:'unverified',
    positiveStrategicValue:'unverified',
    preChoiceInformationNoninterferenceCertified:
      sourcePass.preDecisionNoninterferenceVerified===true
  };
}

/**
 * Post-hoc source-owned Tool opportunity denominator over the fixed original
 * eight native attempts. Every real Pass is counted, including repeated
 * observations of a single physical Tool copy across turns. Repeated roots
 * are never treated as independent games.
 *
 * @param {object} archived Agent35 pinned original source Pass JSON.
 * @param {Set<string>} toolNames Complete public Tool name catalog.
 * @returns {object} Reproducible bounded original owner Pass census.
 */
function censusOriginalSourcePassTools(archived,toolNames){
  assert.equal(archived?.originalAttemptCount,8);
  assert.equal(archived?.exactInitialFullDealAndRootTapeMatches,8);
  assert.ok(Array.isArray(archived.attempts));
  assert.equal(archived.attempts.length,8);
  const seen=new Set(),attempts=[];
  for(const original of archived.attempts){
    assert.equal(typeof original.id,'string');
    assert.ok(!seen.has(original.id));
    seen.add(original.id);
    assert.ok(original.sourceSeat===0||original.sourceSeat===1);
    const observed=original.ownerPassObservations??[];
    assert.ok(Array.isArray(observed));
    const passRoots=observed.map(pass=>classifyOwnerPassTool(
      pass,original.sourceSeat,toolNames));
    attempts.push({
      id:original.id,sourceSeat:original.sourceSeat,
      nativeStatus:original.status??null,
      observedOriginalSourcePasses:passRoots.length,
      structurallyEligiblePasses:passRoots.filter(p=>
        p.structuralToolOpportunity).length,
      eligible:passRoots.filter(p=>p.structuralToolOpportunity).map(p=>({
        ordinal:p.nativePassOrdinal,
        globalTurn:p.globalTurn,
        heldTools:p.heldTools,
        freeOwnRecipients:p.freeOwnRecipients,
        preChoiceInformationNoninterferenceCertified:
          p.preChoiceInformationNoninterferenceCertified
      }))
    });
  }
  const sum=key=>attempts.reduce((total,a)=>total+a[key],0);
  assert.equal(sum('observedOriginalSourcePasses'),
    archived.originalSourcePassesWithOwnedHandAndPublicBoard);
  const frequencies=new Map();
  for(const a of attempts){
    for(const e of a.eligible){
      for(const t of e.heldTools){
        const prior=frequencies.get(t.printing)??0;
        frequencies.set(t.printing,prior+1);
      }
    }
  }
  const observations=sum('observedOriginalSourcePasses');
  const opportunities=sum('structurallyEligiblePasses');
  return {
    schema:'agent20-original-v5-owner-pass-tool-structural-census-v1',
    originalAttemptCount:attempts.length,
    originalSourcePassSnapshots:observations,
    sourcePassSnapshotsWithHeldToolAndFreeRecipient:opportunities,
    uniqueAttemptIdsWithToolOpportunity:attempts.filter(a=>
      a.structurallyEligiblePasses>0).length,
    repeatedToolPrintings:[...frequencies].map(([printing,rootSightings])=>({
      printing,rootSightings
    })).sort((a,b)=>a.printing.localeCompare(b.printing)),
    attempts,
    repeatedRootsAreNotIndependentSamples:true,
    snapshotSourceIsPostPolicyPreStore:true,
    positivePaperLegalityCertified:false,
    independentCompetitiveGames:0
  };
}

module.exports={
  namedToolCatalog,classifyOwnerPassTool,censusOriginalSourcePassTools
};
