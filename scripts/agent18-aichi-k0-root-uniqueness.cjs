'use strict';
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const fs=require('node:fs');

/** @param {unknown} value @returns {string} */
function digest(value){
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}
/**
 * A recorded projection is narrower than a full actorObservation: it lacks
 * many public data fields. Equality proves repeated recorded features only.
 * @param {object} root Original source native owner-first-root receipt.
 * @param {boolean} includeOpposingActive
 * @returns {string} Fixed canonical projection digest.
 */
function rootProjection(root,includeOpposingActive){
  return digest([
    root.globalTurn,root.ownActive,root.ownBench,root.ownerKnownHand,
    ...(includeOpposingActive?[root.opponentActive]:[])
  ]);
}

/**
 * Diagnostic repeated-root check across native original 29-source receipts.
 * Do not assume equally seeded champion-side starts are independent policy
 * states or that equal projections imply fully identical actor observations.
 * @param {object[]} surveys Preregistered 6 + 23 source survey JSON objects.
 * @returns {object}
 */
function analyze(surveys){
  assert.equal(surveys.length,2);
  const all=surveys.flatMap(x=>x.rows??[]).sort((a,b)=>a.rank-b.rank);
  assert.equal(all.length,29);
  assert.equal(new Set(all.map(x=>x.rank)).size,29);
  const seats={};
  for(const seat of [0,1]){
    const groups=new Map(),withOpponent=new Map();
    let offeredRoots=0,offerCount=0;
    const offered={};
    for(const row of all){
      if(row.status==='blocked')continue;
      assert.equal(row.ownerRoots?.length,2);
      const root=row.ownerRoots.find(x=>x.physicalSeat===seat);
      assert.ok(root);
      assert.equal(root.sameRootAllProposersK0Invariant,true);
      const key=rootProjection(root,false);
      const publicKey=rootProjection(root,true);
      if(!groups.has(key))groups.set(key,[]);
      groups.get(key).push(row.rank);
      if(!withOpponent.has(publicKey))withOpponent.set(publicKey,[]);
      withOpponent.get(publicKey).push(row.rank);
      const offers=root.sameRootReceipt?.offers?.filter(o=>
        o.source!=='first-return'&&o.source!=='terminal-hold')??[];
      assert.equal(offers.length,root.sameRootReceipt.supportedAlternativeCount);
      if(offers.length)offeredRoots++;
      offerCount+=offers.length;
      for(const offer of offers){
        const offerKey=digest([offer.source,offer.kind,offer.printing,
          offer.attackName,offer.slot,offer.index,
          offer.proposedDiscardPrinting,offer.proposedDiscardIndex]);
        const bucket=offered[offerKey]??{
          source:offer.source,kind:offer.kind,printing:offer.printing,
          attackName:offer.attackName,slot:offer.slot,index:offer.index,
          occurrences:0,sourceRanks:[]};
        bucket.occurrences++;
        bucket.sourceRanks.push(row.rank);
        offered[offerKey]=bucket;
      }
    }
    const sorted=(map)=>[...map.entries()]
      .map(([sha256,ranks])=>({sha256,ranks}))
      .sort((a,b)=>b.ranks.length-a.ranks.length||
        a.sha256.localeCompare(b.sha256));
    seats[seat]={
      observedRoots:[...groups.values()].reduce((n,ranks)=>n+ranks.length,0),
      rootsWithIndependentOffer:offeredRoots,
      totalIndependentOffers:offerCount,
      uniqueRecordedOwnerLocalProjections:groups.size,
      uniqueRecordedOwnerAndOpponentActiveProjections:withOpponent.size,
      recordedOwnerLocalGroups:sorted(groups),
      distinctOfferSourcePrintingAndTarget:[...Object.values(offered)]
        .sort((a,b)=>b.occurrences-a.occurrences)
    };
  }
  return {
    schema:'agent18-source-29-first-root-pseudoreplication-v1',
    registeredSourceRanks:all.map(row=>row.rank),
    sourceBlockedRanks:all.filter(row=>row.status==='blocked').map(row=>row.rank),
    recordedProjectionFields:['globalTurn','ownActive','ownBench',
      'ownerKnownHand'],
    opponentProjectionAdditionalField:'opponentActive',
    bySeat:seats,
    competitiveQualifiedGames:0,
    limitations:'Projection excludes other public conditions and past history. Repeated projection is not proof of full actor-state equality; all alternatives are unplayed structural offers.'
  };
}
if(require.main===module){
  assert.equal(process.argv.length,4,'Provide six and other23 native source JSON');
  const surveys=process.argv.slice(2).map(p=>
    JSON.parse(fs.readFileSync(p,'utf8')));
  process.stdout.write(JSON.stringify(analyze(surveys),null,2)+'\n');
}
module.exports={digest,rootProjection,analyze};
