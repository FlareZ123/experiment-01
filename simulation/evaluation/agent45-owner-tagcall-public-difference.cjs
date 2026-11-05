'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');

const VERSION='agent45-owner-tagcall-public-root-difference-v1';
const digest=value=>createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');
const visible=a=>a?{
  playerSlot:a.playerSlot??null,turnBefore:a.turnBefore??null,
  action:a.action??null,card:a.card??null,
  attack:a.attack??null,pendingPrompt:a.pendingPrompt??null
}:null;

/**
 * Source seat derives from precommitted trial registration; even an aborted
 * native attempt with null source-seats has a known candidate-slot design.
 * @param {string} id Rank:repeat:candidateSlot:candidate.
 */
function sourceSeatForTrial(id){
  const parts=id?.split(':');
  assert.ok(parts?.length===4);
  assert.ok(parts[2]==='A'||parts[2]==='B');
  return parts[2]==='A'?1:0;
}

/**
 * Read only accepted PUBLIC native action ledger. A Supporter held or found
 * in the owner's private hand is never counted as a played card.
 * @param {object[]} actions
 * @param {0|1} sourceSeat
 */
function activity(actions,sourceSeat){
  const roots=actions.filter(row=>row.playerSlot===sourceSeat);
  const kinds={};
  for(const row of roots)kinds[row.action]=(kinds[row.action]??0)+1;
  const plays=roots.filter(row=>row.action==='PlayCardAction');
  return {
    roots:roots.length,
    passes:kinds.PassTurnAction??0,
    attacks:kinds.AttackAction??0,
    cardsPlayed:kinds.PlayCardAction??0,
    tagCallPlayed:plays.filter(a=>
      typeof a.card==='string'&&a.card.includes('Tag Call')).length,
    guzmaHalaPlayed:plays.filter(a=>
      typeof a.card==='string'&&a.card.includes('Guzma & Hala')).length,
    sourcePublicTagAndHalaRootTimes:plays.filter(a=>
      /Tag Call|Guzma & Hala/.test(a.card??'')).map(a=>({
        ordinal:a.actionOrdinal??null,
        turn:a.turnBefore??null,card:a.card
      })),
    competitiveGameQualified:false
  };
}

/**
 * Exact eight registered matched native public receipt rows. Ledger digest
 * and count are checked before differences are interpreted; a different
 * action may reflect altered search/turn sequencing rather than better play.
 *
 * @param {object} control buildReceipt(originalV5).
 * @param {object} treatment buildReceipt(tagCallV7).
 * @param {string[]} originalIds Registered eight exact trial identifiers.
 */
function compareTagCallPublicRoots(control,treatment,originalIds){
  assert.ok(Array.isArray(originalIds)&&originalIds.length===8);
  assert.equal(new Set(originalIds).size,8);
  const first=new Map(control?.attempts?.map(x=>[x.id,x]));
  const second=new Map(treatment?.attempts?.map(x=>[x.id,x]));
  assert.equal(first.size,8);
  assert.equal(second.size,8);
  const rows=originalIds.map(id=>{
    const a=first.get(id),b=second.get(id);
    assert.ok(a&&b);
    for(const receipt of [a,b]){
      assert.ok(Array.isArray(receipt.publicRootActions));
      assert.equal(receipt.publicRootActionsTruncated,false);
      assert.equal(receipt.publicRootActionCount,
        receipt.publicRootActions.length);
      assert.equal(receipt.publicRootLedgerSha256Computed,
        digest(receipt.publicRootActions));
      assert.notEqual(receipt.publicRootLedgerDigestConsistent,false);
    }
    const left=a.publicRootActions,right=b.publicRootActions;
    let i=0;
    while(i<left.length&&i<right.length&&
      JSON.stringify(visible(left[i]))===
        JSON.stringify(visible(right[i])))i++;
    const firstDifference=i===left.length&&i===right.length?null:{
      ordinal:i,control:visible(left[i]),treatment:visible(right[i])
    };
    const sourceSeat=sourceSeatForTrial(id);
    return {
      id,registeredOriginalSourceSeat:sourceSeat,
      firstPublicActionDifference:firstDifference,
      identicalPublicAcceptedRoots:firstDifference===null,
      controlRootCount:left.length,treatmentRootCount:right.length,
      controlSourceActions:activity(left,sourceSeat),
      treatmentSourceActions:activity(right,sourceSeat),
      noHiddenZonesOrOpponentHandsExamined:true,
      competitiveStrengthInferred:false
    };
  });
  return {schema:VERSION,originalRegisteredTrials:originalIds,
    publicLedgerDigestAndLengthVerified:true,rows,
    qualifiedCompetitiveGames:0};
}

module.exports={
  VERSION,visible,sourceSeatForTrial,activity,compareTagCallPublicRoots
};
