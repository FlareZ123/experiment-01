'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {FIRST_OWNER_TURN_ONLY}=
  require('../twinleaf/agent4-owner-paper-trainer-necessary-screen.cjs');

const VERSION='agent4-aichi-source-first-owner-turn-trainer-incidence-v1';

/**
 * Source-only incidence of exact printings with first-owner-turn restrictions.
 * This is a deck-construction census. It does not model live hand offers,
 * Prizes, actual playability, target existence, opponent policy or outcomes.
 *
 * @param {{decks:object[]}} manifest Published source deck manifest.
 * @returns {object} Exact named print/copy census with missing-rank boundary.
 */
function firstOwnerTurnSourceIncidence(manifest){
  assert.ok(Array.isArray(manifest?.decks));
  const known=manifest.decks.filter(d=>
    Number.isSafeInteger(d.rank)&&d.rank>=1&&d.rank<=32);
  const seen=new Set();
  for(const deck of known){
    assert.ok(!seen.has(deck.rank),'Duplicate Aichi source rank '+deck.rank);
    seen.add(deck.rank);
    assert.ok(Array.isArray(deck.cards));
    assert.equal(deck.cards.reduce((sum,c)=>sum+c.count,0),60,
      'Incomplete exact printed source sixty rank '+deck.rank);
  }
  const rows=known.map(deck=>{
    const relevant=deck.cards.filter(c=>{
      const printing=c.name+' '+c.printing?.set;
      return Object.hasOwn(FIRST_OWNER_TURN_ONLY,printing);
    }).map(card=>({
      printing:card.name+' '+card.printing.set,
      sourceId:FIRST_OWNER_TURN_ONLY[card.name+' '+card.printing.set].sourceId,
      originalPrintingNumber:card.printing.number,
      count:card.count
    })).sort((a,b)=>a.printing.localeCompare(b.printing));
    return {
      rank:deck.rank,archetype:deck.archetype,
      copies:relevant.reduce((s,c)=>s+c.count,0),
      restrictedPrintings:relevant
    };
  }).filter(row=>row.copies>0).sort((a,b)=>a.rank-b.rank);
  const missingRanks=Array.from({length:32},(_,i)=>i+1).filter(x=>!seen.has(x));
  const byPrinting=Object.keys(FIRST_OWNER_TURN_ONLY).sort()
    .map(printing=>({
      printing,
      sourceId:FIRST_OWNER_TURN_ONLY[printing].sourceId,
      originalDeckCopies:rows.reduce((sum,row)=>sum+
        row.restrictedPrintings.filter(x=>x.printing===printing)
          .reduce((s,c)=>s+c.count,0),0)
    }));
  return {
    version:VERSION,
    knownOriginalSourceSixties:known.length,
    unknownSourceRanks:missingRanks,
    originalSourceRanksWithRestrictedTrainer:rows.length,
    totalRestrictedTrainerCopies:rows.reduce((n,r)=>n+r.copies,0),
    byPrinting,rows,
    sourceSemanticMeaning:'decklist-copy-incidence-only',
    independentPlayableOpportunities:0,
    gameWinRateEstimated:false,
    fieldCompletelyAuthenticated:missingRanks.length===0,
    originalSourceProjectionDisallowed:true,
    sourceParsedSha256:createHash('sha256')
      .update(JSON.stringify(manifest)).digest('hex')
  };
}

module.exports={VERSION,firstOwnerTurnSourceIncidence};
