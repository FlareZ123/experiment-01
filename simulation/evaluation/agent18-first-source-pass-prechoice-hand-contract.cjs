'use strict';

const {createHash}=require('node:crypto');
const digest=value=>createHash('sha256').update(JSON.stringify(value))
  .digest('hex');

/**
 * Require the pristine, pre-bot source's first live-turn hand to match the
 * already-existing post-choice native Pass custody receipt, but only when
 * that Pass is exactly the first owner action in that live turn.
 *
 * Values are compared internally and no hand hash or printing is returned:
 * seven-card inventory hands have a small offline-guessable domain.
 * This does not attest other fields or establish a paper-playable alternative.
 *
 * @param {object} row Raw runDevelopment row with all-owner Pass opt-in.
 * @returns {object} Narrow, failure-inclusive hand-integrity verdict.
 */
function auditFirstSourcePassPrechoiceHand(row){
  const id=row?.trial?.id??row?.id??null;
  const ordinal=row?.sourceFirstOwnHandFirstActionOrdinal;
  const seat=row?.sourceSeat;
  const base={trialId:id,firstSourceActionOrdinal:
    Number.isSafeInteger(ordinal)?ordinal:null,
    exposedHandHashes:false,paperEligibleAlternativeCertified:false,
    competitivelyQualifiedGames:0};
  const frontier=row?.nativeAllOwnerPassFrontier;
  if(!(seat===0||seat===1)||
      row.sourceFirstOwnHandProtocol!=='first-live-owner-hand-prebot-v1'||
      !Number.isSafeInteger(ordinal)||ordinal<0||
      frontier?.completeNativePassCoverage!==true||
      frontier?.sourceSeat!==seat||
      !Array.isArray(frontier.receipts)||
      !/^[0-9a-f]{64}$/.test(row.sourceFirstOwnHandSha256)){
    return {...base,status:'UNVERIFIED_SOURCE_HAND_CUSTODY'};
  }
  const candidates=frontier.receipts.filter(receipt=>
    receipt.actionOrdinal===ordinal&&receipt.role==='source');
  if(candidates.length===0)
    return {...base,status:'FIRST_SOURCE_ACTION_NOT_OBSERVED_AS_PASS'};
  if(candidates.length!==1)
    return {...base,status:'DUPLICATE_FIRST_SOURCE_PASS_RECEIPTS'};
  const receipt=candidates[0];
  if(receipt.actorSeat!==seat||receipt.actionOrdinal!==ordinal||
      !Array.isArray(receipt.ownerHandAtChosenPass)||
      !receipt.ownerHandAtChosenPass.every(x=>typeof x==='string')||
      receipt.ownerHandSha256!==digest(receipt.ownerHandAtChosenPass)){
    return {...base,status:'INVALID_POSTCHOICE_OWNER_PASS_RECEIPT'};
  }
  return {...base,status:row.sourceFirstOwnHandSha256===receipt.ownerHandSha256?
    'FIRST_SOURCE_PASS_HAND_PRECHOICE_EQUALS_POSTCHOICE':
    'FIRST_SOURCE_PASS_HAND_CHANGED_DURING_DECISION',
    sourceSeat:seat};
}

module.exports={auditFirstSourcePassPrechoiceHand};
