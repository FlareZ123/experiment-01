'use strict';

const VERSION='agent46-original-source-attempts-to-field-pairs-v1';
const OUTCOMES=new Set(['QUALIFIED_WIN','QUALIFIED_NONWIN','CENSORED']);

/**
 * Convert registered two-arm source experiments to the input format of
 * our downstream field-level confidence sequences. All registered pairs
 * remain represented, including missing arms, invalid physical receipts,
 * source setup mismatches, engine errors and action caps.
 *
 * Every status defaults to CENSORED, regardless of the native winner
 * field or self-described in-row qualification. An explicit independently
 * reviewed whole-paper-game qualification callback is required, together
 * with a matching original-source printed-60 identity in a frozen roster.
 * Missing source ranks or any printing mismatch remain censored. Neither
 * an injected roster nor a callback is independently authenticated here;
 * review their provenance in the surrounding immutable release.
 *
 * @typedef {'QUALIFIED_WIN'|'QUALIFIED_NONWIN'|'CENSORED'} Status
 * @typedef {{
 *  pairId:string,roundId:string,rank:number,candidateSeat:0|1,
 *  originalSourcePrintDigest?:string,
 *  startingSeat?:0|1,referenceTrialId:string,challengerTrialId:string
 * }} RegisteredPair
 * @typedef {{
 *  trialId:string,candidateId:string,candidateSeat:0|1,
 *  sourceDealFingerprint?:string,verifiedFirstTurn?:boolean,
 *  actualStarterSeat?:0|1,nativeWinnerSeat?:0|1|null
 * }} Arm
 * @param {{
 *  referenceId:string,challengerId:string,
 *  layout:'RANK'|'RANK_SEAT'|'RANK_SEAT_START',
 *  registration:RegisteredPair[],
 *  observations:Arm[],
 *  authenticatedOriginalPrints?:Array<{rank:number,printed60Sha256:string,physicalCards:number}>,
 *  qualify?:(arm:Arm,registered:RegisteredPair)=>Status
 * }} config
 * @returns {object} Failure-inclusive, 32/64/128-cell research input.
 */
function registeredSourceFieldPairs(config){
  const {referenceId,challengerId,layout,registration,observations,
    authenticatedOriginalPrints,qualify}=config??{};
  const C=layout==='RANK'?32:layout==='RANK_SEAT'?64:
    layout==='RANK_SEAT_START'?128:null;
  if(!C||typeof referenceId!=='string'||!referenceId||
    typeof challengerId!=='string'||!challengerId||referenceId===challengerId||
    !Array.isArray(registration)||!Array.isArray(observations)||
    (qualify!==undefined&&typeof qualify!=='function')||
    (qualify!==undefined&&!Array.isArray(authenticatedOriginalPrints))){
    throw new TypeError('Expected distinct fixed candidate IDs, explicit field layout and registration/observation arrays');
  }
  // The candidate comparison may only gain a qualified status if the
  // entire original 60 identity matches an independently frozen roster.
  // Even then the separately injected auditor must verify whole-paper play.
  const acceptedPrints=new Map();
  const digest=/^[0-9a-f]{64}$/;
  for(const row of authenticatedOriginalPrints??[]){
    if(!Number.isSafeInteger(row?.rank)||row.rank<1||row.rank>32||
      acceptedPrints.has(row.rank)||!digest.test(row.printed60Sha256??'')||
      row.physicalCards!==60){
      throw new TypeError('Invalid or repeated authenticated original printed-60 roster');
    }
    acceptedPrints.set(row.rank,row.printed60Sha256);
  }
  const cellPairs=Array.from({length:C},()=>[]);
  const enrolled=new Map();
  const pairIds=new Set();
  for(const pair of registration){
    if(!pair||typeof pair.pairId!=='string'||!pair.pairId||pairIds.has(pair.pairId)||
      typeof pair.roundId!=='string'||!pair.roundId||
      !Number.isSafeInteger(pair.rank)||pair.rank<1||pair.rank>32||
      ![0,1].includes(pair.candidateSeat)||
      (layout==='RANK_SEAT_START'&&![0,1].includes(pair.startingSeat))||
      typeof pair.referenceTrialId!=='string'||!pair.referenceTrialId||
      typeof pair.challengerTrialId!=='string'||!pair.challengerTrialId||
      pair.referenceTrialId===pair.challengerTrialId||
      enrolled.has(pair.referenceTrialId)||enrolled.has(pair.challengerTrialId)){
      throw new TypeError('Duplicate or malformed preregistered source trial pair');
    }
    pairIds.add(pair.pairId);
    enrolled.set(pair.referenceTrialId,{pair,expected:referenceId});
    enrolled.set(pair.challengerTrialId,{pair,expected:challengerId});
  }
  const rows=new Map();
  for(const row of observations){
    const req=enrolled.get(row?.trialId);
    if(!req||rows.has(row.trialId)||row.candidateId!==req.expected){
      throw new TypeError('Unregistered, duplicate or misidentified observed trial arm');
    }
    rows.set(row.trialId,row);
  }
  let missingArms=0,invalidSourceReceipts=0,matchedSourcePairs=0;
  let unadmittedOriginalPrintPairs=0;
  const fingerprint=/^[0-9a-f]{64}$/;
  for(const pair of registration){
    const printAdmitted=acceptedPrints.get(pair.rank)===pair.originalSourcePrintDigest&&
      digest.test(pair.originalSourcePrintDigest??'');
    if(!printAdmitted)unadmittedOriginalPrintPairs++;
    const ref=rows.get(pair.referenceTrialId);
    const ch=rows.get(pair.challengerTrialId);
    const valid=arm=>arm&&arm.candidateSeat===pair.candidateSeat&&
      arm.verifiedFirstTurn===true&&fingerprint.test(arm.sourceDealFingerprint??'')&&
      (layout!=='RANK_SEAT_START'||arm.actualStarterSeat===pair.startingSeat);
    if(!ref)missingArms++;
    if(!ch)missingArms++;
    if(ref&&!valid(ref))invalidSourceReceipts++;
    if(ch&&!valid(ch))invalidSourceReceipts++;
    const fRef=valid(ref)?ref.sourceDealFingerprint:'UNKNOWN:'+pair.pairId+':reference';
    const fCh=valid(ch)?ch.sourceDealFingerprint:'UNKNOWN:'+pair.pairId+':challenger';
    if(fRef===fCh)matchedSourcePairs++;
    /** @param {Arm|undefined} arm */
    function status(arm){
      if(!arm||!valid(arm)||!qualify||!printAdmitted)return 'CENSORED';
      const answer=qualify(arm,pair);
      if(!OUTCOMES.has(answer))throw new TypeError('Independent auditor must return a qualified status or CENSORED');
      return answer;
    }
    const cellIndex=(pair.rank-1)*(C/32)+
      (C>=64?pair.candidateSeat*(C/64):0)+
      (C===128?pair.startingSeat:0);
    cellPairs[cellIndex].push({pairId:pair.pairId,roundId:pair.roundId,
      referenceFingerprint:fRef,challengerFingerprint:fCh,
      referenceStatus:status(ref),challengerStatus:status(ch)});
  }
  return {
    version:VERSION,layout,referenceId,challengerId,
    registeredPairs:registration.length,registeredArms:enrolled.size,
    observedArms:rows.size,missingArms,invalidSourceReceipts,
    matchedSourcePairs,unadmittedOriginalPrintPairs,
    printedSourceRosterEntries:acceptedPrints.size,cells:cellPairs,
    competitiveQualified:false,
    note:'This adapter does not independently qualify any paper games; native terminals, native winner fields and self-attested row flags are censored by default.'
  };
}
module.exports={VERSION,registeredSourceFieldPairs};
